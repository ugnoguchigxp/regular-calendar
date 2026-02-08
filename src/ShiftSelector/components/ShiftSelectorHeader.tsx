import { CalendarDateNavigator } from "../../components/ui/CalendarDateNavigator";
import type { ShiftSelectorHeaderProps } from "../ShiftSelector.types";

export function ShiftSelectorHeader({
	monthCursor,
	onNavigate,
	onToday,
}: ShiftSelectorHeaderProps) {
	return (
		<div className="px-[var(--ui-space-3)] py-[var(--ui-space-2)] flex items-center gap-[var(--ui-space-2)]">
			<CalendarDateNavigator
				currentDate={monthCursor}
				onNavigate={onNavigate}
				onToday={onToday}
				dateFormat="yearMonth"
			/>
		</div>
	);
}
