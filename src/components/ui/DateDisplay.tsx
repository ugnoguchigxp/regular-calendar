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

		return (
			<span className={cn("inline-block", className)} {...props}>
				{formatDate()}
			</span>
		);
	},
);

// Alias
export const DateFormat = DateDisplay;
