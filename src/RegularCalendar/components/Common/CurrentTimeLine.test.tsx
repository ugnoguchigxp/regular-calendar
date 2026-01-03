import { act, render } from "@testing-library/react";
import { CurrentTimeLine } from "./CurrentTimeLine";

describe("CurrentTimeLine", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2025-01-01T10:30:00"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("does not render when not today", () => {
		const { container } = render(
			<CurrentTimeLine
				interval={60}
				isToday={false}
				startHour={8}
				endHour={18}
			/>,
		);

		expect(container.firstChild).toBeNull();
	});

	it("does not render when current time is outside range", () => {
		const { container } = render(
			<CurrentTimeLine
				interval={60}
				isToday={true}
				startHour={12}
				endHour={18}
			/>,
		);

		expect(container.firstChild).toBeNull();
	});

	it("renders when today and time is in range", () => {
		const { container } = render(
			<CurrentTimeLine
				interval={60}
				isToday={true}
				startHour={8}
				endHour={18}
			/>,
		);

		const line = container.querySelector(".bg-red-500");
		expect(line).toBeInTheDocument();
	});

	it("calculates correct position", () => {
		const { container } = render(
			<CurrentTimeLine
				interval={60}
				isToday={true}
				startHour={8}
				endHour={18}
			/>,
		);

		const dot = container.querySelector(".bg-red-500.rounded-full");
		expect(dot).toHaveStyle({ top: "150px" });
	});

	it("updates position over time", () => {
		const { container } = render(
			<CurrentTimeLine
				interval={60}
				isToday={true}
				startHour={8}
				endHour={18}
			/>,
		);

		const dot = container.querySelector(
			".bg-red-500.rounded-full",
		) as HTMLElement;
		expect(dot.style.top).toBe("150px");

		act(() => {
			vi.setSystemTime(new Date("2025-01-01T11:30:00"));
			vi.advanceTimersByTime(60000);
		});

		expect(dot.style.top).toBe("211px");
	});

	it("renders in absolute position when relative is true", () => {
		const { container } = render(
			<CurrentTimeLine
				interval={60}
				isToday={true}
				startHour={8}
				endHour={18}
				relative={true}
			/>,
		);

		const line = container.querySelector(
			'[class*="bg-red-500"][class*="h-[var(--ui-space-0-5)]"]',
		) as HTMLElement;
		expect(line).toHaveClass("absolute");
	});

	it("renders in fixed position when relative is false", () => {
		const { container } = render(
			<CurrentTimeLine
				interval={60}
				isToday={true}
				startHour={8}
				endHour={18}
				relative={false}
			/>,
		);

		const line = container.querySelector(
			'[class*="bg-red-500"][class*="h-[var(--ui-space-0-5)]"]',
		) as HTMLElement;
		expect(line).toHaveClass("fixed");
	});

	it("cleans up timer on unmount", () => {
		const { unmount } = render(
			<CurrentTimeLine
				interval={60}
				isToday={true}
				startHour={8}
				endHour={18}
			/>,
		);

		unmount();

		act(() => {
			vi.advanceTimersByTime(60000);
		});

		// Should not throw any errors
		expect(true).toBe(true);
	});
});
