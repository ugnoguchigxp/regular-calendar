/**
 * Utility for handling date formats using the standard Intl API.
 * Automatically supports all languages supported by the browser/runtime.
 */

export type DateFormatType =
	| "header"
	| "picker"
	| "weekday"
	| "weekdayShort"
	| "day"
	| "full"
	| "yearMonth"
	| "monthDay"
	| "monthDayShort"
	| "compact"
	| "time"
	| "timeWithSeconds"
	| "timeWithMs"
	| "time12"
	| "time24"
	| "year"
	| "month"
	| "monthShort"
	| "minute"
	| "second";

/**
 * Formats a date string according to the locale and type using Intl.DateTimeFormat.
 *
 * @param date The date to format.
 * @param localeCode The locale code (e.g., 'en-US', 'ja', 'es'). Defaults to system locale if undefined.
 * @param type The type of format needed ('header', 'picker', 'weekday', 'day').
 * @returns The formatted date string.
 */
export function formatCalendarDate(
	date: Date,
	localeCode: string | undefined,
	type: DateFormatType,
): string {
	const locale = localeCode || undefined; // undefined lets Intl use default system locale

	switch (type) {
		case "header":
			// "Jan 2026" (en), "2026年1月" (ja)
			return new Intl.DateTimeFormat(locale, {
				year: "numeric",
				month: "short",
			}).format(date);

		case "picker":
			// "Jan 2, 2026" (en), "2026年1月2日" (ja)
			return new Intl.DateTimeFormat(locale, {
				year: "numeric",
				month: "short",
				day: "numeric",
			}).format(date);

		case "weekday":
			// "Sunday" (en), "日曜日" (ja)
			return new Intl.DateTimeFormat(locale, {
				weekday: "long",
			}).format(date);

		case "weekdayShort":
			// "Sun" (en), "日" (ja)
			return new Intl.DateTimeFormat(locale, {
				weekday: "short",
			}).format(date);

		case "day":
			// "1" (en), "1" (ja) - Use NumberFormat to avoid "日" suffix in Japanese
			return new Intl.NumberFormat(locale).format(date.getDate());

		case "monthDayShort":
			// "Thu, Oct 23" (en), "10月23日(木)" (ja - approx depending on browser)
			return new Intl.DateTimeFormat(locale, {
				month: "short",
				day: "numeric",
				weekday: "short",
			}).format(date);

		case "compact":
			// "10/23 (Thu)" style preference often implies numeric month/day + short weekday
			return new Intl.DateTimeFormat(locale, {
				month: "numeric",
				day: "numeric",
				weekday: "short",
			}).format(date);

		case "time":
			// Locale default time style (system/locale preference)
			return new Intl.DateTimeFormat(locale, {
				hour: "numeric",
				minute: "numeric",
			}).format(date);

		case "timeWithSeconds":
			// "14:30:45"
			return new Intl.DateTimeFormat(locale, {
				hour: "numeric",
				minute: "numeric",
				second: "numeric",
			}).format(date);

		case "timeWithMs":
			// "14:30:45.123"
			return new Intl.DateTimeFormat(locale, {
				hour: "numeric",
				minute: "numeric",
				second: "numeric",
				fractionalSecondDigits: 3,
			} as Intl.DateTimeFormatOptions & {
				fractionalSecondDigits?: number;
			}).format(date);

		case "minute":
			// "30"
			return new Intl.DateTimeFormat(locale, {
				minute: "numeric",
			}).format(date);

		case "second":
			// "45"
			return new Intl.DateTimeFormat(locale, {
				second: "numeric",
			}).format(date);

		case "time12":
			// "12:00 PM" (en), "午後12:00" (ja)
			return new Intl.DateTimeFormat(locale, {
				hour: "numeric",
				minute: "numeric",
				hour12: true,
			}).format(date);

		case "time24":
			// "14:30" - forcing 24h usage often desired for schedules
			return new Intl.DateTimeFormat(locale, {
				hour: "numeric",
				minute: "numeric",
				hour12: false,
			}).format(date);

		case "year":
			// "2025"
			return new Intl.DateTimeFormat(locale, {
				year: "numeric",
			}).format(date);

		case "month":
			// "October" (en), "10月" (ja)
			return new Intl.DateTimeFormat(locale, {
				month: "long",
			}).format(date);

		case "monthShort":
			// "Oct" (en), "10月" (ja)
			return new Intl.DateTimeFormat(locale, {
				month: "short",
			}).format(date);

		case "full":
			// "Friday, October 23, 2025" (en), "2025年10月23日金曜日" (ja)
			return new Intl.DateTimeFormat(locale, {
				year: "numeric",
				month: "long",
				day: "numeric",
				weekday: "long",
			}).format(date);

		case "yearMonth":
			// "October 2025" (en), "2025年10月" (ja) (Standard long format)
			return new Intl.DateTimeFormat(locale, {
				year: "numeric",
				month: "long",
			}).format(date);

		case "monthDay":
			// "October 23" (en), "10月23日" (ja)
			return new Intl.DateTimeFormat(locale, {
				month: "long",
				day: "numeric",
			}).format(date);

		default:
			return date.toLocaleDateString(locale);
	}
}
