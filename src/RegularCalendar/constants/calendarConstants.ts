/**
 * Standard Calendar Constants
 */

// Time slot height (px)
export const TIME_SLOT_HEIGHT = 60;

// Time slot width (px) - for horizontal timeline
export const TIME_SLOT_WIDTH = 50;

// Color Theme
export const CALENDAR_COLORS = {
	// Event Colors
	eventBlue: "#3b82f6",
	eventGreen: "#10b981",
	eventPurple: "#8b5cf6",
	eventRed: "#ef4444",
	eventOrange: "#f97316",

	// Current Time Line
	currentTimeLine: "#ef4444",

	// Closed Day
	closedDay: "#f97316",
	closedDayBg: "#fed7aa",
	closedDayLight: "#ffedd5",

	// Sunday
	sunday: "#dc2626",

	// Saturday
	saturday: "#2563eb",

	// Selection
	selected: "#dbeafe",
	selectedBorder: "#3b82f6",

	// Hover
	hover: "#eff6ff",

	// Today
	today: "#2563eb",
} as const;

// Default Settings
export const DEFAULT_VIEW_HOURS = {
	start: 8,
	end: 20,
} as const;

// Time Constants
export const TIME_CONSTANTS = {
	MINUTES_PER_HOUR: 60,
	MILLISECONDS_PER_MINUTE: 60 * 1000,
	HOURS_PER_DAY: 24,
	DAYS_PER_WEEK: 7,
} as const;

export const UI_CONSTANTS = {
	MODAL_VERTICAL_MARGIN_REM: 4,
} as const;
