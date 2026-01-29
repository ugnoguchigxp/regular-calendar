import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DateDisplay, DateFormat } from "./DateDisplay";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string, options?: { defaultValue?: string }) =>
			options?.defaultValue ?? key,
		i18n: {
			language: "ja",
		},
	}),
}));

describe("DateDisplay", () => {
	afterEach(() => {
		document.documentElement.removeAttribute("data-secondary-calendar");
		document.documentElement.removeAttribute("data-prefer-local-calendar");
	});

	it("renders formatted date", () => {
		render(<DateDisplay date={new Date("2025-01-01")} />);
		expect(screen.getByText(/2025/)).toBeInTheDocument();
	});

	it("shows day of week when showDayOfWeek is true", () => {
		render(<DateDisplay date={new Date("2025-01-01")} showDayOfWeek={true} />);
		expect(screen.getByText(/水/)).toBeInTheDocument();
	});

	it("shows secondary text when showSecondary is true", () => {
		const { container } = render(
			<DateDisplay date={new Date("2025-01-01")} showSecondary={true} />,
		);
		expect(container.textContent).toContain("2025");
	});

	it("formats date correctly for different locale", () => {
		render(<DateDisplay date={new Date("2025-01-15")} />);
		expect(screen.getByText(/2025/)).toBeInTheDocument();
		expect(screen.getByText(/1月15日/)).toBeInTheDocument();
	});

	it("uses variant prop for format", () => {
		render(<DateDisplay date={new Date("2025-01-15")} variant="monthDay" />);
		expect(screen.getByText(/1月15日/)).toBeInTheDocument();
	});

	it("uses format prop", () => {
		render(<DateDisplay date={new Date("2025-01-15")} format="yearMonth" />);
		expect(screen.getByText(/2025年1月/)).toBeInTheDocument();
	});

	it("handles weekday format", () => {
		render(<DateDisplay date={new Date("2025-01-15")} format="weekday" />);
		// Japanese locale now uses (水) format instead of 水曜日
		expect(screen.getByText(/\(水\)/)).toBeInTheDocument();
	});

	it("handles weekdayShort format", () => {
		render(<DateDisplay date={new Date("2025-01-15")} format="weekdayShort" />);
		expect(screen.getByText(/水/)).toBeInTheDocument();
	});

	it("handles monthDayShort format", () => {
		render(
			<DateDisplay date={new Date("2025-01-15")} format="monthDayShort" />,
		);
		expect(screen.getByText(/1月15日/)).toBeInTheDocument();
	});

	it("handles compact format", () => {
		render(<DateDisplay date={new Date("2025-01-15")} format="compact" />);
		expect(screen.getByText(/1\/15/)).toBeInTheDocument();
	});

	it("applies custom className", () => {
		const { container } = render(
			<DateDisplay date={new Date("2025-01-01")} className="custom-class" />,
		);
		expect(container.firstChild).toHaveClass("custom-class");
	});

	it("passes through other HTML attributes", () => {
		render(
			<DateDisplay date={new Date("2025-01-01")} data-testid="test-date" />,
		);
		expect(screen.getByTestId("test-date")).toBeInTheDocument();
	});

	it("formats correctly for different languages", () => {
		render(<DateDisplay date={new Date("2025-01-15")} />);
		expect(screen.getByText(/2025/)).toBeInTheDocument();
	});

	it("handles DateFormat alias", () => {
		render(<DateFormat date={new Date("2025-01-01")} />);
		expect(screen.getByText(/2025/)).toBeInTheDocument();
	});

	it("renders secondary calendar when enabled", () => {
		document.documentElement.setAttribute("data-secondary-calendar", "buddhist");
		const { container } = render(
			<DateDisplay
				date={new Date("2025-01-01")}
				format="date"
				showSecondary={true}
			/>,
		);
		expect(container.textContent).toContain("(");
	});

	it("skips secondary calendar when matching primary calendar", () => {
		document.documentElement.setAttribute("data-prefer-local-calendar", "true");
		document.documentElement.setAttribute(
			"data-secondary-calendar",
			"japanese",
		);
		const { container } = render(
			<DateDisplay
				date={new Date("2025-01-01")}
				format="date"
				showSecondary={true}
			/>,
		);
		expect(container.textContent).not.toContain("(");
	});

	it("formats with local calendar for monthDayShort", () => {
		document.documentElement.setAttribute("data-prefer-local-calendar", "true");
		const { container } = render(
			<DateDisplay date={new Date("2025-01-15")} format="monthDayShort" />,
		);
		expect(container.textContent).toMatch(/\d/);
	});

	it("formats with local calendar for full format", () => {
		document.documentElement.setAttribute("data-prefer-local-calendar", "true");
		const { container } = render(
			<DateDisplay date={new Date("2025-01-15")} format="full" />,
		);
		expect(container.textContent).toMatch(/\d/);
	});

	it("falls back when format is not recognized", () => {
		const { container } = render(
			<DateDisplay date={new Date("2025-01-15")} format={"unknown" as any} />,
		);
		expect(container.textContent).toMatch(/2025/);
	});
});
