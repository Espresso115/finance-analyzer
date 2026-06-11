import { memo } from 'react';
import { useTradingViewWidget } from '@/hooks/useTradingViewWidget';
import { cn } from '@/lib/utils';

interface TradingViewWidgetProps {
  title?: string;
  scriptUrl: string;
  config: Record<string, unknown>;
  height?: number;
  className?: string;
}

const TradingViewWidget = ({ title, scriptUrl, config, height = 600, className }: TradingViewWidgetProps) => {
  const containerRef = useTradingViewWidget(scriptUrl, config, height);

  return (
    <div className="w-full">
      {title && <h3 className="font-semibold text-2xl text-foreground mb-5">{title}</h3>}
      <div className={cn('tradingview-widget-container', className)} ref={containerRef}>
        {/* The widget script mounts inside the div created by the hook */}
      </div>
    </div>
  );
};

export default memo(TradingViewWidget);
