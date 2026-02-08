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
		const bobs = screen.getAllByText("Bob");
		expect(bobs.length).toBeGreaterThan(0);
		expect(bobs[0]).toBeInTheDocument();
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

	it("filters by department using buttons (legacy mode)", async () => {
		const user = userEvent.setup();
		render(
			<PersonnelPanel
				personnel={personnel}
				selectedIds={[]}
				onSelectionChange={vi.fn()}
				onPriorityChange={vi.fn()}
				filterType="button"
			/>,
		);

		// Check buttons are rendered
		const salesBtn = screen.getByRole("button", { name: "Sales" });
		const supportBtn = screen.getByRole("button", { name: "Support" });
		expect(salesBtn).toBeInTheDocument();
		expect(supportBtn).toBeInTheDocument();

		// Filter by Sales
		await user.click(salesBtn);
		expect(screen.getByText("Alice")).toBeInTheDocument();
		expect(screen.queryByText("Bob")).not.toBeInTheDocument();

		// Toggle off
		await user.click(salesBtn);
		expect(screen.getByText("Alice")).toBeInTheDocument();
		expect(screen.getByText("Bob")).toBeInTheDocument();
	});

	it("filters by department using select (new mode)", async () => {
		const user = userEvent.setup();
		render(
			<PersonnelPanel
				personnel={personnel}
				selectedIds={[]}
				onSelectionChange={vi.fn()}
				onPriorityChange={vi.fn()}
				filterType="select"
			/>,
		);

		const select = screen.getByRole("combobox");
		expect(select).toBeInTheDocument();

		// Select Sales
		await user.selectOptions(select, "Sales");
		expect(screen.getByText("Alice")).toBeInTheDocument();
		expect(screen.queryByText("Bob")).not.toBeInTheDocument();

		// Select All Professions (empty value)
		await user.selectOptions(select, "");
		expect(screen.getByText("Alice")).toBeInTheDocument();
		expect(screen.getByText("Bob")).toBeInTheDocument();
	});
});
