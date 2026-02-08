import { PersonnelPanel } from "../../PersonnelPanel/PersonnelPanel";
import type { ShiftSelectorStaffPanelProps } from "../ShiftSelector.types";

export function ShiftSelectorStaffPanel({
	personnel,
	selectedIds,
	onSelectionChange,
}: ShiftSelectorStaffPanelProps) {
	return (
		<PersonnelPanel
			personnel={personnel}
			selectedIds={selectedIds}
			onSelectionChange={onSelectionChange}
			onPriorityChange={() => {}}
			className="h-full rounded-md border border-border"
		/>
	);
}
