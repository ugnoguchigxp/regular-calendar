import { useAppTranslation } from "@/utils/i18n";
import { Button } from "./Button";
import { DateDisplay as DateFormat } from "./DateDisplay";
import { Icons } from "./Icons";

interface CalendarDateNavigatorProps {
	currentDate: Date;
	onNavigate: (direction: "prev" | "next") => void;
	onToday: () => void;
	dateFormat?:
		| "full"
		| "date"
		| "weekday"
		| "weekdayShort"
		| "yearMonth"
		| "monthDay"
		| "monthDayShort"
		| "compact";
	className?: string;
}

export function CalendarDateNavigator({
	currentDate,
	onNavigate,
	onToday,
	dateFormat = "full",
	className = "",
}: CalendarDateNavigatorProps) {
	const { t } = useAppTranslation();

	return (
		<div className={`flex items-center gap-[var(--ui-space-2)] ${className}`}>
			<Button
				variant="outline"
				size="icon"
				onClick={() => onNavigate("prev")}
				aria-label={t("previous")}
			>
				<Icons.ChevronLeft className="h-[var(--ui-space-4)] w-[var(--ui-space-4)]" />
			</Button>
			<Button variant="outline" onClick={onToday}>
				{t("today_button")}
			</Button>
			<Button
				variant="outline"
				size="icon"
				onClick={() => onNavigate("next")}
				aria-label={t("next")}
			>
				<Icons.ChevronRight className="h-[var(--ui-space-4)] w-[var(--ui-space-4)]" />
			</Button>

			<span className="text-lg font-bold ml-[var(--ui-space-2)]">
				<DateFormat
					date={currentDate}
					format={dateFormat}
					showSecondary
					showDayOfWeek={dateFormat === "full"}
				/>
			</span>
		</div>
	);
}
