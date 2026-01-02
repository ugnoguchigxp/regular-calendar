import type * as React from "react";
import { cn } from "./Button";

interface PercentFormatProps extends React.HTMLAttributes<HTMLSpanElement> {
	value: number; // 0-100 or 0-1
	valueScale?: "percent" | "ratio"; // 0-100 vs 0-1. Default ratio
	options?: Intl.NumberFormatOptions;
}

export function PercentFormat({
	value,
	valueScale = "ratio",
	options,
	className,
	...props
}: PercentFormatProps) {
	const ratio = valueScale === "percent" ? value / 100 : value;

	const formatted = new Intl.NumberFormat("en-US", {
		style: "percent",
		...options,
	}).format(ratio);

	return (
		<span className={cn("", className)} {...props}>
			{formatted}
		</span>
	);
}
