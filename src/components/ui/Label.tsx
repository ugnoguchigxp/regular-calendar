import * as React from "react";
import { cn } from "./utils";

export interface LabelProps
	extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
	({ className, children, ...props }, ref) => {
		return (
			// biome-ignore lint/a11y/noLabelWithoutControl: Consumers provide htmlFor or nest inputs.
			<label
				ref={ref}
				className={cn(
					"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
					className,
				)}
				{...props}
			>
				{children}
			</label>
		);
	},
);
Label.displayName = "Label";

export { Label };
