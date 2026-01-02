import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
	it("renders with merged className and forwards ref", () => {
		const ref = React.createRef<HTMLTextAreaElement>();
		render(<Textarea ref={ref} className="custom" placeholder="Notes" />);

		const textarea = screen.getByPlaceholderText("Notes");
		expect(textarea).toHaveClass("custom");
		expect(ref.current).toBe(textarea);
	});
});
