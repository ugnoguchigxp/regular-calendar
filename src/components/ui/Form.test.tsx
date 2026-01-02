import { render, screen } from "@testing-library/react";
import * as React from "react";
import { useForm } from "react-hook-form";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./Form";

describe("Form components", () => {
	it("renders error state and message", () => {
		const TestForm = () => {
			const methods = useForm<{ name: string }>({
				defaultValues: { name: "" },
			});
			React.useEffect(() => {
				methods.setError("name", { type: "required", message: "Required" });
			}, [methods]);

			return (
				<Form {...methods}>
					<form>
						<FormField
							name="name"
							control={methods.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</form>
				</Form>
			);
		};

		render(<TestForm />);

		expect(screen.getByText("Required")).toBeInTheDocument();
		expect(screen.getByText("Name")).toHaveClass("text-destructive");

		const input = screen.getByRole("textbox");
		const control = input.parentElement;
		expect(control).toHaveAttribute("aria-invalid", "true");
		expect(control?.getAttribute("aria-describedby")).toContain("form-item");
	});
});
