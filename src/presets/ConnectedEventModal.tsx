import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/Button";
import { Checkbox } from "../components/ui/Checkbox";
import { DatePicker } from "../components/ui/DatePicker";
import { EditableSelect } from "../components/ui/EditableSelect";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../components/ui/Form";
import { Icons } from "../components/ui/Icons";
import { Input } from "../components/ui/Input";
import { KeypadModal } from "../components/ui/KeypadModal";
import { ConfirmModal, Modal } from "../components/ui/Modal";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import type {
	Resource,
	ResourceGroup,
	ScheduleEvent,
} from "../FacilitySchedule/FacilitySchedule.schema";
import { getResourceAvailability } from "../FacilitySchedule/utils/resourceAvailability";
import {
	type EventFormData,
	type EventFormValues,
	prepareEventFormData,
	useAvailableResources,
	useConflictCheck,
	useEventForm,
	useResourceDisplayNames,
} from "./hooks";
import { useScheduleContext } from "./ScheduleContext";
import { formatDuration } from "./utils";

interface ConnectedEventModalProps {
	isOpen: boolean;
	event?: ScheduleEvent;
	resources: Resource[];
	events: ScheduleEvent[];
	groups: ResourceGroup[];
	defaultResourceId?: string;
	defaultStartTime?: Date;
	readOnlyResource?: boolean;
	onClose: () => void;
	onSave: (data: EventFormData) => void;
	onDelete?: (eventId: string) => void;
	currentUserId?: string;
}

export function ConnectedEventModal({
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
}: ConnectedEventModalProps) {
	const { t } = useTranslation();
	const { fetchResourceAvailability, getResourceAvailabilityFromCache } =
		useScheduleContext();

	// Use extracted form hook
	const {
		form,
		isEditMode,
		startDateVal,
		durationVal,
		resourceIdVal,
		isAllDay,
		// endDateDisplay available if needed
	} = useEventForm({
		event,
		defaultResourceId,
		defaultStartTime,
		resources,
	});

	// Check ownership
	const ownerId =
		typeof event?.extendedProps?.ownerId === "string"
			? event.extendedProps.ownerId
			: undefined;
	const isOwner = !isEditMode || !ownerId || ownerId === currentUserId;
	const canEdit = isOwner;

	// Modal state
	const [isModalReady, setIsModalReady] = useState(false);
	const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
	const [resourceAvailability, setResourceAvailability] = useState<
		{ resourceId: string; isAvailable: boolean }[]
	>([]);
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

	// Fetch resource availability on modal open
	useEffect(() => {
		if (!isOpen) return;

		const targetDate = event?.startDate || defaultStartTime || new Date();

		const cached = getResourceAvailabilityFromCache(targetDate);
		if (cached) {
			console.log("[ConnectedEventModal] Using cached resource availability");
			setResourceAvailability(
				cached.map((r) => ({
					resourceId: r.resourceId,
					isAvailable: r.isAvailable,
				})),
			);
			return;
		}

		console.log("[ConnectedEventModal] Fetching resource availability");
		fetchResourceAvailability(targetDate).then((availability) => {
			setResourceAvailability(
				availability.map((r) => ({
					resourceId: r.resourceId,
					isAvailable: r.isAvailable,
				})),
			);
		});
	}, [
		isOpen,
		event?.startDate,
		defaultStartTime,
		fetchResourceAvailability,
		getResourceAvailabilityFromCache,
	]);

	// Use extracted hooks for derived data (at top level, not in render)
	const conflict = useConflictCheck(
		startDateVal,
		durationVal,
		resourceIdVal,
		events,
		event?.id,
	);

	// Compute available resources
	const availabilityForFilter = useMemo(() => {
		if (resourceAvailability.length > 0) {
			return resourceAvailability;
		}
		// Fallback to local calculation
		const start = new Date(startDateVal);
		const minutes = (Number(durationVal) || 0) * 60;
		const end = new Date(start.getTime() + minutes * 60000);
		return getResourceAvailability(
			resources,
			events,
			{ start, end },
			event?.id,
		);
	}, [
		resourceAvailability,
		resources,
		events,
		startDateVal,
		durationVal,
		event?.id,
	]);

	const availableResources = useAvailableResources(
		resources,
		availabilityForFilter,
	);
	const resourceDisplayNames = useResourceDisplayNames(
		availableResources,
		groups,
	);

	// Display value for selected resource
	const displayValue = useMemo(() => {
		const res = resources.find((r) => r.id === resourceIdVal);
		if (!res) return resourceIdVal;
		const group = groups.find((g) => g.id === res.groupId);
		return group ? `${res.name} (${group.name})` : res.name;
	}, [resourceIdVal, resources, groups]);

	const handleSubmit = (data: EventFormValues) => {
		const formData = prepareEventFormData(data, event, currentUserId);
		onSave(formData);
	};

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
			title={
				isEditMode
					? canEdit
						? t("event_custom_edit_title")
						: "View Event (Read Only)"
					: t("event_custom_create_title")
			}
		>
			<div style={{ pointerEvents: isModalReady ? "auto" : "none" }}>
				{!canEdit && isEditMode && (
					<div className="mb-4 p-2 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-200">
						You cannot edit this event because you are not the owner.
					</div>
				)}
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-4 text-foreground"
					>
						{/* Event Name (Title) */}
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{t("event_name_label") || "Event Name (予定名称)"}{" "}
										<span className="text-red-500">*</span>
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder={
												t("event_name_placeholder") || "Enter event name"
											}
											disabled={!canEdit}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Custom Usage (Purpose) Field */}
						<FormField
							control={form.control}
							name="usage"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("usage_label") || "Usage (Purpose)"}</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value}
										disabled={!canEdit}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue
													placeholder={t("usage_placeholder") || "Select usage"}
												/>
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="Meeting">Meeting (会議)</SelectItem>
											<SelectItem value="Event">Event (イベント)</SelectItem>
											<SelectItem value="Interview">
												Interview (面談)
											</SelectItem>
										</SelectContent>
									</Select>
								</FormItem>
							)}
						/>

						{/* Attendee */}
						<FormField
							control={form.control}
							name="attendee"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{t("attendee_label") || "Attendee"}{" "}
										<span className="text-red-500">*</span>
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder={
												t("attendee_placeholder") || "Enter attendee name"
											}
											disabled={!canEdit}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Resource Selection */}
						<FormField
							control={form.control}
							name="resourceId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{t("resource_label")}{" "}
										<span className="text-red-500">*</span>
									</FormLabel>
									{readOnlyResource ? (
										<>
											<div className="p-2 bg-muted rounded-md text-sm border border-input">
												{displayValue || t("resource_placeholder")}
											</div>
											<input type="hidden" {...field} />
										</>
									) : (
										<FormControl>
											<EditableSelect
												value={displayValue}
												onChange={(val) => {
													const match = availableResources.find((r) => {
														const g = groups.find((g) => g.id === r.groupId);
														const d = g ? `${r.name} (${g.name})` : r.name;
														return d === val;
													});
													field.onChange(match ? match.id : val);
												}}
												options={Array.from(resourceDisplayNames.values())}
												placeholder={t("resource_placeholder")}
												disabled={!canEdit}
											/>
										</FormControl>
									)}
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Date and Duration */}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-4">
								<div className="flex justify-between items-center">
									<FormLabel>
										{t("start_time_label")}{" "}
										<span className="text-red-500">*</span>
									</FormLabel>
									<FormField
										control={form.control}
										name="isAllDay"
										render={({ field }) => (
											<FormItem className="flex flex-row items-center space-x-2 space-y-0">
												<FormControl>
													<Checkbox
														checked={field.value}
														onCheckedChange={field.onChange}
														disabled={!canEdit}
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
												disabled={isAllDay || !canEdit}
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
											value={format(new Date(startDateVal), "HH:mm")}
											readOnly={!canEdit}
											className="w-24 cursor-pointer"
											onClick={() => canEdit && setIsTimeModalOpen(true)}
											tabIndex={-1}
											disabled={!canEdit}
										/>
									)}
								</div>
							</div>

							<FormField
								control={form.control}
								name="durationHours"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("duration_label")}</FormLabel>
										<Select
											onValueChange={(v) => field.onChange(Number(v))}
											value={String(field.value)}
											disabled={isAllDay || !canEdit}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent className="max-h-[200px]">
												{[
													0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5,
													2.75, 3, 3.5, 4, 4.5, 5,
												].map((h) => (
													<SelectItem key={h} value={String(h)}>
														{formatDuration(h)}
													</SelectItem>
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
										Clash with {conflict.existingSchedule.title} (
										{format(conflict.existingSchedule.startDate, "HH:mm")} -{" "}
										{format(conflict.existingSchedule.endDate, "HH:mm")})
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
									<FormLabel>{t("status_label")}</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value}
										disabled={!canEdit}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
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
									<FormLabel>{t("note_label")}</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											placeholder="Add notes..."
											rows={2}
											disabled={!canEdit}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Action Buttons */}
						<div className="flex gap-3 pt-4 border-t border-border">
							{canEdit && isEditMode && onDelete && (
								<Button
									type="button"
									variant="outline-delete"
									size="sm"
									onClick={handleDelete}
									className="flex-1"
								>
									{t("delete_button")}
								</Button>
							)}
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={onClose}
								className="flex-1"
							>
								{canEdit ? t("cancel_button") : "Close"}
							</Button>
							{canEdit && (
								<Button
									type="submit"
									variant="default"
									size="sm"
									className="flex-1"
								>
									{t("save_button")}
								</Button>
							)}
						</div>
					</form>
				</Form>
			</div>

			<KeypadModal
				open={isTimeModalOpen}
				onClose={() => setIsTimeModalOpen(false)}
				onSubmit={(time) => {
					const cur = new Date(form.getValues("startDate"));
					const [h, m] = time.split(":").map(Number);
					cur.setHours(h || 0, m || 0);
					form.setValue("startDate", format(cur, "yyyy-MM-dd'T'HH:mm"));
					setIsTimeModalOpen(false);
				}}
				initialValue={format(new Date(startDateVal), "HH:mm")}
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
