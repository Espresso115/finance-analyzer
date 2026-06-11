import { useParams, useSearchParams } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { Card } from '@/components/ui/card';
import TradingViewWidget from '../components/TradingViewWidget';

export function SymbolPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const [searchParams] = useSearchParams();
  const tvWidgetSymbol = searchParams.get('tvwidgetsymbol');
  
  let actualSymbol = symbol;
  if (!symbol || symbol === '{symbol}') {
    actualSymbol = tvWidgetSymbol || 'NASDAQ:AAPL';
  }
  const defaultSymbol = actualSymbol;
  const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight text-foreground uppercase">
              {defaultSymbol} Analysis
            </h2>
            <p className="text-muted-foreground mt-1.5 flex items-center gap-2">
              Deep dive into company profile and fundamental data.
            </p>
          </div>
        </section>

        <div className="flex flex-col gap-8 w-full min-h-screen">
          <Card className="w-full overflow-hidden border-border/50 shadow-lg bg-card/50 backdrop-blur-sm">
            <TradingViewWidget
              scriptUrl={`${scriptUrl}symbol-profile.js`}
              config={{
                width: '100%',
                height: 400,
                colorTheme: 'dark',
                isTransparent: true,
                symbol: defaultSymbol,
                locale: 'en'
              }}
              height={400}
            />
          </Card>

          <Card className="w-full overflow-hidden border-border/50 shadow-lg bg-card/50 backdrop-blur-sm p-0 m-0">
            <TradingViewWidget
              scriptUrl={`${scriptUrl}advanced-chart.js`}
              config={{
                height: 800,
                autosize: false,
                symbol: defaultSymbol,
                interval: "D",
                timezone: "Etc/UTC",
                theme: "dark",
                style: "1",
                locale: "en",
                enable_publishing: false,
                backgroundColor: "rgba(15, 15, 15, 0)",
                gridColor: "rgba(240, 243, 250, 0.06)",
                hide_top_toolbar: false,
                hide_legend: false,
                save_image: false,
                container_id: "tradingview_advanced_chart"
              }}
              height={800}
            />
          </Card>

          <Card className="w-full overflow-hidden border-border/50 shadow-lg bg-[#131722]">
            <TradingViewWidget
              scriptUrl={`${scriptUrl}financials.js`}
              config={{
                width: '100%',
                height: 800,
                colorTheme: 'dark',
                isTransparent: false,
                symbol: defaultSymbol,
                locale: 'en',
                displayMode: 'compact',
                largeChartUrl: ''
              }}
              height={800}
            />
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
