/**
 * DateDisplay Component
 * Ported from @gxp/design-system to ensure full compatibility.
 * Uses Intl API for robust localization instead of date-fns format strings.
 */

import React from "react";
import { useTranslation } from "react-i18next";
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
	return lang === "ja" ? "ja-JP" : "en-GB";
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
		const { i18n } = useTranslation();
		const lang = i18n.language || "ja"; // Default to ja if undefined
		const locale = getLocale(lang);

		// Compatibility mapper: Map 'variant' to 'format' if format is default
		const effectiveFormat =
			format === "full" && isDisplayFormat(variant) ? variant : format;

		const formatDate = (): string => {
			switch (effectiveFormat) {
				case "weekday":
					return date.toLocaleDateString(locale, { weekday: "long" });

				case "weekdayShort":
					return date.toLocaleDateString(locale, { weekday: "short" });

				case "yearMonth":
					if (lang === "ja") {
						return `${date.getFullYear()}年${date.getMonth() + 1}月`;
					}
					return date.toLocaleDateString(locale, {
						year: "numeric",
						month: "long",
					});

				case "monthDay":
					if (lang === "ja") {
						return `${date.getMonth() + 1}月${date.getDate()}日`;
					}
					return date.toLocaleDateString(locale, {
						day: "numeric",
						month: "long",
					});

				case "monthDayShort": {
					if (lang === "ja") {
						const weekdayShort = date.toLocaleDateString(locale, {
							weekday: "short",
						});
						return `${date.getMonth() + 1}/${date.getDate()} (${weekdayShort})`;
					}
					const monthShort = date.toLocaleDateString(locale, {
						month: "short",
					});
					const weekdayShort = date.toLocaleDateString(locale, {
						weekday: "short",
					});
					return `${date.getDate()} ${monthShort} (${weekdayShort})`;
				}

				case "compact": {
					if (lang === "ja") {
						const weekdayShort = date.toLocaleDateString(locale, {
							weekday: "short",
						});
						// Note: keeping it inline for span compatibility, original had \n
						return `${date.getMonth() + 1}/${date.getDate()} (${weekdayShort})`;
					}
					const weekdayShort = date.toLocaleDateString(locale, {
						weekday: "short",
					});
					return `${date.getDate()} ${weekdayShort}`;
				}

				case "date":
					if (lang === "ja") {
						return date.toLocaleDateString(locale, {
							year: "numeric",
							month: "long",
							day: "numeric",
						});
					}
					return date.toLocaleDateString(locale, {
						day: "numeric",
						month: "long",
						year: "numeric",
					});

				default:
					// full
					if (lang === "ja") {
						const dateStr = date.toLocaleDateString(locale, {
							year: "numeric",
							month: "long",
							day: "numeric",
						});
						const weekday = date.toLocaleDateString(locale, {
							weekday: "long",
						});
						return `${dateStr}（${weekday}）`;
					}
					return date.toLocaleDateString(locale, {
						weekday: "long",
						day: "numeric",
						month: "long",
						year: "numeric",
					});
			}
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
