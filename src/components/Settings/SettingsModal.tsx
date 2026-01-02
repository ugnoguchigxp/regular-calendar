import { useTranslation } from "react-i18next";
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
	const { t } = useTranslation();

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

	// Style constants
	const overlayStyle: React.CSSProperties = {
		position: "fixed",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0,0,0,0.5)",
		zIndex: 9999,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		pointerEvents: "auto",
	};

	const modalStyle: React.CSSProperties = {
		backgroundColor: "hsl(var(--background))",
		color: "hsl(var(--foreground))",
		border: "1px solid hsl(var(--border))",
		borderRadius: "8px",
		width: "100%",
		maxWidth: "500px",
		maxHeight: "90vh",
		overflowY: "auto",
		padding: "24px",
		pointerEvents: "auto",
		boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
	};

	const sectionStyle: React.CSSProperties = { marginBottom: "24px" };
	const labelStyle: React.CSSProperties = {
		display: "block",
		marginBottom: "8px",
		fontWeight: "bold",
		fontSize: "14px",
	};
	const rowStyle: React.CSSProperties = {
		display: "flex",
		gap: "8px",
		flexWrap: "wrap",
	};

	return (
		<div style={overlayStyle}>
			<button
				type="button"
				aria-label={t("close")}
				onClick={onClose}
				style={{
					position: "absolute",
					inset: 0,
					background: "transparent",
					border: "none",
					padding: 0,
					margin: 0,
				}}
			/>
			<div style={{ ...modalStyle, position: "relative", zIndex: 1 }}>
				{/* Header */}
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "24px",
						borderBottom: "1px solid hsl(var(--border))",
						paddingBottom: "16px",
					}}
				>
					<h2 style={{ margin: 0, fontSize: "20px", fontWeight: "bold" }}>
						{t("settings_title")}
					</h2>
					<Button variant="ghost" size="icon" onClick={onClose}>
						✕
					</Button>
				</div>

				{/* Language (New) */}
				<div style={sectionStyle}>
					<div style={labelStyle}>{t("settings_language")}</div>
					<div style={rowStyle}>
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
				<div style={sectionStyle}>
					<label htmlFor="settings-timezone" style={labelStyle}>
						TimeZone
					</label>
					<select
						id="settings-timezone"
						value={settings.timeZone || "Asia/Tokyo"}
						onChange={(e) => update({ timeZone: e.target.value })}
						style={{
							width: "100%",
							padding: "8px",
							borderRadius: "6px",
							border: "1px solid hsl(var(--border))",
							backgroundColor: "hsl(var(--background))",
							color: "hsl(var(--foreground))",
						}}
					>
						<option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
						<option value="UTC">UTC</option>
						<option value="America/New_York">America/New_York (ET)</option>
						<option value="Europe/London">Europe/London (GMT/BST)</option>
						<option value="Asia/Shanghai">Asia/Shanghai (CST)</option>
					</select>
				</div>

				{/* Theme */}
				<div style={sectionStyle}>
					<div style={labelStyle}>{t("settings_theme")}</div>
					<div style={rowStyle}>
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
				<div style={sectionStyle}>
					<div style={labelStyle}>{t("settings_density")}</div>
					<div style={rowStyle}>
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
				<div style={sectionStyle}>
					<label htmlFor="settings-radius" style={labelStyle}>
						{t("settings_radius")}: {settings.borderRadius}px
					</label>
					<input
						id="settings-radius"
						type="range"
						min="0"
						max="16"
						value={settings.borderRadius}
						onChange={(e) => update({ borderRadius: Number(e.target.value) })}
						style={{ width: "100%", cursor: "pointer" }}
					/>
				</div>

				{/* Font Size */}
				<div style={sectionStyle}>
					<label htmlFor="settings-font-size" style={labelStyle}>
						{t("settings_font_size")}: {settings.fontSize}px
					</label>
					<input
						id="settings-font-size"
						type="range"
						min="12"
						max="20"
						value={settings.fontSize}
						onChange={(e) => update({ fontSize: Number(e.target.value) })}
						style={{ width: "100%", cursor: "pointer" }}
					/>
				</div>

				{/* Week Start */}
				<div style={sectionStyle}>
					<label htmlFor="settings-week-start" style={labelStyle}>
						{t("settings_week_start")}
					</label>
					<select
						id="settings-week-start"
						value={settings.weekStartsOn}
						onChange={(e) =>
							update({ weekStartsOn: Number(e.target.value) as 0 | 1 })
						}
						style={{
							width: "100%",
							padding: "8px",
							borderRadius: "6px",
							border: "1px solid hsl(var(--border))",
							backgroundColor: "hsl(var(--background))",
							color: "hsl(var(--foreground))",
						}}
					>
						<option value={0}>{t("option_sunday")}</option>
						<option value={1}>{t("option_monday")}</option>
					</select>
				</div>

				{/* Business Hours */}
				<div style={sectionStyle}>
					<div style={labelStyle}>{t("settings_business_hours")}</div>
					<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
						<select
							value={settings.businessHoursStart}
							onChange={(e) => update({ businessHoursStart: e.target.value })}
							style={{
								flex: 1,
								padding: "8px",
								borderRadius: "6px",
								border: "1px solid hsl(var(--border))",
								backgroundColor: "hsl(var(--background))",
								color: "hsl(var(--foreground))",
							}}
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
							style={{
								flex: 1,
								padding: "8px",
								borderRadius: "6px",
								border: "1px solid hsl(var(--border))",
								backgroundColor: "hsl(var(--background))",
								color: "hsl(var(--foreground))",
							}}
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
				<div style={sectionStyle}>
					<div style={labelStyle}>{t("settings_closed_days")}</div>
					<div style={rowStyle}>
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
					<div
						style={{
							marginTop: "32px",
							borderTop: "1px solid hsl(var(--border))",
							paddingTop: "16px",
						}}
					>
						<Button
							variant="outline"
							className="w-full text-destructive hover:bg-destructive/10 hover:border-destructive"
							onClick={onResetSettings}
						>
							Reset All Settings
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
