/**
 * DayCell - 月ビューの日付セルコンポーネント
 */

import { PercentFormat } from '@/components/ui/PercentFormat';

interface DayCellProps {
  date: Date;
  density: number; // 予約密度（0-100%）
  isCurrentMonth: boolean;
  isClosedDay: boolean;
  maxSlots: number;
  onClick?: () => void;
}

export function DayCell({
  date,
  density,
  isCurrentMonth,
  isClosedDay,
  maxSlots,
  onClick,
}: DayCellProps) {
  const day = date.getDate();
  const bookedCount = Math.round((density / 100) * maxSlots);

  // 密度に応じた透明度を計算 (0%なら0, それ以外は 0.1 + density/100 * 0.8 程度で調整)
  // 0%のときは白背景
  const isZero = density === 0;
  const opacity = isZero ? 0 : 0.1 + (density / 100) * 0.9;

  // 密度が高い場合は白文字にする
  const isHighDensity = density > 50;
  const textColorClass = isHighDensity ? 'text-white' : 'text-foreground';
  const subTextColorClass = isHighDensity ? 'text-white/90' : 'text-muted-foreground';

  return (
    <button
      type="button"
      className={`
        border border-border rounded-md p-2 min-h-[100px] cursor-pointer text-left
        transition-all hover:shadow-md
        ${!isCurrentMonth ? 'opacity-50' : ''}
        ${isClosedDay ? 'bg-muted' : 'bg-card'}
      `}
      style={
        !isClosedDay && !isZero
          ? { backgroundColor: `hsl(var(--theme-accent) / ${opacity})` }
          : undefined
      }
      onClick={onClick}
    >
      {/* 日付 */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-sm font-semibold ${!isCurrentMonth ? 'text-muted-foreground' : textColorClass}`}
        >
          {day}
        </span>
        {isClosedDay && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-theme-warning text-white font-medium">
            定休日
          </span>
        )}
      </div>

      {/* 予約情報 */}
      {!isClosedDay && (
        <div className="space-y-1">
          <div className={`text-xs ${subTextColorClass}`}>
            {bookedCount}/{maxSlots}
          </div>
          <PercentFormat
            value={density}
            valueScale="percent"
            options={{ maximumFractionDigits: 0 }}
            className={`text-xs font-medium ${textColorClass}`}
          />
        </div>
      )}
    </button>
  );
}
