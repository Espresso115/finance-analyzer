import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { marketApi } from '../services/api';
import type { MarketInstrument } from '../types/market';
import { useDebounce } from '@/hooks/useDebounce';

export function SymbolSearch() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MarketInstrument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSuggestions() {
      if (!debouncedQuery.trim()) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await marketApi.search({ q: debouncedQuery });
        const validResults = Array.isArray(response.data) ? response.data : [];
        setSuggestions(validResults.slice(0, 8)); // Limit to 8 suggestions
        setIsOpen(validResults.length > 0);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSuggestions();
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (symbol: string) => {
    navigate(`/symbol/${symbol.toUpperCase()}`);
    setQuery('');
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleSelect(query.trim());
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-sm z-50">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
          placeholder="Search for a stock symbol or name (e.g. AAPL or Apple)"
          className="pl-9 pr-10 w-full bg-card/50 border-border/50 focus-visible:ring-1 transition-colors rounded-full"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </form>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden backdrop-blur-xl">
          <ul className="max-h-64 overflow-y-auto py-1">
            {suggestions.map((item, index) => (
              <li key={`${item.symbol}-${index}`}>
                <button
                  type="button"
                  onClick={() => handleSelect(item.symbol)}
                  className="w-full text-left px-4 py-2 hover:bg-secondary/50 transition-colors flex flex-col items-start gap-0.5"
                >
                  <span className="font-semibold text-sm">{item.symbol}</span>
                  <span className="text-xs text-muted-foreground truncate w-full">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
