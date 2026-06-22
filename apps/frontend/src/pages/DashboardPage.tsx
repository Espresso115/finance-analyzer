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
      <div className="flex flex-col gap-4 animate-in fade-in duration-500 pb-6 w-full h-full">
        {/* Removed large consumer-style header, AppShell provides title context */}

        <div className="flex flex-col gap-4 w-full h-full">
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 w-full">
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

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 w-full">
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
