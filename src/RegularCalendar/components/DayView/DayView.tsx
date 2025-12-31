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
                position: calculateEventPosition(event, timeInterval, startHour),
            })),
        [timeEvents, timeInterval, startHour]
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
                className={`border-b border-border p-4 sticky top-0 z-10 flex items-center justify-center ${isToday ? 'bg-muted/50' : 'bg-background'
                    }`}
                style={{ paddingRight: scrollbarPadding || undefined }}
            >
                <div>
                    <span className="text-2xl font-bold">
                        <DateDisplay date={currentDate} format="date" />
                    </span>
                    <span className="ml-2 text-muted-foreground">
                        <DateDisplay date={currentDate} format="weekday" />
                    </span>
                </div>
            </div>

            {/* All Day Events Area */}
            {allDayEvents.length > 0 && (
                <div className="border-b border-border bg-muted/20 p-2 flex flex-col gap-1 sticky top-[73px] z-10"
                    style={{ paddingRight: scrollbarPadding ? scrollbarPadding + 8 : 8, paddingLeft: 64 }}>
                    <div className="absolute left-2 top-2 text-xs font-semibold text-muted-foreground w-12 text-right">
                        All Day
                    </div>
                    {allDayEvents.map(event => (
                        <div
                            key={event.id}
                            className="text-xs bg-primary/10 border-l-4 border-primary p-1 rounded cursor-pointer hover:bg-primary/20 truncate"
                            onClick={() => onEventClick?.(event)}
                        >
                            {event.title}
                        </div>
                    ))}
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
