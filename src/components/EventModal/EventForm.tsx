/**
 * EventForm - Form for creating/editing schedule events
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { DatePicker } from "@/components/ui/DatePicker";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/Form";
import { Icons } from "@/components/ui/Icons";
import { Input } from "@/components/ui/Input";
import { KeypadModal } from "@/components/ui/KeypadModal";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { formatCalendarDate } from "@/utils/dateFormats";
import { formatIsoDateTime } from "@/utils/dateUtils";
import { useAppTranslation } from "@/utils/i18n";
import type {
	CustomField,
	EventFormData,
	Resource,
	ResourceGroup,
	ScheduleEvent,
} from "../../FacilitySchedule/FacilitySchedule.schema";
import { useAttendeeManagement } from "../../FacilitySchedule/hooks/useAttendeeManagement";
// Import new hooks
import { useResourceAvailability } from "../../FacilitySchedule/hooks/useResourceAvailability";
import { useScheduleConflict } from "../../FacilitySchedule/hooks/useScheduleConflict";
import type { Personnel } from "../../PersonnelPanel/PersonnelPanel.schema";
import { AttendeeInput } from "./AttendeeInput";

// Helper for duration formatting
const formatDuration = (hours: number) => {
	const h = Math.floor(hours);
	const m = Math.round((hours - h) * 60);
	if (h === 0) return `${m}m`;
	if (m === 0) return `${h}h`;
	return `${h}h ${m}m`;
};

const getStringProp = (
	value: Record<string, unknown> | undefined,
	key: string,
) => {
	const candidate = value?.[key];
	return typeof candidate === "string" ? candidate : undefined;
};

// Base Schema
const baseEventSchema = z.object({
	title: z.string().min(1, "required"),
	attendee: z.string().optional(),
	resourceId: z.string().optional(),
	startDate: z.string().min(1, "required"),
	durationHours: z.number().min(0.25).max(24),
	note: z.string().optional(),
	isRecurring: z.boolean().optional(),
	scheduleType: z.string().optional(),
	endDate: z.string().optional(),
	isAllDay: z.boolean().optional(),
});

type BaseEventFormValues = z.infer<typeof baseEventSchema>;
// Allow any extra fields for custom fields
type EventFormValues = BaseEventFormValues & Record<string, unknown>;

interface EventFormProps {
	event?: ScheduleEvent;
	resources: Resource[];
	groups: ResourceGroup[];
	events: ScheduleEvent[];
	resourceAvailability?: { resourceId: string; isAvailable: boolean }[];

	defaultResourceId?: string;
	defaultStartTime?: Date;

	onSubmit: (data: EventFormData) => void;
	onCancel: () => void;
	onDelete?: () => void;
	readOnlyResource?: boolean;
	personnel?: Personnel[];
	currentUserId?: string;
	onAvailabilityRequest?: (criteria: {
		startDate: Date;
		endDate: Date;
	}) => void;
	customFields?: CustomField[];
}

// biome-ignore lint/suspicious/noExplicitAny: Generic empty array constant
const EMPTY_ARRAY: any[] = [];

export function EventForm({
	event,
	resources,
	groups,
	events,
	resourceAvailability,
	defaultResourceId,
	defaultStartTime,
	onSubmit,
	onCancel,
	onDelete,
	readOnlyResource = false,
	personnel = EMPTY_ARRAY,
	currentUserId,
	onAvailabilityRequest,
	customFields = EMPTY_ARRAY,
}: EventFormProps) {
	const { t, i18n } = useAppTranslation();
	const isEditMode = !!event;
	const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);

	// Create dynamic schema
	const schema = useMemo(() => {
		const customShape: Record<string, z.ZodTypeAny> = {};
		customFields.forEach((field) => {
			let fieldSchema: z.ZodTypeAny;
			if (field.type === "number") {
				fieldSchema = z.union([
					z.number(),
					z.string().transform((val) => (val === "" ? undefined : Number(val))),
				]);
				if (field.required) {
					fieldSchema = z.coerce.number().min(1, "required");
				} else {
					fieldSchema = z.coerce.number().optional();
				}
			} else if (field.type === "boolean") {
				fieldSchema = z.boolean().optional();
			} else {
				// string-based
				fieldSchema = z.string();
				if (field.required) {
					fieldSchema = (fieldSchema as z.ZodString).min(1, "required");
				} else {
					fieldSchema = (fieldSchema as z.ZodString).optional();
				}
			}
			customShape[field.name] = fieldSchema;
		});
		return baseEventSchema.extend(customShape);
	}, [customFields]);

	// Prepare default values
	const defaultValues = useMemo(() => {
		const baseDefaults = {
			title:
				getStringProp(event?.extendedProps, "originalTitle") ??
				event?.title ??
				"",
			attendee: event?.attendee || "[]",
			resourceId: event?.resourceId || defaultResourceId || "",
			startDate: formatIsoDateTime(
				event?.startDate || defaultStartTime || new Date(),
			),
			durationHours: event
				? Math.round(
						((event.endDate.getTime() - event.startDate.getTime()) /
							(1000 * 60 * 60)) *
							100,
					) / 100
				: 1,
			note: event?.note || "",
			isRecurring: false,
			isAllDay: event?.isAllDay || false,
		};

		const customDefaults: Record<string, unknown> = {};
		customFields.forEach((field) => {
			const val = event?.extendedProps?.[field.name];
			customDefaults[field.name] =
				val !== undefined ? val : (field.defaultValue ?? "");
		});

		return { ...baseDefaults, ...customDefaults };
	}, [event, defaultResourceId, defaultStartTime, customFields]);

	const form = useForm<EventFormValues>({
		resolver: zodResolver(schema),
		defaultValues,
	});

	// Reset form when defaultValues change (e.g. switching events)
	useEffect(() => {
		form.reset(defaultValues);
	}, [defaultValues, form]);

	// Watch values
	const isAllDay = form.watch("isAllDay");
	const startDateVal = form.watch("startDate");
	const durationVal = form.watch("durationHours");
	const resourceIdVal = form.watch("resourceId");

	const endDateDisplay = new Date(startDateVal);
	if (!Number.isNaN(endDateDisplay.getTime())) {
		const minutes = (Number(durationVal) || 0) * 60;
		endDateDisplay.setTime(new Date(startDateVal).getTime() + minutes * 60000);
	}

	// Use new hooks
	const { availableResources, getDisplayName } = useResourceAvailability({
		resources,
		groups,
		events,
		timeRange: {
			start: new Date(startDateVal),
			end: endDateDisplay,
		},
		currentEventId: event?.id,
		externalAvailability: resourceAvailability,
	});

	// Trigger external availability check when date/duration changes
	useEffect(() => {
		if (onAvailabilityRequest) {
			const start = new Date(startDateVal);
			if (!Number.isNaN(start.getTime())) {
				const end = new Date(start);
				const minutes = (Number(durationVal) || 0) * 60;
				end.setMinutes(end.getMinutes() + minutes);
				onAvailabilityRequest({
					startDate: start,
					endDate: end,
				});
			}
		}
	}, [startDateVal, durationVal, onAvailabilityRequest]);

	const conflict = useScheduleConflict({
		startDate: startDateVal,
		duration: durationVal,
		resourceId: resourceIdVal,
		events,
		currentEventId: event?.id,
	});

	const { parseAttendees, processAttendeesForSubmit } = useAttendeeManagement({
		personnel,
		currentUserId,
		isEditMode,
	});

	const handleSubmit = (data: EventFormValues) => {
		const start = new Date(data.startDate);
		if (data.isAllDay) {
			start.setHours(0, 0, 0, 0);
		}

		const end = new Date(start);
		const minutes = (Number(data.durationHours) || 0) * 60;
		end.setMinutes(end.getMinutes() + minutes);

		const { finalAttendees, shouldDelete } = processAttendeesForSubmit(
			data.attendee || "[]",
		);

		if (shouldDelete && onDelete) {
			onDelete();
			return;
		}

		// Extract base fields
		const {
			startDate: _startDate,
			endDate: _endDate,
			title,
			attendee,
			resourceId,
			note,
			durationHours,
			isAllDay: _isAllDay,
			isRecurring,
			scheduleType,
			...rest
		} = data;

		// Everything else is a custom field or extended prop
		const extendedProps: Record<string, unknown> = {
			...(event?.extendedProps ?? {}),
			...rest,
		};

		// Also extract explicitly defined custom fields to ensure they are captured even if conflicting with base names (unlikely but safe)
		customFields.forEach((field) => {
			if (data[field.name] !== undefined) {
				extendedProps[field.name] = data[field.name];
			}
		});

		const payload: EventFormData = {
			title,
			attendee: finalAttendees,
			resourceId: resourceId || undefined,
			startDate: start,
			endDate: end,
			status: event?.status ?? "booked",
			note,
			durationHours, // Keep duration if needed by API
			isAllDay: !!data.isAllDay,
			extendedProps,
		};

		onSubmit(payload);
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				className="space-y-[var(--ui-space-4)] text-foreground"
			>
				{/* Title (Event Name) */}
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								{t("event_name_label") || "Event Name"}{" "}
								<span className="text-red-500">*</span>
							</FormLabel>
							<FormControl>
								<Input
									{...field}
									placeholder={
										t("event_name_placeholder") || "Enter event name"
									}
									autoFocus
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Attendee */}
				<FormField
					control={form.control}
					name="attendee"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("attendee_label") || "Attendee"}</FormLabel>
							<FormControl>
								<AttendeeInput
									value={parseAttendees(field.value as string)}
									onChange={(val) => field.onChange(JSON.stringify(val))}
									personnel={personnel || []}
									placeholder={
										t("attendee_placeholder") || "Enter attendee name"
									}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* リソース選択 */}
				<FormField
					control={form.control}
					name="resourceId"
					render={({ field }) => {
						const displayValue = getDisplayName((field.value as string) || "");

						return (
							<FormItem>
								<FormLabel>{t("resource_label")}</FormLabel>
								{readOnlyResource ? (
									<>
										<div className="px-ui py-ui bg-muted rounded-md text-sm border border-input min-h-ui flex items-center">
											{displayValue || t("resource_placeholder")}
										</div>
										<input type="hidden" {...field} />
									</>
								) : (
									<FormControl>
										<Select
											onValueChange={field.onChange}
											value={(field.value as string) || ""}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder={t("resource_placeholder")}>
														{displayValue}
													</SelectValue>
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{availableResources.map((r) => (
													<SelectItem key={r.id} value={r.id}>
														{getDisplayName(r.id)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormControl>
								)}
								<FormMessage />
							</FormItem>
						);
					}}
				/>

				{/* Custom Fields */}
				{customFields.map((field) => (
					<FormField
						key={field.name}
						control={form.control}
						name={field.name}
						render={({ field: formField }) => (
							<FormItem>
								<FormLabel>
									{field.label}
									{field.required && <span className="text-red-500"> *</span>}
								</FormLabel>
								<FormControl>
									{field.type === "select" ? (
										<Select
											onValueChange={formField.onChange}
											value={String(formField.value || "")}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select..." />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{field.options?.map((opt) => (
													<SelectItem key={opt.value} value={opt.value}>
														{opt.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									) : field.type === "boolean" ? (
										<div className="flex items-center space-x-[var(--ui-space-2)]">
											<Checkbox
												checked={!!formField.value}
												onCheckedChange={formField.onChange}
											/>
											<span className="text-sm text-muted-foreground">
												{field.label}
											</span>
										</div>
									) : field.type === "number" ? (
										<Input
											type="number"
											{...formField}
											value={String(formField.value || "")}
											onChange={formField.onChange}
										/>
									) : (
										<Input
											{...formField}
											value={String(formField.value || "")}
										/>
									)}
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				))}

				{/* Start Date & Time */}
				<div className="space-y-[var(--ui-space-2)]">
					{/* Header Row: Label & All Day Checkbox */}
					<div className="flex items-center justify-between">
						<FormLabel className="text-base font-semibold">
							{t("date_time_label") || "Date & Time"}{" "}
							<span className="text-red-500">*</span>
						</FormLabel>
						<FormField
							control={form.control}
							name="isAllDay"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center space-x-[var(--ui-space-2)] space-y-[var(--ui-space-0)]">
									<FormControl>
										<Checkbox
											checked={!!field.value}
											onCheckedChange={field.onChange}
											id="isAllDay-checkbox"
										/>
									</FormControl>
									<label
										htmlFor="isAllDay-checkbox"
										className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
									>
										{t("all_day") || "All Day"}
									</label>
								</FormItem>
							)}
						/>
					</div>

					{/* 4-Column Grid */}
					<div className="grid grid-cols-4 gap-[var(--ui-space-4)] items-start">
						{/* Col 1: Date Picker */}
						<FormField
							control={form.control}
							name="startDate"
							render={({ field }) => (
								<FormItem className="space-y-[var(--ui-space-1-5)]">
									<FormLabel className="text-xs text-muted-foreground">
										{t("date_label") || "Date"}
									</FormLabel>
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
													field.onChange(formatIsoDateTime(date));
												}
											}}
											className="w-full"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Col 2: Time Picker (Hidden if All Day) */}
						{isAllDay ? (
							<div aria-hidden="true" />
						) : (
							<FormField
								control={form.control}
								name="startDate"
								render={({ field }) => (
									<FormItem className="space-y-[var(--ui-space-1-5)]">
										<FormLabel className="text-xs text-muted-foreground">
											{t("time_label") || "Time"}
										</FormLabel>
										<FormControl>
											<Input
												value={formatCalendarDate(
													new Date(field.value),
													i18n.language,
													"time24",
												)}
												readOnly
												className="cursor-pointer w-full text-center"
												onClick={() => setIsTimeModalOpen(true)}
												tabIndex={-1}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{/* Col 3: Duration (Hidden if All Day) */}
						{isAllDay ? (
							<div aria-hidden="true" />
						) : (
							<FormField
								control={form.control}
								name="durationHours"
								render={({ field }) => (
									<FormItem className="space-y-[var(--ui-space-1-5)]">
										<FormLabel className="text-xs text-muted-foreground">
											{t("duration_label")}
										</FormLabel>
										<Select
											onValueChange={(v) => field.onChange(Number(v))}
											value={String(field.value)}
											disabled={isAllDay}
										>
											<FormControl>
												<SelectTrigger className="w-full">
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent className="max-h-[var(--ui-space-50)]">
												{[
													0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5,
													2.75, 3, 3.5, 4, 4.5, 5, 6, 8,
												].map((h) => (
													<SelectItem key={h} value={String(h)}>
														{formatDuration(h)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{/* Col 4: End Time Display (Hidden if All Day) */}
						{isAllDay ? (
							<div aria-hidden="true" />
						) : (
							<div className="space-y-[var(--ui-space-1-5)]">
								<FormLabel className="text-xs text-muted-foreground">
									End Time
								</FormLabel>
								<div className="h-[var(--ui-component-height)] px-3 py-1 flex items-center justify-center border border-transparent text-sm text-foreground/80 font-medium whitespace-nowrap">
									{!Number.isNaN(endDateDisplay.getTime())
										? formatCalendarDate(
												endDateDisplay,
												i18n.language,
												"time24",
											)
										: "-"}
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Conflict Warning */}
				{conflict && (
					<div className="p-[var(--ui-space-4)] bg-red-50 border border-red-500 rounded text-red-800 flex items-start gap-[var(--ui-space-2)]">
						<Icons.AlertTriangle className="w-[var(--ui-space-5)] h-[var(--ui-space-5)] flex-shrink-0" />
						<div>
							<strong className="block text-sm">Conflict Detected</strong>
							<span className="text-xs">
								{t("event_form_conflict_warning")} (
								{formatCalendarDate(
									conflict.existingSchedule.startDate,
									i18n.language,
									"time24",
								)}{" "}
								-{" "}
								{formatCalendarDate(
									conflict.existingSchedule.endDate,
									i18n.language,
									"time24",
								)}
								)
							</span>
						</div>
					</div>
				)}

				{/* Note */}
				<FormField
					control={form.control}
					name="note"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("note_label")}</FormLabel>
							<FormControl>
								<Textarea
									{...field}
									value={(field.value as string) || ""}
									placeholder="Add notes..."
									rows={2}
								/>
							</FormControl>
						</FormItem>
					)}
				/>

				{/* Action Buttons */}
				<div className="flex gap-[var(--ui-space-3)] pt-[var(--ui-space-4)] border-t border-border">
					{isEditMode && onDelete && (
						<Button
							type="button"
							variant="outline-delete"
							size="sm"
							onClick={onDelete}
							className="flex-1"
						>
							{t("delete_button")}
						</Button>
					)}
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={onCancel}
						className="flex-1"
					>
						{t("cancel_button")}
					</Button>
					<Button type="submit" variant="default" size="sm" className="flex-1">
						{t("save_button")}
					</Button>
				</div>
			</form>

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
					new Date(form.getValues("startDate")),
					i18n.language,
					"time24",
				)}
				variant="time"
			/>
		</Form>
	);
}
