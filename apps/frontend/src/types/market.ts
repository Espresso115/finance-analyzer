export type AssetType = 'stock' | 'crypto' | 'forex';

export type MarketInstrument = {
  symbol: string;
  name: string;
  type: AssetType;
  exchange: string;
  currency: string;
  basePrice: number;
};

export type MarketQuote = Omit<MarketInstrument, 'basePrice'> & {
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  lastUpdated: string;
  cached: boolean;
};

export type MarketHistoryPoint = {
  date: string;
  close: number;
  volume: number;
};

export type MarketHistory = {
  symbol: string;
  range: '7d' | '30d' | '90d';
  points: MarketHistoryPoint[];
  cached: boolean;
};

export type MarketDataResponse<T> = {
  success: boolean;
  data: T;
};
