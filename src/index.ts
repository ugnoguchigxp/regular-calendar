import "./index.css";

export * from "./components/EventModal";
export { EventForm } from "./components/EventModal/EventForm";
export * from "./components/EventModal/EventModal";
// Facility Schedule Manager
export * from "./components/FacilityScheduleManager/FacilityScheduleManager";
export * from "./components/FacilitySettings/FacilityStructureSettings";
export * from "./components/ScheduleManager";
export * from "./components/Settings/SettingsModal";
export * from "./components/Settings/settingsUtils";
export * from "./components/ThemeApplier";
// Theme
export * from "./components/ThemeProvider";
// UI Components
// UI Components
export { Button, buttonVariants } from "./components/ui/Button";
export { Checkbox } from "./components/ui/Checkbox";
export { DateDisplay } from "./components/ui/DateDisplay";
export * from "./components/ui/DatePicker";
export {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	useFormField,
} from "./components/ui/Form";
export { Icons } from "./components/ui/Icons";
export { Input } from "./components/ui/Input";
export { KeypadModal } from "./components/ui/KeypadModal";
export { ConfirmModal, Modal } from "./components/ui/Modal";
export {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./components/ui/Select";
export { Textarea } from "./components/ui/Textarea";
export { ViewSelector } from "./components/ui/ViewSelector";
// Context & Providers
export * from "./contexts/ScheduleContext";
export type {
	ConfigResponse,
	ContextResourceAvailability,
	EventData,
	ResourceAvailabilityParams,
	ResourceAvailabilityResponse,
	ScheduleApiClient,
	ScheduleContextType,
} from "./contexts/types";
export * from "./FacilitySchedule/FacilitySchedule";
export * from "./FacilitySchedule/FacilitySchedule.schema";
export * from "./FacilitySchedule/hooks/useAttendeeManagement";
export * from "./FacilitySchedule/hooks/useResourceAvailability";
export * from "./FacilitySchedule/hooks/useScheduleConflict";
export * from "./FacilitySchedule/hooks/useScheduleData";
export * from "./FacilitySchedule/hooks/useScheduleEventHandlers";
// Custom Hooks
export * from "./FacilitySchedule/hooks/useScheduleView";
export * from "./FacilitySchedule/utils/resourceAvailability";
export * from "./FacilitySchedule/utils/scheduleHelpers";
// schema exports handled by FacilitySchedule export
export * from "./PersonnelPanel";
// Utils
export {
	cleanEventId,
	formatEventTitleWithAttendees,
	mergeEvents,
	parseAttendeeNames,
	resolveEventOwnerId,
	transformBookingsToEvents,
} from "./utils/transformHelpers";
// presets removed

export * from "./RegularCalendar/RegularCalendar";
export * as RegularCalendarSchema from "./RegularCalendar/RegularCalendar.schema";
export * from "./types";
export * from "./utils/dateFormats";
export * from "./utils/dateNavigation";
// Utilities
export * from "./utils/StorageAdapter";
