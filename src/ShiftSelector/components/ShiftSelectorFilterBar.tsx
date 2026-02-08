import { Button } from "../../components/ui/Button";
import {
	SLOT_LABELS,
	SLOT_ORDER,
	SLOT_SELECTION_BADGES,
} from "../ShiftSelector.constants";
import type { ShiftSelectorFilterBarProps } from "../ShiftSelector.types";

export function ShiftSelectorFilterBar({
	selectedSlots,
	visibleSlots,
	eraseMode,
	onToggleSlot,
	onToggleVisibleSlot,
	onToggleEraseMode,
}: ShiftSelectorFilterBarProps) {
	return (
		<div className="border-t border-border px-[var(--ui-space-3)] py-[var(--ui-space-2)] flex flex-wrap items-center gap-[var(--ui-space-2)]">
			{SLOT_ORDER.map((slot) => {
				const checked = selectedSlots.has(slot);
				return (
					<label
						key={slot}
						className={`flex items-center gap-[var(--ui-space-1)] text-xs rounded border px-[var(--ui-space-2)] py-[var(--ui-space-1)] cursor-pointer ${
							checked
								? SLOT_SELECTION_BADGES[slot]
								: "bg-background border-border hover:bg-muted/40"
						}`}
					>
						<input
							type="checkbox"
							checked={checked}
							onChange={() => onToggleSlot(slot)}
						/>
						{SLOT_LABELS[slot]}
					</label>
				);
			})}

			<div className="w-px h-5 bg-border mx-[var(--ui-space-1)]" />

			{SLOT_ORDER.map((slot) => {
				const checked = visibleSlots.has(slot);
				return (
					<label
						key={`visible_${slot}`}
						className={`flex items-center gap-[var(--ui-space-1)] text-xs rounded border px-[var(--ui-space-2)] py-[var(--ui-space-1)] cursor-pointer ${
							checked
								? SLOT_SELECTION_BADGES[slot]
								: "bg-background border-border opacity-70 hover:bg-muted/40"
						}`}
					>
						<input
							type="checkbox"
							checked={checked}
							onChange={() => onToggleVisibleSlot(slot)}
						/>
						{SLOT_LABELS[slot]}
					</label>
				);
			})}

			<Button
				type="button"
				size="sm"
				variant={eraseMode ? "destructive" : "outline"}
				onClick={onToggleEraseMode}
				className="ml-auto"
			>
				削除モード
			</Button>
		</div>
	);
}
