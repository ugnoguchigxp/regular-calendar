/**
 * TimeGrid - Time Axis Grid Component
 */

interface TimeGridProps {
	startTime: string; // "HH:mm"
	endTime: string; // "HH:mm"
	slotSize?: number; // pixels per hour (height or width)
	slotInterval?: number; // minutes
	orientation?: "horizontal" | "vertical";
}

export function TimeGrid({
	startTime,
	endTime,
	slotSize = 60,
	slotInterval = 60,
	orientation = "vertical",
}: TimeGridProps) {
	const slots = generateTimeSlots(startTime, endTime, slotInterval);
	const isHorizontal = orientation === "horizontal";
	const cellSize = slotSize; // pixels per slot

	if (isHorizontal) {
		return (
			<div className="flex min-w-max">
				{slots.map((slot) => (
					<div
						key={slot}
						className="border-r border-border flex items-center justify-center text-[10px] text-muted-foreground font-medium flex-shrink-0"
						style={{ width: `${cellSize}px` }}
					>
						{slot}
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="flex flex-col border-r border-border h-full bg-background">
			{/* Header Placeholder (sticky) */}
			<div className="h-[var(--ui-space-14)] border-b border-border bg-background sticky top-[var(--ui-space-0)] z-30" />

			{/* Time Slots */}
			{slots.map((slot) => (
				<div
					key={slot}
					className="border-b border-border flex items-start justify-end pe-2 py-[var(--ui-space-0-5)] text-xs text-muted-foreground font-medium"
					style={{ height: `${cellSize}px` }}
				>
					{slot}
				</div>
			))}
		</div>
	);
}

/**
 * Generate time slots array from start to end time with given interval
 */
function generateTimeSlots(
	startTime: string,
	endTime: string,
	interval: number,
): string[] {
	const startParts = startTime.split(":");
	const endParts = endTime.split(":");
	const startHour = Number(startParts[0] ?? 0);
	const startMinute = Number(startParts[1] ?? 0);
	const endHour = Number(endParts[0] ?? 23);
	const endMinute = Number(endParts[1] ?? 0);

	const startTotal = startHour * 60 + startMinute;
	const endTotal = endHour * 60 + endMinute;

	const slots: string[] = [];
	for (let total = startTotal; total < endTotal; total += interval) {
		const h = Math.floor(total / 60);
		const m = total % 60;
		slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
	}

	return slots;
}
