/**
 * dateNavigation - 日付ナビゲーションユーティリティ
 *
 * RegularCalendarとuseScheduleViewで重複していた日付計算ロジックを統合。
 */

import { addDays, addMonths, addWeeks } from "@/utils/dateUtils";
import type { ViewMode } from "../FacilitySchedule/FacilitySchedule.schema";

/**
 * ビューモードに応じて日付を前後に移動
 *
 * @param currentDate 現在の日付
 * @param viewMode ビューモード（day/week/month）
 * @param direction 移動方向（prev/next）
 * @returns 移動後の日付
 *
 * @example
 * ```typescript
 * const nextWeek = navigateDate(new Date(), 'week', 'next');
 * const prevDay = navigateDate(new Date(), 'day', 'prev');
 * ```
 */
export function navigateDate(
	currentDate: Date,
	viewMode: ViewMode,
	direction: "prev" | "next",
): Date {
	const offset = direction === "next" ? 1 : -1;

	switch (viewMode) {
		case "day":
			return addDays(currentDate, offset);
		case "week":
			return addWeeks(currentDate, offset);
		case "month":
			return addMonths(currentDate, offset);
		default:
			return currentDate;
	}
}

/**
 * 今日の日付を取得（時刻を0:00:00にリセット）
 *
 * @returns 今日の日付（時刻なし）
 */
export function getToday(): Date {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return today;
}
