/**
 * Event Display Components
 */

import { useDraggable } from '@dnd-kit/core';
import type React from 'react';
import type { ScheduleEvent } from '../../RegularCalendar.schema';

// Helper to get location string
const getEventLocation = (event: ScheduleEvent): string => {
    // Use extendedProps if available, or description
    if (event.extendedProps?.location) {
        const loc = event.extendedProps.location;
        if (typeof loc === 'string') return loc;
        if (typeof loc === 'object') {
            const l = loc as any;
            return `${l.building || ''} ${l.room || ''}`.trim();
        }
    }
    return event.description || '';
};

// Helper to check if all day
const getEventIsAllDay = (event: ScheduleEvent): boolean => {
    return !!event.extendedProps?.isAllDay;
};

/**
 * Event Item for Day/Week View
 */
interface EventItemProps {
    event: ScheduleEvent;
    position: { top: number; height: number };
    onEventClick?: (event: ScheduleEvent) => void;
}

export const EventItem: React.FC<EventItemProps> = ({ event, position, onEventClick }) => {
    // Note: Drag functionality depends on DndContext being present in parent
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: event.id,
        data: event,
        disabled: false, // Default to true? Logic can be refined.
    });

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEventClick?.(event);
    };

    const title = event.title;
    const locationText = getEventLocation(event);

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    onEventClick?.(event);
                }
            }}
            className={`
        absolute left-1 right-1 rounded px-2 py-1 text-sm cursor-pointer
        transition-all select-none
        active:scale-95
        ${isDragging ? 'opacity-50 z-50' : 'hover:shadow-md z-10'}
      `}
            style={{
                top: `${position.top}px`,
                height: `${position.height}px`,
                minHeight: '44px',
                backgroundColor: event.color || '#3b82f6',
                color: 'white',
            }}
        >
            <div className="font-medium truncate">{title}</div>
            {position.height > 44 && locationText && (
                <div className="text-sm opacity-90 truncate">{locationText}</div>
            )}
        </div>
    );
};

/**
 * Event Item for Month View
 */
interface MonthEventItemProps {
    event: ScheduleEvent;
    onClick?: (event: ScheduleEvent) => void;
}

export const MonthEventItem: React.FC<MonthEventItemProps> = ({ event, onClick }) => {
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick?.(event);
    };

    const title = event.title;
    const isAllDay = getEventIsAllDay(event);

    const timeStr = isAllDay
        ? 'All Day'
        : `${event.startDate.getHours()}:${event.startDate.getMinutes().toString().padStart(2, '0')}`;

    return (
        <button
            type="button"
            onClick={handleClick}
            className="w-full text-left text-sm px-2 py-1 mb-0.5 rounded truncate cursor-pointer active:scale-95 transition-transform select-none border-0 min-h-[28px] flex items-center"
            style={{
                backgroundColor: event.color || '#3b82f6',
                color: 'white',
            }}
        >
            <span className="font-medium mr-1">{timeStr}</span> {title}
        </button>
    );
};

/**
 * Drag Overlay Component
 */
interface EventDragOverlayProps {
    event: ScheduleEvent;
}

export const EventDragOverlay: React.FC<EventDragOverlayProps> = ({ event }) => {
    const title = event.title;
    const locationText = getEventLocation(event);

    return (
        <div
            className="rounded px-2 py-2 text-sm shadow-lg min-h-[44px] flex flex-col justify-center"
            style={{
                backgroundColor: event.color || '#3b82f6',
                color: 'white',
                width: '200px',
            }}
        >
            <div className="font-medium">{title}</div>
            {locationText && <div className="text-sm opacity-90">{locationText}</div>}
        </div>
    );
};
