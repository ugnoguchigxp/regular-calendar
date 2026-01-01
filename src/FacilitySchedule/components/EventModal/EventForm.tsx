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
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Resource, ResourceGroup, ScheduleEvent } from '../../FacilitySchedule.schema';
import type { Personnel } from '../../../PersonnelPanel/PersonnelPanel.schema';
import { checkScheduleConflict } from '../../utils/scheduleHelpers';
import { Checkbox } from '@/components/ui/Checkbox';

// Helper for duration formatting
const formatDuration = (hours: number) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

// App specific sanitization removed, relying on basic React/Zod protection
// or assuming input is safe or sanitized on server.

const eventSchema = z.object({
  title: z.string().min(1, 'required'), // Was patientId -> mapped to title
  attendee: z.string().min(1, 'required'),
  resourceId: z.string().min(1, 'required'),
  startDate: z.string().min(1, 'required'),
  durationHours: z.number().min(0.25).max(24),
  status: z.string().optional(),
  note: z.string().optional(),

  // Extended Logic
  isRecurring: z.boolean().optional(),
  scheduleType: z.string().optional(),
  endDate: z.string().optional(),
  isAllDay: z.boolean().optional(),
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
  personnel?: Personnel[];
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
  personnel = [],
}: EventFormProps) {
  const { t } = useTranslation();
  const isEditMode = !!event;
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || '',
      attendee: event?.attendee || '',
      resourceId: event?.resourceId || defaultResourceId || '',
      startDate: format(
        event?.startDate || defaultStartTime || new Date(),
        "yyyy-MM-dd'T'HH:mm"
      ),
      durationHours: event
        ? Math.round((event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60 * 60) * 100) / 100
        : 1,
      status: event?.status || 'booked',
      note: event?.note || '',
      isRecurring: false,
      isAllDay: event?.isAllDay || false,
    },
  });

  const isAllDay = form.watch('isAllDay');



  const startDateVal = form.watch('startDate');
  const durationVal = form.watch('durationHours');
  const resourceIdVal = form.watch('resourceId');

  const endDateDisplay = new Date(startDateVal);
  if (!Number.isNaN(endDateDisplay.getTime())) {
    const minutes = (Number(durationVal) || 0) * 60;
    endDateDisplay.setTime(new Date(startDateVal).getTime() + minutes * 60000);
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
    if (data.isAllDay) {
      start.setHours(0, 0, 0, 0);
    }

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
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('user_name_label') || 'User Name'} <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('name_placeholder') || 'Enter name'} autoFocus />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Attendee */}
        <FormField
          control={form.control}
          name="attendee"
          render={({ field }) => {
            const inputValue = field.value || '';
            const lastSegment = inputValue.split(/,|、/).pop()?.trim() || ''; // Support both comma types
            const showSuggestions = lastSegment.length > 0;

            const filteredPersonnel = showSuggestions
              ? (personnel || []).filter(p =>
                p.name.toLowerCase().includes(lastSegment.toLowerCase()) ||
                (p.department && p.department.toLowerCase().includes(lastSegment.toLowerCase()))
              ).slice(0, 5) // Limit to 5 suggestions
              : [];

            const handleSelect = (p: Personnel) => {
              const segments = inputValue.split(/,|、/);
              segments.pop(); // Remove partial input
              segments.push(p.name);
              const newValue = segments.map(s => s.trim()).filter(s => s).join(', ') + ', ';
              field.onChange(newValue);
              // Focus back to input is handled automatically
            };

            return (
              <FormItem className="relative">
                <FormLabel>{t('attendee_label') || 'Attendee'} <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <div>
                    <Input
                      {...field}
                      placeholder={t('attendee_placeholder') || 'Enter attendee name'}
                      autoComplete="off"
                    />
                    {filteredPersonnel.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground border border-border rounded-md shadow-md overflow-hidden animate-in fade-in-0 zoom-in-95">
                        {filteredPersonnel.map(p => (
                          <div
                            key={p.id}
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground flex justify-between items-center"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSelect(p);
                            }}
                          >
                            <span className="font-medium">{p.name}</span>
                            {p.department && <span className="text-xs text-muted-foreground ml-2">{p.department}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* Resource Selection */}
        <FormField
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
                <FormLabel>{t('resource_label')}</FormLabel>
                {readOnlyResource ? (
                  <>
                    <div className="p-2 bg-muted rounded-md text-sm border border-input">
                      {displayValue || t('resource_placeholder')}
                    </div>
                    {/* Hidden input to maintain form state */}
                    <input type="hidden" {...field} />
                  </>
                ) : (
                  <FormControl>
                    <EditableSelect
                      value={displayValue || ''}
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
                      placeholder={t('resource_placeholder')}
                    />
                  </FormControl>
                )}
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* Start Date & Time */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <FormLabel>{t('start_time_label')} <span className="text-red-500">*</span></FormLabel>
            <FormField
              control={form.control}
              name="isAllDay"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="isAllDay-checkbox" // Add ID
                    />
                  </FormControl>
                  <label
                    htmlFor="isAllDay-checkbox"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    All Day
                  </label>
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-2 items-center">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DatePicker
                      value={new Date(field.value)}
                      disabled={isAllDay}
                      onChange={(date) => {
                        if (date) {
                          const cur = new Date(field.value);
                          if (!isAllDay) {
                            date.setHours(cur.getHours(), cur.getMinutes());
                          } else {
                            date.setHours(0, 0, 0, 0);
                          }
                          field.onChange(format(date, "yyyy-MM-dd'T'HH:mm"));
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {!isAllDay && (
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        value={format(new Date(field.value), 'HH:mm')}
                        readOnly
                        className="cursor-pointer w-24"
                        onClick={() => setIsTimeModalOpen(true)}
                        tabIndex={-1}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        {/* Duration */}
        <FormField
          control={form.control}
          name="durationHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('duration_label')}</FormLabel>
              <div className="flex items-center gap-2">
                <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)} disabled={isAllDay}>
                  <FormControl>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[200px]">
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.5, 4, 4.5, 5, 6, 8].map(h => (
                      <SelectItem key={h} value={String(h)}>{formatDuration(h)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isAllDay && (
                  <span className="text-sm text-muted-foreground">
                    End: {!Number.isNaN(endDateDisplay.getTime()) ? format(endDateDisplay, 'HH:mm') : '--:--'}
                  </span>
                )}
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
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('status_label')}</FormLabel>
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
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('note_label')}</FormLabel>
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
              {t('delete_button')}
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={onCancel} className="flex-1">
            {t('cancel_button')}
          </Button>
          <Button type="submit" variant="default" size="sm" className="flex-1">
            {t('save_button')}
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
