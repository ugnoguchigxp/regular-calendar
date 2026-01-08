import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	RegularCalendar,
	type RegularCalendarComponents,
} from "./RegularCalendar";
import type {
	FacilityScheduleSettings,
	ScheduleEvent,
	ViewMode,
} from "./RegularCalendar.schema";

type ViewSelectorOption = {
	value: ViewMode;
	label: string;
};

type ViewSelectorProps = {
	currentView: ViewMode;
	onViewChange: (view: ViewMode) => void;
	options: ViewSelectorOption[];
};

type DayViewProps = {
	currentDate: Date;
	onTimeSlotClick?: (date: Date, timeSlot?: string) => void;
	renderEventContent?: (
		event: ScheduleEvent,
		viewMode: ViewMode,
	) => React.ReactNode;
	components?: RegularCalendarComponents;
};

type MonthViewProps = {
	onDateClick?: (date: Date) => void;
};

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string, options?: { defaultValue?: string }) =>
			options?.defaultValue ?? key,
		i18n: {
			language: "en",
		},
	}),
}));

vi.mock("@/components/ui/Icons", () => ({
	Icons: {
		ChevronLeft: () => <div data-testid="chevron-left" />,
		ChevronRight: () => <div data-testid="chevron-right" />,
	},
}));

vi.mock("@/components/ui/ViewSelector", () => ({
	ViewSelector: ({ currentView, onViewChange, options }: ViewSelectorProps) => (
		<div data-testid="view-selector">
			{options.map((opt) => (
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

vi.mock("./components/DayView/DayView", () => ({
	DayView: ({
		currentDate,
		onTimeSlotClick,
		renderEventContent,
		components,
	}: DayViewProps) => (
		<div>
			<button
				type="button"
				data-testid="day-view"
				onClick={() => onTimeSlotClick?.(currentDate, "09:30")}
			>
				DayView
			</button>
			{renderEventContent && <div data-testid="has-custom-renderer" />}
			{components?.EventCard && <div data-testid="has-custom-event-card" />}
		</div>
	),
}));

vi.mock("./components/WeekView/WeekView", () => ({
	WeekView: () => <div data-testid="week-view" />,
}));

vi.mock("./components/MonthView/MonthView", () => ({
	MonthView: ({ onDateClick }: MonthViewProps) => (
		<button
			type="button"
			data-testid="month-view"
			onClick={() => onDateClick?.(new Date("2025-02-10T00:00:00"))}
		>
			MonthView
		</button>
	),
}));

describe("RegularCalendar", () => {
	const mockEvents: ScheduleEvent[] = [];
	const mockSettings: FacilityScheduleSettings = {
		startTime: "00:00",
		endTime: "23:59",
		defaultDuration: 1,
		closedDays: [],
		weekStartsOn: 0,
	};
	const mockOnDateChange = vi.fn();
	const mockOnViewChange = vi.fn();
	const mockOnTimeSlotClick = vi.fn();
	const mockOnDateClick = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("renders with default props", () => {
		render(<RegularCalendar events={mockEvents} settings={mockSettings} />);

		expect(screen.getByTestId("chevron-left")).toBeInTheDocument();
		expect(screen.getByTestId("chevron-right")).toBeInTheDocument();
		expect(screen.getByText("Today")).toBeInTheDocument();
		expect(screen.getByTestId("view-selector")).toBeInTheDocument();
	});

	it("renders week view by default", () => {
		render(<RegularCalendar events={mockEvents} settings={mockSettings} />);

		expect(screen.getByTestId("week-view")).toBeInTheDocument();
		expect(screen.queryByTestId("day-view")).not.toBeInTheDocument();
		expect(screen.queryByTestId("month-view")).not.toBeInTheDocument();
	});

	it("renders with controlled view mode", () => {
		render(
			<RegularCalendar
				events={mockEvents}
				settings={mockSettings}
				viewMode="day"
			/>,
		);

		expect(screen.getByTestId("day-view")).toBeInTheDocument();
		expect(screen.queryByTestId("week-view")).not.toBeInTheDocument();
	});

	it("renders with controlled date", () => {
		const testDate = new Date("2025-01-15");
		render(
			<RegularCalendar
				events={mockEvents}
				settings={mockSettings}
				currentDate={testDate}
			/>,
		);

		expect(screen.getByText(/January/i)).toBeInTheDocument();
	});

	it("calls onDateChange when navigating to previous date", () => {
		const testDate = new Date("2025-01-15");
		render(
			<RegularCalendar
				events={mockEvents}
				settings={mockSettings}
				currentDate={testDate}
				onDateChange={mockOnDateChange}
			/>,
		);

		fireEvent.click(screen.getByTestId("chevron-left"));
		expect(mockOnDateChange).toHaveBeenCalledTimes(1);
	});

	it("calls onDateChange when navigating to next date", () => {
		const testDate = new Date("2025-01-15");
		render(
			<RegularCalendar
				events={mockEvents}
				settings={mockSettings}
				currentDate={testDate}
				onDateChange={mockOnDateChange}
			/>,
		);

		fireEvent.click(screen.getByTestId("chevron-right"));
		expect(mockOnDateChange).toHaveBeenCalledTimes(1);
	});

	it("calls onDateChange when clicking today button", () => {
		render(
			<RegularCalendar
				events={mockEvents}
				settings={mockSettings}
				onDateChange={mockOnDateChange}
			/>,
		);

		fireEvent.click(screen.getByText("Today"));
		expect(mockOnDateChange).toHaveBeenCalledTimes(1);
	});

	it("calls onViewChange when changing view", () => {
		render(
			<RegularCalendar
				events={mockEvents}
				settings={mockSettings}
				onViewChange={mockOnViewChange}
			/>,
		);

		const viewButtons = screen
			.getByTestId("view-selector")
			.querySelectorAll("button");
		fireEvent.click(viewButtons[0]);
		expect(mockOnViewChange).toHaveBeenCalledWith("day");
	});

	it("shows loading state when isLoading is true", () => {
		render(
			<RegularCalendar
				events={mockEvents}
				settings={mockSettings}
				isLoading={true}
			/>,
		);

		expect(screen.getByText("Loading...")).toBeInTheDocument();
	});

	it("does not show loading state when isLoading is false", () => {
		render(
			<RegularCalendar
				events={mockEvents}
				settings={mockSettings}
				isLoading={false}
			/>,
		);

		expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
	});

	it("renders custom headerLeft", () => {
		render(
			<RegularCalendar
				events={mockEvents}
				settings={mockSettings}
				headerLeft={<div data-testid="custom-left">Custom Left</div>}
			/>,
		);

		expect(screen.getByTestId("custom-left")).toBeInTheDocument();
	});

	it("renders custom headerRight", () => {
		render(
			<RegularCalendar
				events={mockEvents}
				settings={mockSettings}
				headerRight={<div data-testid="custom-right">Custom Right</div>}
			/>,
		);

		expect(screen.getByTestId("custom-right")).toBeInTheDocument();
	});

	it("uses defaultView prop", () => {
		render(
			<RegularCalendar
				events={mockEvents}
				settings={mockSettings}
				defaultView="month"
			/>,
		);

		expect(screen.getByTestId("month-view")).toBeInTheDocument();
	});

	it("loads view from storage when persistence is enabled", () => {
		const storage = {
			getItem: vi.fn().mockReturnValue("month"),
			setItem: vi.fn(),
			removeItem: vi.fn(),
		};

		render(
			<RegularCalendar
				events={mockEvents}
				settings={mockSettings}
				enablePersistence={true}
				storage={storage}
			/>,
		);

		expect(storage.getItem).toHaveBeenCalledWith("regular-calendar-view");
		expect(screen.getByTestId("month-view")).toBeInTheDocument();
	});

	it("falls back to defaultView when storage access fails", () => {
		const storage = {
			getItem: vi.fn(() => {
				throw new Error("storage error");
			}),
			setItem: vi.fn(),
			removeItem: vi.fn(),
		};

		render(
			<RegularCalendar
				events={mockEvents}
				settings={mockSettings}
				enablePersistence={true}
				defaultView="day"
				storage={storage}
			/>,
		);

		expect(screen.getByTestId("day-view")).toBeInTheDocument();
	});

	it("persists view changes when uncontrolled", async () => {
		const storage = {
			getItem: vi.fn().mockReturnValue(null),
			setItem: vi.fn(),
			removeItem: vi.fn(),
		};

		render(
			<RegularCalendar
				events={mockEvents}
				settings={mockSettings}
				enablePersistence={true}
				storage={storage}
			/>,
		);

		const viewButtons = screen
			.getByTestId("view-selector")
			.querySelectorAll("button");
		fireEvent.click(viewButtons[0]);

		await waitFor(() => {
			expect(storage.setItem).toHaveBeenCalledWith(
				"regular-calendar-view",
				"day",
			);
		});
	});

	it("does not persist when viewMode is controlled", async () => {
		const storage = {
			getItem: vi.fn().mockReturnValue("week"),
			setItem: vi.fn(),
			removeItem: vi.fn(),
		};

		render(
			<RegularCalendar
				events={mockEvents}
				settings={mockSettings}
				viewMode="week"
				enablePersistence={true}
				storage={storage}
			/>,
		);

		const viewButtons = screen
			.getByTestId("view-selector")
			.querySelectorAll("button");
		fireEvent.click(viewButtons[0]);

		await waitFor(() => {
			expect(storage.setItem).not.toHaveBeenCalled();
		});
	});

	it("passes time slot clicks with adjusted time", () => {
		const testDate = new Date("2025-01-15T00:00:00");
		render(
			<RegularCalendar
				events={mockEvents}
				settings={mockSettings}
				viewMode="day"
				currentDate={testDate}
				onTimeSlotClick={mockOnTimeSlotClick}
			/>,
		);

		fireEvent.click(screen.getByTestId("day-view"));

		expect(mockOnTimeSlotClick).toHaveBeenCalledTimes(1);
		const calledDate = mockOnTimeSlotClick.mock.calls[0][0] as Date;
		expect(calledDate.getHours()).toBe(9);
		expect(calledDate.getMinutes()).toBe(30);
	});

	it("calls date handlers when clicking a month date", () => {
		render(
			<RegularCalendar
				events={mockEvents}
				settings={mockSettings}
				viewMode="month"
				onDateClick={mockOnDateClick}
				onDateChange={mockOnDateChange}
			/>,
		);

		fireEvent.click(screen.getByTestId("month-view"));

		expect(mockOnDateClick).toHaveBeenCalledTimes(1);
		expect(mockOnDateChange).toHaveBeenCalledTimes(1);
	});

	it("applies custom className", () => {
		const { container } = render(
			<RegularCalendar
				events={mockEvents}
				settings={mockSettings}
				className="custom-class"
			/>,
		);

		expect(container.firstChild).toHaveClass("custom-class");
	});

	it("passes renderEventContent to views", () => {
		const handleRenderEventContent = () => <div>Custom</div>;
		render(
			<RegularCalendar
				events={mockEvents}
				settings={mockSettings}
				viewMode="day"
				renderEventContent={handleRenderEventContent}
			/>,
		);

		expect(screen.getByTestId("has-custom-renderer")).toBeInTheDocument();
	});

	it("passes components to views", () => {
		const CustomEventCard = () => <div>Custom</div>;
		render(
			<RegularCalendar
				events={mockEvents}
				settings={mockSettings}
				viewMode="day"
				components={{ EventCard: CustomEventCard }}
			/>,
		);

		expect(screen.getByTestId("has-custom-event-card")).toBeInTheDocument();
	});
});
