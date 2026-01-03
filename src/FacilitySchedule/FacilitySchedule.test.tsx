import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FacilitySchedule } from "./FacilitySchedule";
import type { FacilityScheduleProps } from "./FacilitySchedule.schema";
import type * as useScheduleDataModule from "./hooks/useScheduleData";
import type * as useScheduleEventHandlersModule from "./hooks/useScheduleEventHandlers";
import * as useScheduleViewModule from "./hooks/useScheduleView";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string, options?: { defaultValue?: string }) =>
			options?.defaultValue ?? key,
	}),
}));

vi.mock("./hooks/useScheduleView", async (importOriginal) => {
	return {
		...((await importOriginal()) as typeof useScheduleViewModule),
		useScheduleView: vi.fn(() => ({
			currentDate: new Date("2025-01-15"),
			viewMode: "day",
			selectedGroupId: null,
			setViewMode: vi.fn(),
			setSelectedGroupId: vi.fn(),
			navigate: vi.fn(),
			goToToday: vi.fn(),
			setDate: vi.fn(),
		})),
	};
});

vi.mock("./hooks/useScheduleData", async (importOriginal) => {
	return {
		...((await importOriginal()) as typeof useScheduleDataModule),
		useScheduleData: vi.fn(() => ({
			effectiveGroupId: null,
			filteredResources: [],
			filteredEvents: [],
		})),
	};
});

vi.mock("./hooks/useScheduleEventHandlers", async (importOriginal) => {
	return {
		...((await importOriginal()) as typeof useScheduleEventHandlersModule),
		useScheduleEventHandlers: vi.fn(() => ({
			isModalOpen: false,
			selectedEvent: null,
			newInfo: { resourceId: "", startTime: new Date() },
			handleEventClick: vi.fn(),
			handleEmptySlotClick: vi.fn(),
			handleDayClick: vi.fn(),
			handleModalSave: vi.fn(),
			handleModalDelete: vi.fn(),
			handleModalClose: vi.fn(),
		})),
	};
});

vi.mock("./components/ScheduleHeader", () => ({
	ScheduleHeader: () => <div data-testid="schedule-header" />,
}));

vi.mock("./components/DayView/DayView", () => ({
	DayView: () => <div data-testid="day-view" />,
}));

vi.mock("./components/WeekView/WeekView", () => ({
	WeekView: () => <div data-testid="week-view" />,
}));

vi.mock("./components/MonthView/MonthView", () => ({
	MonthView: () => <div data-testid="month-view" />,
}));

vi.mock("../components/EventModal/EventModal", () => ({
	EventModal: () => <div data-testid="event-modal" />,
}));

describe("FacilitySchedule", () => {
	const mockProps: FacilityScheduleProps = {
		events: [],
		resources: [],
		groups: [],
		settings: {
			startTime: "00:00",
			endTime: "23:59",
			defaultDuration: 1,
			closedDays: [],
			weekStartsOn: 0,
		},
	};

	it("renders with default props", () => {
		render(<FacilitySchedule {...mockProps} />);

		expect(screen.getByTestId("schedule-header")).toBeInTheDocument();
		expect(screen.getByTestId("day-view")).toBeInTheDocument();
	});

	it("renders week view when viewMode is week", () => {
		const { useScheduleView } = vi.mocked(useScheduleViewModule);
		useScheduleView.mockReturnValue({
			currentDate: new Date("2025-01-15"),
			viewMode: "week",
			selectedGroupId: null,
			setViewMode: vi.fn(),
			setSelectedGroupId: vi.fn(),
			navigate: vi.fn(),
			goToToday: vi.fn(),
			setDate: vi.fn(),
		});

		render(<FacilitySchedule {...mockProps} viewMode="week" />);

		expect(screen.getByTestId("week-view")).toBeInTheDocument();
		expect(screen.queryByTestId("day-view")).not.toBeInTheDocument();
	});

	it("renders month view when viewMode is month", () => {
		const { useScheduleView } = vi.mocked(useScheduleViewModule);
		useScheduleView.mockReturnValue({
			currentDate: new Date("2025-01-15"),
			viewMode: "month",
			selectedGroupId: null,
			setViewMode: vi.fn(),
			setSelectedGroupId: vi.fn(),
			navigate: vi.fn(),
			goToToday: vi.fn(),
			setDate: vi.fn(),
		});

		render(<FacilitySchedule {...mockProps} viewMode="month" />);

		expect(screen.getByTestId("month-view")).toBeInTheDocument();
		expect(screen.queryByTestId("day-view")).not.toBeInTheDocument();
	});

	it("renders loading state when isLoading is true", () => {
		render(<FacilitySchedule {...mockProps} isLoading={true} />);

		expect(screen.getByText(/Loading/)).toBeInTheDocument();
	});

	it("does not render loading state when isLoading is false", () => {
		render(<FacilitySchedule {...mockProps} isLoading={false} />);

		expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
	});

	it("applies custom className", () => {
		const { container } = render(
			<FacilitySchedule {...mockProps} className="custom-class" />,
		);

		expect(container.firstChild).toHaveClass("custom-class");
	});

	it("renders custom EventModal when provided", () => {
		const CustomModal = () => <div data-testid="custom-modal" />;
		render(
			<FacilitySchedule
				{...mockProps}
				components={{ EventModal: CustomModal }}
			/>,
		);

		expect(screen.getByTestId("custom-modal")).toBeInTheDocument();
		expect(screen.queryByTestId("event-modal")).not.toBeInTheDocument();
	});

	it("uses defaultView prop", () => {
		render(<FacilitySchedule {...mockProps} defaultView="week" />);

		expect(screen.getByTestId("schedule-header")).toBeInTheDocument();
	});

	it("uses enablePersistence and storageKey props", () => {
		render(
			<FacilitySchedule
				{...mockProps}
				enablePersistence={true}
				storageKey="test-key"
			/>,
		);

		expect(screen.getByTestId("schedule-header")).toBeInTheDocument();
	});
});
