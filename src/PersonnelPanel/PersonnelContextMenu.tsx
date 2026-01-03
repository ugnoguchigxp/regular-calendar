import { useEffect, useRef } from "react";
import { useAppTranslation } from "@/utils/i18n";
import type { Personnel } from "./PersonnelPanel.schema";

interface PersonnelContextMenuProps {
	personnel: Personnel | null;
	position: { x: number; y: number } | null;
	onClose: () => void;
	onSetPriority: (id: string, priority: number) => void;
}

export function PersonnelContextMenu({
	personnel,
	position,
	onClose,
	onSetPriority,
}: PersonnelContextMenuProps) {
	const { t } = useAppTranslation();
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				onClose();
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [onClose]);

	if (!personnel || !position) return null;

	const menuItems = [
		{ label: t("personnel_priority_high"), priority: 1, icon: "⬆️" },
		{ label: t("personnel_priority_normal"), priority: 0, icon: "➖" },
		{ label: t("personnel_priority_low"), priority: -1, icon: "⬇️" },
	];

	return (
		<div
			ref={menuRef}
			className="fixed bg-popover border border-border rounded-md shadow-lg py-[var(--ui-space-1)] z-50 min-w-[var(--ui-space-40)]"
			style={{ left: position.x, top: position.y }}
		>
			<div className="px-[var(--ui-space-3)] py-[var(--ui-space-1-5)] text-xs text-muted-foreground border-b border-border">
				{personnel.name}
			</div>
			{menuItems.map((item) => (
				<button
					key={item.priority}
					type="button"
					className={`w-full px-[var(--ui-space-3)] py-[var(--ui-space-2)] text-left text-sm hover:bg-muted flex items-center gap-[var(--ui-space-2)] transition-colors
                        ${personnel.priority === item.priority ? "text-primary font-medium" : "text-foreground"}
                    `}
					onClick={() => {
						onSetPriority(personnel.id, item.priority);
						onClose();
					}}
				>
					<span>{item.icon}</span>
					<span>{item.label}</span>
					{personnel.priority === item.priority && (
						<span className="ml-auto text-primary">✓</span>
					)}
				</button>
			))}
		</div>
	);
}
