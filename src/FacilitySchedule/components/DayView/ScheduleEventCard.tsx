/**
 * ScheduleEventCard - Component for displaying an event in the schedule
 * Ported from TreatmentCard.tsx
 */

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import type { ScheduleEvent } from '../../FacilitySchedule.schema';

interface ScheduleEventCardProps {
  event: ScheduleEvent;
  top: number; // px from top
  height: number; // px height
  widthPercent?: number; // % width
  leftPercent?: number; // % left
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isDragging?: boolean;
}

export function ScheduleEventCard({
  event,
  top,
  height,
  widthPercent = 100,
  leftPercent = 0,
  onClick,
  isDragging = false,
}: ScheduleEventCardProps) {
  const startTime = event.startDate.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endTime = event.endDate.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const durationHours =
    Math.round(
      ((event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60 * 60)) * 10
    ) / 10;

  // Determine styling
  const bgColor = event.hasConflict
    ? 'bg-destructive border-destructive'
    : 'bg-primary border-primary/30';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`
        absolute rounded-md shadow-sm border
        transition-all duration-200 cursor-pointer
        ${isDragging ? 'opacity-50 scale-95' : 'hover:shadow-md hover:scale-[1.02] hover:z-10'}
        ${bgColor} text-primary-foreground
        ${event.hasConflict ? 'ring-2 ring-red-400 ring-offset-1' : ''}
      `}
            style={{
              top: `${top}px`,
              height: `${height}px`,
              left: `${leftPercent}%`,
              width: `${widthPercent}%`,
              paddingLeft: leftPercent > 0 ? '2px' : '4px',
              paddingRight: leftPercent + widthPercent < 100 ? '2px' : '4px',
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
            }}
            onClick={onClick}
          >
            <div className="p-2 h-full flex flex-col overflow-hidden">
              {/* Conflict Warning */}
              {event.hasConflict && <div className="text-xs font-bold mb-1">⚠️ Double Booking</div>}

              {/* Title */}
              <div className="font-semibold text-sm leading-snug break-words">
                {event.title}
              </div>

              {/* Time */}
              <div className="text-xs text-primary-foreground/90 mt-1">
                {startTime} - {endTime}
              </div>

              {/* Duration */}
              <div className="text-xs text-primary-foreground/80 mt-auto">{durationHours}h</div>
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <div className="space-y-1">
            {event.hasConflict && (
              <p className="font-bold text-xs text-red-600">⚠️ Double Booking</p>
            )}
            <p className="font-semibold text-xs">{event.title}</p>
            <p className="text-xs">
              {startTime} - {endTime} ({durationHours}h)
            </p>
            {event.note && (
              <p className="text-[10px] text-muted-foreground max-w-[180px] break-words">
                {event.note}
              </p>
            )}
            {event.description && (
              <p className="text-[10px] text-muted-foreground max-w-[180px] break-words italic">
                {event.description}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
