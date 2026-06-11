import {
  fetchMarketHistory,
  fetchMarketQuote,
  fetchMarketSummary,
  isValidMarketSymbol,
  searchMarketInstruments,
  serializeQuotesCsv,
  SUPPORTED_ASSET_TYPES
} from '../services/market.service.js';

// @desc    Get market quote
// @route   GET /api/v1/market/quote/:symbol
// @access  Private
export const getMarketQuote = async (req, res) => {
  const symbol = String(req.params.symbol || '').trim().toUpperCase();
  
  if (!symbol) {
    return res.status(400).json({ error: 'Market symbol is required' });
  }

  if (!isValidMarketSymbol(symbol)) {
    return res.status(422).json({ error: 'Market symbol must use 1-12 letters, numbers, dots, or hyphens' });
  }

  try {
    const quote = await fetchMarketQuote(symbol);
    res.json({
      success: true,
      data: quote
    });
  } catch (error) {
    console.error(`Market Controller Error: ${error.message}`);
    res.status(500).json({ error: 'Server error retrieving market data' });
  }
};

// @desc    Search market instruments
// @route   GET /api/v1/market/search?q=AAPL&type=stock
// @access  Private
export const searchMarket = async (req, res) => {
  const query = String(req.query.q || '').trim();
  const type = String(req.query.type || '').trim().toLowerCase();

  if (type && !SUPPORTED_ASSET_TYPES.includes(type)) {
    return res.status(422).json({ error: 'Asset type must be stock, crypto, or forex' });
  }

  if (query.length > 40) {
    return res.status(422).json({ error: 'Search query must be 40 characters or fewer' });
  }

  const instruments = await searchMarketInstruments({ query, type });
  res.json({
    success: true,
    data: instruments
  });
};

// @desc    Get market quote summary
// @route   GET /api/v1/market/summary?symbols=AAPL,MSFT,BTC-USD
// @access  Private
export const getMarketSummary = async (req, res) => {
  const symbols = String(req.query.symbols || '')
    .split(',')
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean);

  if (!symbols.length) {
    return res.status(400).json({ error: 'At least one market symbol is required' });
  }

  const invalidSymbol = symbols.find((symbol) => !isValidMarketSymbol(symbol));
  if (invalidSymbol) {
    return res.status(422).json({ error: `Invalid market symbol: ${invalidSymbol}` });
  }

  try {
    const quotes = await fetchMarketSummary(symbols);
    res.json({
      success: true,
      data: quotes
    });
  } catch (error) {
    console.error(`Market Summary Error: ${error.message}`);
    res.status(500).json({ error: 'Server error retrieving market summary' });
  }
};

// @desc    Get market price history
// @route   GET /api/v1/market/history/:symbol?range=30d
// @access  Private
export const getMarketHistory = async (req, res) => {
  const symbol = String(req.params.symbol || '').trim().toUpperCase();
  const range = String(req.query.range || '30d').trim().toLowerCase();

  if (!symbol) {
    return res.status(400).json({ error: 'Market symbol is required' });
  }

  if (!isValidMarketSymbol(symbol)) {
    return res.status(422).json({ error: 'Market symbol must use 1-12 letters, numbers, dots, or hyphens' });
  }

  if (!['7d', '30d', '90d'].includes(range)) {
    return res.status(422).json({ error: 'Range must be 7d, 30d, or 90d' });
  }

  try {
    const history = await fetchMarketHistory(symbol, range);
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error(`Market History Error: ${error.message}`);
    res.status(500).json({ error: 'Server error retrieving market history' });
  }
};

// @desc    Export market quote summary
// @route   GET /api/v1/market/export?symbols=AAPL,MSFT&format=csv
// @access  Private
export const exportMarketData = async (req, res) => {
  const symbols = String(req.query.symbols || '')
    .split(',')
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean);
  const format = String(req.query.format || 'json').trim().toLowerCase();

  if (!symbols.length) {
    return res.status(400).json({ error: 'At least one market symbol is required' });
  }

  if (!['json', 'csv'].includes(format)) {
    return res.status(422).json({ error: 'Export format must be json or csv' });
  }

  const invalidSymbol = symbols.find((symbol) => !isValidMarketSymbol(symbol));
  if (invalidSymbol) {
    return res.status(422).json({ error: `Invalid market symbol: ${invalidSymbol}` });
  }

  try {
    const quotes = await fetchMarketSummary(symbols);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="market-quotes.csv"');
      return res.send(serializeQuotesCsv(quotes));
    }

    return res.json({
      success: true,
      data: quotes
    });
  } catch (error) {
    console.error(`Market Export Error: ${error.message}`);
    return res.status(500).json({ error: 'Server error exporting market data' });
  }
};
