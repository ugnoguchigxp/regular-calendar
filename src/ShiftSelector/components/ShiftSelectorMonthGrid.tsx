import { SLOT_BADGES, SLOT_LABELS } from "../ShiftSelector.constants";
import type { ShiftSelectorMonthGridProps } from "../ShiftSelector.types";

export function ShiftSelectorMonthGrid({
	weekLabels,
	dayCells,
	eraseMode,
	onDateClick,
	onClearDateAssignments,
	onDeleteAssignment,
}: ShiftSelectorMonthGridProps) {
	return (
		<>
			<div className="grid grid-cols-7 border-b border-border bg-muted/40">
				{weekLabels.map((label) => (
					<div
						key={label}
						className="px-[var(--ui-space-2)] py-[var(--ui-space-1)] text-xs font-medium text-muted-foreground border-r border-border last:border-r-0"
					>
						{label}
					</div>
				))}
			</div>

			<div className="grid grid-cols-7">
				{dayCells.map((dayCell) => {
					const isCellClickable = !eraseMode;
					const cellClassName = `border-r border-b border-border last:border-r-0 p-[var(--ui-space-2)] min-h-[220px] flex flex-col gap-[var(--ui-space-1)] ${
						dayCell.inCurrentMonth
							? "bg-background"
							: "bg-muted/20 text-muted-foreground"
					} ${isCellClickable ? "cursor-pointer hover:bg-muted/50" : ""}`;
					const cellContent = (
						<>
							<div className="flex items-center justify-between">
								<div
									className={`text-xs font-semibold px-[var(--ui-space-1)] py-[var(--ui-space-0)] ${
										dayCell.isToday ? "text-primary" : "text-foreground"
									}`}
								>
									{dayCell.date.getDate()}
								</div>
								{eraseMode && (
									<button
										type="button"
										onClick={(event) => {
											event.stopPropagation();
											onClearDateAssignments(dayCell.dateKey);
										}}
										className="text-[10px] text-muted-foreground hover:text-foreground"
										title="この日の全割当をクリア"
									>
										全消去
									</button>
								)}
							</div>

							<div className="space-y-[4px]">
								{dayCell.assignments.map((row) => (
									<div
										key={`${dayCell.dateKey}_${row.staffId}`}
										className="text-[11px] rounded border border-border px-[4px] py-[2px] bg-background/90"
									>
										<div className="flex items-start gap-[var(--ui-space-1)]">
											<div className="font-medium break-words flex-1 min-w-[0]">
												{row.staffName}
											</div>
											{eraseMode && (
												<button
													type="button"
													onClick={(event) => {
														event.stopPropagation();
														onDeleteAssignment(dayCell.dateKey, row.staffId);
													}}
													className="text-[10px] px-[4px] py-[1px] rounded border border-destructive text-destructive hover:bg-destructive/10"
													title="このシフトを削除"
												>
													削除
												</button>
											)}
										</div>
										<div className="flex flex-wrap gap-[2px] mt-[1px]">
											{row.slots.map((slot) => (
												<span
													key={`${dayCell.dateKey}_${row.staffName}_${slot}`}
													className={`text-[10px] border rounded px-[3px] ${SLOT_BADGES[slot]}`}
												>
													{SLOT_LABELS[slot]}
												</span>
											))}
										</div>
									</div>
								))}
							</div>
						</>
					);

					if (!isCellClickable) {
						return (
							<div key={dayCell.dateKey} className={cellClassName}>
								{cellContent}
							</div>
						);
					}

					return (
						<button
							key={dayCell.dateKey}
							type="button"
							onClick={() => onDateClick(dayCell.dateKey)}
							className={cellClassName}
						>
							{cellContent}
						</button>
					);
				})}
			</div>
		</>
	);
}
