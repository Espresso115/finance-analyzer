import { fetchMarketQuote } from '../services/market.service.js';

// @desc    Get market quote
// @route   GET /api/v1/market/quote/:symbol
// @access  Private
export const getMarketQuote = async (req, res) => {
  const { symbol } = req.params;
  
  if (!symbol) {
    return res.status(400).json({ error: 'Market symbol is required' });
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
