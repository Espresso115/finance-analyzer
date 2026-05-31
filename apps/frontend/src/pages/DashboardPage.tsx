import { type FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { AppShell } from '../components/AppShell';
import { getApiErrorMessage, marketApi, userApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { MarketHistory, MarketInstrument, MarketQuote } from '../types/market';

const fallbackWatchlist = ['AAPL', 'MSFT', 'NVDA', 'BTC-USD'];
const symbolRegex = /^[A-Z0-9.-]{1,12}$/;

const formatCurrency = (value: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: value < 10 ? 4 : 2
  }).format(value);

const formatVolume = (value: number) =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);

const normalizeSymbols = (symbols: string[]) =>
  symbols
    .map((symbol) => symbol.trim().toUpperCase())
    .filter((symbol, index, allSymbols) => symbolRegex.test(symbol) && allSymbols.indexOf(symbol) === index)
    .slice(0, 8);

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const syncUser = useAuthStore((state) => state.syncUser);
  const savedWatchlist = user?.profile?.preferences.defaultWatchlist || [];
  const initialWatchlist = savedWatchlist.length ? savedWatchlist : fallbackWatchlist;
  const [watchlist, setWatchlist] = useState(() => normalizeSymbols(initialWatchlist));
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState(watchlist[0] || 'AAPL');
  const [historyRange, setHistoryRange] = useState<MarketHistory['range']>('30d');
  const [history, setHistory] = useState<MarketHistory | null>(null);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<MarketInstrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selectedQuote = useMemo(
    () => quotes.find((quote) => quote.symbol === selectedSymbol),
    [quotes, selectedSymbol]
  );

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const summary = await marketApi.getSummary(watchlist);
        const historyResponse = await marketApi.getHistory(selectedSymbol, historyRange);

        if (isMounted) {
          setQuotes(summary.data);
          setHistory(historyResponse.data);
        }
      } catch (requestError) {
        if (isMounted) setError(getApiErrorMessage(requestError));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [historyRange, selectedSymbol, watchlist]);

  const runSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (searchText.trim().length > 40) {
      setError('Search terms must be 40 characters or fewer.');
      return;
    }

    try {
      const response = await marketApi.search({ q: searchText });
      setSearchResults(response.data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  const persistWatchlist = async (symbols: string[]) => {
    const nextWatchlist = normalizeSymbols(symbols);
    const preferences = user?.profile?.preferences;
    setWatchlist(nextWatchlist);
    setSelectedSymbol((currentSymbol) =>
      nextWatchlist.includes(currentSymbol) ? currentSymbol : nextWatchlist[0] || 'AAPL'
    );

    if (preferences) {
      await userApi.updateSettings({
        ...preferences,
        defaultWatchlist: nextWatchlist
      });
      await syncUser();
    }
  };

  const addSymbol = async (symbol: string) => {
    setMessage('');
    setError('');
    const normalizedSymbol = symbol.trim().toUpperCase();

    if (!symbolRegex.test(normalizedSymbol)) {
      setError('Use a valid symbol with letters, numbers, dots, or hyphens.');
      return;
    }

    try {
      await persistWatchlist([...watchlist, normalizedSymbol]);
      setSelectedSymbol(normalizedSymbol);
      setMessage(`${normalizedSymbol} added to your watchlist.`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  const removeSymbol = async (symbol: string) => {
    setMessage('');
    setError('');

    if (watchlist.length <= 1) {
      setError('Keep at least one symbol in the watchlist.');
      return;
    }

    try {
      await persistWatchlist(watchlist.filter((watchSymbol) => watchSymbol !== symbol));
      setMessage(`${symbol} removed.`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  const downloadCsv = async () => {
    setMessage('');
    setError('');
    try {
      const csv = await marketApi.exportCsv(watchlist);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'market-watchlist.csv';
      link.click();
      URL.revokeObjectURL(url);
      setMessage('CSV export prepared.');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  return (
    <AppShell>
      <section className="dashboard-hero" aria-label="Market dashboard">
        <div className="dashboard-hero-copy">
          <span className="eyebrow">Day 12-14 Market Workspace</span>
          <h2>Track your watchlist before research begins.</h2>
          <p>
            Search assets, review quote movement, inspect generated history, and export the current
            view while the research workspace stays focused.
          </p>
          <div className="hero-actions">
            <button type="button" onClick={downloadCsv} disabled={!watchlist.length}>
              Export CSV
            </button>
            <button type="button" className="ghost-button" onClick={() => void addSymbol('AAPL')}>
              Add AAPL
            </button>
          </div>
        </div>
      </section>

      <section className="market-toolbar" aria-label="Market search">
        <form className="market-search" onSubmit={runSearch}>
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search AAPL, Bitcoin, USD..."
          />
          <button type="submit">Search</button>
        </form>
        <div className="range-control" aria-label="History range">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              type="button"
              className={historyRange === range ? 'active' : ''}
              onClick={() => setHistoryRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </section>

      {error ? <p className="form-error dashboard-message">{error}</p> : null}
      {message ? <p className="success-message dashboard-message">{message}</p> : null}

      {searchResults.length ? (
        <section className="instrument-strip" aria-label="Search results">
          {searchResults.map((instrument) => (
            <button key={instrument.symbol} type="button" onClick={() => void addSymbol(instrument.symbol)}>
              <strong>{instrument.symbol}</strong>
              <span>{instrument.name}</span>
            </button>
          ))}
        </section>
      ) : null}

      <section className="quote-grid" aria-label="Watchlist quotes">
        {quotes.map((quote) => {
          const isPositive = quote.change >= 0;
          return (
            <article
              key={quote.symbol}
              className={selectedSymbol === quote.symbol ? 'selected' : ''}
              onClick={() => setSelectedSymbol(quote.symbol)}
            >
              <div>
                <span>{quote.type.toUpperCase()} · {quote.exchange}</span>
                <strong>{quote.symbol}</strong>
                <p>{quote.name}</p>
              </div>
              <div>
                <strong>{formatCurrency(quote.price, quote.currency)}</strong>
                <span className={isPositive ? 'positive' : 'negative'}>
                  {isPositive ? '+' : ''}{quote.changePercent}%
                </span>
              </div>
              <button type="button" onClick={(event) => {
                event.stopPropagation();
                void removeSymbol(quote.symbol);
              }}>
                Remove
              </button>
            </article>
          );
        })}
      </section>

      <section className="market-detail">
        <div className="chart-panel">
          <div className="section-heading">
            <span className="eyebrow">{selectedSymbol}</span>
            <h2>{selectedQuote?.name || 'Market history'}</h2>
            <p>
              {selectedQuote
                ? `${formatVolume(selectedQuote.volume)} volume · updated ${new Date(
                    selectedQuote.lastUpdated
                  ).toLocaleTimeString()}`
                : 'Select a symbol to inspect the trend.'}
            </p>
          </div>

          <div className="chart-frame">
            {loading ? (
              <div className="empty-state">Loading market data...</div>
            ) : history?.points.length ? (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={history.points} margin={{ top: 12, right: 16, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1667f2" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#1667f2" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e8ecf4" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={28} />
                  <YAxis tickLine={false} axisLine={false} width={72} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="close"
                    stroke="#1667f2"
                    strokeWidth={3}
                    fill="url(#priceFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">No history available yet.</div>
            )}
          </div>
        </div>

        <aside className="insight-panel">
          <span className="eyebrow">Readiness</span>
          <h2>Milestone status</h2>
          <ul>
            <li>Protected market search and quote APIs are active.</li>
            <li>Watchlist preferences persist through user settings.</li>
            <li>CSV export is ready for spreadsheet workflows.</li>
            <li>Document research work remains intentionally untouched.</li>
          </ul>
        </aside>
      </section>
    </AppShell>
  );
}
