import type { Resource, ScheduleEvent } from "../FacilitySchedule.schema";

export interface ResourceAvailabilityInfo {
	resourceId: string;
	isAvailable: boolean;
	conflictingEvents: ScheduleEvent[];
	todaySchedule: ScheduleEvent[];
}

/**
 * 指定された時間範囲に対するすべてのリソースの空き状況を計算する。
 * 視覚化のために、開始日のイベントも返す。
 */
export function getResourceAvailability(
	resources: Resource[],
	events: ScheduleEvent[],
	timeRange: { start: Date; end: Date },
	excludeEventId?: string,
): ResourceAvailabilityInfo[] {
	const { start, end } = timeRange;

	// 無効な日付の場合は全リソースを利用可能として返す
	if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
		return resources.map((r) => ({
			resourceId: r.id,
			isAvailable: true,
			conflictingEvents: [],
			todaySchedule: [],
		}));
	}

	// 当日スケジュール表示用の日付範囲
	const dayStart = new Date(start);
	dayStart.setHours(0, 0, 0, 0);
	const dayEnd = new Date(start);
	dayEnd.setHours(23, 59, 59, 999);

	return resources.map((resource) => {
		const resourceId = resource.id;

		// このリソースのイベントをフィルタ（編集中のイベントとキャンセル済みを除外）
		const resourceEvents = events.filter(
			(e) =>
				e.resourceId === resourceId &&
				e.id !== excludeEventId &&
				e.status !== "cancelled",
		);

		// 1. 競合イベントを計算
		const conflicts = resourceEvents.filter((e) => {
			// 終日イベントの堅牢なチェック
			const val = e.isAllDay ?? e.extendedProps?.isAllDay;
			const isAllDay =
				val === true || val === "true" || val === 1 || val === "1";

			const eStart = new Date(e.startDate);
			let eEnd = new Date(e.endDate);

			if (isAllDay) {
				// 終日イベントを00:00から翌日00:00までに正規化
				eStart.setHours(0, 0, 0, 0);
				if (
					eEnd <= eStart ||
					(eEnd.getDate() === eStart.getDate() &&
						eEnd.getFullYear() === eStart.getFullYear() &&
						eEnd.getMonth() === eStart.getMonth())
				) {
					eEnd = new Date(eStart);
					eEnd.setDate(eEnd.getDate() + 1);
				} else {
					eEnd.setHours(0, 0, 0, 0);
					if (eEnd <= eStart) {
						eEnd = new Date(eStart);
						eEnd.setDate(eEnd.getDate() + 1);
					}
				}
			}

			// 時間範囲の重複チェック
			return start < eEnd && end > eStart;
		});

		// 2. 当日スケジュールを取得（タイムライン表示用）
		const todayEvents = resourceEvents.filter((e) => {
			const eStart = new Date(e.startDate);
			const eEnd = new Date(e.endDate);
			return dayStart < eEnd && dayEnd > eStart;
		});

		// 開始時刻でソート
		todayEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

		return {
			resourceId,
			isAvailable: conflicts.length === 0,
			conflictingEvents: conflicts,
			todaySchedule: todayEvents,
		};
	});
}
