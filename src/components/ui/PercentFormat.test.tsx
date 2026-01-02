import { render, screen } from "@testing-library/react";
import { PercentFormat } from "./PercentFormat";

describe("PercentFormat", () => {
	it("renders formatted percent for ratio values", () => {
		render(<PercentFormat value={0.25} />);
		expect(screen.getByText("25%")).toBeInTheDocument();
	});

	it("renders formatted percent for percent values", () => {
		render(<PercentFormat value={25} valueScale="percent" />);
		expect(screen.getByText("25%")).toBeInTheDocument();
	});

	it("applies className and options", () => {
		render(
			<PercentFormat
				value={0.2}
				options={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
				className="custom"
				data-testid="percent"
			/>,
		);
		const el = screen.getByTestId("percent");
		expect(el).toHaveTextContent("20.0%");
		expect(el).toHaveClass("custom");
	});
});
