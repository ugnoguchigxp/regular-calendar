import { render, screen } from "@testing-library/react";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

describe("Popover", () => {
	it("renders content with default alignment", () => {
		render(
			<Popover open>
				<PopoverTrigger>Open</PopoverTrigger>
				<PopoverContent>Content</PopoverContent>
			</Popover>,
		);

		expect(screen.getByText("Content")).toBeInTheDocument();
	});
});
