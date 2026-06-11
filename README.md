# Financial AI Platform

A full-stack, monorepo financial platform equipped with advanced AI agents and robust real-time market tracking.

## Overview
This platform acts as an intelligent financial assistant. It features an automated market dashboard integrating advanced charting from TradingView, which updates and provides insights on the stock market natively. 

## Key Features
- **Intelligent Stock Dashboard**: Utilizing integrated TradingView widgets for the Market Overview, Heatmaps, Timelines, and Quotes.
- **RAG Services & Document Parsers**: Extracted from various AI implementations across microservices.
- **Microservices Architecture**: Separate services to manage AI functionality and UI gateways.

## Getting Started

1. **Install dependencies:**
   From the root folder, run:
   ```bash
   pnpm install
   ```
2. **Start the applications:**
   ```bash
   pnpm dev
   ```

*Note: The frontend operates with TradingView's timeline native capabilities and doesn't require Finnhub API for general Top Stories functionality. If you do wish to connect your own external news parser via finnhub, configure `VITE_FINNHUB_API_KEY` in the frontend environment file.*
