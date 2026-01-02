import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AttendeeInput } from "./AttendeeInput";

const personnel = [
	{
		id: "p1",
		name: "Alice",
		email: "alice@example.com",
		department: "Sales",
		priority: 0,
	},
	{
		id: "p2",
		name: "Bob",
		email: "bob@example.com",
		department: "Support",
		priority: 0,
	},
];

describe("AttendeeInput", () => {
	it("adds attendee from suggestion list", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();

		render(
			<AttendeeInput
				value={[]}
				onChange={onChange}
				personnel={personnel}
				placeholder="Add"
			/>,
		);

		const input = screen.getByPlaceholderText("Add");
		await user.type(input, "Ali");
		await user.click(screen.getByText("Alice"));

		expect(onChange).toHaveBeenCalledWith([
			{
				name: "Alice",
				email: "alice@example.com",
				personnelId: "p1",
				type: "personnel",
			},
		]);
	});

	it("adds external attendee on enter and removes with backspace", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();

		const { rerender } = render(
			<AttendeeInput
				value={[]}
				onChange={onChange}
				personnel={personnel}
				placeholder="Add"
			/>,
		);

		const input = screen.getByPlaceholderText("Add");
		await user.type(input, "Guest{enter}");

		expect(onChange).toHaveBeenCalledWith([
			{ name: "Guest", type: "external" },
		]);

		rerender(
			<AttendeeInput
				value={[{ name: "Guest", type: "external" }]}
				onChange={onChange}
				personnel={personnel}
				placeholder="Add"
			/>,
		);

		await user.click(screen.getByRole("textbox"));
		await user.keyboard("{Backspace}");

		expect(onChange).toHaveBeenCalledWith([]);
	});
});
