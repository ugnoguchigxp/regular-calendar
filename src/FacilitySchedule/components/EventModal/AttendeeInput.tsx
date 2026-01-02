import { X } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/components/ui/utils";
import type { Personnel } from "../../../PersonnelPanel/PersonnelPanel.schema";
import type { AttendeeInfo } from "../../FacilitySchedule.schema";

interface AttendeeInputProps {
	value: AttendeeInfo[];
	onChange: (value: AttendeeInfo[]) => void;
	personnel: Personnel[];
	placeholder?: string;
	className?: string;
}

export function AttendeeInput({
	value = [],
	onChange,
	personnel,
	placeholder,
	className,
}: AttendeeInputProps) {
	const [open, setOpen] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const [activeIndex, setActiveIndex] = useState(-1);
	const inputRef = useRef<HTMLInputElement>(null);

	// Filter personnel based on current input
	const filteredPersonnel = useMemo(() => {
		if (!inputValue || !personnel) return [];

		const q = inputValue.toLowerCase();
		// Only show if we have some input
		if (q.length < 1) return [];

		return personnel
			.filter((p) => {
				// Exclude already selected personnel
				if (value.some((v) => v.personnelId === p.id)) return false;

				return (
					p.name.toLowerCase().includes(q) ||
					p.department?.toLowerCase().includes(q)
				);
			})
			.slice(0, 5);
	}, [inputValue, personnel, value]);

	// Reset active index when suggestions change
	useEffect(() => {
		setActiveIndex(-1);
		setOpen(filteredPersonnel.length > 0);
	}, [filteredPersonnel]);

	const addAttendee = (info: AttendeeInfo) => {
		onChange([...value, info]);
		setInputValue("");
		setOpen(false);
		inputRef.current?.focus();
	};

	const removeAttendee = (index: number) => {
		const newValue = [...value];
		newValue.splice(index, 1);
		onChange(newValue);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.nativeEvent.isComposing) return;

		if (open && filteredPersonnel.length > 0) {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setActiveIndex((prev) =>
					prev === -1 ? 0 : (prev + 1) % filteredPersonnel.length,
				);
				return;
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setActiveIndex((prev) => {
					if (prev === -1) return filteredPersonnel.length - 1;
					return (
						(prev - 1 + filteredPersonnel.length) % filteredPersonnel.length
					);
				});
				return;
			}
		}

		if (e.key === "Enter") {
			e.preventDefault();
			if (activeIndex >= 0 && filteredPersonnel[activeIndex]) {
				const p = filteredPersonnel[activeIndex];
				addAttendee({
					name: p.name,
					email: p.email || "",
					personnelId: p.id,
					type: "personnel",
				});
			} else if (inputValue.trim().length > 0) {
				addAttendee({
					name: inputValue.trim(),
					type: "external",
				});
			}
		} else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
			removeAttendee(value.length - 1);
		} else if (e.key === "Escape") {
			setOpen(false);
		}
	};

	const handleBlur = () => {
		setTimeout(() => {
			setOpen(false);
		}, 200);
	};

	return (
		<div
			className={cn(
				"flex flex-wrap gap-2 p-2 border rounded-md bg-background focus-within:ring-2 ring-ring ring-offset-2 border-input",
				className,
			)}
		>
			{value.map((attendee, index) => (
				<div
					key={
						attendee.personnelId ??
						attendee.email ??
						`${attendee.type}-${attendee.name}`
					}
					className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm group"
				>
					<span>{attendee.name}</span>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							removeAttendee(index);
						}}
						className="text-muted-foreground group-hover:text-destructive transition-colors"
					>
						<X className="h-3 w-3" />
					</button>
				</div>
			))}

			<div className="relative flex-1 min-w-[120px]">
				<Input
					ref={inputRef}
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleKeyDown}
					onFocus={() => {
						if (filteredPersonnel.length > 0) setOpen(true);
					}}
					onBlur={handleBlur}
					placeholder={value.length === 0 ? placeholder : ""}
					className="border-0 focus-visible:ring-0 px-0 h-auto py-1 shadow-none bg-transparent"
					autoComplete="off"
				/>

				{open && filteredPersonnel.length > 0 && (
					<div className="absolute top-full left-0 z-50 w-full min-w-[200px] mt-1 bg-popover text-popover-foreground border border-border rounded-md shadow-md overflow-hidden animate-in fade-in-0 zoom-in-95">
						{filteredPersonnel.map((p, index) => (
							<button
								type="button"
								key={p.id}
								className={cn(
									"px-3 py-2 text-sm cursor-pointer flex justify-between items-center",
									index === activeIndex
										? "bg-accent text-accent-foreground"
										: "hover:bg-accent hover:text-accent-foreground",
								)}
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									addAttendee({
										name: p.name,
										email: p.email || "",
										personnelId: p.id,
										type: "personnel",
									});
								}}
								onMouseEnter={() => setActiveIndex(index)}
							>
								<span className="font-medium">{p.name}</span>
								{p.department && (
									<span className="text-xs text-muted-foreground ml-2">
										{p.department}
									</span>
								)}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
