/**
 * EventModal - Modal for creating/editing events
 */

import { ConfirmModal, Modal } from '@/components/ui/Modal';
import { format } from 'date-fns';

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Resource, ResourceGroup, ScheduleEvent } from '../../FacilitySchedule.schema';
import type { Personnel } from '../../../PersonnelPanel/PersonnelPanel.schema';

import { EventForm, type EventFormData } from './EventForm';

interface EventModalProps {
  isOpen: boolean;
  event?: ScheduleEvent;
  resources: Resource[];
  groups: ResourceGroup[];
  events: ScheduleEvent[];
  personnel?: Personnel[];

  defaultResourceId?: string;
  defaultStartTime?: Date;
  readOnlyResource?: boolean;

  onClose: () => void;
  onSave: (data: EventFormData) => void;
  onDelete?: (eventId: string) => void;
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
    title: '',
    onConfirm: () => { },
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
      title: t('confirm_delete_title'),
      description: t('confirm_delete_message'),
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
      title={isEditMode ? t('event_edit_title') : t('event_create_title')}
    >
      <div style={{ pointerEvents: isModalReady ? 'auto' : 'none' }}>
        {isEditMode && event && (
          <div className="p-4 bg-card border border-border rounded-lg mb-4 text-sm grid grid-cols-2 gap-2">
            <div>
              <span className="text-muted-foreground">Title:</span>
              <span className="ml-2 font-semibold">{event.title}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Resource:</span>
              <span className="ml-2 font-semibold">
                {resources.find(r => r.id === event.resourceId)?.name || event.resourceId}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Time:</span>
              <span className="ml-2 font-semibold">{format(event.startDate, 'MM/dd HH:mm')}</span>
            </div>
          </div>
        )}

        <EventForm
          event={event}
          resources={resources}
          groups={groups}
          events={events}
          personnel={personnel}
          defaultResourceId={defaultResourceId}
          defaultStartTime={defaultStartTime}
          onSubmit={onSave}
          onCancel={onClose}
          onDelete={isEditMode && onDelete ? handleDelete : undefined}
          readOnlyResource={readOnlyResource}
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
