// 20 distinct colors for personnel - muted, non-fluorescent colors
export const PERSONNEL_COLORS = [
    '#3B82F6', // blue-500 (primary blue)
    '#DC2626', // red-600 (deeper red)
    '#7C3AED', // violet-600 (purple)
    '#0891B2', // cyan-600 (teal-ish)
    '#EA580C', // orange-600 (burnt orange)
    '#DB2777', // pink-600 (magenta)
    '#4F46E5', // indigo-600 (deep indigo)
    '#059669', // emerald-600 (forest green)
    '#9333EA', // purple-600 
    '#0284C7', // sky-600 (ocean blue)
    '#BE185D', // pink-700 (dark pink)
    '#0D9488', // teal-600
    '#7C2D12', // orange-900 (brown)
    '#1D4ED8', // blue-700 (navy)
    '#9F1239', // rose-800 (wine)
    '#6D28D9', // violet-700
    '#166534', // green-700 (dark green)
    '#B45309', // amber-700 (golden brown)
    '#1E40AF', // blue-800
    '#831843', // pink-900 (burgundy)
];

// Get color for personnel index (cycles through palette)
export function getPersonnelColor(index: number): string {
    return PERSONNEL_COLORS[index % PERSONNEL_COLORS.length];
}

// Create a map of personnelId to color based on selection order
export function createPersonnelColorMap(selectedIds: string[]): Map<string, string> {
    const colorMap = new Map<string, string>();
    selectedIds.forEach((id, index) => {
        colorMap.set(id, getPersonnelColor(index));
    });
    return colorMap;
}
