/**
 * EventModal - Modal for creating/editing events
 */

import React from "react";
import { ConfirmModal, Modal } from "@/components/ui/Modal";
import { useAppTranslation } from "@/utils/i18n";
import type {
	CustomField,
	EventFormData,
	Resource,
	ResourceGroup,
	ScheduleEvent,
} from "../../FacilitySchedule/FacilitySchedule.schema";
import type { Personnel } from "../../PersonnelPanel/PersonnelPanel.schema";

import { EventForm } from "./EventForm";

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
	onAvailabilityRequest?: (criteria: {
		startDate: Date;
		endDate: Date;
	}) => void;
	customFields?: CustomField[];
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
	onAvailabilityRequest,
	customFields,
}: EventModalProps) {
	const { t } = useAppTranslation();
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

	return (
		<Modal
			open={isOpen}
			onOpenChange={(open) => !open && onClose()}
			title={isEditMode ? t("event_edit_title") : t("event_create_title")}
			className="sm:max-w-3xl"
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
					onAvailabilityRequest={onAvailabilityRequest}
					customFields={customFields}
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
