import * as React from "react";
import { Icons } from "@/components/ui/Icons";
import {
	type SelectItemVariants,
	type SelectTriggerVariants,
	selectItemVariants,
	selectTriggerVariants,
} from "./selectVariants";
import { cn } from "./utils";

export interface IEditableSelectProps {
	value: string | number;
	onChange: (value: string) => void;
	options: (string | number)[];
	className?: string;
	placeholder?: string;
	disabled?: boolean;
	/** Visual variant (matches `SelectTrigger`) */
	variant?: SelectTriggerVariants["variant"];
	/** Size variant (matches `SelectTrigger`) */
	size?: SelectTriggerVariants["size"];
}

export const EditableSelect = React.forwardRef<
	HTMLInputElement,
	IEditableSelectProps
>(
	(
		{
			value,
			onChange,
			options,
			className,
			placeholder,
			disabled = false,
			variant = "default",
			size = "md",
		},
		ref,
	) => {
		const [isOpen, setIsOpen] = React.useState(false);
		const [activeIndex, setActiveIndex] = React.useState(-1);
		const containerRef = React.useRef<HTMLFieldSetElement>(null);
		const listRef = React.useRef<HTMLDivElement>(null);

		// Reset or sync active index when opening
		React.useEffect(() => {
			if (isOpen) {
				const index = options.indexOf(value);
				setActiveIndex(index >= 0 ? index : -1);
			}
		}, [isOpen, value, options]);

		// Scroll into view when active index changes
		React.useEffect(() => {
			if (isOpen && activeIndex >= 0 && listRef.current) {
				const activeItem = listRef.current.children[activeIndex] as HTMLElement;
				if (activeItem) {
					activeItem.scrollIntoView({ block: "nearest" });
				}
			}
		}, [activeIndex, isOpen]);

		React.useEffect(() => {
			const handleClickOutside = (event: MouseEvent) => {
				if (
					containerRef.current &&
					!containerRef.current.contains(event.target as Node)
				) {
					setIsOpen(false);
				}
			};

			document.addEventListener("mousedown", handleClickOutside);
			return () =>
				document.removeEventListener("mousedown", handleClickOutside);
		}, []);

		const handleOptionClick = (option: string | number) => {
			onChange(String(option));
			setIsOpen(false);
		};

		const handleKeyDown = (e: React.KeyboardEvent) => {
			if (!isOpen) {
				if (e.key === "ArrowDown" || e.key === "ArrowUp") {
					setIsOpen(true);
					e.preventDefault();
				} else if (e.key === "Enter") {
					// Allow default form submission if closed?
					// Or open list? Usually Enter in input submits form.
					// Let's keep default behavior if closed.
				}
				return;
			}

			if (e.key === "ArrowDown") {
				e.preventDefault();
				setActiveIndex((prev) => (prev + 1) % options.length);
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setActiveIndex((prev) => (prev - 1 + options.length) % options.length);
			} else if (e.key === "Enter") {
				e.preventDefault();
				if (activeIndex >= 0) {
					handleOptionClick(options[activeIndex]);
				}
			} else if (e.key === "Escape") {
				e.preventDefault();
				setIsOpen(false);
			}
		};

		return (
			<fieldset
				className={cn(
					"relative border-0 p-[var(--ui-space-0)] m-[var(--ui-space-0)]",
					className,
				)}
				ref={containerRef}
				onBlur={(e) => {
					if (!e.currentTarget.contains(e.relatedTarget as Node)) {
						setIsOpen(false);
					}
				}}
				disabled={disabled}
			>
				<div
					className={cn(
						selectTriggerVariants({ variant, size }),
						"cursor-text",
						"focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
						disabled && "pointer-events-none",
					)}
					aria-disabled={disabled}
				>
					<input
						ref={ref}
						type="text"
						value={value}
						onChange={(e) => onChange(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={placeholder}
						disabled={disabled}
						className={cn(
							"w-full bg-transparent border-none text-foreground text-left appearance-none focus:outline-none p-[var(--ui-space-0)] m-[var(--ui-space-0)]",
							"placeholder:text-muted-foreground",
						)}
						onFocus={() => setIsOpen(true)}
					/>
					<button
						type="button"
						onClick={() => setIsOpen((v) => !v)}
						className={cn(
							"inline-flex items-center justify-center rounded",
							"text-muted-foreground hover:bg-accent focus:outline-none",
						)}
						tabIndex={-1}
						aria-label="Toggle options"
					>
						<Icons.ChevronDown className={cn("h-ui-icon w-ui-icon")} />
					</button>
				</div>

				{isOpen && (
					<div
						ref={listRef}
						className="absolute z-50 w-full mt-[var(--ui-space-1)] max-h-[var(--ui-space-60)] overflow-y-auto bg-background border border-border rounded-md shadow-lg scrollbar-thin"
					>
						{options.map((option, index) => (
							<button
								key={option}
								type="button"
								tabIndex={-1}
								onClick={() => handleOptionClick(option)}
								onMouseEnter={() => setActiveIndex(index)}
								className={cn(
									selectItemVariants({
										size: size as SelectItemVariants["size"],
										indicator: "none",
										padding: "plain",
									}),
									"w-full text-left text-foreground",
									index === activeIndex
										? "bg-accent text-accent-foreground"
										: "hover:bg-accent hover:text-accent-foreground",
								)}
							>
								{option}
							</button>
						))}
					</div>
				)}
			</fieldset>
		);
	},
);
EditableSelect.displayName = "EditableSelect";
