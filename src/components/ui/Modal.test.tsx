import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal, { ConfirmModal } from "./Modal";

describe("Modal", () => {
	it("renders content and calls onClose when closed", async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();
		const onOpenChange = vi.fn();

		render(
			<Modal
				defaultOpen
				title="Details"
				description="Info"
				onClose={onClose}
				onOpenChange={onOpenChange}
			>
				<div>Body</div>
			</Modal>,
		);

		expect(screen.getByText("Details")).toBeInTheDocument();
		expect(screen.getByText("Info")).toBeInTheDocument();
		expect(screen.getByText("Body")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /close/i }));
		expect(onOpenChange).toHaveBeenCalledWith(false);
		expect(onClose).toHaveBeenCalled();
	});

	it("calls onConfirm in ConfirmModal", async () => {
		const user = userEvent.setup();
		const onConfirm = vi.fn();
		const onClose = vi.fn();

		render(
			<ConfirmModal
				open
				title="Confirm"
				description="Are you sure?"
				onConfirm={onConfirm}
				onClose={onClose}
				onOpenChange={vi.fn()}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Confirm" }));
		expect(onConfirm).toHaveBeenCalled();

		await user.click(screen.getByRole("button", { name: "Cancel" }));
		expect(onClose).toHaveBeenCalled();
	});

	it("renders without header and shows footer content", () => {
		render(
			<Modal
				open
				noHeader
				description="Hidden description"
				footer={<div>Footer</div>}
			>
				<div>Body</div>
			</Modal>,
		);

		expect(screen.queryByLabelText("Drag modal")).not.toBeInTheDocument();
		expect(screen.getByText("Footer")).toBeInTheDocument();
	});

	it("respects non-draggable header styling", () => {
		render(
			<Modal
				open
				title="Static"
				description="Static description"
				draggable={false}
			>
				<div>Body</div>
			</Modal>,
		);

		const header = screen.getByLabelText("Drag modal");
		expect(header.className).not.toContain("cursor-move");
	});

	it("calls onOpenChange when ConfirmModal has no onClose", async () => {
		const user = userEvent.setup();
		const onOpenChange = vi.fn();

		render(
			<ConfirmModal
				open
				title="Confirm"
				description="Are you sure?"
				onConfirm={vi.fn()}
				onOpenChange={onOpenChange}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Cancel" }));
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it("renders trigger when provided", () => {
		render(
			<Modal trigger={<button type="button">Open</button>}>
				<div>Body</div>
			</Modal>,
		);

		expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
	});

	it("updates position when dragging", () => {
		render(
			<Modal defaultOpen title="Draggable" description="Drag description">
				<div>Body</div>
			</Modal>,
		);

		const dialog = screen.getByRole("dialog");
		const initialTransform = dialog.style.transform;
		const header = screen.getByLabelText("Drag modal");

		fireEvent.mouseDown(header, { clientX: 100, clientY: 100 });
		fireEvent.mouseMove(document, { clientX: 120, clientY: 130 });
		fireEvent.mouseUp(document);

		expect(dialog.style.transform).not.toBe(initialTransform);
	});

	it("handles non-draggable header interactions and padding options", () => {
		render(
			<Modal
				open
				title="Static"
				description="Static description"
				draggable={false}
				noPadding
			>
				<div>Body</div>
			</Modal>,
		);

		const dialog = screen.getByRole("dialog");
		const header = screen.getByLabelText("Drag modal");

		fireEvent.mouseDown(header);
		fireEvent.keyDown(header, { key: "Enter" });
		fireEvent.keyDown(header, { key: " " });

		expect(dialog).toBeInTheDocument();
	});
});
