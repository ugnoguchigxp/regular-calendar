import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Icons } from "./Icons";
import { cn } from "./utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 min-w-[var(--ui-space-0)] overflow-hidden",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground shadow hover:bg-primary/90",
				destructive: "bg-chart-4 text-white shadow-sm hover:bg-chart-4/90",
				outline:
					"border border-input bg-transparent text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground",
				secondary:
					"bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
				ghost: "hover:bg-accent hover:text-accent-foreground",
				link: "text-accent underline-offset-4 underline hover:text-accent/80 !h-auto !py-[var(--ui-space-0)]",
				// Legacy/Custom Mappings
				positive: "bg-chart-2 text-white shadow-sm hover:bg-chart-2/90",
				warning: "bg-chart-3 text-white shadow-sm hover:bg-chart-3/90",
				info: "bg-chart-5 text-white shadow-sm hover:bg-chart-5/90",
				// Custom Outlines
				"outline-positive":
					"border border-chart-2 text-chart-2 hover:bg-chart-2/10",
				"outline-negative":
					"border border-muted text-muted-foreground hover:bg-muted/10",
				// Special
				fab: "rounded-full h-[var(--ui-space-14)] w-[var(--ui-space-14)] p-[var(--ui-space-0)] shadow-lg hover:shadow-xl bg-primary text-primary-foreground hover:bg-primary/90",
				"circle-help":
					"bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 rounded-full",
				"circle-alert":
					"bg-chart-3 text-white shadow-sm hover:bg-chart-3/90 rounded-full",
				// Missing Variants
				abort:
					"bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
				negative: "bg-muted text-muted-foreground shadow-sm hover:bg-muted/80",
				delete: "bg-chart-4 text-white shadow-sm hover:bg-chart-4/90",
				pause: "bg-chart-3 text-white shadow-sm hover:bg-chart-3/90",
				"outline-abort":
					"border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
				option:
					"border border-[hsl(210,30%,35%)] dark:border-border bg-background text-foreground shadow-none hover:bg-accent/30 hover:text-foreground",
				"option-active":
					"border-2 border-primary bg-primary/10 text-foreground shadow-none hover:bg-primary/20",
				"outline-delete":
					"border border-destructive/50 text-destructive bg-background hover:bg-destructive/10 hover:border-destructive",
			},
			size: {
				default: "px-ui-button py-ui text-ui min-h-ui-touch",
				sm: "rounded-md px-[var(--ui-space-3)] py-[var(--ui-space-1)] text-xs",
				lg: "rounded-md px-[var(--ui-space-8)] py-[var(--ui-space-3)]",
				icon: "p-ui min-h-ui-touch min-w-[var(--ui-touch-target-min)]",
				circle: "rounded-full p-[var(--ui-space-2)] aspect-square",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	loading?: boolean;
	success?: boolean;
	error?: boolean;
	icon?: React.ElementType;
	maxLabelLength?: number;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant = "default",
			size,
			children,
			loading = false,
			success = false,
			error = false,
			icon: Icon,
			asChild = false,
			disabled,
			maxLabelLength = 100,
			...props
		},
		ref,
	) => {
		const Comp = asChild ? Slot : "button";

		const finalVariant = success ? "positive" : error ? "destructive" : variant;

		const renderContent = () => {
			if (loading) return <Icons.Spinner className="h-ui-icon w-ui-icon" />;
			if (success) return <Icons.Check className="h-ui-icon w-ui-icon" />;
			if (error) return <Icons.X className="h-ui-icon w-ui-icon" />;

			const truncatedLabel =
				typeof children === "string" && children.length > maxLabelLength
					? `${children.slice(0, Math.max(0, maxLabelLength - 1))}…`
					: children;
			const isTruncated =
				typeof children === "string" &&
				typeof truncatedLabel === "string" &&
				truncatedLabel !== children;

			const label =
				typeof children === "string" ? (
					<span
						className="min-w-[var(--ui-space-0)] flex-1 whitespace-nowrap"
						title={isTruncated ? children : undefined}
					>
						{truncatedLabel}
					</span>
				) : (
					children
				);

			return (
				<span className="flex min-w-[var(--ui-space-0)] items-center">
					{Icon && (
						<Icon
							className={cn(
								"mr-[var(--ui-space-2)] h-ui-icon w-ui-icon",
								!children && "mr-[var(--ui-space-0)]",
							)}
						/>
					)}
					{label}
				</span>
			);
		};

		return (
			<Comp
				className={cn(
					buttonVariants({ variant: finalVariant, size, className }),
				)}
				ref={ref}
				disabled={disabled || loading || success || error}
				{...props}
			>
				{renderContent()}
			</Comp>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants, cn };
