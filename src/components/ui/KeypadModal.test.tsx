import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { KeypadModal } from "./KeypadModal";

vi.mock("./Modal", () => ({
	Modal: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

describe("KeypadModal", () => {
	it("submits number input and validates empty", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();

		render(
			<KeypadModal
				open
				onClose={vi.fn()}
				onSubmit={onSubmit}
				variant="number"
			/>,
		);

		await user.click(screen.getByRole("button", { name: "1" }));
		await user.click(screen.getByRole("button", { name: "2" }));
		await user.click(screen.getByRole("button", { name: "OK" }));
		expect(onSubmit).toHaveBeenCalledWith("12");

		await user.click(screen.getByRole("button", { name: "C" }));
		await user.click(screen.getByRole("button", { name: "OK" }));
		expect(screen.getByText("Please enter a value")).toBeInTheDocument();
	});

	it("validates phone hyphen usage", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();

		render(
			<KeypadModal
				open
				onClose={vi.fn()}
				onSubmit={onSubmit}
				variant="phone"
			/>,
		);

		await user.click(screen.getByRole("button", { name: "-" }));
		await user.click(screen.getByRole("button", { name: "OK" }));
		expect(
			screen.getByText("Value cannot end with a hyphen"),
		).toBeInTheDocument();
	});

	it("prevents consecutive hyphens in phone input", async () => {
		const user = userEvent.setup();

		render(
			<KeypadModal open onClose={vi.fn()} onSubmit={vi.fn()} variant="phone" />,
		);

		await user.click(screen.getByRole("button", { name: "-" }));
		await user.click(screen.getByRole("button", { name: "-" }));
		expect(screen.getByText("Hyphen cannot be repeated")).toBeInTheDocument();
	});

	it("validates decimal input and prevents trailing dot", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();

		render(
			<KeypadModal
				open
				onClose={vi.fn()}
				onSubmit={onSubmit}
				variant="number"
				allowDecimal
			/>,
		);

		await user.click(screen.getByRole("button", { name: "1" }));
		await user.click(screen.getByRole("button", { name: "." }));
		await user.click(screen.getByRole("button", { name: "OK" }));

		expect(
			screen.getByText("Value cannot end with a decimal point"),
		).toBeInTheDocument();
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it("validates time format before submit", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();

		render(
			<KeypadModal open onClose={vi.fn()} onSubmit={onSubmit} variant="time" />,
		);

		await user.click(screen.getByRole("button", { name: "2" }));
		await user.click(screen.getByRole("button", { name: "9" }));
		await user.click(screen.getByRole("button", { name: "6" }));
		await user.click(screen.getByRole("button", { name: "0" }));
		await user.click(screen.getByRole("button", { name: "OK" }));

		expect(
			screen.getByText("Enter a valid 4-digit time (e.g., 0930)"),
		).toBeInTheDocument();
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it("submits valid time and handles keyboard input", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		const onClose = vi.fn();

		render(
			<KeypadModal open onClose={onClose} onSubmit={onSubmit} variant="time" />,
		);

		await user.keyboard("0930{Enter}");
		expect(onSubmit).toHaveBeenCalledWith("09:30");

		await user.keyboard("{Escape}");
		expect(onClose).toHaveBeenCalled();
	});
});
