import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "./Button";
import { Calendar } from "./Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { cn } from "./utils";

interface DatePickerBaseProps {
	className?: string;
	label?: string;
	disabled?: boolean;
	minDate?: Date;
	maxDate?: Date;
	monthsShown?: number;
}

interface SingleDatePickerProps extends DatePickerBaseProps {
	selectsRange?: false;
	// Compatible with both old (value/onChange) and new (date/setDate) APIs
	value?: Date | null;
	onChange?: (date: Date | null) => void;
	date?: Date;
	setDate?: (date: Date | undefined) => void;
	// Ensure strict discrimination
	startDate?: never;
	endDate?: never;
	onRangeChange?: never;
}

interface RangeDatePickerProps extends DatePickerBaseProps {
	selectsRange: true;
	startDate?: Date | null;
	endDate?: Date | null;
	onRangeChange?: (dates: [Date | null, Date | null]) => void;
	// Ensure strict discrimination
	value?: never;
	onChange?: never;
	date?: never;
	setDate?: never;
}

export type DatePickerProps = SingleDatePickerProps | RangeDatePickerProps;

export function DatePicker(props: DatePickerProps) {
	const {
		className,
		label = "日付を選択",
		disabled,
		minDate,
		maxDate,
		monthsShown = 1,
		selectsRange,
	} = props;

	// Determine state for Single Mode
	// Prioritize 'value' (legacy) over 'date' (new) if both present, but usually only one is used.
	const singleDate = !selectsRange ? (props.value ?? props.date) : undefined;

	// Handler for Single Mode
	const handleSingleSelect = (date: Date | undefined) => {
		if (selectsRange) return;

		// Support legacy onChange (Date | null)
		if (props.onChange) {
			props.onChange(date ?? null);
		}
		// Support new setDate (Date | undefined)
		if (props.setDate) {
			props.setDate(date);
		}
	};

	// Determine state for Range Mode
	const rangeDate: DateRange | undefined = selectsRange
		? {
				from: props.startDate ?? undefined,
				to: props.endDate ?? undefined,
			}
		: undefined;

	// Handler for Range Mode
	const handleRangeSelect = (range: DateRange | undefined) => {
		if (!selectsRange) return;

		if (props.onRangeChange) {
			props.onRangeChange([range?.from ?? null, range?.to ?? null]);
		}
	};

	// Calculate disabled days for react-day-picker
	const disabledDays = [
		...(minDate ? [{ before: minDate }] : []),
		...(maxDate ? [{ after: maxDate }] : []),
	];

	// Determine display text
	let displayText = label;
	const isValueSelected = selectsRange ? !!rangeDate?.from : !!singleDate;

	if (selectsRange && rangeDate?.from) {
		displayText = format(rangeDate.from, "yyyy年MM月dd日", { locale: ja });
		if (rangeDate.to) {
			displayText += ` - ${format(rangeDate.to, "yyyy年MM月dd日", { locale: ja })}`;
		}
	} else if (!selectsRange && singleDate) {
		displayText = format(singleDate, "yyyy年MM月dd日", { locale: ja });
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={"outline"}
					disabled={disabled}
					className={cn(
						"w-full justify-start text-left font-normal",
						!isValueSelected && "opacity-70",
						className,
					)}
				>
					<CalendarIcon className="me-2 h-4 w-4" />
					{displayText}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				{selectsRange ? (
					<Calendar
						mode="range"
						defaultMonth={rangeDate?.from}
						selected={rangeDate}
						onSelect={handleRangeSelect}
						numberOfMonths={monthsShown}
						disabled={disabledDays}
						initialFocus
					/>
				) : (
					<Calendar
						mode="single"
						selected={singleDate}
						defaultMonth={singleDate}
						onSelect={handleSingleSelect}
						numberOfMonths={monthsShown}
						disabled={disabledDays}
						initialFocus
					/>
				)}
			</PopoverContent>
		</Popover>
	);
}
