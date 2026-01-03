/**
 * LegendBar - 密度凡例バーコンポーネント
 */

export function LegendBar() {
	const levels = [
		{ label: "0%", opacity: 0 },
		{ label: "20%", opacity: 0.28 }, // 0.1 + 0.2 * 0.9
		{ label: "40%", opacity: 0.46 }, // 0.1 + 0.4 * 0.9
		{ label: "60%", opacity: 0.64 }, // 0.1 + 0.6 * 0.9
		{ label: "80%", opacity: 0.82 }, // 0.1 + 0.8 * 0.9
		{ label: "100%", opacity: 1.0 }, // 0.1 + 1.0 * 0.9 -> max 1.0
	];

	return (
		<div className="flex items-center justify-center gap-[var(--ui-space-4)] py-[var(--ui-space-3)] border-t border-border bg-background">
			<span className="text-sm text-gray-600">予約密度:</span>
			<div className="flex items-center gap-[var(--ui-space-1)]">
				{levels.map((level, index) => (
					<div
						key={level.label}
						className="flex flex-col items-center gap-[var(--ui-space-1)]"
					>
						<div
							className="w-[var(--ui-space-8)] h-[var(--ui-space-8)] border border-gray-300"
							style={{
								backgroundColor:
									level.opacity === 0
										? "white"
										: `hsl(var(--theme-accent) / ${level.opacity})`,
							}}
						/>
						{(index === 0 || index === levels.length - 1) && (
							<span className="text-xs text-gray-600">{level.label}</span>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
