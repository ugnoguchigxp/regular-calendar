/**
 * MonthView - Month View Component
 * Heatmap based on booking density
 */

import { addDays } from "@/utils/dateUtils";
import { useMemo } from "react";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { PercentFormat } from "@/components/ui/PercentFormat";
import { useAppTranslation } from "@/utils/i18n";
import type {
	FacilityScheduleSettings,
	Resource,
	ScheduleEvent,
} from "../../FacilitySchedule.schema";
import {
	generateDateRange,
	getMonthStart,
	getWeekStart,
} from "../../utils/scheduleHelpers";
import {
	createEventIndexes,
	getDayKey,
	getEventsByDay,
} from "../../utils/scheduleIndexHelpers";
import { DayCell } from "./DayCell";
import { LegendBar } from "./LegendBar";

interface MonthViewProps {
	month: Date;
	resources: Resource[];
	events: ScheduleEvent[];
	settings: FacilityScheduleSettings;
	selectedGroupId: string | null;
	onDayClick?: (date: Date) => void;
}

export function MonthView({
	month,
	resources,
	events,
	settings,
	selectedGroupId,
	onDayClick,
}: MonthViewProps) {
	const { t } = useAppTranslation();

	const { filteredResources, filteredEvents } = useMemo(() => {
		if (!selectedGroupId) {
			return { filteredResources: resources, filteredEvents: events };
		}
		return {
			filteredResources: resources.filter(
				(pos) => pos.groupId === selectedGroupId,
			),
			filteredEvents: events.filter((sch) => sch.groupId === selectedGroupId),
		};
	}, [selectedGroupId, resources, events]);

	const calendarDays = useMemo(() => {
		const start = getMonthStart(month);

		const weekStart = getWeekStart(start, settings.weekStartsOn ?? 1);

		// If we need exactly 6 weeks (42 days) to avoid jumpy UI, or just fit the month.
		// The previous implementation used 42. I'll stick to 42 for stability.
		const days = generateDateRange(weekStart, addDays(weekStart, 41));
		return days;
	}, [month, settings.weekStartsOn]);

	const eventIndexes = useMemo(() => {
		return createEventIndexes(filteredEvents);
	}, [filteredEvents]);

	// Determine Daily Capacity
	const slotsPerResource = settings.timeSlots ? settings.timeSlots.length : 3;
	// TODO: Fix fallback logic or make it configurable on Resource or Settings

	const densityMap = useMemo(() => {
		const map = new Map<string, number>();
		const maxSlotsPerDay = filteredResources.length * slotsPerResource;

		for (const day of calendarDays) {
			const dayKey = getDayKey(day);
			const dayEvents = getEventsByDay(day, eventIndexes);

			const density =
				maxSlotsPerDay > 0 ? (dayEvents.length / maxSlotsPerDay) * 100 : 0;
			map.set(dayKey, density);
		}
		return map;
	}, [calendarDays, eventIndexes, filteredResources.length, slotsPerResource]);

	const monthlyUtilization = useMemo(() => {
		const monthDays = calendarDays.filter(
			(day) => day.getMonth() === month.getMonth(),
		);
		const totalDensity = monthDays.reduce((sum, day) => {
			const dayKey = getDayKey(day);
			return sum + (densityMap.get(dayKey) || 0);
		}, 0);

		return monthDays.length > 0
			? Math.round(totalDensity / monthDays.length)
			: 0;
	}, [calendarDays, month, densityMap]);

	const weeks = useMemo(() => {
		const result: Date[][] = [];
		for (let i = 0; i < calendarDays.length; i += 7) {
			result.push(calendarDays.slice(i, i + 7));
		}
		return result;
	}, [calendarDays]);

	const weekdayHeaders = useMemo(() => {
		const headers: string[] = [];
		const startDay = settings.weekStartsOn === 0 ? 0 : 1;
		const weekdays = [
			t("days_short_sun"),
			t("days_short_mon"),
			t("days_short_tue"),
			t("days_short_wed"),
			t("days_short_thu"),
			t("days_short_fri"),
			t("days_short_sat"),
		];

		for (let i = 0; i < 7; i++) {
			const index = (startDay + i) % 7;
			headers.push(weekdays[index] || "");
		}

		return headers;
	}, [settings.weekStartsOn, t]);

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="border-b border-border bg-background px-ui py-ui">
				<div className="flex items-center justify-between">
					<div className="flex-1">
						<h2 className="text-lg font-semibold">
							<DateDisplay date={month} format="yearMonth" />
						</h2>
						<div className="flex items-center gap-4 mt-2">
							<div className="text-sm text-muted-foreground">
								Resources: {filteredResources.length} / Utilization:{" "}
								<PercentFormat
									value={monthlyUtilization}
									valueScale="percent"
									options={{ maximumFractionDigits: 0 }}
									className="font-medium text-foreground"
								/>
							</div>
						</div>
					</div>
					<LegendBar />
				</div>
			</div>

			{/* Grid */}
			<div className="w-full p-4 overflow-y-auto">
				<div className="w-full">
					{/* Headers */}
					<div className="grid grid-cols-7 gap-1 mb-1">
						{weekdayHeaders.map((day) => (
							<div
								key={day}
								className="text-center font-semibold text-sm text-foreground py-2"
							>
								{day}
							</div>
						))}
					</div>

					{/* Days */}
					<div
						className="grid gap-1"
						style={{ gridTemplateRows: `repeat(${weeks.length}, 1fr)` }}
					>
						{weeks.map((week) => (
							<div
								key={week[0]?.toISOString() ?? "empty-week"}
								className="grid grid-cols-7 gap-1"
							>
								{week.map((day) => {
									const dayKey = day.toISOString().split("T")[0] || "";
									const density = densityMap.get(dayKey) || 0;
									const isCurrentMonth = day.getMonth() === month.getMonth();
									const isClosedDay = settings.closedDays.includes(
										day.getDay(),
									);

									return (
										<DayCell
											key={dayKey}
											date={day}
											density={density}
											isCurrentMonth={isCurrentMonth}
											isClosedDay={isClosedDay}
											maxSlots={filteredResources.length * slotsPerResource}
											onClick={() => onDayClick?.(day)}
										/>
									);
								})}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
