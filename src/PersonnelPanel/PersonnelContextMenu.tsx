import { useEffect, useRef } from "react";
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
		{ label: "高優先度に設定", priority: 1, icon: "⬆️" },
		{ label: "通常に設定", priority: 0, icon: "➖" },
		{ label: "低優先度に設定", priority: -1, icon: "⬇️" },
	];

	return (
		<div
			ref={menuRef}
			className="fixed bg-popover border border-border rounded-md shadow-lg py-1 z-50 min-w-[160px]"
			style={{ left: position.x, top: position.y }}
		>
			<div className="px-3 py-1.5 text-xs text-muted-foreground border-b border-border">
				{personnel.name}
			</div>
			{menuItems.map((item) => (
				<button
					key={item.priority}
					type="button"
					className={`w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 transition-colors
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
