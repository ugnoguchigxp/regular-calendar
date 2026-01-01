/**
 * useResourceAvailability - リソース可用性管理フック
 * 
 * EventFormから抽出したリソース可用性チェックと表示ロジック。
 * 指定された時間範囲でリソースが利用可能かを判定し、
 * 利用可能なリソースの一覧を提供します。
 */

import { useMemo } from 'react';
import type { Resource, ResourceGroup, ScheduleEvent } from '../FacilitySchedule.schema';
import { getResourceAvailability } from '../utils/resourceAvailability';

export interface UseResourceAvailabilityOptions {
    /** 全リソースのリスト */
    resources: Resource[];
    /** グループ情報 */
    groups: ResourceGroup[];
    /** 既存のイベント一覧 */
    events: ScheduleEvent[];
    /** チェック対象の時間範囲 */
    timeRange: { start: Date; end: Date };
    /** 編集中のイベントID（競合チェックから除外） */
    currentEventId?: string;
    /** 外部から提供されたリソース可用性（オプション） */
    externalAvailability?: { resourceId: string; isAvailable: boolean }[];
}

export interface UseResourceAvailabilityResult {
    /** リソース可用性の一覧 */
    availabilityList: { resourceId: string; isAvailable: boolean }[];
    /** 利用可能なリソースの一覧 */
    availableResources: Resource[];
    /** グループ名付きリソース名の一覧 */
    resourceNames: string[];
    /** リソースIDから表示名を取得 */
    getDisplayName: (resourceId: string) => string;
}

/**
 * リソース可用性を管理するフック
 * 
 * @example
 * ```tsx
 * const { availableResources, resourceNames, getDisplayName } = useResourceAvailability({
 *   resources,
 *   groups,
 *   events,
 *   timeRange: { start, end },
 *   currentEventId: event?.id,
 * });
 * ```
 */
export function useResourceAvailability({
    resources,
    groups,
    events,
    timeRange,
    currentEventId,
    externalAvailability,
}: UseResourceAvailabilityOptions): UseResourceAvailabilityResult {

    // リソース可用性リストの計算
    const availabilityList = useMemo(() => {
        if (externalAvailability) {
            return externalAvailability;
        }
        // フォールバック: 従来のgetResourceAvailabilityを使用
        return getResourceAvailability(resources, events, timeRange, currentEventId);
    }, [externalAvailability, resources, events, timeRange.start.getTime(), timeRange.end.getTime(), currentEventId]);

    // 利用可能なリソースのフィルタリング
    const availableResources = useMemo(() => {
        return resources.filter(r => {
            const availability = availabilityList.find(a => a.resourceId === r.id);
            return availability?.isAvailable ?? true;
        });
    }, [resources, availabilityList]);

    // 表示用のリソース名を生成
    const resourceNames = useMemo(() => {
        return availableResources.map(r => {
            const group = groups.find(g => g.id === r.groupId);
            return group ? `${r.name} (${group.name})` : r.name;
        });
    }, [availableResources, groups]);

    // リソースIDから表示名を取得する関数
    const getDisplayName = useMemo(() => {
        return (resourceId: string): string => {
            const res = resources.find(r => r.id === resourceId);
            if (!res) return resourceId;
            const group = groups.find(g => g.id === res.groupId);
            return group ? `${res.name} (${group.name})` : res.name;
        };
    }, [resources, groups]);

    return {
        availabilityList,
        availableResources,
        resourceNames,
        getDisplayName,
    };
}
