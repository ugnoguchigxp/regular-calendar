/**
 * EventModal - Modal for creating/editing events
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { ConfirmModal, Modal } from "@/components/ui/Modal";
import type { Personnel } from "../../../PersonnelPanel/PersonnelPanel.schema";
import type {
	Resource,
	ResourceGroup,
	ScheduleEvent,
} from "../../FacilitySchedule.schema";

import { EventForm, type EventFormData } from "./EventForm";

interface EventModalProps {
	isOpen: boolean;
	event?: ScheduleEvent;
	resources: Resource[];
	groups: ResourceGroup[];
	events: ScheduleEvent[];
	personnel?: Personnel[];
	resourceAvailability?: { resourceId: string; isAvailable: boolean }[];

	defaultResourceId?: string;
	defaultStartTime?: Date;
	readOnlyResource?: boolean;

	onClose: () => void;
	onSave: (data: EventFormData) => void;
	onDelete?: (eventId: string) => void;
	currentUserId?: string;
}

export function EventModal({
	isOpen,
	event,
	resources,
	groups,
	events,
	defaultResourceId,
	defaultStartTime,
	onClose,
	onSave,
	onDelete,
	readOnlyResource,
	personnel = [],
	currentUserId,
	resourceAvailability,
}: EventModalProps) {
	const { t } = useTranslation();
	const isEditMode = !!event;

	const [isModalReady, setIsModalReady] = React.useState(false);
	const [confirmModal, setConfirmModal] = React.useState<{
		open: boolean;
		title: string;
		description?: string;
		onConfirm: () => void;
	}>({
		open: false,
		title: "",
		onConfirm: () => {},
	});

	React.useEffect(() => {
		if (isOpen) {
			setIsModalReady(false);
			const timer = setTimeout(() => {
				setIsModalReady(true);
			}, 500); // reduced delay
			return () => clearTimeout(timer);
		}
		setIsModalReady(false);
		return undefined;
	}, [isOpen]);

	const handleDelete = () => {
		if (!event || !onDelete) return;

		setConfirmModal({
			open: true,
			title: t("confirm_delete_title"),
			description: t("confirm_delete_message"),
			onConfirm: () => {
				onDelete(event.id);
				setConfirmModal((prev) => ({ ...prev, open: false }));
				onClose();
			},
		});
	};

	// const selectedAttendee = event ? attendees.find(a => a.label === event.title) : undefined;
	// Fallback matching by title if no ID link.

	return (
		<Modal
			open={isOpen}
			onOpenChange={(open) => !open && onClose()}
			title={isEditMode ? t("event_edit_title") : t("event_create_title")}
		>
			<div style={{ pointerEvents: isModalReady ? "auto" : "none" }}>
				<EventForm
					event={event}
					resources={resources}
					groups={groups}
					events={events}
					personnel={personnel}
					resourceAvailability={resourceAvailability}
					defaultResourceId={defaultResourceId}
					defaultStartTime={defaultStartTime}
					onSubmit={onSave}
					onCancel={onClose}
					onDelete={isEditMode && onDelete ? handleDelete : undefined}
					readOnlyResource={readOnlyResource}
					currentUserId={currentUserId}
				/>
			</div>

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
