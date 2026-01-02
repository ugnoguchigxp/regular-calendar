import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PersonnelPanel } from "./PersonnelPanel";

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
		priority: 1,
	},
];

describe("PersonnelPanel", () => {
	it("filters and toggles selection", async () => {
		const user = userEvent.setup();
		const onSelectionChange = vi.fn();

		render(
			<PersonnelPanel
				personnel={personnel}
				selectedIds={[]}
				onSelectionChange={onSelectionChange}
				onPriorityChange={vi.fn()}
			/>,
		);

		await user.click(screen.getByText("Alice"));
		expect(onSelectionChange).toHaveBeenCalledWith(["p1"]);

		const searchInput = screen.getByRole("textbox");
		await user.type(searchInput, "bob");
		expect(screen.queryByText("Alice")).not.toBeInTheDocument();
		expect(screen.getByText("Bob")).toBeInTheDocument();
	});

	it("opens context menu and updates priority", () => {
		const onPriorityChange = vi.fn();

		render(
			<PersonnelPanel
				personnel={personnel}
				selectedIds={[]}
				onSelectionChange={vi.fn()}
				onPriorityChange={onPriorityChange}
			/>,
		);

		fireEvent.contextMenu(screen.getByRole("button", { name: /Bob/ }));
		fireEvent.click(screen.getByRole("button", { name: /High Priority/ }));

		expect(onPriorityChange).toHaveBeenCalledWith("p2", 1);
	});
});
