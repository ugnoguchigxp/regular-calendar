import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ThemeApplier } from "./ThemeApplier";
import { ThemeProvider, useTheme } from "./ThemeProvider";

const TestChild = () => {
	const theme = useTheme();
	return <div data-testid="theme-child">{JSON.stringify(theme)}</div>;
};

describe("ThemeProvider", () => {
	it("renders children", () => {
		render(
			<ThemeProvider>
				<div data-testid="test-child">Test Content</div>
			</ThemeProvider>,
		);

		expect(screen.getByTestId("test-child")).toBeInTheDocument();
		expect(screen.getByText("Test Content")).toBeInTheDocument();
	});

	it("provides theme config via context", () => {
		render(
			<ThemeProvider config={{ density: "compact" }}>
				<TestChild />
			</ThemeProvider>,
		);

		const child = screen.getByTestId("theme-child");
		expect(child).toBeInTheDocument();
	});

	it("applies default theme config when not provided", () => {
		render(
			<ThemeProvider>
				<TestChild />
			</ThemeProvider>,
		);

		const child = screen.getByTestId("theme-child");
		expect(child).toBeInTheDocument();
	});

	it("uses custom applier when provided", () => {
		const mockApplier: ThemeApplier = {
			applyVariables: vi.fn(),
			removeVariables: vi.fn(),
		};

		render(
			<ThemeProvider config={{ density: "normal" }} applier={mockApplier}>
				<TestChild />
			</ThemeProvider>,
		);

		expect(mockApplier.applyVariables).toHaveBeenCalledWith(expect.any(Object));
	});

	it("allows useTheme hook to access context", () => {
		render(
			<ThemeProvider config={{ density: "spacious" }}>
				<TestChild />
			</ThemeProvider>,
		);

		const child = screen.getByTestId("theme-child");
		expect(child.textContent).toContain("spacious");
	});

	it("applies theme with multiple config properties", () => {
		render(
			<ThemeProvider
				config={{ density: "compact", radius: 0.5, fontSize: 0.875 }}
			>
				<TestChild />
			</ThemeProvider>,
		);

		const child = screen.getByTestId("theme-child");
		expect(child.textContent).toContain("compact");
	});

	it("renders without applier prop", () => {
		render(
			<ThemeProvider config={{ density: "normal" }}>
				<TestChild />
			</ThemeProvider>,
		);

		const child = screen.getByTestId("theme-child");
		expect(child).toBeInTheDocument();
	});

	it("supports undefined config", () => {
		render(
			<ThemeProvider config={undefined}>
				<TestChild />
			</ThemeProvider>,
		);

		const child = screen.getByTestId("theme-child");
		expect(child).toBeInTheDocument();
	});
});
