/**
 * @feature Facility Schedule Management
 * @description A generic drag-and-drop schedule management component for facilities and resources.
 * Supports Day, Week, and Month views.
 */

import { useAppTranslation } from "@/utils/i18n";
import { EventModal } from "../components/EventModal/EventModal";
import { DayView } from "./components/DayView/DayView";
import { MonthView } from "./components/MonthView/MonthView";
import { ScheduleHeader } from "./components/ScheduleHeader";
import { WeekView } from "./components/WeekView/WeekView";
import type { FacilityScheduleProps } from "./FacilitySchedule.schema";
import { useResourcePagination } from "./hooks/useResourcePagination";
import { useScheduleData } from "./hooks/useScheduleData";
import { useScheduleEventHandlers } from "./hooks/useScheduleEventHandlers";
import { useScheduleView } from "./hooks/useScheduleView";

export function FacilitySchedule({
	events,
	resources,
	groups,
	settings,
	currentDate: propCurrentDate,
	viewMode: propViewMode,
	selectedGroupId: propSelectedGroupId,
	onDateChange,
	onViewChange,
	onGroupChange,
	onEventCreate,
	onEventUpdate,
	onEventDelete,
	isLoading = false,
	className,
	hideGroupSelector = false,
	components,
	headerLeft,
	headerRight,
	defaultView = "day",
	enablePersistence = false,
	storageKey = "facility-schedule-view",
	customFields,
	pagination,
}: FacilityScheduleProps) {
	const { t } = useAppTranslation();

	const {
		currentDate,
		viewMode,
		selectedGroupId,
		setViewMode,
		setSelectedGroupId,
		navigate,
		goToToday,
		setDate,
	} = useScheduleView({
		defaultView: propViewMode || defaultView,
		defaultDate: propCurrentDate,
		defaultGroupId: propSelectedGroupId as string | null,
		enablePersistence,
		storageKey,
		onDateChange,
		onViewChange,
		onGroupChange,
	});

	const { effectiveGroupId, filteredResources, filteredEvents } =
		useScheduleData({
			events,
			resources,
			groups,
			selectedGroupId,
		});

	const {
		isModalOpen,
		selectedEvent,
		newInfo,
		handleEventClick,
		handleEmptySlotClick,
		handleDayClick,
		handleModalSave,
		handleModalDelete,
		handleModalClose,
	} = useScheduleEventHandlers({
		onEventCreate,
		onEventUpdate,
		onEventDelete,
		onDateChange: setDate,
		onViewChange: setViewMode,
	});

	const {
		paginatedResources,
		currentPage,
		totalPages,
		goToPage,
		isPaginated,
		pageInfo,
	} = useResourcePagination({
		allResources: filteredResources,
		paginationOptions: pagination,
	});

	return (
		<div className={`flex flex-col h-full bg-background ${className}`}>
			<ScheduleHeader
				currentDate={currentDate}
				viewMode={viewMode}
				groups={groups}
				selectedGroupId={effectiveGroupId}
				isLoading={isLoading}
				hideGroupSelector={hideGroupSelector}
				headerLeft={headerLeft}
				headerRight={headerRight}
				onNavigate={navigate}
				onToday={goToToday}
				onViewChange={setViewMode}
				onGroupChange={setSelectedGroupId}
				isPaginated={isPaginated}
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={goToPage}
				pageInfo={pageInfo}
			/>

			{/* Content */}
			<div className="flex-1 overflow-hidden relative">
				{isLoading && (
					<div className="absolute inset-[var(--ui-space-0)] bg-background/50 z-10 flex items-center justify-center">
						{t("loading")}...
					</div>
				)}

				{viewMode === "day" && (
					<DayView
						currentDate={currentDate}
						resources={paginatedResources}
						events={filteredEvents}
						settings={settings}
						onEventClick={handleEventClick}
						onEmptySlotClick={handleEmptySlotClick}
						components={components}
					/>
				)}

				{viewMode === "week" && (
					<WeekView
						weekStart={currentDate}
						resources={paginatedResources}
						events={filteredEvents}
						settings={settings}
						groups={groups}
						onEventClick={handleEventClick}
						onEmptySlotClick={handleEmptySlotClick}
						components={components}
					/>
				)}

				{viewMode === "month" && (
					<MonthView
						month={currentDate}
						events={events} // Month view usually shows all resources or aggregates?
						// Month view interface: resources: Resource[]
						// If we paginate month view, we pass paginated resources.
						resources={paginatedResources}
						settings={settings}
						selectedGroupId={effectiveGroupId}
						onDayClick={handleDayClick}
					/>
				)}
			</div>

			{/* Modal - Use injected component or default */}
			{components?.EventModal ? (
				<components.EventModal
					isOpen={isModalOpen}
					onClose={handleModalClose}
					event={selectedEvent}
					resources={resources}
					groups={groups}
					events={events}
					defaultResourceId={newInfo.resourceId}
					onSave={handleModalSave}
					onDelete={onEventDelete ? handleModalDelete : undefined}
					readOnlyResource={true}
					customFields={customFields}
				/>
			) : (
				<EventModal
					isOpen={isModalOpen}
					onClose={handleModalClose}
					event={selectedEvent}
					resources={resources}
					groups={groups}
					events={events}
					defaultResourceId={newInfo.resourceId}
					defaultStartTime={newInfo.startTime}
					onSave={handleModalSave}
					onDelete={onEventDelete ? handleModalDelete : undefined}
					readOnlyResource={true}
					customFields={customFields}
				/>
			)}
		</div>
	);
}
