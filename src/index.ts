import "./index.css";

export * from "./components/FacilitySettings/FacilityStructureSettings";
export * from "./components/Settings/SettingsModal";
export * from "./components/Settings/settingsUtils";
export * from "./components/ThemeApplier";
// Theme
export * from "./components/ThemeProvider";
// UI Components
// UI Components
export { Button, buttonVariants } from "./components/ui/Button";
export { Checkbox } from "./components/ui/Checkbox";
export * from "./components/ui/DatePicker";
export { EditableSelect } from "./components/ui/EditableSelect";
export * from "./components/ScheduleManager";

// Facility Schedule Manager
export * from "./components/FacilityScheduleManager/FacilityScheduleManager";

// Context & Providers
export * from "./contexts/ScheduleContext";
export type {
    EventData,
    ContextResourceAvailability,
    ScheduleApiClient,
    ScheduleContextType,
} from "./contexts/types";


// Utils
export {
    transformBookingsToEvents,
    formatEventTitleWithAttendees,
    resolveEventOwnerId,
    cleanEventId,
    parseAttendeeNames,
    mergeEvents,
} from "./utils/transformHelpers";
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
export { Modal, ConfirmModal } from "./components/ui/Modal";
export {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./components/ui/Select";
export { Textarea } from "./components/ui/Textarea";
export { ViewSelector } from "./components/ui/ViewSelector";
export { DateDisplay } from "./components/ui/DateDisplay";
export * from "./FacilitySchedule/components/EventModal";
export { EventForm } from "./FacilitySchedule/components/EventModal/EventForm";
export * from "./FacilitySchedule/components/EventModal/EventModal";
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
// presets removed

export * from "./RegularCalendar/RegularCalendar";
export * as RegularCalendarSchema from "./RegularCalendar/RegularCalendar.schema";
export * from "./types";
export * from "./utils/dateNavigation";
export * from "./utils/dateFormats";
// Utilities
export * from "./utils/StorageAdapter";
