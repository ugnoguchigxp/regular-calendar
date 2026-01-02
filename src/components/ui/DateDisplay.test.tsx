import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DateDisplay, DateFormat } from "./DateDisplay";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: {
			language: "ja",
		},
	}),
}));

describe("DateDisplay", () => {
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
		expect(screen.getByText(/水曜日/)).toBeInTheDocument();
	});

	it("handles weekdayShort format", () => {
		render(<DateDisplay date={new Date("2025-01-15")} format="weekdayShort" />);
		expect(screen.getByText(/水/)).toBeInTheDocument();
	});

	it("handles monthDayShort format", () => {
		render(
			<DateDisplay date={new Date("2025-01-15")} format="monthDayShort" />,
		);
		expect(screen.getByText(/1\/15/)).toBeInTheDocument();
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
});
