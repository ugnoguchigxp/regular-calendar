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
import { useAppTranslation } from "@/utils/i18n";
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

	// Pagination
	isPaginated?: boolean;
	currentPage?: number;
	totalPages?: number;
	onPageChange?: (page: number) => void;
	pageInfo?: { page: number; startResource: string; endResource: string }[];
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
	isPaginated,
	currentPage,
	totalPages,
	onPageChange,
	pageInfo,
}: ScheduleHeaderProps) {
	const { t } = useAppTranslation();

	return (
		<header className="border-b border-border px-[var(--ui-space-4)] py-[var(--ui-space-3)] flex items-center justify-between gap-[var(--ui-space-4)]">
			<div className="flex items-center gap-[var(--ui-space-2)]">
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
					<DateFormat date={currentDate} showSecondary showDayOfWeek />
				</span>
				{headerLeft}
			</div>

			<div className="flex items-center gap-[var(--ui-space-4)]">
				{!hideGroupSelector && (
					<Select
						value={selectedGroupId ?? undefined}
						onValueChange={onGroupChange}
						disabled={isLoading || groups.length === 0}
					>
						<SelectTrigger className="w-[var(--ui-space-50)]">
							<SelectValue placeholder="Select Group">
								{selectedGroupId === "ALL"
									? "All Facilities"
									: groups.find((g) => g.id === selectedGroupId)?.name || ""}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">All Facilities</SelectItem>
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

				{isPaginated && totalPages && totalPages > 1 && onPageChange && (
					<div className="flex bg-muted p-[calc(var(--ui-gap-base)/2)] rounded-md gap-[calc(var(--ui-gap-base)/2)]">
						{Array.from({ length: totalPages }).map((_, i) => {
							const info = pageInfo?.find((p) => p.page === i);
							const title = info
								? `${t("page")} ${i + 1}: ${info.startResource} - ${info.endResource}`
								: `${t("page")} ${i + 1}`;
							return (
								<Button
									key={i}
									variant={(currentPage ?? 0) === i ? "default" : "ghost"}
									onClick={() => onPageChange(i)}
									className="h-[var(--ui-component-height)] w-[var(--ui-component-height)] p-0"
									title={title}
								>
									{i + 1}
								</Button>
							);
						})}
					</div>
				)}

				{headerRight}
			</div>
		</header>
	);
}
