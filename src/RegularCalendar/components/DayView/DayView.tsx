import { DateDisplay } from '@/components/ui/DateDisplay';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FacilityScheduleSettings, ScheduleEvent } from '../../RegularCalendar.schema';
import { DEFAULT_VIEW_HOURS, TIME_SLOT_HEIGHT } from '../../constants/calendarConstants';
import {
    calculateEventPosition,
    generateTimeSlots,
    getEventsForDate,
} from '../../utils/calendarHelpers';
import { CurrentTimeLine } from '../Common/CurrentTimeLine';
import { EventItem } from '../Common/EventComponents';

interface DayViewProps {
    currentDate: Date;
    events: ScheduleEvent[];
    settings: FacilityScheduleSettings;
    onTimeSlotClick?: (date: Date, timeSlot: string) => void;
    onEventClick?: (event: ScheduleEvent) => void;
}

export function DayView({
    currentDate,
    events,
    settings,
    onTimeSlotClick,
    onEventClick,
}: DayViewProps) {
    const timeInterval = settings.defaultDuration || 30; // Fallback to 30 min
    const startHour = Number(settings.startTime?.split(':')[0] || DEFAULT_VIEW_HOURS.start);
    const endHour = Number(settings.endTime?.split(':')[0] || DEFAULT_VIEW_HOURS.end);

    const timeSlots = useMemo(
        () => generateTimeSlots(timeInterval, startHour, endHour),
        [timeInterval, startHour, endHour]
    );

    const dayEvents = useMemo(() => getEventsForDate(events, currentDate), [events, currentDate]);

    const { allDayEvents, timeEvents } = useMemo(() => {
        const allDay: ScheduleEvent[] = [];
        const time: ScheduleEvent[] = [];
        dayEvents.forEach(e => {
            if (e.isAllDay) allDay.push(e);
            else time.push(e);
        });
        return { allDayEvents: allDay, timeEvents: time };
    }, [dayEvents]);

    const eventsWithPosition = useMemo(
        () =>
            timeEvents.map((event) => ({
                event,
                position: calculateEventPosition(event, timeInterval, startHour, settings.timeZone),
            })),
        [timeEvents, timeInterval, startHour, settings.timeZone]
    );

    const today = new Date();
    const isToday = currentDate.toDateString() === today.toDateString();

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

    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            {/* Date Header */}
            <div
                className={`border-b border-border p-2 sticky top-0 z-10 text-center ${isToday ? 'bg-muted/50' : 'bg-muted/40'
                    }`}
                style={{ paddingRight: scrollbarPadding || undefined }}
            >
                <div className="text-xs font-medium text-muted-foreground">
                    <DateDisplay date={currentDate} format="weekday" />
                </div>
                <div className={`text-xl font-bold mt-1 ${isToday ? 'text-primary' : ''}`}>
                    {currentDate.getDate()}
                </div>
            </div>

            {/* All Day Events Row - Only shown if there are allDay events */}
            {allDayEvents.length > 0 && (
                <div
                    className="flex border-b border-border bg-muted/20 sticky top-[52px] z-10"
                    style={{ paddingRight: scrollbarPadding || undefined }}
                >
                    <div className="w-16 flex-shrink-0 border-r border-border bg-background flex items-center justify-end pr-1">
                        <span className="text-[9px] text-muted-foreground">終日</span>
                    </div>
                    <div className="flex-1 p-0.5 min-w-0">
                        <div className="flex flex-col gap-0.5">
                            {allDayEvents.map(event => (
                                <button
                                    key={event.id}
                                    type="button"
                                    className={`
                                        text-[9px] px-1 py-0.5 rounded w-full text-left truncate leading-tight
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
                </div>
            )}

            {/* Time Slots Area */}
            <div className="flex-1 overflow-y-auto relative" ref={scrollContainerRef}>
                <div className="flex" style={{ minHeight: `${(endHour - startHour) * 60 / timeInterval * TIME_SLOT_HEIGHT}px` }}>
                    <div className="w-16 flex-shrink-0 bg-background sticky left-0 z-20">
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
                    <div className="flex-1 relative border-l border-border min-w-[200px]">
                        <CurrentTimeLine
                            interval={timeInterval}
                            isToday={isToday}
                            startHour={startHour}
                            endHour={endHour}
                            relative={true}
                            timeZone={settings.timeZone}
                        />

                        {/* Slots Background */}
                        {timeSlots.map((timeSlot) => (
                            <div
                                key={timeSlot}
                                onClick={() => onTimeSlotClick?.(currentDate, timeSlot)}
                                className="border-b border-border cursor-pointer transition-colors hover:bg-muted/30"
                                style={{ height: `${TIME_SLOT_HEIGHT}px` }}
                            />
                        ))}

                        {/* Events */}
                        {eventsWithPosition.map(({ event, position }) => (
                            <EventItem
                                key={event.id}
                                event={event}
                                position={position}
                                onEventClick={onEventClick}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
