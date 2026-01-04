import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type {
	Personnel,
	Resource,
	ResourceGroup,
	ScheduleEvent,
} from "../../../FacilitySchedule/FacilitySchedule.schema";
import { formatCalendarDate } from "../../../utils/dateFormats";
import { formatIsoDateTime } from "../../../utils/dateUtils";
import { KeypadModal } from "../../ui/KeypadModal";
import { ConfirmModal, Modal } from "../../ui/Modal";
import type { CustomField } from "../types";
import { EventForm } from "./EventForm";
import {
	type EventFormValues,
	prepareEventFormData,
	type SMEventFormData,
	useAvailableResources,
	useConflictCheck,
	useEventForm,
	useResourceDisplayNames,
} from "./useEventForm";

interface DefaultEventModalProps {
	isOpen: boolean;
	event?: ScheduleEvent;
	resources: Resource[];
	events: ScheduleEvent[];
	groups: ResourceGroup[];
	defaultResourceId?: string;
	defaultStartTime?: Date;
	readOnlyResource?: boolean;
	onClose: () => void;
	onSave: (data: SMEventFormData) => void;
	onDelete?: (eventId: string) => void;
	currentUserId?: string;
	personnel?: Personnel[];
	customFields?: CustomField[];
}

export function DefaultEventModal({
	isOpen,
	event,
	resources,
	events,
	groups,
	defaultResourceId,
	defaultStartTime,
	onClose,
	onSave,
	onDelete,
	readOnlyResource = false,
	currentUserId,
	personnel,
	customFields = [],
}: DefaultEventModalProps) {
	const { t, i18n } = useTranslation();

	// Use extracted form hook
	const {
		form,
		isEditMode,
		startDateVal,
		durationVal,
		resourceIdVal,
		isAllDay,
		endDateDisplay,
		personnel: formPersonnel,
	} = useEventForm({
		event,
		defaultResourceId,
		defaultStartTime,
		resources,
		personnel,
		customFields,
		currentUserId,
	});

	// Check ownership
	const ownerId =
		typeof event?.extendedProps?.ownerId === "string"
			? event.extendedProps.ownerId
			: undefined;
	// If currentUserId is not provided, we assume everyone can edit (or handled by parent)
	// If provided, check match.
	const isOwner =
		!currentUserId || !isEditMode || !ownerId || ownerId === currentUserId;
	const canEdit = isOwner;

	// Modal state
	const [isModalReady, setIsModalReady] = useState(false);
	const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);

	const [confirmModal, setConfirmModal] = useState<{
		open: boolean;
		title: string;
		description?: string;
		onConfirm: () => void;
	}>({
		open: false,
		title: "",
		onConfirm: () => {},
	});

	// Animation/Ready delay
	useEffect(() => {
		if (isOpen) {
			setIsModalReady(false);
			const timer = setTimeout(() => setIsModalReady(true), 100);
			return () => clearTimeout(timer);
		}
		setIsModalReady(false);
	}, [isOpen]);

	// Use extracted hooks for derived data (at top level, not in render)
	const conflict = useConflictCheck(
		startDateVal,
		durationVal,
		resourceIdVal || "",
		events,
		event?.id,
	);

	// Compute available resources
	const availableResources = useAvailableResources(
		resources,
		events,
		new Date(startDateVal),
		endDateDisplay,
		event?.id,
	);

	const resourceDisplayNames = useResourceDisplayNames(
		availableResources,
		groups,
	);

	// Display value for selected resource
	const displayValue = useMemo(() => {
		const res = resources.find((r) => r.id === resourceIdVal);
		if (!res) return resourceIdVal || "";
		const group = groups.find((g) => g.id === res.groupId);
		return group ? `${res.name} (${group.name})` : res.name;
	}, [resourceIdVal, resources, groups]);

	const handleSubmit = (data: EventFormValues) => {
		const formData = prepareEventFormData(
			data,
			event,
			currentUserId,
			customFields,
		);
		onSave(formData);
	};

	const handleDelete = () => {
		if (!event || !onDelete) return;
		setConfirmModal({
			open: true,
			title: t("confirm_delete_title", "Are you sure?"),
			description: t("confirm_delete_message", "This action cannot be undone."),
			onConfirm: () => {
				onDelete(event.id);
				setConfirmModal((prev) => ({ ...prev, open: false }));
				onClose();
			},
		});
	};

	return (
		<Modal
			open={isOpen}
			onOpenChange={(open) => !open && onClose()}
			title={
				isEditMode
					? canEdit
						? t("event_custom_edit_title", "Edit Event")
						: "View Event (Read Only)"
					: t("event_custom_create_title", "Create Event")
			}
		>
			<div style={{ pointerEvents: isModalReady ? "auto" : "none" }}>
				{!canEdit && isEditMode && (
					<div className="mb-[var(--ui-space-4)] p-[var(--ui-space-2)] bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-200">
						You cannot edit this event because you are not the owner.
					</div>
				)}

				<EventForm
					form={form}
					onSubmit={handleSubmit}
					onCancel={onClose}
					onDelete={onDelete ? handleDelete : undefined}
					isEditMode={isEditMode}
					canEdit={canEdit}
					isAllDay={isAllDay}
					startDateVal={startDateVal}
					displayValue={displayValue}
					availableResources={availableResources}
					resourceDisplayNames={resourceDisplayNames}
					conflict={conflict}
					setIsTimeModalOpen={setIsTimeModalOpen}
					customFields={customFields}
					readOnlyResource={readOnlyResource}
					personnel={formPersonnel}
					currentUserId={currentUserId}
				/>
			</div>

			<KeypadModal
				open={isTimeModalOpen}
				onClose={() => setIsTimeModalOpen(false)}
				onSubmit={(time) => {
					const cur = new Date(form.getValues("startDate"));
					const [h, m] = time.split(":").map(Number);
					cur.setHours(h || 0, m || 0);
					form.setValue("startDate", formatIsoDateTime(cur));
					setIsTimeModalOpen(false);
				}}
				initialValue={formatCalendarDate(
					new Date(startDateVal),
					i18n.language,
					"time24",
				)}
				variant="time"
			/>

			<ConfirmModal
				open={confirmModal.open}
				onOpenChange={(open) => setConfirmModal((prev) => ({ ...prev, open }))}
				title={confirmModal.title}
				description={confirmModal.description}
				onConfirm={confirmModal.onConfirm}
				variant="destructive"
			/>
		</Modal>
	);
}
