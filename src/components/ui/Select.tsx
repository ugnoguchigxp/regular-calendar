import { type ClassValue, clsx } from "clsx";
import * as React from "react";
import { twMerge } from "tailwind-merge";
import { Icons } from "@/components/ui/Icons";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Minimal Select implementation using native select for simplicity in standalone package
// while mocking the Radix UI structure used in the original code to minimize refactor.
// Note: Properly implementing Radix Select without the library is hard.
// I will implement a "Smart" Native implementation that pretends to show custom UI
// or for now, just simplified Select using native <select>.
// However, the original code uses SelectTrigger, SelectContent, SelectItem which allows custom content.
// Native <select> only allows text.
// If I use native, I break custom rendering (e.g. bed number).

// STRATEGY: Implement a basic custom Select using React State.

interface SelectContextValue {
	value: string;
	onValueChange: (value: string) => void;
	open: boolean;
	setOpen: (open: boolean) => void;
	label?: React.ReactNode;
	setLabel: (label: React.ReactNode) => void;
	disabled?: boolean;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

export const Select = ({
	children,
	value,
	onValueChange,
	defaultValue,
	disabled,
}: {
	children: React.ReactNode;
	value?: string;
	onValueChange?: (value: string) => void;
	defaultValue?: string;
	disabled?: boolean;
}) => {
	const [internalValue, setInternalValue] = React.useState(defaultValue || "");
	const [open, setOpen] = React.useState(false);
	const [selectedLabel, setSelectedLabel] =
		React.useState<React.ReactNode>(null);

	const actualValue = value !== undefined ? value : internalValue;

	const handleValueChange = (val: string) => {
		setInternalValue(val);
		onValueChange?.(val);
		setOpen(false);
	};

	return (
		<SelectContext.Provider
			value={{
				value: actualValue,
				onValueChange: handleValueChange,
				open,
				setOpen,
				label: selectedLabel,
				setLabel: setSelectedLabel,
				disabled,
			}}
		>
			<div className="relative">{children}</div>
		</SelectContext.Provider>
	);
};

export const SelectTrigger = React.forwardRef<
	HTMLButtonElement,
	React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
	const ctx = React.useContext(SelectContext);
	if (!ctx) throw new Error("SelectTrigger must be used within Select");

	return (
		<button
			ref={ref}
			type="button"
			disabled={ctx.disabled || props.disabled}
			onClick={() => !ctx.disabled && ctx.setOpen(!ctx.open)}
			className={cn(
				"flex w-full items-center justify-between rounded-md border border-input bg-background px-ui py-ui text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		>
			{children}
			<Icons.ChevronDown className="h-ui-icon w-ui-icon opacity-50" />
		</button>
	);
});
SelectTrigger.displayName = "SelectTrigger";

export const SelectValue = React.forwardRef<
	HTMLSpanElement,
	React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }
>(({ className, placeholder, ...props }, ref) => {
	const ctx = React.useContext(SelectContext);
	if (!ctx) throw new Error("SelectValue must be used within Select");

	return (
		<span ref={ref} className={cn("block truncate", className)} {...props}>
			{props.children || ctx.label || ctx.value || placeholder}
		</span>
	);
});
SelectValue.displayName = "SelectValue";

export const SelectContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
	const ctx = React.useContext(SelectContext);
	if (!ctx) throw new Error("SelectContent must be used within Select");

	if (!ctx.open) return null;

	return (
		<div
			ref={ref}
			className={cn(
				"absolute z-50 min-w-[var(--ui-space-32)] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 w-full mt-[var(--ui-space-1)]",
				className,
			)}
			{...props}
		>
			<div className="p-[var(--ui-space-1)] max-h-[var(--ui-space-60)] overflow-y-auto">
				{children}
			</div>
		</div>
	);
});
SelectContent.displayName = "SelectContent";

export const SelectItem = React.forwardRef<
	HTMLButtonElement,
	React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, children, value, ...props }, ref) => {
	const ctx = React.useContext(SelectContext);
	if (!ctx) throw new Error("SelectItem must be used within Select");

	const isSelected = ctx.value === value;

	// Update label if selected (effect inside render is risky but for this simple sync it works if we assume single pass or strict mode double render won't hurt much usually, but simpler is to derive label in Select by iterating children? No because children are nested components.
	// We'll use a layout effect or just render logic in Parent? No, items push label up.
	// We'll trust the trigger to show Value directly or this is getting complex.
	// Let's use basic OnClick update.

	React.useEffect(() => {
		if (isSelected) {
			ctx.setLabel(children);
		}
	}, [isSelected, children, ctx]);

	return (
		<button
			ref={ref}
			type="button"
			className={cn(
				"relative flex w-full cursor-default select-none items-center rounded-sm py-[var(--ui-space-1-5)] pl-[var(--ui-space-8)] pr-[var(--ui-space-2)] text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
				isSelected ? "bg-accent/50" : "",
				className,
			)}
			onClick={() => {
				ctx.setLabel(children);
				ctx.onValueChange(value);
			}}
			{...props}
		>
			<span className="absolute left-[var(--ui-space-2)] flex h-[var(--ui-space-3-5)] w-[var(--ui-space-3-5)] items-center justify-center">
				{isSelected && (
					<span className="h-[var(--ui-space-2)] w-[var(--ui-space-2)] rounded-full bg-current" />
				)}
			</span>
			<span className="truncate">{children}</span>
		</button>
	);
});
SelectItem.displayName = "SelectItem";
