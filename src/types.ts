export interface AppSettings {
	theme: "light" | "dark";
	density: "compact" | "normal" | "spacious";
	borderRadius: number; // 0-16
	fontSize: number; // 12-20
	weekStartsOn: 0 | 1; // 0=Sunday, 1=Monday
	businessHoursStart: string; // "HH:mm"
	businessHoursEnd: string; // "HH:mm"
	closedDays: number[]; // 0-6 (Sunday=0)
	language: "ja" | "en";
	timeZone: string;
	paginationEnabled: boolean;
	paginationPageSize: number;
	calendarOrientation: "horizontal" | "vertical";
	facilityOrientation: "horizontal" | "vertical";
	calendarSlotInterval: 15 | 30 | 60 | 120;
	facilitySlotInterval: 15 | 30 | 60 | 120;
}

export const DEFAULT_SETTINGS: AppSettings = {
	theme: "light",
	density: "normal",
	borderRadius: 8,
	fontSize: 16,
	weekStartsOn: 1,
	businessHoursStart: "08:00",
	businessHoursEnd: "18:00",
	closedDays: [0, 6], // Sunday and Saturday
	language: "ja",
	timeZone: "Asia/Tokyo",
	paginationEnabled: false,
	paginationPageSize: 8,
	calendarOrientation: "horizontal",
	facilityOrientation: "horizontal",
	calendarSlotInterval: 60,
	facilitySlotInterval: 60,
};
