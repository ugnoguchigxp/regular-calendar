import { render, screen } from "@testing-library/react";
import * as React from "react";
import type { ScheduleEvent } from "../../FacilitySchedule.schema";
import { ScheduleEventCard } from "./ScheduleEventCard";

type TooltipProps = React.PropsWithChildren;
type TooltipContentProps = React.PropsWithChildren;
type TooltipTriggerProps = React.PropsWithChildren<{ asChild?: boolean }>;
type TooltipProviderProps = React.PropsWithChildren;

// Mock Tooltip components to avoid tooltip rendering issues
vi.mock("@/components/ui/Tooltip", () => ({
	Tooltip: ({ children }: TooltipProps) => <div>{children}</div>,
	TooltipContent: ({ children }: TooltipContentProps) => (
		<div data-testid="tooltip-content">{children}</div>
	),
	TooltipTrigger: ({ children, asChild }: TooltipTriggerProps) => {
		if (asChild) {
			return React.cloneElement(
				React.Children.only(children) as React.ReactElement,
			);
		}
		return <div>{children}</div>;
	},
	TooltipProvider: ({ children }: TooltipProviderProps) => (
		<div>{children}</div>
	),
}));

const mockEvent: ScheduleEvent = {
	id: "1",
	groupId: "group1",
	title: "会議",
	attendee: "",
	startDate: new Date("2025-01-01T10:00:00"),
	endDate: new Date("2025-01-01T11:30:00"),
	status: "confirmed",
	createdAt: new Date("2025-01-01T00:00:00"),
	updatedAt: new Date("2025-01-01T00:00:00"),
	resourceId: "resource1",
	isAllDay: false,
};

describe("ScheduleEventCard", () => {
	it("renders event title", () => {
		const onClick = vi.fn();
		const { container } = render(
			<ScheduleEventCard
				event={mockEvent}
				top={100}
				height={90}
				onClick={onClick}
			/>,
		);

		const button = container.querySelector("button");
		expect(button?.textContent).toContain("会議");
	});

	it("renders event time", () => {
		const onClick = vi.fn();
		const { container } = render(
			<ScheduleEventCard
				event={mockEvent}
				top={100}
				height={90}
				onClick={onClick}
			/>,
		);

		const button = container.querySelector("button");
		expect(button?.textContent).toContain("10:00");
		expect(button?.textContent).toContain("11:30");
		expect(button?.textContent).toContain("1.5h");
	});

	it("renders attendee", () => {
		const onClick = vi.fn();
		const eventWithAttendee: ScheduleEvent = {
			...mockEvent,
			attendee: "田中 太郎",
		};

		render(
			<ScheduleEventCard
				event={eventWithAttendee}
				top={100}
				height={90}
				onClick={onClick}
			/>,
		);

		expect(screen.getByText("👤 田中 太郎")).toBeInTheDocument();
	});

	it("calls onClick when clicked", () => {
		const onClick = vi.fn();
		const { getByRole } = render(
			<ScheduleEventCard
				event={mockEvent}
				top={100}
				height={90}
				onClick={onClick}
			/>,
		);

		const button = getByRole("button");
		button.click();

		expect(onClick).toHaveBeenCalled();
	});

	it("applies custom color", () => {
		const onClick = vi.fn();
		const eventWithColor: ScheduleEvent = {
			...mockEvent,
			color: "#FF0000",
		};

		const { container } = render(
			<ScheduleEventCard
				event={eventWithColor}
				top={100}
				height={90}
				onClick={onClick}
			/>,
		);

		const button = container.querySelector("button");
		expect(button).toHaveStyle({ backgroundColor: "#FF0000" });
	});

	it("shows conflict styling", () => {
		const onClick = vi.fn();
		const eventWithConflict: ScheduleEvent = {
			...mockEvent,
			hasConflict: true,
		};

		const { container } = render(
			<ScheduleEventCard
				event={eventWithConflict}
				top={100}
				height={90}
				onClick={onClick}
			/>,
		);

		expect(container.textContent).toContain("⚠️ Double Booking");
	});

	it("applies dragging styling", () => {
		const onClick = vi.fn();
		const { container } = render(
			<ScheduleEventCard
				event={mockEvent}
				top={100}
				height={90}
				onClick={onClick}
				isDragging={true}
			/>,
		);

		const button = container.querySelector("button");
		expect(button).toHaveClass("opacity-50", "scale-95");
	});

	it("applies position styles", () => {
		const onClick = vi.fn();
		const { container } = render(
			<ScheduleEventCard
				event={mockEvent}
				top={150}
				height={75}
				widthPercent={50}
				leftPercent={25}
				onClick={onClick}
			/>,
		);

		const button = container.querySelector("button");
		expect(button).toHaveStyle({
			top: "150px",
			height: "75px",
			left: "25%",
			width: "50%",
		});
	});

	it("does not show time for all-day events", () => {
		const onClick = vi.fn();
		const allDayEvent: ScheduleEvent = {
			...mockEvent,
			isAllDay: true,
		};

		const { container } = render(
			<ScheduleEventCard
				event={allDayEvent}
				top={100}
				height={90}
				onClick={onClick}
			/>,
		);

		const button = container.querySelector("button");
		expect(button?.textContent).not.toContain("10:00");
	});

	it("renders note in tooltip", () => {
		const onClick = vi.fn();
		const eventWithNote: ScheduleEvent = {
			...mockEvent,
			note: "備考メモ",
		};

		render(
			<ScheduleEventCard
				event={eventWithNote}
				top={100}
				height={90}
				onClick={onClick}
			/>,
		);

		expect(screen.getByText("備考メモ")).toBeInTheDocument();
	});

	it("renders description in tooltip", () => {
		const onClick = vi.fn();
		const eventWithDescription: ScheduleEvent = {
			...mockEvent,
			description: "詳細説明",
		};

		render(
			<ScheduleEventCard
				event={eventWithDescription}
				top={100}
				height={90}
				onClick={onClick}
			/>,
		);

		expect(screen.getByText("詳細説明")).toBeInTheDocument();
	});
});
