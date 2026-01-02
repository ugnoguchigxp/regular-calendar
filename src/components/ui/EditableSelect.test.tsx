import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditableSelect } from "./EditableSelect";

describe("EditableSelect", () => {
	beforeAll(() => {
		Element.prototype.scrollIntoView = vi.fn();
	});

	it("opens on focus and selects option with keyboard", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();

		render(
			<EditableSelect
				value=""
				onChange={onChange}
				options={["A", "B"]}
				placeholder="Type"
			/>,
		);

		const input = screen.getByPlaceholderText("Type");
		await user.click(input);
		await user.keyboard("{ArrowDown}{Enter}");

		expect(onChange).toHaveBeenCalledWith("A");
	});

	it("selects option on click and closes list", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();

		render(
			<EditableSelect value="" onChange={onChange} options={["A", "B"]} />,
		);

		const input = screen.getByRole("textbox");
		await user.click(input);

		await user.click(screen.getByRole("button", { name: "B" }));
		expect(onChange).toHaveBeenCalledWith("B");
		expect(screen.queryByRole("button", { name: "A" })).not.toBeInTheDocument();
	});

	it("toggles list with button and closes on escape", async () => {
		const user = userEvent.setup();

		render(<EditableSelect value="" onChange={vi.fn()} options={["A", "B"]} />);

		const input = screen.getByRole("textbox");
		const toggle = screen.getByRole("button", { name: "Toggle options" });
		await user.click(toggle);
		expect(screen.getByRole("button", { name: "A" })).toBeInTheDocument();

		await user.click(input);
		await user.keyboard("{Escape}");
		expect(screen.queryByRole("button", { name: "A" })).not.toBeInTheDocument();
	});

	it("wraps selection with ArrowUp and selects last option", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();

		render(
			<EditableSelect value="" onChange={onChange} options={["A", "B", "C"]} />,
		);

		const input = screen.getByRole("textbox");
		await user.click(input);
		await user.keyboard("{ArrowDown}{ArrowUp}{Enter}");

		expect(onChange).toHaveBeenCalledWith("C");
	});

	it("closes on blur and outside click", async () => {
		const user = userEvent.setup();

		render(<EditableSelect value="" onChange={vi.fn()} options={["A", "B"]} />);

		const input = screen.getByRole("textbox");
		await user.click(input);
		expect(screen.getByRole("button", { name: "A" })).toBeInTheDocument();

		fireEvent.mouseDown(document.body);
		expect(screen.queryByRole("button", { name: "A" })).not.toBeInTheDocument();

		await user.click(input);
		fireEvent.blur(input);
		expect(screen.queryByRole("button", { name: "A" })).not.toBeInTheDocument();
	});

	it("opens on ArrowDown when closed and ignores Enter", () => {
		const onChange = vi.fn();

		render(
			<EditableSelect value="" onChange={onChange} options={["A", "B"]} />,
		);

		const input = screen.getByRole("textbox");
		fireEvent.keyDown(input, { key: "ArrowDown" });
		expect(screen.getByRole("button", { name: "A" })).toBeInTheDocument();

		fireEvent.keyDown(input, { key: "Escape" });
		expect(screen.queryByRole("button", { name: "A" })).not.toBeInTheDocument();

		fireEvent.keyDown(input, { key: "Enter" });
		expect(screen.queryByRole("button", { name: "A" })).not.toBeInTheDocument();
	});

	it("calls onChange when typing in input", () => {
		const onChange = vi.fn();

		render(
			<EditableSelect value="" onChange={onChange} options={["A", "B"]} />,
		);

		fireEvent.change(screen.getByRole("textbox"), {
			target: { value: "Custom" },
		});
		expect(onChange).toHaveBeenCalledWith("Custom");
	});

	it("keeps list open when interacting inside and handles enter with no active option", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();

		render(
			<EditableSelect value="Z" onChange={onChange} options={["A", "B"]} />,
		);

		const input = screen.getByRole("textbox");
		const toggle = screen.getByRole("button", { name: "Toggle options" });

		await user.click(input);
		expect(screen.getByRole("button", { name: "A" })).toBeInTheDocument();

		fireEvent.mouseDown(input);
		expect(screen.getByRole("button", { name: "A" })).toBeInTheDocument();

		const container = input.parentElement?.parentElement as HTMLElement;
		fireEvent.blur(container, { relatedTarget: toggle });
		expect(screen.getByRole("button", { name: "A" })).toBeInTheDocument();

		await user.keyboard("{Enter}");
		expect(onChange).not.toHaveBeenCalled();
	});
});
