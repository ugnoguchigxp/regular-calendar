import { Icons } from "@/components/ui/Icons";
import { useAppTranslation } from "@/utils/i18n";
import { Button } from "./Button";
import { Calendar, type DateRange } from "./Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { cn } from "./utils";
import { formatCalendarDate } from "@/utils/dateFormats";

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
		label,
		disabled,
		minDate,
		maxDate,
		monthsShown = 1,
		selectsRange,
	} = props;
	const { t, i18n } = useAppTranslation();
	const locale = i18n.language?.startsWith("ja") ? "ja-JP" : "en-US";
	const resolvedLabel = label ?? t("date_picker_label");

	// Determine state for Single Mode
	// Prioritize 'value' (legacy) over 'date' (new) if both present, but usually only one is used.
	const singleDate = !selectsRange ? (props.value ?? props.date) : undefined;

	// Handler for Single Mode
	const handleSingleSelect = (date: any) => {
		const selectedDate = date as Date | undefined;
		if (selectsRange) return;

		// Support legacy onChange (Date | null)
		if (props.onChange) {
			props.onChange(selectedDate ?? null);
		}
		// Support new setDate (Date | undefined)
		if (props.setDate) {
			props.setDate(selectedDate);
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
	const handleRangeSelect = (range: any) => {
		const selectedRange = range as DateRange | undefined;
		if (!selectsRange) return;

		if (props.onRangeChange) {
			props.onRangeChange([selectedRange?.from ?? null, selectedRange?.to ?? null]);
		}
	};

	// Calculate disabled days for custom calendar
	const disabledDays = [
		...(minDate ? [{ before: minDate }] : []),
		...(maxDate ? [{ after: maxDate }] : []),
	];



	// Determine display text
	let displayText = resolvedLabel;
	const isValueSelected = selectsRange ? !!rangeDate?.from : !!singleDate;

	if (selectsRange && rangeDate?.from) {
		displayText = formatCalendarDate(rangeDate.from, locale, "picker");
		if (rangeDate.to) {
			displayText += ` - ${formatCalendarDate(rangeDate.to, locale, "picker")}`;
		}
	} else if (!selectsRange && singleDate) {
		displayText = formatCalendarDate(singleDate, locale, "picker");
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
					<Icons.Calendar className="me-2 h-ui-icon w-ui-icon" />
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
						locale={locale}
					/>
				) : (
					<Calendar
						mode="single"
						selected={singleDate}
						defaultMonth={singleDate}
						onSelect={handleSingleSelect}
						numberOfMonths={monthsShown}
						disabled={disabledDays}
						locale={locale}
					/>
				)}
			</PopoverContent>
		</Popover>
	);
}
