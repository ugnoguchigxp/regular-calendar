import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";
import { Icons } from "./Icons";

describe("Button", () => {
	it("should render button with text", () => {
		render(<Button>Click me</Button>);

		expect(screen.getByRole("button")).toHaveTextContent("Click me");
	});

	it("should render button with variant", () => {
		render(<Button variant="destructive">Delete</Button>);

		expect(screen.getByRole("button")).toHaveClass("bg-chart-4");
	});

	it("should render button with size", () => {
		render(<Button size="sm">Small</Button>);

		expect(screen.getByRole("button")).toHaveClass("text-xs");
		expect(screen.getByRole("button")).toHaveClass("py-[var(--ui-space-1)]");
	});

	it("should render loading state", () => {
		render(<Button loading>Loading</Button>);

		expect(screen.getByRole("button")).toBeDisabled();
		expect(screen.getByRole("button")).toContainHTML("animate-spin");
	});

	it("should render success state", () => {
		render(<Button success>Success</Button>);

		expect(screen.getByRole("button")).toBeDisabled();
		expect(screen.getByRole("button")).toHaveClass("bg-chart-2");
	});

	it("should render error state", () => {
		render(<Button error>Error</Button>);

		expect(screen.getByRole("button")).toBeDisabled();
		expect(screen.getByRole("button")).toHaveClass("bg-chart-4");
	});

	it("should render with icon", () => {
		render(<Button icon={Icons.Check}>With Icon</Button>);

		const iconElement = screen.getByRole("button").querySelector("svg");
		expect(iconElement).toBeInTheDocument();
	});

	it("should call onClick when clicked", async () => {
		const handleClick = vi.fn();
		const user = userEvent.setup();

		render(<Button onClick={handleClick}>Click me</Button>);

		await user.click(screen.getByRole("button"));

		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("should be disabled when disabled prop is true", () => {
		render(<Button disabled>Disabled</Button>);

		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("should truncate long text", () => {
		render(
			<Button maxLabelLength={5}>
				Very Long Text That Should Be Truncated
			</Button>,
		);

		expect(screen.getByRole("button")).toHaveTextContent("Very…");
	});

	it("should show title on hover when truncated", () => {
		render(
			<Button maxLabelLength={5}>
				Very Long Text That Should Be Truncated
			</Button>,
		);

		const button = screen.getByRole("button");
		expect(button).toHaveTextContent("Very…");
	});

	it("should handle fab variant", () => {
		render(<Button variant="fab">FAB</Button>);

		expect(screen.getByRole("button")).toHaveClass("rounded-full");
		expect(screen.getByRole("button")).toHaveClass("h-[var(--ui-space-14)]");
		expect(screen.getByRole("button")).toHaveClass("w-[var(--ui-space-14)]");
	});

	it("should handle circle variant", () => {
		render(<Button size="circle">Circle</Button>);

		expect(screen.getByRole("button")).toHaveClass("rounded-full");
		expect(screen.getByRole("button")).toHaveClass("p-[var(--ui-space-2)]");
		expect(screen.getByRole("button")).toHaveClass("aspect-square");
	});

	it("should apply custom className", () => {
		render(<Button className="custom-class">Custom</Button>);

		expect(screen.getByRole("button")).toHaveClass("custom-class");
	});

	it("should override variant with success", () => {
		render(
			<Button variant="default" success>
				Success
			</Button>,
		);

		expect(screen.getByRole("button")).toHaveClass("bg-chart-2");
	});

	it("should override variant with error", () => {
		render(
			<Button variant="default" error>
				Error
			</Button>,
		);

		expect(screen.getByRole("button")).toHaveClass("bg-chart-4");
	});

	it("should render as child when asChild is true", () => {
		render(
			<Button asChild>
				<a href="/link">Link Button</a>
			</Button>,
		);

		expect(screen.getByRole("link")).toHaveTextContent("Link Button");
	});

	it("should handle icon-only button", () => {
		render(<Button icon={Icons.Check}></Button>);

		const iconElement = screen.getByRole("button").querySelector("svg");
		expect(iconElement).toBeInTheDocument();
	});

	it("should not add margin when icon-only", () => {
		render(<Button icon={Icons.Check}></Button>);

		const iconElement = screen.getByRole("button").querySelector("svg");
		expect(iconElement).not.toHaveClass("mr-[var(--ui-space-2)]");
	});
});
