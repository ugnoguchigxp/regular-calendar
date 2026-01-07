/**
 * DateDisplay Component
 * Ported from @gxp/design-system to ensure full compatibility.
 * Uses Intl API for robust localization instead of date-fns format strings.
 */

import React from "react";
import { formatCalendarDate } from "@/utils/dateFormats";
import { useAppTranslation } from "@/utils/i18n";
import { cn } from "./Button"; // Reusing cn utility

interface DateDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
	date: Date;
	/**
	 * Display format
	 * - full: 2025年10月23日（木曜日） / Thursday, 23 October 2025
	 * - date: 2025年10月23日 / 23 October 2025
	 * - weekday: 木曜日 / Thursday
	 * - weekdayShort: 木 / Thu
	 * - yearMonth: 2025年10月 / October 2025
	 * - monthDay: 10月23日 / 23 October
	 * - monthDayShort: 10/23 (木) / 23 Oct (Thu)
	 * - compact: 11/27(木) / 27 Thu (multiline in orig, but simplified here)
	 */
	format?:
		| "full"
		| "date"
		| "weekday"
		| "weekdayShort"
		| "yearMonth"
		| "monthDay"
		| "monthDayShort"
		| "compact";

	// Legacy props for compatibility (now handled or ignored safely)
	variant?: string; // Mapped to format if possible
	showSecondary?: boolean;
	showDayOfWeek?: boolean;
}

/**
 * Get locale string based on language
 */
const getLocale = (lang: string): string => {
	return lang.startsWith("ja") ? "ja-JP" : "en-GB";
};

const getCalendarLocale = (calendar: string): string | null => {
	switch (calendar) {
		case "japanese":
			return "ja-JP-u-ca-japanese";
		case "buddhist":
			return "th-TH-u-ca-buddhist";
		case "islamic":
			return "ar-SA-u-ca-islamic";
		case "chinese":
			return "zh-CN-u-ca-chinese";
		default:
			return null;
	}
};

const isDisplayFormat = (
	value?: string,
): value is NonNullable<DateDisplayProps["format"]> => {
	return (
		value === "full" ||
		value === "date" ||
		value === "weekday" ||
		value === "weekdayShort" ||
		value === "yearMonth" ||
		value === "monthDay" ||
		value === "monthDayShort" ||
		value === "compact"
	);
};

const getSecondaryCalendarSetting = (): string | null => {
	if (typeof document === "undefined") return null;
	return document.documentElement.getAttribute("data-secondary-calendar");
};

const getPreferLocalCalendarSetting = (): boolean => {
	if (typeof document === "undefined") return false;
	return document.documentElement.getAttribute("data-prefer-local-calendar") === "true";
};

const getLocalCalendarForLocale = (lang: string): string | null => {
	if (lang.startsWith("ja")) return "japanese";
	if (lang.startsWith("th")) return "buddhist";
	if (lang.startsWith("ar")) return "islamic";
	if (lang.startsWith("zh")) return "chinese";
	return null;
};

const formatWithCalendar = (
	date: Date,
	locale: string,
	type: NonNullable<DateDisplayProps["format"]>,
	calendar: string,
): string => {
	const formatter = (options: Intl.DateTimeFormatOptions) =>
		new Intl.DateTimeFormat(locale, { ...options, calendar }).format(date);

	switch (type) {
		case "weekday":
			return formatter({ weekday: "long" });
		case "weekdayShort":
			return formatter({ weekday: "short" });
		case "date":
			return formatter({ year: "numeric", month: "short", day: "numeric" });
		case "monthDayShort":
			return formatter({ month: "short", day: "numeric", weekday: "short" });
		case "compact":
			return formatter({ month: "numeric", day: "numeric", weekday: "short" });
		case "yearMonth":
			return formatter({ year: "numeric", month: "long" });
		case "monthDay":
			return formatter({ month: "long", day: "numeric" });
		case "full":
		default:
			return formatter({
				year: "numeric",
				month: "long",
				day: "numeric",
				weekday: "long",
			});
	}
};

export const DateDisplay: React.FC<DateDisplayProps> = React.memo(
	({
		date,
		format = "full",
		variant,
		className,
		showSecondary,
		showDayOfWeek,
		...props
	}) => {
		const { i18n } = useAppTranslation();
		const lang = i18n.language || "en"; // Default to English if undefined
		const locale = getLocale(lang);

		// Compatibility mapper: Map 'variant' to 'format' if format is default
		const effectiveFormat =
			format === "full" && isDisplayFormat(variant) ? variant : format;

		const formatDate = (): string => {
			// Direct mapping for supported types including composites
			if (
				effectiveFormat === "full" ||
				effectiveFormat === "yearMonth" ||
				effectiveFormat === "monthDay" ||
				effectiveFormat === "monthDayShort" ||
				effectiveFormat === "compact" ||
				effectiveFormat === "weekday" ||
				effectiveFormat === "weekdayShort"
			) {
				return formatCalendarDate(date, locale, effectiveFormat);
			}

			if (effectiveFormat === "date") {
				// "date" usually maps to a standard date string.
				// Using 'picker' style (medium date) e.g. "Jan 2, 2026"
				return formatCalendarDate(date, locale, "picker");
			}

			return formatCalendarDate(date, locale, "full");
		};

		const getPrimaryCalendar = (): string | null => {
			if (getPreferLocalCalendarSetting()) {
				return getLocalCalendarForLocale(lang);
			}
			return null;
		};

		const formatPrimary = (): string => {
			const primaryCalendar = getPrimaryCalendar();
			if (primaryCalendar) {
				const primaryLocale = getCalendarLocale(primaryCalendar) ?? locale;
				return formatWithCalendar(date, primaryLocale, effectiveFormat, primaryCalendar);
			}
			return formatDate();
		};

		const formatSecondary = (): string | null => {
			if (!showSecondary) return null;
			const secondaryCalendar = getSecondaryCalendarSetting();
			if (!secondaryCalendar || secondaryCalendar === "none") return null;

			const primaryCalendar = getPrimaryCalendar();
			if (secondaryCalendar === primaryCalendar) return null;

			const secondaryLocale = getCalendarLocale(secondaryCalendar) ?? locale;
			return formatWithCalendar(date, secondaryLocale, effectiveFormat, secondaryCalendar);
		};

		const primaryText = formatPrimary();
		const secondaryText = formatSecondary();

		return (
			<span className={cn("inline-block", className)} {...props}>
				{primaryText}
				{secondaryText && (
					<span className="ml-[var(--ui-space-2)] text-muted-foreground">
						({secondaryText})
					</span>
				)}
			</span>
		);
	},
);

// Alias
export const DateFormat = DateDisplay;
