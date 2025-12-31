/**
 * Standard Week View Component
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FacilityScheduleSettings, ScheduleEvent } from '../../RegularCalendar.schema';
import { DEFAULT_VIEW_HOURS, TIME_SLOT_HEIGHT } from '../../constants/calendarConstants';
import {
    calculateEventPosition,
    generateTimeSlots,
    getEventsForDate,
    getWeekDates,
} from '../../utils/calendarHelpers';

import { CurrentTimeLine } from '../Common/CurrentTimeLine';
import { EventItem } from '../Common/EventComponents';

interface WeekViewProps {
    currentDate: Date;
    events: ScheduleEvent[];
    settings: FacilityScheduleSettings;
    onTimeSlotClick?: (date: Date, timeSlot: string) => void;
    onEventClick?: (event: ScheduleEvent) => void;
}

export function WeekView({
    currentDate,
    events,
    settings,
    onTimeSlotClick,
    onEventClick,
}: WeekViewProps) {
    const { t } = useTranslation();
    const timeInterval = settings.defaultDuration || 30;
    const startHour = Number(settings.startTime?.split(':')[0] || DEFAULT_VIEW_HOURS.start);
    const endHour = Number(settings.endTime?.split(':')[0] || DEFAULT_VIEW_HOURS.end);
    const weekStart = settings.weekStartsOn ?? 1;

    const weekDates = useMemo(
        () => getWeekDates(currentDate, weekStart),
        [currentDate, weekStart]
    );

    const timeSlots = useMemo(
        () => generateTimeSlots(timeInterval, startHour, endHour),
        [timeInterval, startHour, endHour]
    );

    // Simple day names - could come from i18n
    const dayNames = [
        t('days_short_sun'),
        t('days_short_mon'),
        t('days_short_tue'),
        t('days_short_wed'),
        t('days_short_thu'),
        t('days_short_fri'),
        t('days_short_sat')
    ];

    const today = new Date();
    const todayString = today.toDateString();

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [scrollbarPadding, setScrollbarPadding] = useState(0);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const measure = () => {
            const padding = container.offsetWidth - container.clientWidth;
            setScrollbarPadding(padding > 0 ? padding : 0);
        };

        measure();
        const resizeObserver = new ResizeObserver(measure);
        resizeObserver.observe(container);

        return () => resizeObserver.disconnect();
    }, []);

    // Filter All Day Events
    const { allDayEvents, timedEvents } = useMemo(() => {
        const allDay: ScheduleEvent[] = [];
        const timed: ScheduleEvent[] = [];

        console.log('WeekView events total:', events.length);

        events.forEach(e => {
            // Check both root and extendedProps for isAllDay
            const isAllDay = e.isAllDay || e.extendedProps?.isAllDay;
            // console.log('Event:', e.title, 'isAllDay:', isAllDay, e);

            if (isAllDay) {
                allDay.push(e);
            } else {
                timed.push(e);
            }
        });

        console.log('AllDay events count:', allDay.length);
        console.log('Timed events count:', timed.length);

        return { allDayEvents: allDay, timedEvents: timed };
    }, [events]);

    const weekEventsWithPosition = useMemo(() => {
        return weekDates.map((date) => {
            // Use TIMED events only
            const dayEvents = getEventsForDate(timedEvents, date);
            return {
                date: date.toISOString(),
                events: dayEvents.map((event) => ({
                    event,
                    position: calculateEventPosition(event, timeInterval, startHour),
                })),
            };
        });
    }, [weekDates, timedEvents, timeInterval, startHour]);

    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            {/* Header */}
            <div
                className="flex border-b border-border bg-muted/40 sticky top-0 z-30"
                style={{ paddingRight: scrollbarPadding || undefined }}
            >
                <div className="w-16 flex-shrink-0 border-r border-border bg-background" />
                {weekDates.map((date) => {
                    const isToday = date.toDateString() === todayString;
                    const isSelected = date.toDateString() === currentDate.toDateString();
                    const dayOfWeek = date.getDay();

                    const dayAllDayEvents = getEventsForDate(allDayEvents, date);

                    return (
                        <div
                            key={date.toISOString()}
                            className={`flex-1 p-2 text-center border-r border-border last:border-r-0 transition-colors
                            ${isSelected ? 'bg-primary/5' : ''}
                        `}
                        >
                            <div className={`text-xs font-medium ${dayOfWeek === 0 ? 'text-red-500' : dayOfWeek === 6 ? 'text-blue-500' : 'text-muted-foreground'}`}>
                                {dayNames[dayOfWeek]}
                            </div>
                            <div className={`text-xl font-bold mt-1 ${isToday ? 'text-primary' : ''}`}>
                                {date.getDate()}
                            </div>

                            {/* All Day Events in Header */}
                            <div className="mt-1 flex flex-col gap-0.5">
                                {dayAllDayEvents.map(event => (
                                    <button
                                        key={event.id}
                                        type="button"
                                        className={`
                                            text-[10px] px-1.5 py-0.5 rounded w-full text-left truncate leading-tight
                                            bg-primary text-primary-foreground
                                            hover:brightness-110 transition-colors
                                        `}
                                        style={event.color ? { backgroundColor: event.color } : {}}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEventClick?.(event);
                                        }}
                                    >
                                        {event.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* All Day Row */}


            {/* Grid */}
            <div className="flex-1 overflow-y-auto relative" ref={scrollContainerRef}>
                <div className="flex" style={{ minHeight: '600px' }}>
                    {/* Time Column */}
                    <div className="w-16 flex-shrink-0 sticky left-0 z-20 bg-background border-r border-border">
                        {timeSlots.map((timeSlot) => (
                            <div
                                key={timeSlot}
                                className="border-b border-border text-xs text-muted-foreground p-1 text-right pr-2"
                                style={{ height: `${TIME_SLOT_HEIGHT}px` }}
                            >
                                {timeSlot}
                            </div>
                        ))}
                    </div>

                    {/* Columns */}
                    <div className="flex-1 flex">
                        {weekDates.map((date, index) => {
                            const isToday = date.toDateString() === todayString;
                            const dateEvents = weekEventsWithPosition[index];

                            return (
                                <div key={date.toISOString()} className="flex-1 border-r border-border last:border-r-0 relative min-w-[100px]">
                                    <CurrentTimeLine
                                        interval={timeInterval}
                                        isToday={isToday}
                                        startHour={startHour}
                                        endHour={endHour}
                                        relative={true}
                                    />

                                    {timeSlots.map((timeSlot) => (
                                        <div
                                            key={`${date.toISOString()}-${timeSlot}`}
                                            onClick={() => onTimeSlotClick?.(date, timeSlot)}
                                            className="border-b border-border cursor-pointer transition-colors hover:bg-muted/30"
                                            style={{ height: `${TIME_SLOT_HEIGHT}px` }}
                                        />
                                    ))}

                                    {dateEvents?.events.map(({ event, position }) => (
                                        <EventItem
                                            key={event.id}
                                            event={event}
                                            position={position}
                                            onEventClick={onEventClick}
                                        />
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
