import { useAppTranslation } from "@/utils/i18n";
import type { AppSettings } from "../../types";
import { Button } from "../ui/Button";

export interface SettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
	settings: AppSettings;
	onUpdateSettings: (partial: Partial<AppSettings>) => void;
	onResetSettings?: () => void;
}

const HOURS = [
	...Array.from(
		{ length: 24 },
		(_, i) => `${i.toString().padStart(2, "0")}:00`,
	),
	"24:00",
	"25:00",
	"26:00",
	"27:00",
	"28:00",
	"29:00",
	"30:00",
];

export function SettingsModal({
	isOpen,
	onClose,
	settings,
	onUpdateSettings,
	onResetSettings,
}: SettingsModalProps) {
	const { t } = useAppTranslation();

	if (!isOpen) return null;

	// Helper for instant update
	const update = (partial: Partial<AppSettings>) => {
		onUpdateSettings(partial);
	};

	// Get localized days
	const daysShort = [
		t("days_short_sun"),
		t("days_short_mon"),
		t("days_short_tue"),
		t("days_short_wed"),
		t("days_short_thu"),
		t("days_short_fri"),
		t("days_short_sat"),
	];

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
			<button
				type="button"
				aria-label={t("close")}
				onClick={onClose}
				className="absolute inset-0 border-none bg-transparent p-0 m-0 w-full h-full cursor-default"
			/>
			<div className="relative z-10 w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-background text-foreground shadow-xl p-6">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-border pb-4 mb-6">
					<h2 className="m-0 text-xl font-bold">
						{t("settings_title")}
					</h2>
					<Button variant="ghost" size="icon" onClick={onClose}>
						✕
					</Button>
				</div>

				{/* Language (New) */}
				<div className="mb-6">
					<div className="block mb-2 text-sm font-bold">{t("settings_language")}</div>
					<div className="flex flex-wrap gap-2">
						{(["ja", "en"] as const).map((lang) => (
							<Button
								key={lang}
								variant={settings.language === lang ? "default" : "outline"}
								onClick={() => update({ language: lang })}
							>
								{lang === "ja" ? "日本語" : "English"}
							</Button>
						))}
					</div>
				</div>

				{/* TimeZone (New) */}
				<div className="mb-6">
					<label htmlFor="settings-timezone" className="block mb-2 text-sm font-bold">
						TimeZone
					</label>
					<select
						id="settings-timezone"
						value={settings.timeZone || "Asia/Tokyo"}
						onChange={(e) => update({ timeZone: e.target.value })}
						className="h-ui w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					>
						<option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
						<option value="UTC">UTC</option>
						<option value="America/New_York">America/New_York (ET)</option>
						<option value="Europe/London">Europe/London (GMT/BST)</option>
						<option value="Asia/Shanghai">Asia/Shanghai (CST)</option>
					</select>
				</div>

				{/* Theme */}
				<div className="mb-6">
					<div className="block mb-2 text-sm font-bold">{t("settings_theme")}</div>
					<div className="flex flex-wrap gap-2">
						{(["light", "dark"] as const).map((theme) => (
							<Button
								key={theme}
								variant={settings.theme === theme ? "default" : "outline"}
								onClick={() => update({ theme })}
							>
								{theme === "light" ? t("option_light") : t("option_dark")}
							</Button>
						))}
					</div>
				</div>

				{/* Density */}
				<div className="mb-6">
					<div className="block mb-2 text-sm font-bold">{t("settings_density")}</div>
					<div className="flex flex-wrap gap-2">
						{(["compact", "normal", "spacious"] as const).map((density) => (
							<Button
								key={density}
								variant={settings.density === density ? "default" : "outline"}
								onClick={() => update({ density })}
							>
								{density === "compact"
									? t("option_compact")
									: density === "normal"
										? t("option_normal")
										: t("option_spacious")}
							</Button>
						))}
					</div>
				</div>

				{/* Border Radius */}
				<div className="mb-6">
					<label htmlFor="settings-radius" className="block mb-2 text-sm font-bold">
						{t("settings_radius")}: {settings.borderRadius}px
					</label>
					<input
						id="settings-radius"
						type="range"
						min="0"
						max="16"
						value={settings.borderRadius}
						onChange={(e) => update({ borderRadius: Number(e.target.value) })}
						className="w-full cursor-pointer"
					/>
				</div>

				{/* Font Size */}
				<div className="mb-6">
					<label htmlFor="settings-font-size" className="block mb-2 text-sm font-bold">
						{t("settings_font_size")}: {settings.fontSize}px
					</label>
					<input
						id="settings-font-size"
						type="range"
						min="12"
						max="20"
						value={settings.fontSize}
						onChange={(e) => update({ fontSize: Number(e.target.value) })}
						className="w-full cursor-pointer"
					/>
				</div>

				{/* Week Start */}
				<div className="mb-6">
					<label htmlFor="settings-week-start" className="block mb-2 text-sm font-bold">
						{t("settings_week_start")}
					</label>
					<select
						id="settings-week-start"
						value={settings.weekStartsOn}
						onChange={(e) =>
							update({ weekStartsOn: Number(e.target.value) as 0 | 1 })
						}
						className="h-ui w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					>
						<option value={0}>{t("option_sunday")}</option>
						<option value={1}>{t("option_monday")}</option>
					</select>
				</div>

				{/* Business Hours */}
				<div className="mb-6">
					<div className="block mb-2 text-sm font-bold">{t("settings_business_hours")}</div>
					<div className="flex items-center gap-2">
						<select
							value={settings.businessHoursStart}
							onChange={(e) => update({ businessHoursStart: e.target.value })}
							className="h-ui flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						>
							{HOURS.map((h) => (
								<option key={h} value={h}>
									{h}
								</option>
							))}
						</select>
						<span>〜</span>
						<select
							value={settings.businessHoursEnd}
							onChange={(e) => update({ businessHoursEnd: e.target.value })}
							className="h-ui flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						>
							{HOURS.map((h) => (
								<option key={h} value={h}>
									{h}
								</option>
							))}
						</select>
					</div>
				</div>

				{/* Closed Days */}
				<div className="mb-6">
					<div className="block mb-2 text-sm font-bold">{t("settings_closed_days")}</div>
					<div className="flex flex-wrap gap-2">
						{daysShort.map((day, index) => (
							<Button
								key={day}
								variant={
									settings.closedDays.includes(index)
										? "destructive"
										: "outline"
								}
								size="sm" // Use small buttons for days
								onClick={() => {
									const newDays = settings.closedDays.includes(index)
										? settings.closedDays.filter((d) => d !== index)
										: [...settings.closedDays, index];
									update({ closedDays: newDays });
								}}
								className="w-10 h-10 p-0"
							>
								{day}
							</Button>
						))}
					</div>
				</div>

				{/* Reset Button (Optional) */}
				{onResetSettings && (
					<div className="mt-8 border-t border-border pt-4">
						<Button
							variant="outline"
							className="w-full text-destructive hover:bg-destructive/10 hover:border-destructive h-ui"
							onClick={onResetSettings}
						>
							Reset All Settings
						</Button>
					</div>
				)}
			</div>
		</div >
	);
}
