import { format } from "date-fns";
import { enUS, ja } from "date-fns/locale";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type * as React from "react";
import { DayPicker, useNavigation } from "react-day-picker";
import { useAppTranslation } from "@/utils/i18n";
import { MonthYearPicker } from "./MonthYearPicker";
import { cn } from "./utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	...props
}: CalendarProps) {
	const { i18n } = useAppTranslation();
	const locale = i18n.language?.startsWith("ja") ? ja : enUS;
	const { modifiers, modifiersClassNames, ...restProps } = props;
	const mergedModifiers = {
		...modifiers,
		sunday: modifiers?.sunday ?? { dayOfWeek: [0] },
		saturday: modifiers?.saturday ?? { dayOfWeek: [6] },
	};
	const mergedModifiersClassNames = {
		...modifiersClassNames,
		sunday: modifiersClassNames?.sunday ?? "text-red-600",
		saturday: modifiersClassNames?.saturday ?? "text-blue-600",
		today:
			modifiersClassNames?.today ??
			"bg-primary text-primary-foreground rounded-full",
	};

	return (
		<DayPicker
			locale={locale}
			showOutsideDays={showOutsideDays}
			className={cn("px-ui py-ui rounded-md", className)}
			classNames={{
				months: "px-ui py-ui rounded-md",
				month: "px-ui py-ui rounded-md relative w-full",
				month_caption:
					"px-ui py-ui rounded-md flex items-center justify-center h-12",
				caption_label: "px-ui py-ui rounded-md text-xl font-semibold",
				nav: "px-ui py-ui rounded-md flex items-center gap-ui",
				nav_button: "px-ui py-ui rounded-md",
				button_previous: "px-ui py-ui rounded-md absolute left-3 top-0 h-12",
				button_next: "px-ui py-ui rounded-md absolute right-3 top-0 h-12",
				table: "px-ui py-ui rounded-md",
				head_row: "px-ui py-ui rounded-md bg-muted/40",
				head_cell:
					"px-ui py-ui rounded-md text-muted-foreground first:text-red-600 last:text-blue-600",
				row: "px-ui py-ui rounded-md",
				cell: "px-ui py-ui rounded-md",
				day: "px-ui py-ui rounded-md",
				day_range_end: "px-ui py-ui rounded-md",
				day_selected: "px-ui py-ui rounded-md",
				day_today:
					"px-ui py-ui rounded-md bg-primary text-primary-foreground rounded-full",
				day_outside: "px-ui py-ui rounded-md",
				day_disabled: "px-ui py-ui rounded-md text-destructive",
				day_range_middle: "px-ui py-ui rounded-md",
				day_hidden: "invisible",
				...classNames,
			}}
			navLayout="around"
			modifiers={mergedModifiers}
			modifiersClassNames={mergedModifiersClassNames}
			components={{
				Chevron: ({ orientation, ...props }) => {
					const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
					return <Icon className="h-6 w-6" {...props} />;
				},
				MonthCaption: ({ calendarMonth, ...props }) => {
					// v9: calendarMonth.date is the date
					const displayMonth = calendarMonth.date;
					const { goToMonth } = useNavigation();

					if (!displayMonth || Number.isNaN(displayMonth.getTime())) {
						return <span {...props} />;
					}

					return (
						<MonthYearPicker
							date={displayMonth}
							onDateChange={(d) => goToMonth?.(d)}
						>
							<span className="text-sm font-medium cursor-pointer hover:bg-muted/50 rounded px-2 py-1 transition-colors flex items-center justify-center gap-1">
								{format(displayMonth, "LLLL yyyy", { locale })}
								<ChevronDown className="h-4 w-4 opacity-50" />
							</span>
						</MonthYearPicker>
					);
				},
			}}
			{...restProps}
		/>
	);
}
Calendar.displayName = "Calendar";

export { Calendar };
