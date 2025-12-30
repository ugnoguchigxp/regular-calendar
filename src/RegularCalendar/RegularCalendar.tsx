import { Button } from '@/components/ui/Button';
import { DateDisplay as DateFormat } from '@/components/ui/DateDisplay';
import { Icons } from '@/components/ui/Icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DayView } from './components/DayView/DayView';
import { MonthView } from './components/MonthView/MonthView';
import { ViewSelector } from '@/components/ui/ViewSelector';
import { WeekView } from './components/WeekView/WeekView';
import type { FacilityScheduleSettings, ScheduleEvent, ViewMode } from './RegularCalendar.schema';

export interface RegularCalendarProps {
    // Data
    events: ScheduleEvent[];
    settings: FacilityScheduleSettings;

    // State (controlled)
    currentDate?: Date;
    viewMode?: ViewMode;

    // Actions
    onDateChange?: (date: Date) => void;
    onViewChange?: (view: ViewMode) => void;

    // Event Actions
    onEventClick?: (event: ScheduleEvent) => void;
    onTimeSlotClick?: (date: Date) => void;
    onDateClick?: (date: Date) => void;

    // Customization
    isLoading?: boolean;
    className?: string;

    // Custom header slots
    headerLeft?: React.ReactNode;
    headerRight?: React.ReactNode;
}

export function RegularCalendar({
    events,
    settings,
    currentDate: propCurrentDate,
    viewMode: propViewMode,
    onDateChange,
    onViewChange,
    onEventClick,
    onTimeSlotClick,
    onDateClick,
    isLoading = false,
    className,
    headerLeft,
    headerRight,
}: RegularCalendarProps) {
    const { t } = useTranslation();

    // Internal State
    const [internalDate, setInternalDate] = useState(new Date());
    const [internalViewMode, setInternalViewMode] = useState<ViewMode>('month');

    // Derived State
    const currentDate = propCurrentDate ?? internalDate;
    const viewMode = propViewMode ?? internalViewMode;

    // Helpers
    const handleDateNavigate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (viewMode === 'day') {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        } else if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        } else {
            newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        }

        if (onDateChange) onDateChange(newDate);
        else setInternalDate(newDate);
    };

    const handleToday = () => {
        const today = new Date();
        if (onDateChange) onDateChange(today);
        else setInternalDate(today);
    };

    const handleViewChange = (mode: ViewMode) => {
        if (onViewChange) onViewChange(mode);
        else setInternalViewMode(mode);
    };

    // Event Handlers Wrapper
    const handleTimeSlotClick = (date: Date, timeSlotString?: string) => {
        // timeSlotString is passed from Day/Week views as "HH:mm"
        const targetDate = new Date(date);
        if (timeSlotString) {
            const [hours, minutes] = timeSlotString.split(':').map(Number);
            if (!isNaN(hours)) targetDate.setHours(hours);
            if (!isNaN(minutes)) targetDate.setMinutes(minutes);
        }
        onTimeSlotClick?.(targetDate);
    };

    const handleDayClick = (date: Date) => {
        if (onDateClick) onDateClick(date);
        // Optional: Switch to day view on date click if desired
        // if (onViewChange) onViewChange('day');
        // else setInternalViewMode('day');

        // For now, just propagate the date change and maybe let parent decide
        if (onDateChange) onDateChange(date);
        else setInternalDate(date);
    };

    return (
        <div className={`flex flex-col h-full bg-background ${className}`}>
            {/* Header */}
            <header className="border-b border-border px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleDateNavigate('prev')}>
                        <Icons.ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={handleToday}>
                        Today
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDateNavigate('next')}>
                        <Icons.ChevronRight className="h-4 w-4" />
                    </Button>

                    <span className="text-lg font-bold ml-2">
                        <DateFormat date={currentDate} showSecondary showDayOfWeek />
                    </span>
                    {headerLeft}
                </div>

                <div className="flex items-center gap-4">
                    <ViewSelector
                        currentView={viewMode}
                        onViewChange={handleViewChange}
                        options={[
                            { value: 'day', label: t('views.day') },
                            { value: 'week', label: t('views.week') },
                            { value: 'month', label: t('views.month') },
                        ]}
                    />
                    {headerRight}
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center">
                        Loading...
                    </div>
                )}

                {viewMode === 'day' && (
                    <DayView
                        currentDate={currentDate}
                        events={events}
                        settings={settings}
                        onEventClick={onEventClick}
                        onTimeSlotClick={handleTimeSlotClick}
                    />
                )}

                {viewMode === 'week' && (
                    <WeekView
                        currentDate={currentDate}
                        events={events}
                        settings={settings}
                        onEventClick={onEventClick}
                        onTimeSlotClick={handleTimeSlotClick}
                    />
                )}

                {viewMode === 'month' && (
                    <MonthView
                        currentDate={currentDate}
                        events={events}
                        settings={settings}
                        onEventClick={onEventClick}
                        onDateClick={handleDayClick}
                    />
                )}
            </div>
        </div>
    );
}
