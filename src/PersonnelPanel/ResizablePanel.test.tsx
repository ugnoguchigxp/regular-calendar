import { fireEvent, render } from "@testing-library/react";
import { ResizablePanel } from "./ResizablePanel";

const createStorage = () => ({
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
});

describe("ResizablePanel", () => {
	it("loads width from storage and updates on resize", () => {
		const storage = createStorage();
		storage.getItem.mockReturnValue("220");

		const { container } = render(
			<ResizablePanel storageKey="panel" storage={storage}>
				<div>Content</div>
			</ResizablePanel>,
		);

		const panel = container.firstElementChild as HTMLDivElement;
		expect(panel.style.width).toBe("220px");

		vi.spyOn(panel, "getBoundingClientRect").mockReturnValue({
			x: 0,
			y: 0,
			width: 220,
			height: 100,
			top: 0,
			left: 0,
			bottom: 100,
			right: 220,
			toJSON: () => {},
		});

		const handle = panel.querySelector("button.cursor-col-resize");
		if (!handle) throw new Error("Resize handle not found");

		fireEvent.mouseDown(handle);
		fireEvent.mouseMove(document, { clientX: 260 });
		fireEvent.mouseUp(document);

		expect(storage.setItem).toHaveBeenCalledWith("panel", "260");
	});
});
