/**
 * TimeGrid - Time Axis Grid Component
 */

interface TimeGridProps {
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  slotHeight?: number; // pixels per hour
}

export function TimeGrid({ startTime, endTime, slotHeight = 60 }: TimeGridProps) {
  const hours = generateHourSlots(startTime, endTime);

  return (
    <div className="flex flex-col border-r border-border h-full bg-background">
      {/* Header Placeholder (sticky) */}
      <div className="h-[var(--ui-schedule-header-height)] border-b border-border bg-background sticky top-0 z-30" />

      {/* Time Slots */}
      {hours.map((hour) => (
        <div
          key={hour}
          className="border-b border-border flex items-start justify-end pe-2 py-1 text-xs text-muted-foreground font-medium"
          style={{ height: `${slotHeight}px` }}
        >
          {hour}:00
        </div>
      ))}
    </div>
  );
}

/**
 * Generate hour array from start to end time
 */
function generateHourSlots(startTime: string, endTime: string): number[] {
  const startParts = startTime.split(':');
  const endParts = endTime.split(':');
  const startHour = Number(startParts[0] ?? 0);
  const endHour = Number(endParts[0] ?? 23);

  const hours: number[] = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    hours.push(hour);
  }

  return hours;
}
