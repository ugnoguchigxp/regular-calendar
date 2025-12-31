import { ConfirmModal, Modal } from '@/components/ui/Modal';
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
import { Textarea } from '@/components/ui/Textarea';
import { KeypadModal } from '@/components/ui/KeypadModal';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/Select';
import { Icons } from '@/components/ui/Icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { EditableSelect } from '@/components/ui/EditableSelect';
import { Checkbox } from '@/components/ui/Checkbox';
import {
    checkScheduleConflict,
    type Resource,
    type ResourceGroup,
    type ScheduleEvent
} from 'regular-calendar';

// Helper for duration formatting
const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
};

// 1. Define Custom Schema with Extra Field (Usage instead of Department)
const customEventSchema = z.object({
    title: z.string().min(1, 'required'),
    attendee: z.string().min(1, 'required'),
    resourceId: z.string().min(1, 'required'),
    startDate: z.string().min(1, 'required'),
    durationHours: z.number().min(0.25).max(24),
    status: z.string().optional(),
    note: z.string().optional(),
    usage: z.string().optional(), // CHANGED from department
    isAllDay: z.boolean().optional(),
});

type CustomEventFormValues = z.infer<typeof customEventSchema>;

export interface CustomEventFormData extends Omit<CustomEventFormValues, 'startDate'> {
    startDate: Date;
    endDate: Date;
    extendedProps?: Record<string, any>;
}

interface CustomEventModalProps {
    isOpen: boolean;
    event?: ScheduleEvent;
    resources: Resource[];
    events: ScheduleEvent[];
    groups: ResourceGroup[];
    defaultResourceId?: string;
    defaultStartTime?: Date;
    readOnlyResource?: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    onDelete?: (eventId: string) => void;
}

export function CustomEventModal({
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
}: CustomEventModalProps) {
    const { t } = useTranslation();
    const isEditMode = !!event;
    const [isModalReady, setIsModalReady] = useState(false);
    const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);

    const [confirmModal, setConfirmModal] = useState<{
        open: boolean;
        title: string;
        description?: string;
        onConfirm: () => void;
    }>({
        open: false,
        title: '',
        onConfirm: () => { },
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

    // Form Setup
    const form = useForm<CustomEventFormValues>({
        resolver: zodResolver(customEventSchema),
        defaultValues: {
            title: event?.title || 'Anonymous',
            attendee: event?.attendee || '',
            resourceId: event?.resourceId || defaultResourceId || resources[0]?.id || '',
            startDate: format(
                event?.startDate || defaultStartTime || new Date(),
                "yyyy-MM-dd'T'HH:mm"
            ),
            durationHours: event
                ? Math.round((event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60 * 60) * 100) / 100
                : 1,
            status: event?.status || 'booked',
            note: event?.note || '',
            usage: (event as any)?.extendedProps?.usage || 'Meeting',
            isAllDay: event?.isAllDay || false,
        },
    });

    const isAllDay = form.watch('isAllDay');

    // Watchers
    const startDateVal = form.watch('startDate');
    const durationVal = form.watch('durationHours');
    const resourceIdVal = form.watch('resourceId');
    const endDateDisplay = new Date(startDateVal);
    if (!Number.isNaN(endDateDisplay.getTime())) {
        const minutes = (Number(durationVal) || 0) * 60;
        endDateDisplay.setTime(new Date(startDateVal).getTime() + minutes * 60000);
    }

    // Conflict Check
    const conflict = useMemo(() => {
        const start = new Date(startDateVal);
        if (Number.isNaN(start.getTime()) || !resourceIdVal) return null;

        const minutes = (Number(durationVal) || 0) * 60;
        const end = new Date(start.getTime() + minutes * 60000);

        const otherEvents = events.filter((e) => e.id !== event?.id);
        return checkScheduleConflict(
            { startDate: start, endDate: end, resourceId: resourceIdVal },
            otherEvents
        );
    }, [startDateVal, durationVal, resourceIdVal, events, event?.id]);


    const handleSubmit = (data: CustomEventFormValues) => {
        const start = new Date(data.startDate);
        if (data.isAllDay) {
            start.setHours(0, 0, 0, 0);
        }

        const minutes = (Number(data.durationHours) || 0) * 60;
        const end = new Date(start.getTime() + minutes * 60000);

        onSave({
            ...data,
            startDate: start,
            endDate: end,
            extendedProps: {
                usage: data.usage
            }
        });
    };

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



    return (
        <Modal
            open={isOpen}
            onOpenChange={(open) => !open && onClose()}
            title={isEditMode ? t('event_custom_edit_title') : t('event_custom_create_title')}
        >
            <div style={{ pointerEvents: isModalReady ? 'auto' : 'none' }}>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 text-foreground">

                        {/* Custom Usage (Purpose) Field - Standard Style */}
                        {/* Custom Usage (Purpose) Field - Standard Style */}
                        <FormField
                            control={form.control}
                            name="usage"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('usage_label') || 'Usage (Purpose)'}</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger autoFocus>
                                                <SelectValue placeholder={t('usage_placeholder') || "Select usage"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Meeting">Meeting (会議)</SelectItem>
                                            <SelectItem value="Event">Event (イベント)</SelectItem>
                                            <SelectItem value="Interview">Interview (面談)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />




                        {/* Attendee */}
                        {/* Attendee */}
                        <FormField
                            control={form.control}
                            name="attendee"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('attendee_label') || 'Attendee'} <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder={t('attendee_placeholder') || 'Enter attendee name'} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Resource Selection */}
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
                                    const res = resources.find(r => r.id === field.value);
                                    if (!res) return field.value;
                                    const group = groups.find(g => g.id === res.groupId);
                                    return group ? `${res.name} (${group.name})` : res.name;
                                }, [field.value, resources, groups]);

                                return (
                                    <FormItem>
                                        <FormLabel>{t('resource_label')} <span className="text-red-500">*</span></FormLabel>
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
                                                    value={displayValue}
                                                    onChange={(val) => {
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

                        {/* Date and Duration */}
                        <div className="grid grid-cols-2 gap-4">
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
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer">
                                                    All Day
                                                </FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <FormField
                                        name="startDate"
                                        control={form.control}
                                        render={({ field }) => (
                                            <DatePicker
                                                value={new Date(field.value)}
                                                disabled={isAllDay}
                                                onChange={(date) => {
                                                    if (date) {
                                                        const d = new Date(field.value);
                                                        if (!isAllDay) {
                                                            date.setHours(d.getHours(), d.getMinutes());
                                                        } else {
                                                            date.setHours(0, 0, 0, 0);
                                                        }
                                                        field.onChange(format(date, "yyyy-MM-dd'T'HH:mm"));
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                    {!isAllDay && (
                                        <Input
                                            value={format(new Date(startDateVal), 'HH:mm')}
                                            readOnly
                                            className="w-24 cursor-pointer"
                                            onClick={() => setIsTimeModalOpen(true)}
                                            tabIndex={-1}
                                        />
                                    )}
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="durationHours"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('duration_label')}</FormLabel>
                                        <Select onValueChange={v => field.onChange(Number(v))} value={String(field.value)} disabled={isAllDay}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="max-h-[200px]">
                                                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.5, 4, 4.5, 5].map(h => (
                                                    <SelectItem key={h} value={String(h)}>{formatDuration(h)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        </div>

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
                                <Button type="button" variant="outline-delete" size="sm" onClick={handleDelete} className="flex-1">
                                    {t('delete_button')}
                                </Button>
                            )}
                            <Button type="button" variant="outline" size="sm" onClick={onClose} className="flex-1">
                                {t('cancel_button')}
                            </Button>
                            <Button type="submit" variant="default" size="sm" className="flex-1">
                                {t('save_button')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>

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
                initialValue={format(new Date(startDateVal), 'HH:mm')}
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
