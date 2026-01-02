import { type ClassValue, clsx } from "clsx";
import * as React from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Stub implementation for Tooltip
// A real accessible tooltip requires complex state or library like Radix.
// For now, using a simple hover logic or just pass-through for layout compatibility.

export const TooltipProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	return <>{children}</>;
};

export const Tooltip = ({ children }: { children: React.ReactNode }) => {
	// Use display: contents to avoid layout interference with absolute positioned children
	return <div className="group contents">{children}</div>;
};

type TooltipTriggerProps = {
	children: React.ReactNode;
	asChild?: boolean;
} & React.HTMLAttributes<HTMLElement>;

export const TooltipTrigger = ({
	children,
	asChild,
	...props
}: TooltipTriggerProps) => {
	// If asChild is true, we should probably return children with props merged
	// But for now, just stripping asChild prevents the React warning.
	// If strict asChild behavior (merging props onto child) is needed, we'd use React.cloneElement.
	// Given usage in ScheduleEventCard is wrapping a button, rendering a span around it is invalid HTML.
	// So let's try to clone if asChild is present and child is valid.
	if (asChild && React.isValidElement(children)) {
		const child = children as React.ReactElement<{ className?: string }>;
		return React.cloneElement(child, {
			...props,
			className: cn(child.props.className, "cursor-help"),
		});
	}

	return (
		<span {...props} className="cursor-help inline-block">
			{children}
		</span>
	);
};

type TooltipContentProps = {
	children: React.ReactNode;
	className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const TooltipContent = ({
	children,
	className,
	...props
}: TooltipContentProps) => {
	return (
		<div
			className={cn(
				"absolute z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
				"hidden group-hover:block w-max max-w-xs bottom-full mb-2 left-1/2 -translate-x-1/2",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
};
