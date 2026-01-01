/**
 * useScheduleEventHandlers - スケジュールイベントハンドラフック
 * 
 * FacilityScheduleコンポーネントから抽出したイベントハンドラロジック。
 * モーダル状態管理とイベント操作のロジックを集約します。
 */

import { useState, useCallback } from 'react';
import type { ScheduleEvent } from '../FacilitySchedule.schema';
import type { EventFormData } from '../components/EventModal/EventForm';

export interface UseScheduleEventHandlersOptions {
    onEventCreate?: (data: EventFormData) => void;
    onEventUpdate?: (id: string, data: EventFormData) => void;
    onEventDelete?: (id: string) => void;
    onDateChange?: (date: Date) => void;
    onViewChange?: (view: 'day' | 'week' | 'month') => void;
}

export interface UseScheduleEventHandlersResult {
    isModalOpen: boolean;
    selectedEvent: ScheduleEvent | undefined;
    newInfo: { resourceId?: string; startTime?: Date };
    handleEventClick: (event: ScheduleEvent) => void;
    handleEmptySlotClick: (resourceId: string | null, startTime: Date) => void;
    handleDayClick: (date: Date) => void;
    handleModalSave: (data: EventFormData) => void;
    handleModalDelete: (eventId: string) => void;
    handleModalClose: () => void;
}

/**
 * スケジュールイベントハンドラフック
 * 
 * @example
 * ```tsx
 * const {
 *   isModalOpen,
 *   selectedEvent,
 *   newInfo,
 *   handleEventClick,
 *   handleEmptySlotClick,
 *   handleModalSave,
 *   handleModalClose,
 * } = useScheduleEventHandlers({
 *   onEventCreate,
 *   onEventUpdate,
 *   onEventDelete,
 * });
 * ```
 */
export function useScheduleEventHandlers({
    onEventCreate,
    onEventUpdate,
    onEventDelete,
    onDateChange,
    onViewChange,
}: UseScheduleEventHandlersOptions): UseScheduleEventHandlersResult {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | undefined>(undefined);
    const [newInfo, setNewInfo] = useState<{ resourceId?: string; startTime?: Date }>({});

    const handleEventClick = useCallback((event: ScheduleEvent) => {
        setSelectedEvent(event);
        setNewInfo({});
        setIsModalOpen(true);
    }, []);

    const handleEmptySlotClick = useCallback((resourceId: string | null, startTime: Date) => {
        setSelectedEvent(undefined);
        setNewInfo({ resourceId: resourceId || undefined, startTime });
        setIsModalOpen(true);
    }, []);

    const handleDayClick = useCallback((date: Date) => {
        onDateChange?.(date);
        onViewChange?.('day');
    }, [onDateChange, onViewChange]);

    const handleModalSave = useCallback((data: EventFormData) => {
        if (selectedEvent) {
            onEventUpdate?.(selectedEvent.id, data);
        } else {
            onEventCreate?.(data);
        }
        setIsModalOpen(false);
    }, [selectedEvent, onEventCreate, onEventUpdate]);

    const handleModalDelete = useCallback((eventId: string) => {
        onEventDelete?.(eventId);
        setIsModalOpen(false);
    }, [onEventDelete]);

    const handleModalClose = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    return {
        isModalOpen,
        selectedEvent,
        newInfo,
        handleEventClick,
        handleEmptySlotClick,
        handleDayClick,
        handleModalSave,
        handleModalDelete,
        handleModalClose,
    };
}
