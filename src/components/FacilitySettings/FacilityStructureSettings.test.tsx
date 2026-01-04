import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FacilityStructureSettings } from "./FacilityStructureSettings";

const groups = [
	{
		id: "g1",
		name: "Group 1",
		displayMode: "grid" as const,
		dimension: 1,
		resources: [],
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

const resources = [
	{
		id: "r1",
		name: "Room 1",
		order: 1,
		isAvailable: true,
		groupId: "g1",
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

describe("FacilityStructureSettings", () => {
	beforeEach(() => {
		vi.spyOn(window, "prompt").mockImplementation(() => "New Name");
		vi.spyOn(window, "confirm").mockImplementation(() => true);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("creates, edits, and deletes groups/resources", async () => {
		const user = userEvent.setup();
		const onCreateGroup = vi.fn().mockResolvedValue(undefined);
		const onUpdateGroup = vi.fn().mockResolvedValue(undefined);
		const onDeleteGroup = vi.fn().mockResolvedValue(undefined);
		const onCreateResource = vi.fn().mockResolvedValue(undefined);
		const onUpdateResource = vi.fn().mockResolvedValue(undefined);
		const onDeleteResource = vi.fn().mockResolvedValue(undefined);

		render(
			<FacilityStructureSettings
				groups={groups}
				resources={resources}
				onCreateGroup={onCreateGroup}
				onUpdateGroup={onUpdateGroup}
				onDeleteGroup={onDeleteGroup}
				onCreateResource={onCreateResource}
				onUpdateResource={onUpdateResource}
				onDeleteResource={onDeleteResource}
				onClose={vi.fn()}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /add group/i }));
		expect(onCreateGroup).toHaveBeenCalledWith({ name: "New Name" });

		const groupSection = screen.getByText("Group 1").closest("div");
		if (!groupSection) throw new Error("Group section not found");
		const groupButtons = within(groupSection).getAllByRole("button");
		fireEvent.click(groupButtons[0]);

		const editInput = screen.getByDisplayValue("Group 1");
		await user.clear(editInput);
		await user.type(editInput, "Updated Group");
		await user.click(screen.getByRole("button", { name: /save/i }));
		expect(onUpdateGroup).toHaveBeenCalledWith("g1", { name: "Updated Group" });

		const groupButtonsAfterEdit = within(groupSection).getAllByRole("button");
		fireEvent.click(groupButtonsAfterEdit[1]);
		expect(onDeleteGroup).toHaveBeenCalledWith("g1");

		await user.click(screen.getByRole("button", { name: /add resource/i }));
		expect(onCreateResource).toHaveBeenCalledWith({
			name: "New Name",
			groupId: "g1",
			order: 2,
			isAvailable: true,
		});

		const resourceTag = screen.getByText("Room 1").closest("div");
		if (!resourceTag) throw new Error("Resource tag not found");
		const resourceButtons = within(resourceTag).getAllByRole("button");
		fireEvent.click(resourceButtons[0]);

		const resourceInput = screen.getByDisplayValue("Room 1");
		await user.clear(resourceInput);
		await user.type(resourceInput, "Updated Room");
		await user.click(
			within(resourceTag).getByRole("button", { name: /save/i }),
		);
		expect(onUpdateResource).toHaveBeenCalledWith("r1", {
			name: "Updated Room",
		});

		const resourceButtonsAfterEdit = within(resourceTag).getAllByRole("button");
		fireEvent.click(resourceButtonsAfterEdit[1]);
		expect(onDeleteResource).toHaveBeenCalledWith("r1");
	});

	it("closes when clicking overlay", () => {
		const onClose = vi.fn();
		const { container } = render(
			<FacilityStructureSettings
				groups={[]}
				resources={[]}
				onCreateGroup={vi.fn()}
				onUpdateGroup={vi.fn()}
				onDeleteGroup={vi.fn()}
				onCreateResource={vi.fn()}
				onUpdateResource={vi.fn()}
				onDeleteResource={vi.fn()}
				onClose={onClose}
			/>,
		);

		const overlay = container.querySelector("button[aria-label]");
		if (!overlay) throw new Error("Overlay not found");
		fireEvent.click(overlay);
		expect(onClose).toHaveBeenCalled();
	});
});
