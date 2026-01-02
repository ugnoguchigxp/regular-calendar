import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RegularCalendar } from './RegularCalendar';
import type { ScheduleEvent, FacilityScheduleSettings } from './RegularCalendar.schema';
import { defaultStorage } from '../utils/StorageAdapter';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: 'ja',
        },
    }),
}));

vi.mock('@/components/ui/Icons', () => ({
    Icons: {
        ChevronLeft: () => <div data-testid="chevron-left" />,
        ChevronRight: () => <div data-testid="chevron-right" />,
    },
}));

vi.mock('@/components/ui/ViewSelector', () => ({
    ViewSelector: ({ currentView, onViewChange, options }: any) => (
        <div data-testid="view-selector">
            {options.map((opt: any) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onViewChange(opt.value)}
                    data-active={currentView === opt.value}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    ),
}));

vi.mock('./components/DayView/DayView', () => ({
    DayView: () => <div data-testid="day-view" />,
}));

vi.mock('./components/WeekView/WeekView', () => ({
    WeekView: () => <div data-testid="week-view" />,
}));

vi.mock('./components/MonthView/MonthView', () => ({
    MonthView: () => <div data-testid="month-view" />,
}));

describe('RegularCalendar', () => {
    const mockEvents: ScheduleEvent[] = [];
    const mockSettings: FacilityScheduleSettings = {
        startTime: '00:00',
        endTime: '23:59',
        defaultDuration: 1,
        closedDays: [],
        weekStartsOn: 0,
    };
    const mockOnDateChange = vi.fn();
    const mockOnViewChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders with default props', () => {
        render(
            <RegularCalendar
                events={mockEvents}
                settings={mockSettings}
            />,
        );

        expect(screen.getByTestId('chevron-left')).toBeInTheDocument();
        expect(screen.getByTestId('chevron-right')).toBeInTheDocument();
        expect(screen.getByText('today_button')).toBeInTheDocument();
        expect(screen.getByTestId('view-selector')).toBeInTheDocument();
    });

    it('renders week view by default', () => {
        render(
            <RegularCalendar
                events={mockEvents}
                settings={mockSettings}
            />,
        );

        expect(screen.getByTestId('week-view')).toBeInTheDocument();
        expect(screen.queryByTestId('day-view')).not.toBeInTheDocument();
        expect(screen.queryByTestId('month-view')).not.toBeInTheDocument();
    });

    it('renders with controlled view mode', () => {
        render(
            <RegularCalendar
                events={mockEvents}
                settings={mockSettings}
                viewMode="day"
            />,
        );

        expect(screen.getByTestId('day-view')).toBeInTheDocument();
        expect(screen.queryByTestId('week-view')).not.toBeInTheDocument();
    });

    it('renders with controlled date', () => {
        const testDate = new Date('2025-01-15');
        render(
            <RegularCalendar
                events={mockEvents}
                settings={mockSettings}
                currentDate={testDate}
            />,
        );

        expect(screen.getByText(/1月15日/i)).toBeInTheDocument();
    });

    it('calls onDateChange when navigating to previous date', () => {
        const testDate = new Date('2025-01-15');
        render(
            <RegularCalendar
                events={mockEvents}
                settings={mockSettings}
                currentDate={testDate}
                onDateChange={mockOnDateChange}
            />,
        );

        fireEvent.click(screen.getByTestId('chevron-left'));
        expect(mockOnDateChange).toHaveBeenCalledTimes(1);
    });

    it('calls onDateChange when navigating to next date', () => {
        const testDate = new Date('2025-01-15');
        render(
            <RegularCalendar
                events={mockEvents}
                settings={mockSettings}
                currentDate={testDate}
                onDateChange={mockOnDateChange}
            />,
        );

        fireEvent.click(screen.getByTestId('chevron-right'));
        expect(mockOnDateChange).toHaveBeenCalledTimes(1);
    });

    it('calls onDateChange when clicking today button', () => {
        render(
            <RegularCalendar
                events={mockEvents}
                settings={mockSettings}
                onDateChange={mockOnDateChange}
            />,
        );

        fireEvent.click(screen.getByText('today_button'));
        expect(mockOnDateChange).toHaveBeenCalledTimes(1);
    });

    it('calls onViewChange when changing view', () => {
        render(
            <RegularCalendar
                events={mockEvents}
                settings={mockSettings}
                onViewChange={mockOnViewChange}
            />,
        );

        const viewButtons = screen.getByTestId('view-selector').querySelectorAll('button');
        fireEvent.click(viewButtons[0]);
        expect(mockOnViewChange).toHaveBeenCalledWith('day');
    });

    it('shows loading state when isLoading is true', () => {
        render(
            <RegularCalendar
                events={mockEvents}
                settings={mockSettings}
                isLoading={true}
            />,
        );

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('does not show loading state when isLoading is false', () => {
        render(
            <RegularCalendar
                events={mockEvents}
                settings={mockSettings}
                isLoading={false}
            />,
        );

        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('renders custom headerLeft', () => {
        render(
            <RegularCalendar
                events={mockEvents}
                settings={mockSettings}
                headerLeft={<div data-testid="custom-left">Custom Left</div>}
            />,
        );

        expect(screen.getByTestId('custom-left')).toBeInTheDocument();
    });

    it('renders custom headerRight', () => {
        render(
            <RegularCalendar
                events={mockEvents}
                settings={mockSettings}
                headerRight={<div data-testid="custom-right">Custom Right</div>}
            />,
        );

        expect(screen.getByTestId('custom-right')).toBeInTheDocument();
    });

    it('uses defaultView prop', () => {
        render(
            <RegularCalendar
                events={mockEvents}
                settings={mockSettings}
                defaultView="month"
            />,
        );

        expect(screen.getByTestId('month-view')).toBeInTheDocument();
    });

    it('persists view when enablePersistence is true', () => {
        const mockSetItem = vi.fn();
        vi.mocked(defaultStorage).setItem = mockSetItem;

        render(
            <RegularCalendar
                events={mockEvents}
                settings={mockSettings}
                enablePersistence={true}
                defaultView="day"
            />,
        );

        const viewButtons = screen.getByTestId('view-selector').querySelectorAll('button');
        fireEvent.click(viewButtons[1]);

        expect(mockSetItem).toHaveBeenCalledWith('regular-calendar-view', 'week');
    });

    it('loads persisted view when enablePersistence is true', () => {
        const mockGetItem = vi.fn(() => 'month');
        vi.mocked(defaultStorage).getItem = mockGetItem;

        render(
            <RegularCalendar
                events={mockEvents}
                settings={mockSettings}
                enablePersistence={true}
            />,
        );

        expect(mockGetItem).toHaveBeenCalledWith('regular-calendar-view');
        expect(screen.getByTestId('month-view')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(
            <RegularCalendar
                events={mockEvents}
                settings={mockSettings}
                className="custom-class"
            />,
        );

        expect(container.firstChild).toHaveClass('custom-class');
    });
});
