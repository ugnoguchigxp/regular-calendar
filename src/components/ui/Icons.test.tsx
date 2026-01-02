import { render } from "@testing-library/react";
import { Icons } from "./Icons";

describe("Icons", () => {
	it("renders svg icons with custom class", () => {
		const { container } = render(
			<Icons.ChevronLeft className="size-6" data-testid="icon" />,
		);
		const svg = container.querySelector("svg");
		expect(svg).toBeInTheDocument();
		expect(svg).toHaveClass("size-6");
	});
});
