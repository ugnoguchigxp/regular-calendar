import { fireEvent, render, screen } from "@testing-library/react";
import { PersonnelContextMenu } from "./PersonnelContextMenu";

const personnel = {
	id: "p1",
	name: "Alice",
	email: "alice@example.com",
	department: "Sales",
	priority: 0,
};

describe("PersonnelContextMenu", () => {
	it("invokes priority change and closes", () => {
		const onClose = vi.fn();
		const onSetPriority = vi.fn();

		render(
			<PersonnelContextMenu
				personnel={personnel}
				position={{ x: 10, y: 20 }}
				onClose={onClose}
				onSetPriority={onSetPriority}
			/>,
		);

		const menuButtons = screen.getAllByRole("button");
		fireEvent.click(menuButtons[0]);
		expect(onSetPriority).toHaveBeenCalledWith("p1", 1);
		expect(onClose).toHaveBeenCalled();
	});

	it("closes when clicking outside", () => {
		const onClose = vi.fn();

		render(
			<PersonnelContextMenu
				personnel={personnel}
				position={{ x: 10, y: 20 }}
				onClose={onClose}
				onSetPriority={vi.fn()}
			/>,
		);

		fireEvent.mouseDown(document.body);
		expect(onClose).toHaveBeenCalled();
	});
});
