import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { DateDisplay as DateFormat } from "@/components/ui/DateDisplay";
import { Icons } from "@/components/ui/Icons";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/Select";
import { ViewSelector } from "@/components/ui/ViewSelector";
import type { ResourceGroup, ViewMode } from "../FacilitySchedule.schema";

interface ScheduleHeaderProps {
	currentDate: Date;
	viewMode: ViewMode;
	groups: ResourceGroup[];
	selectedGroupId: string | null;
	isLoading?: boolean;
	hideGroupSelector?: boolean;
	headerLeft?: React.ReactNode;
	headerRight?: React.ReactNode;
	onNavigate: (direction: "prev" | "next") => void;
	onToday: () => void;
	onViewChange: (view: ViewMode) => void;
	onGroupChange: (groupId: string | null) => void;
}

export function ScheduleHeader({
	currentDate,
	viewMode,
	groups,
	selectedGroupId,
	isLoading,
	hideGroupSelector,
	headerLeft,
	headerRight,
	onNavigate,
	onToday,
	onViewChange,
	onGroupChange,
}: ScheduleHeaderProps) {
	const { t } = useTranslation();

	return (
		<header className="border-b border-border px-4 py-3 flex items-center justify-between gap-4">
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="icon"
					onClick={() => onNavigate("prev")}
				>
					<Icons.ChevronLeft className="h-4 w-4" />
				</Button>
				<Button variant="outline" onClick={onToday}>
					{t("today_button")}
				</Button>
				<Button
					variant="outline"
					size="icon"
					onClick={() => onNavigate("next")}
				>
					<Icons.ChevronRight className="h-4 w-4" />
				</Button>

				<span className="text-lg font-bold ml-2">
					<DateFormat date={currentDate} showSecondary showDayOfWeek />
				</span>
				{headerLeft}
			</div>

			<div className="flex items-center gap-4">
				{!hideGroupSelector && (
					<Select
						value={selectedGroupId ?? undefined}
						onValueChange={onGroupChange}
						disabled={isLoading || groups.length === 0}
					>
						<SelectTrigger className="w-[200px]">
							<SelectValue placeholder="Select Group">
								{groups.find((g) => g.id === selectedGroupId)?.name || ""}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							{groups.map((g) => (
								<SelectItem key={g.id} value={g.id}>
									{g.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}
				<ViewSelector
					currentView={viewMode}
					onViewChange={onViewChange}
					options={[
						{ value: "day", label: t("view_day") },
						{ value: "week", label: t("view_week") },
						{ value: "month", label: t("view_month") },
					]}
				/>
				{headerRight}
			</div>
		</header>
	);
}
