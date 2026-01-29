/**
 * Layout Constants for Facility Schedule
 */

export const DAY_VIEW = {
	SLOT_HEIGHT: 60,
	SLOT_WIDTH: 50,
	HEADER_HEIGHT: 64,
	TIME_COLUMN_WIDTH: 64,
	RESOURCE_COLUMN_MIN_WIDTH: 120, // Renamed from POSITION_COLUMN_MIN_WIDTH
} as const;

export const WEEK_VIEW = {
	DAY_CELL_HEIGHT: 110,
	DATE_COLUMN_WIDTH: 56,
	RESOURCE_MIN_WIDTH: 80, // Renamed from POSITION_MIN_WIDTH
	MAX_VISIBLE_EVENTS: 4, // Renamed from MAX_VISIBLE_SCHEDULES
} as const;

export const MONTH_VIEW = {
	DAY_CELL_MIN_HEIGHT: 100,
	LEGEND_BAR_HEIGHT: 40,
} as const;

export const PAGINATION = {
	ITEMS_PER_PAGE: 10,
} as const;

export const TRANSITION = {
	DURATION: 200,
} as const;
