import { useMemo, useState } from "react";
import { useAppTranslation } from "@/utils/i18n";
import { PersonnelContextMenu } from "./PersonnelContextMenu";
import type { Personnel } from "./PersonnelPanel.schema";

interface PersonnelPanelProps {
	personnel: Personnel[];
	selectedIds: string[];
	onSelectionChange: (ids: string[]) => void;
	onPriorityChange: (id: string, priority: number) => void;
	className?: string;
	colorMap?: Map<string, string>;
}

export function PersonnelPanel({
	personnel,
	selectedIds,
	onSelectionChange,
	onPriorityChange,
	className = "",
	colorMap = new Map(),
}: PersonnelPanelProps) {
	const { t } = useAppTranslation();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL");
	const [contextMenu, setContextMenu] = useState<{
		personnel: Personnel | null;
		position: { x: number; y: number } | null;
	}>({ personnel: null, position: null });

	// Extract unique departments
	const availableDepartments = useMemo(() => {
		const depts = new Set(personnel.map((p) => p.department).filter(Boolean));
		return Array.from(depts).sort();
	}, [personnel]);

	// Filter personnel by search query and department
	const filteredPersonnel = useMemo(() => {
		let result = personnel;

		// Filter by Department
		if (selectedDepartment !== "ALL") {
			result = result.filter((p) => p.department === selectedDepartment);
		}

		// Filter by Search Query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(p) =>
					p.name.toLowerCase().includes(query) ||
					p.email.toLowerCase().includes(query),
			);
		}

		return result;
	}, [personnel, searchQuery, selectedDepartment]);

	// Group by priority for visual separation
	const groupedPersonnel = useMemo(() => {
		const high = filteredPersonnel.filter((p) => p.priority === 1);
		const normal = filteredPersonnel.filter((p) => p.priority === 0);
		const low = filteredPersonnel.filter((p) => p.priority === -1);
		return { high, normal, low };
	}, [filteredPersonnel]);

	const handleToggle = (id: string) => {
		if (selectedIds.includes(id)) {
			onSelectionChange(selectedIds.filter((sid) => sid !== id));
		} else {
			onSelectionChange([...selectedIds, id]);
		}
	};

	const handleContextMenu = (e: React.MouseEvent, p: Personnel) => {
		e.preventDefault();
		setContextMenu({
			personnel: p,
			position: { x: e.clientX, y: e.clientY },
		});
	};

	const renderPersonnelItem = (p: Personnel) => {
		const isSelected = selectedIds.includes(p.id);
		const color = colorMap.get(p.id);

		return (
			<button
				key={p.id}
				type="button"
				className={`flex items-center gap-[var(--ui-space-2)] px-[var(--ui-space-2)] py-[var(--ui-space-1-5)] rounded cursor-pointer text-sm transition-colors ${isSelected ? "border" : "hover:bg-muted/50 border border-transparent"
					}`}
				style={
					isSelected && color
						? {
							backgroundColor: `${color}20`, // 20% opacity
							borderColor: color,
						}
						: {}
				}
				onClick={() => handleToggle(p.id)}
				onContextMenu={(e) => handleContextMenu(e, p)}
			>
				{/* Color badge for selected */}
				{isSelected && color ? (
					<div
						className="w-[var(--ui-space-4)] h-[var(--ui-space-4)] rounded-sm flex-shrink-0"
						style={{ backgroundColor: color }}
					/>
				) : (
					<div className="w-[var(--ui-space-4)] h-[var(--ui-space-4)] rounded border border-border flex-shrink-0" />
				)}
				<div className="flex-1 min-w-[var(--ui-space-0)]">
					<div className="truncate font-medium">{p.name}</div>
					<div className="truncate text-xs text-muted-foreground">
						{p.department}
					</div>
				</div>
				{p.priority === 1 && (
					<span className="text-xs" title={t("personnel_priority_high")}>
						⬆️
					</span>
				)}
				{p.priority === -1 && (
					<span className="text-xs" title={t("personnel_priority_low")}>
						⬇️
					</span>
				)}
			</button>
		);
	};

	return (
		<div
			className={`flex flex-col h-full bg-background border-r border-border ${className}`}
		>
			{/* Header */}
			<div className="p-[var(--ui-space-2)] border-b border-border space-y-[var(--ui-space-2)]">
				<div className="text-sm font-semibold">
					{t("personnel_list_title")}
				</div>

				{/* Department Filter */}
				<select
					value={selectedDepartment}
					onChange={(e) => setSelectedDepartment(e.target.value)}
					className="w-full px-[var(--ui-space-2)] py-[var(--ui-space-1-5)] text-sm border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
				>
					<option value="ALL">{t("personnel_all_departments")}</option>
					{availableDepartments.map((dept) => (
						<option key={dept} value={dept}>
							{dept}
						</option>
					))}
				</select>

				<input
					type="text"
					placeholder={t("personnel_search_placeholder")}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full px-[var(--ui-space-2)] py-[var(--ui-space-1-5)] text-sm border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
				/>
			</div>

			{/* List */}
			<div className="flex-1 overflow-y-auto p-[var(--ui-space-1)]">
				{groupedPersonnel.high.length > 0 && (
					<div className="mb-[var(--ui-space-2)]">
						<div className="px-[var(--ui-space-2)] py-[var(--ui-space-1)] text-xs font-semibold text-muted-foreground">
							{t("personnel_priority_high")}
						</div>
						{groupedPersonnel.high.map(renderPersonnelItem)}
					</div>
				)}

				{groupedPersonnel.normal.length > 0 && (
					<div className="mb-[var(--ui-space-2)]">
						{groupedPersonnel.high.length > 0 && (
							<div className="px-[var(--ui-space-2)] py-[var(--ui-space-1)] text-xs font-semibold text-muted-foreground">
								{t("personnel_priority_normal")}
							</div>
						)}
						{groupedPersonnel.normal.map(renderPersonnelItem)}
					</div>
				)}

				{groupedPersonnel.low.length > 0 && (
					<div className="mb-[var(--ui-space-2)]">
						<div className="px-[var(--ui-space-2)] py-[var(--ui-space-1)] text-xs font-semibold text-muted-foreground">
							{t("personnel_priority_low")}
						</div>
						{groupedPersonnel.low.map(renderPersonnelItem)}
					</div>
				)}

				{filteredPersonnel.length === 0 && (
					<div className="px-[var(--ui-space-2)] py-[var(--ui-space-4)] text-center text-sm text-muted-foreground">
						{t("personnel_no_results")}
					</div>
				)}
			</div>

			{/* Footer - Selection count */}
			<div className="p-[var(--ui-space-2)] border-t border-border text-xs text-muted-foreground">
				{selectedIds.length > 0
					? t("personnel_selected_count", {
						count: selectedIds.length,
						defaultValue: `${selectedIds.length} selected`,
					})
					: t("personnel_context_hint")}
			</div>

			{/* Context Menu */}
			<PersonnelContextMenu
				personnel={contextMenu.personnel}
				position={contextMenu.position}
				onClose={() => setContextMenu({ personnel: null, position: null })}
				onSetPriority={onPriorityChange}
			/>
		</div>
	);
}
