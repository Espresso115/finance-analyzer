import { AppShell } from '../components/AppShell';
import TradingViewWidget from '../components/TradingViewWidget';
import {
  HEATMAP_WIDGET_CONFIG,
  MARKET_DATA_WIDGET_CONFIG,
  MARKET_OVERVIEW_WIDGET_CONFIG,
  TOP_STORIES_WIDGET_CONFIG
} from '../constants/tradingview';

export function DashboardPage() {
  const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        <section className="flex flex-col items-center text-center gap-4">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight text-foreground">
              Market Dashboard
            </h2>
            <p className="text-muted-foreground mt-1.5 flex items-center justify-center gap-2">
              Track prices, analyze trends, and monitor market news.
            </p>
          </div>
        </section>

        <div className="flex flex-col gap-8 w-full min-h-screen">
          <section className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-3 gap-8 w-full">
            <div className="xl:col-span-1">
              <TradingViewWidget
                title="Market Overview"
                scriptUrl={`${scriptUrl}market-overview.js`}
                config={MARKET_OVERVIEW_WIDGET_CONFIG}
                className="custom-chart"
                height={600}
              />
            </div>
            <div className="xl:col-span-2">
              <TradingViewWidget
                title="Stock Heatmap"
                scriptUrl={`${scriptUrl}stock-heatmap.js`}
                className="heatmap-clickable"
                config={{
                  ...HEATMAP_WIDGET_CONFIG,
                  symbolUrl: window.location.origin + '/symbol'
                }}
                height={600}
              />
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-3 gap-8 w-full">
            <div className="xl:col-span-1 h-full">
              <TradingViewWidget
                title="Top Stories"
                scriptUrl={`${scriptUrl}timeline.js`}
                config={TOP_STORIES_WIDGET_CONFIG}
                height={600}
              />
            </div>
            <div className="xl:col-span-2 h-full">
              <TradingViewWidget
                title="Market Quotes"
                scriptUrl={`${scriptUrl}market-quotes.js`}
                config={MARKET_DATA_WIDGET_CONFIG}
                height={600}
              />
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
