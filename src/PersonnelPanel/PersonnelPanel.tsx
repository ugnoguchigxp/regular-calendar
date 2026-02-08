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
	const [isSearchFocused, setIsSearchFocused] = useState(false);
	const [selectedDepartments, setSelectedDepartments] = useState<Set<string>>(
		new Set(),
	);
	const [contextMenu, setContextMenu] = useState<{
		personnel: Personnel | null;
		position: { x: number; y: number } | null;
	}>({ personnel: null, position: null });

	// Extract unique departments
	const availableDepartments = useMemo(() => {
		const depts = new Set(personnel.map((p) => p.department).filter(Boolean));
		return Array.from(depts).sort();
	}, [personnel]);

	// Filter personnel by search query (Name or Department)
	const filteredPersonnel = useMemo(() => {
		if (!searchQuery.trim() && selectedDepartments.size === 0) return personnel;
		const query = searchQuery.toLowerCase();
		return personnel.filter((p) => {
			if (
				selectedDepartments.size > 0 &&
				!selectedDepartments.has(p.department)
			) {
				return false;
			}
			if (!searchQuery.trim()) {
				return true;
			}
			return (
				p.name.toLowerCase().includes(query) ||
				p.department?.toLowerCase().includes(query)
			);
		});
	}, [personnel, searchQuery, selectedDepartments]);

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

	const handleDepartmentToggle = (department: string) => {
		setSelectedDepartments((prev) => {
			const next = new Set(prev);
			if (next.has(department)) {
				next.delete(department);
			} else {
				next.add(department);
			}
			return next;
		});
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
				className={`flex items-center gap-[var(--ui-space-2)] px-[var(--ui-space-2)] py-[var(--ui-space-1-5)] rounded cursor-pointer text-sm transition-colors w-full ${
					isSelected ? "border" : "hover:bg-muted/50 border border-transparent"
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
						className="w-[var(--ui-space-3)] h-[var(--ui-space-3)] rounded-full flex-shrink-0"
						style={{ backgroundColor: color }}
					/>
				) : (
					<div className="w-[var(--ui-space-3)] h-[var(--ui-space-3)] rounded-full flex-shrink-0 bg-transparent" />
				)}
				<div className="flex-1 min-w-[var(--ui-space-0)] text-left">
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
				<div className="text-sm font-semibold">{t("personnel_list_title")}</div>

				{/* Search Input with Department Suggestions */}
				<div className="relative">
					<input
						type="text"
						placeholder={t("personnel_search_placeholder")}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onFocus={() => setIsSearchFocused(true)}
						onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
						className="w-full px-[var(--ui-space-2)] py-[var(--ui-space-1-5)] text-sm border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
					/>

					{/* Dropdown Logic */}
					{isSearchFocused && (
						<div className="absolute top-full left-0 w-full mt-1 bg-popover border border-border rounded shadow-lg z-50 max-h-48 overflow-y-auto">
							<div className="p-1">
								{(() => {
									if (!searchQuery.trim()) {
										// Case 1: Empty input -> Show all departments
										return (
											<>
												<div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
													{t("personnel_all_departments")}
												</div>
												{availableDepartments.map((dept) => (
													<button
														key={dept}
														type="button"
														className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
														onClick={() => setSearchQuery(dept)}
													>
														{dept}
													</button>
												))}
											</>
										);
									}

									const query = searchQuery.toLowerCase();
									const nameMatches = personnel.filter((p) =>
										p.name.toLowerCase().includes(query),
									);

									if (nameMatches.length > 0) {
										// Case 2: Name matches -> Show matching personnel
										return nameMatches.map((p) => (
											<button
												key={p.id}
												type="button"
												className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
												onClick={() => setSearchQuery(p.name)}
											>
												<span className="font-medium">{p.name}</span>
												<span className="text-xs text-muted-foreground ml-2">
													({p.department})
												</span>
											</button>
										));
									}

									// Case 3: No name matches -> Show matching departments
									const deptMatches = availableDepartments.filter((d) =>
										d.toLowerCase().includes(query),
									);

									if (deptMatches.length > 0) {
										return deptMatches.map((dept) => (
											<button
												key={dept}
												type="button"
												className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
												onClick={() => setSearchQuery(dept)}
											>
												{dept}
											</button>
										));
									}

									return (
										<div className="px-2 py-2 text-sm text-muted-foreground text-center">
											{t("personnel_no_results")}
										</div>
									);
								})()}
							</div>
						</div>
					)}
				</div>

				{availableDepartments.length > 0 && (
					<div className="flex flex-wrap gap-[var(--ui-space-1)] max-h-[var(--ui-space-20)] overflow-auto">
						{availableDepartments.map((dept) => {
							const active = selectedDepartments.has(dept);
							return (
								<button
									key={dept}
									type="button"
									className={`text-xs px-[var(--ui-space-2)] py-[var(--ui-space-1)] rounded border cursor-pointer ${
										active
											? "bg-primary text-primary-foreground border-primary"
											: "bg-background border-border hover:bg-muted/40"
									}`}
									onClick={() => handleDepartmentToggle(dept)}
								>
									{dept}
								</button>
							);
						})}
					</div>
				)}
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
