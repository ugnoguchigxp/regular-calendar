/**
 * useScheduleConflict - スケジュール競合チェックフック
 * 
 * EventFormから抽出した競合チェックロジック。
 * 指定された時間帯とリソースで既存イベントとの競合を検出します。
 */

import { useMemo } from 'react';
import type { ScheduleEvent } from '../FacilitySchedule.schema';
import { checkScheduleConflict } from '../utils/scheduleHelpers';

export interface UseScheduleConflictOptions {
    /** 開始日時（ISO形式文字列） */
    startDate: string;
    /** 予定時間（時間単位） */
    duration: number;
    /** リソースID */
    resourceId: string | undefined;
    /** 既存イベント一覧 */
    events: ScheduleEvent[];
    /** 編集中のイベントID（競合チェックから除外） */
    currentEventId?: string;
}

export interface ConflictInfo {
    existingSchedule: ScheduleEvent;
}

/**
 * スケジュール競合をチェックするフック
 * 
 * @returns 競合がある場合は競合情報、ない場合はnull
 * 
 * @example
 * ```tsx
 * const conflict = useScheduleConflict({
 *   startDate: '2024-01-01T10:00',
 *   duration: 2,
 *   resourceId: 'resource-1',
 *   events,
 *   currentEventId: event?.id,
 * });
 * 
 * if (conflict) {
 *   // 競合あり
 * }
 * ```
 */
export function useScheduleConflict({
    startDate,
    duration,
    resourceId,
    events,
    currentEventId,
}: UseScheduleConflictOptions): ConflictInfo | null {

    return useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(start);
        const minutes = (Number(duration) || 0) * 60;
        end.setMinutes(end.getMinutes() + minutes);

        if (!resourceId || Number.isNaN(start.getTime())) {
            return null;
        }

        const otherEvents = events.filter((e) => e.id !== currentEventId);

        return checkScheduleConflict(
            { startDate: start, endDate: end, resourceId },
            otherEvents
        );
    }, [startDate, duration, resourceId, events, currentEventId]);
}
