/**
 * EventForm - Form for creating/editing schedule events
 */

import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { KeypadModal } from '@/components/ui/KeypadModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/Select';
import { EditableSelect } from '@/components/ui/EditableSelect';
import { Textarea } from '@/components/ui/Textarea';
import { Icons } from '@/components/ui/Icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ControllerProps, FieldPath } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Resource, ResourceGroup, ScheduleEvent } from '../../FacilitySchedule.schema';
import { checkScheduleConflict } from '../../utils/scheduleHelpers';


// App specific sanitization removed, relying on basic React/Zod protection
// or assuming input is safe or sanitized on server.

const eventSchema = z.object({
  title: z.string().min(1, 'required'), // Was patientId -> mapped to title
  resourceId: z.string().min(1, 'required'),
  startDate: z.string().min(1, 'required'),
  durationHours: z.number().min(0.5).max(24),
  status: z.string().optional(),
  note: z.string().optional(),

  // Extended Logic
  isRecurring: z.boolean().optional(),
  scheduleType: z.string().optional(),
  endDate: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

export interface EventFormData extends Omit<EventFormValues, 'startDate' | 'endDate'> {
  startDate: Date;
  endDate: Date;
  description?: string;
  // mapped fields
}

interface EventFormProps {
  event?: ScheduleEvent;
  resources: Resource[];
  groups: ResourceGroup[];
  events: ScheduleEvent[];

  defaultResourceId?: string;
  defaultStartTime?: Date;

  onSubmit: (data: EventFormData) => void;
  onCancel: () => void;
  onDelete?: () => void;
  readOnlyResource?: boolean;
}

export function EventForm({
  event,
  resources,
  groups,
  events,
  defaultResourceId,
  defaultStartTime,
  onSubmit,
  onCancel,
  onDelete,
  readOnlyResource = false,
}: EventFormProps) {
  const { t } = useTranslation();
  const isEditMode = !!event;
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || '',
      resourceId: event?.resourceId || defaultResourceId || '',
      startDate: format(
        event?.startDate || defaultStartTime || new Date(),
        "yyyy-MM-dd'T'HH:mm"
      ),
      durationHours: event
        ? Math.round((event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60 * 60) * 10) / 10
        : 1,
      status: event?.status || 'booked',
      note: event?.note || '',
      isRecurring: false,
    },
  });

  const TypedFormField = <TName extends FieldPath<EventFormValues>>(
    props: ControllerProps<EventFormValues, TName>
  ) => <FormField {...props} />;

  const startDateVal = form.watch('startDate');
  const durationVal = form.watch('durationHours');
  const resourceIdVal = form.watch('resourceId');

  const endDateDisplay = new Date(startDateVal);
  if (!Number.isNaN(endDateDisplay.getTime())) {
    endDateDisplay.setHours(endDateDisplay.getHours() + (Number(durationVal) || 0));
    // Note: durationVal might be decimal
    const minutes = (Number(durationVal) || 0) * 60;
    endDateDisplay.setHours(new Date(startDateVal).getHours());
    endDateDisplay.setMinutes(new Date(startDateVal).getMinutes() + minutes);
  }

  const conflict = useMemo(() => {
    const start = new Date(startDateVal);
    const end = new Date(start);
    const minutes = (Number(durationVal) || 0) * 60;
    end.setMinutes(end.getMinutes() + minutes);

    if (!resourceIdVal || Number.isNaN(start.getTime())) return null;

    const otherEvents = events.filter((e) => e.id !== event?.id);

    return checkScheduleConflict(
      { startDate: start, endDate: end, resourceId: resourceIdVal },
      otherEvents
    );
  }, [startDateVal, durationVal, resourceIdVal, events, event?.id]);

  const handleSubmit = (data: EventFormValues) => {
    const start = new Date(data.startDate);
    const end = new Date(start);
    const minutes = (Number(data.durationHours) || 0) * 60;
    end.setMinutes(end.getMinutes() + minutes);

    onSubmit({
      ...data,
      startDate: start,
      endDate: end,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 text-foreground">

        {/* Title (Patient/User Name) */}
        <TypedFormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('eventModal.labels.userName')} <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('eventModal.placeholders.enterName')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Resource Selection */}
        <TypedFormField
          control={form.control}
          name="resourceId"
          render={({ field }) => {
            const resourceNames = useMemo(() => {
              return resources.map(r => {
                const group = groups.find(g => g.id === r.groupId);
                return group ? `${r.name} (${group.name})` : r.name;
              });
            }, [resources, groups]);

            const displayValue = useMemo(() => {
              // field.value is ID, convert to display name
              const res = resources.find(r => r.id === field.value);
              if (!res) return field.value; // Fallback to ID if not found
              const group = groups.find(g => g.id === res.groupId);
              return group ? `${res.name} (${group.name})` : res.name;
            }, [field.value, resources, groups]);

            return (
              <FormItem>
                <FormLabel>{t('eventModal.labels.resource')} <span className="text-red-500">*</span></FormLabel>
                {readOnlyResource ? (
                  <>
                    <div className="p-2 bg-muted rounded-md text-sm border border-input">
                      {displayValue || t('eventModal.placeholders.selectResource')}
                    </div>
                    {/* Hidden input to maintain form state */}
                    <input type="hidden" {...field} />
                  </>
                ) : (
                  <FormControl>
                    <EditableSelect
                      value={displayValue}
                      onChange={(val) => {
                        // Reverse lookup: Display Name -> ID
                        const match = resources.find(r => {
                          const g = groups.find(g => g.id === r.groupId);
                          const d = g ? `${r.name} (${g.name})` : r.name;
                          return d === val;
                        });
                        field.onChange(match ? match.id : val);
                      }}
                      options={resourceNames}
                      placeholder={t('eventModal.placeholders.selectResource')}
                    />
                  </FormControl>
                )}
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* Start Date & Time */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('eventModal.labels.startTime')} <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-2 gap-2">
            <TypedFormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DatePicker
                      value={new Date(field.value)}
                      onChange={(date) => {
                        if (date) {
                          const cur = new Date(field.value);
                          const next = new Date(date);
                          next.setHours(cur.getHours(), cur.getMinutes());
                          field.onChange(format(next, "yyyy-MM-dd'T'HH:mm"));
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <TypedFormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      value={format(new Date(field.value), 'HH:mm')}
                      readOnly
                      className="cursor-pointer"
                      onClick={() => setIsTimeModalOpen(true)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Duration */}
        <TypedFormField
          control={form.control}
          name="durationHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('eventModal.labels.duration')}</FormLabel>
              <div className="flex items-center gap-2">
                <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
                  <FormControl>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8].map(h => (
                      <SelectItem key={h} value={String(h)}>{h} h</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                  End: {!Number.isNaN(endDateDisplay.getTime()) ? format(endDateDisplay, 'HH:mm') : '--:--'}
                </span>
              </div>
            </FormItem>
          )}
        />

        {/* Conflict Warning */}
        {conflict && (
          <div className="p-4 bg-red-50 border border-red-500 rounded text-red-800 flex items-start gap-2">
            <Icons.AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>
              <strong className="block text-sm">Conflict Detected</strong>
              <span className="text-xs">
                Clash with {conflict.existingSchedule.title} ({format(conflict.existingSchedule.startDate, 'HH:mm')} - {format(conflict.existingSchedule.endDate, 'HH:mm')})
              </span>
            </div>
          </div>
        )}

        {/* Status */}
        <TypedFormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('eventModal.labels.status')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* Note */}
        <TypedFormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('eventModal.labels.note')}</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Add notes..." rows={2} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-border">
          {isEditMode && onDelete && (
            <Button type="button" variant="outline-delete" size="sm" onClick={onDelete} className="flex-1">
              {t('eventModal.actions.delete')}
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={onCancel} className="flex-1">
            {t('eventModal.actions.cancel')}
          </Button>
          <Button type="submit" variant="default" size="sm" className="flex-1">
            {t('eventModal.actions.save')}
          </Button>
        </div>
      </form>

      <KeypadModal
        open={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
        onSubmit={(time) => {
          const cur = new Date(form.getValues('startDate'));
          const [h, m] = time.split(':').map(Number);
          cur.setHours(h || 0, m || 0);
          form.setValue('startDate', format(cur, "yyyy-MM-dd'T'HH:mm"));
          setIsTimeModalOpen(false);
        }}
        initialValue={format(new Date(form.getValues('startDate')), 'HH:mm')}
        variant="time"
      />
    </Form>
  );
}
