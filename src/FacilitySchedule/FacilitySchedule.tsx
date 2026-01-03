/**
 * @feature Facility Schedule Management
 * @description A generic drag-and-drop schedule management component for facilities and resources.
 * Supports Day, Week, and Month views.
 */

import { useAppTranslation } from "@/utils/i18n";
import { DayView } from "./components/DayView/DayView";

import { EventModal } from "./components/EventModal/EventModal";
import { MonthView } from "./components/MonthView/MonthView";
import { ScheduleHeader } from "./components/ScheduleHeader";
import { WeekView } from "./components/WeekView/WeekView";
import type { FacilityScheduleProps } from "./FacilitySchedule.schema";
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

	return (
		<div className={`flex flex-col h-full bg-background ${className}`}>
			<ScheduleHeader
				currentDate={currentDate}
				viewMode={viewMode}
				groups={groups}
				selectedGroupId={selectedGroupId}
				isLoading={isLoading}
				hideGroupSelector={hideGroupSelector}
				headerLeft={headerLeft}
				headerRight={headerRight}
				onNavigate={navigate}
				onToday={goToToday}
				onViewChange={setViewMode}
				onGroupChange={setSelectedGroupId}
			/>

			{/* Content */}
			<div className="flex-1 overflow-hidden relative">
				{isLoading && (
					<div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center">
						{t("loading")}...
					</div>
				)}

				{viewMode === "day" && (
					<DayView
						currentDate={currentDate}
						resources={filteredResources}
						events={filteredEvents}
						settings={settings}
						onEventClick={handleEventClick}
						onEmptySlotClick={handleEmptySlotClick}
					/>
				)}

				{viewMode === "week" && (
					<WeekView
						weekStart={currentDate}
						resources={filteredResources}
						events={filteredEvents}
						settings={settings}
						groups={groups}
						onEventClick={handleEventClick}
						onEmptySlotClick={handleEmptySlotClick}
					/>
				)}

				{viewMode === "month" && (
					<MonthView
						month={currentDate}
						events={events}
						resources={resources}
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
