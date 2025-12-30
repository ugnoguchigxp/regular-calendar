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
import type { ControllerProps, FieldPath } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { EditableSelect } from '@/components/ui/EditableSelect';
import {
    checkScheduleConflict,
    type Resource,
    type ResourceGroup,
    type ScheduleEvent
} from 'regular-calendar';

// 1. Define Custom Schema with Extra Field
const customEventSchema = z.object({
    title: z.string().min(1, 'required'),
    resourceId: z.string().min(1, 'required'),
    startDate: z.string().min(1, 'required'),
    durationHours: z.number().min(0.5).max(24),
    status: z.string().optional(),
    note: z.string().optional(),
    department: z.string().optional(), // NEW FIELD
});

type CustomEventFormValues = z.infer<typeof customEventSchema>;

export interface CustomEventFormData extends Omit<CustomEventFormValues, 'startDate'> {
    startDate: Date;
    endDate: Date;
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
            title: event?.title || '',
            resourceId: event?.resourceId || defaultResourceId || resources[0]?.id || '',
            startDate: format(
                event?.startDate || defaultStartTime || new Date(),
                "yyyy-MM-dd'T'HH:mm"
            ),
            durationHours: event
                ? Math.round((event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60 * 60) * 10) / 10
                : 1,
            status: event?.status || 'booked',
            note: event?.note || '',
            department: (event as any)?.extendedProps?.department || 'General', // Load custom field mock
        },
    });

    // Watchers
    const startDateVal = form.watch('startDate');
    const durationVal = form.watch('durationHours');
    const resourceIdVal = form.watch('resourceId');
    const endDateDisplay = new Date(startDateVal);
    if (!Number.isNaN(endDateDisplay.getTime())) {
        const minutes = (Number(durationVal) || 0) * 60;
        endDateDisplay.setHours(new Date(startDateVal).getHours()); // Reset to start hours base to avoid drift if day changes? No just add minutes.
        // Actually simply:
        endDateDisplay.setTime(new Date(startDateVal).getTime() + minutes * 60000);
        // Wait, original code:
        // endDateDisplay.setHours(endDateDisplay.getHours() + (Number(durationVal) || 0)); ... incorrect logic in original?
        // Let's use simple math
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
        const minutes = (Number(data.durationHours) || 0) * 60;
        const end = new Date(start.getTime() + minutes * 60000);

        // Pass back data including custom field
        onSave({
            ...data,
            startDate: start,
            endDate: end,
            extendedProps: {
                department: data.department
            }
        });
    };

    const handleDelete = () => {
        if (!event || !onDelete) return;
        setConfirmModal({
            open: true,
            title: t('eventModal.actions.confirmDelete'),
            description: t('eventModal.actions.confirmDeleteMessage'),
            onConfirm: () => {
                onDelete(event.id);
                setConfirmModal((prev) => ({ ...prev, open: false }));
                onClose();
            },
        });
    };

    const TypedFormField = <TName extends FieldPath<CustomEventFormValues>>(
        props: ControllerProps<CustomEventFormValues, TName>
    ) => <FormField {...props} />;

    return (
        <Modal
            open={isOpen}
            onOpenChange={(open) => !open && onClose()}
            title={isEditMode ? t('eventModal.title.editCustom') : t('eventModal.title.createCustom')}
        >
            <div style={{ pointerEvents: isModalReady ? 'auto' : 'none' }}>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 text-foreground">

                        {/* Custom Department Field */}
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800">
                            <TypedFormField
                                control={form.control}
                                name="department"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-blue-700 dark:text-blue-300">{t('eventModal.labels.department')}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white dark:bg-black">
                                                    <SelectValue placeholder={t('eventModal.placeholders.selectDepartment')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="General">General</SelectItem>
                                                <SelectItem value="Cardiology">Cardiology</SelectItem>
                                                <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                                                <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        </div>

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
                                    const res = resources.find(r => r.id === field.value);
                                    if (!res) return field.value;
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

                        {/* Date and Duration */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <FormLabel>{t('eventModal.labels.startTime')} <span className="text-red-500">*</span></FormLabel>
                                <div className="flex gap-2">
                                    <TypedFormField
                                        name="startDate"
                                        control={form.control}
                                        render={({ field }) => (
                                            <DatePicker
                                                value={new Date(field.value)}
                                                onChange={(date) => {
                                                    if (date) {
                                                        const d = new Date(field.value);
                                                        date.setHours(d.getHours(), d.getMinutes());
                                                        field.onChange(format(date, "yyyy-MM-dd'T'HH:mm"));
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                    <Input
                                        value={format(new Date(startDateVal), 'HH:mm')}
                                        readOnly
                                        className="w-20 cursor-pointer"
                                        onClick={() => setIsTimeModalOpen(true)}
                                    />
                                </div>
                            </div>

                            <TypedFormField
                                control={form.control}
                                name="durationHours"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('eventModal.labels.duration')}</FormLabel>
                                        <Select onValueChange={v => field.onChange(Number(v))} value={String(field.value)}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {[0.5, 1, 1.5, 2, 3, 4, 5].map(h => (
                                                    <SelectItem key={h} value={String(h)}>{h} h</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Conflict */}
                        {conflict && (
                            <div className="p-3 bg-red-100 text-red-800 text-sm rounded flex items-center gap-2">
                                <Icons.AlertTriangle className="w-4 h-4" />
                                <span>Conflict with {conflict.existingSchedule.title}</span>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 justify-end">
                            {isEditMode && onDelete && (
                                <Button type="button" variant="destructive" onClick={handleDelete}>{t('eventModal.actions.delete')}</Button>
                            )}
                            <Button type="button" variant="outline" onClick={onClose}>{t('eventModal.actions.cancel')}</Button>
                            <Button type="submit">{t('eventModal.actions.save')}</Button>
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
                onOpenChange={(o) => setConfirmModal(p => ({ ...p, open: o }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                description={confirmModal.description}
                variant="destructive"
            />
        </Modal>
    );
}
