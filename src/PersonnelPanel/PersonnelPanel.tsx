import { useState, useMemo } from 'react';
import type { Personnel } from './PersonnelPanel.schema';
import { PersonnelContextMenu } from './PersonnelContextMenu';
import { getPersonnelColor } from './personnelColors';

interface PersonnelPanelProps {
    personnel: Personnel[];
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    onPriorityChange: (id: string, priority: number) => void;
    className?: string;
}

export function PersonnelPanel({
    personnel,
    selectedIds,
    onSelectionChange,
    onPriorityChange,
    className = '',
}: PersonnelPanelProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [contextMenu, setContextMenu] = useState<{
        personnel: Personnel | null;
        position: { x: number; y: number } | null;
    }>({ personnel: null, position: null });

    // Create color map for selected personnel
    const colorMap = useMemo(() => {
        const map = new Map<string, string>();
        selectedIds.forEach((id, index) => {
            map.set(id, getPersonnelColor(index));
        });
        return map;
    }, [selectedIds]);

    // Filter personnel by search query
    const filteredPersonnel = useMemo(() => {
        if (!searchQuery.trim()) return personnel;
        const query = searchQuery.toLowerCase();
        return personnel.filter(
            (p) =>
                p.name.toLowerCase().includes(query) ||
                p.email.toLowerCase().includes(query)
        );
    }, [personnel, searchQuery]);

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
            <div
                key={p.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm transition-colors ${isSelected ? 'border' : 'hover:bg-muted/50 border border-transparent'
                    }`}
                style={isSelected && color ? {
                    backgroundColor: `${color}20`, // 20% opacity
                    borderColor: color,
                } : {}}
                onClick={() => handleToggle(p.id)}
                onContextMenu={(e) => handleContextMenu(e, p)}
            >
                {/* Color badge for selected */}
                {isSelected && color ? (
                    <div
                        className="w-4 h-4 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: color }}
                    />
                ) : (
                    <div className="w-4 h-4 rounded border border-border flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{p.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{p.department}</div>
                </div>
                {p.priority === 1 && <span className="text-xs" title="高優先度">⬆️</span>}
                {p.priority === -1 && <span className="text-xs" title="低優先度">⬇️</span>}
            </div>
        );
    };

    return (
        <div className={`flex flex-col h-full bg-background border-r border-border ${className}`}>
            {/* Header */}
            <div className="p-2 border-b border-border">
                <div className="text-sm font-semibold mb-2">職員一覧</div>
                <input
                    type="text"
                    placeholder="名前・メールで検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-1">
                {groupedPersonnel.high.length > 0 && (
                    <div className="mb-2">
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">高優先度</div>
                        {groupedPersonnel.high.map(renderPersonnelItem)}
                    </div>
                )}

                {groupedPersonnel.normal.length > 0 && (
                    <div className="mb-2">
                        {groupedPersonnel.high.length > 0 && (
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">通常</div>
                        )}
                        {groupedPersonnel.normal.map(renderPersonnelItem)}
                    </div>
                )}

                {groupedPersonnel.low.length > 0 && (
                    <div className="mb-2">
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">低優先度</div>
                        {groupedPersonnel.low.map(renderPersonnelItem)}
                    </div>
                )}

                {filteredPersonnel.length === 0 && (
                    <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                        該当する職員が見つかりません
                    </div>
                )}
            </div>

            {/* Footer - Selection count */}
            <div className="p-2 border-t border-border text-xs text-muted-foreground">
                {selectedIds.length > 0 ? `${selectedIds.length}名 選択中` : '右クリックで優先度設定'}
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

