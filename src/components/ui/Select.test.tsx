import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./Select";

describe("Select", () => {
	it("opens content and selects item", async () => {
		const user = userEvent.setup();
		const onValueChange = vi.fn();
		render(
			<Select defaultValue="a" onValueChange={onValueChange}>
				<SelectTrigger>
					<SelectValue placeholder="Pick one" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="a">Alpha</SelectItem>
					<SelectItem value="b">Beta</SelectItem>
				</SelectContent>
			</Select>,
		);

		expect(
			screen.getByRole("button", { name: "a Chevron down" }),
		).toHaveTextContent("a");

		await user.click(screen.getByRole("button", { name: "a Chevron down" }));
		expect(screen.getAllByText("Alpha").length).toBeGreaterThan(0);
		expect(screen.getByText("Beta")).toBeInTheDocument();

		await user.click(screen.getByText("Beta"));
		expect(onValueChange).toHaveBeenCalledWith("b");
		await user.click(screen.getByRole("button", { name: "Beta Chevron down" }));
		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: "Beta Chevron down" }),
			).toHaveTextContent("Beta");
		});
	});

	it("does not open when disabled", async () => {
		const user = userEvent.setup();
		render(
			<Select defaultValue="a" disabled>
				<SelectTrigger>
					<SelectValue placeholder="Pick one" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="a">Alpha</SelectItem>
				</SelectContent>
			</Select>,
		);

		await user.click(screen.getByRole("button", { name: "a Chevron down" }));
		expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
	});
});
