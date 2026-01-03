import type { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type {
	Resource,
	ResourceGroup,
	ScheduleConflict,
} from "../../../FacilitySchedule/FacilitySchedule.schema";
import { formatCalendarDate } from "../../../utils/dateFormats";
import { formatIsoDateTime, formatIsoTime } from "../../../utils/dateUtils";
import { Button } from "../../ui/Button";
import { Checkbox } from "../../ui/Checkbox";
import { DatePicker } from "../../ui/DatePicker";
import { EditableSelect } from "../../ui/EditableSelect";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../../ui/Form";
import { Icons } from "../../ui/Icons";
import { Input } from "../../ui/Input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../ui/Select";
import { Textarea } from "../../ui/Textarea";
import type { CustomField } from "../types";
import type { EventFormValues } from "./useEventForm";

interface EventFormProps {
	form: UseFormReturn<EventFormValues>;
	onSubmit: (data: EventFormValues) => void;
	onCancel: () => void;
	onDelete?: () => void;
	isEditMode: boolean;
	canEdit: boolean;
	isAllDay: boolean;
	startDateVal: string;
	displayValue: string;
	availableResources: Resource[];
	resourceDisplayNames: Map<string, string>;
	groups: ResourceGroup[];
	conflict?: ScheduleConflict | null;
	setIsTimeModalOpen: (open: boolean) => void;
	customFields?: CustomField[];
	readOnlyResource?: boolean;
}

export function EventForm({
	form,
	onSubmit,
	onCancel,
	onDelete,
	isEditMode,
	canEdit,
	isAllDay,
	startDateVal,
	displayValue,
	availableResources,
	resourceDisplayNames,
	groups,
	conflict,
	setIsTimeModalOpen,
	customFields = [],
	readOnlyResource = false,
}: EventFormProps) {
	const { t, i18n } = useTranslation();

	// Helper to format duration for display
	const formatDurationDisplay = (h: number) => {
		const hours = Math.floor(h);
		const minutes = Math.round((h - hours) * 60);
		if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
		if (hours > 0) return `${hours}h`;
		return `${minutes}m`;
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-[var(--ui-space-4)] text-foreground"
			>
				{/* Event Name (Title) */}
				<FormField
					control={form.control}
					name="title"
					render={({
						field,
					}: {
						field: ControllerRenderProps<EventFormValues, "title">;
					}) => (
						<FormItem>
							<FormLabel>
								{t("event_name_label", "Event Name")}{" "}
								<span className="text-red-500">*</span>
							</FormLabel>
							<FormControl>
								<Input
									{...field}
									placeholder={t("event_name_placeholder", "Enter event name")}
									disabled={!canEdit}
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
					render={({
						field,
					}: {
						field: ControllerRenderProps<EventFormValues, "attendee">;
					}) => (
						<FormItem>
							<FormLabel>
								{t("attendee_label", "Attendee")}{" "}
								<span className="text-red-500">*</span>
							</FormLabel>
							<FormControl>
								<Input
									{...field}
									placeholder={t("attendee_placeholder", "Enter attendee name")}
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
					render={({
						field,
					}: {
						field: ControllerRenderProps<EventFormValues, "resourceId">;
					}) => (
						<FormItem>
							<FormLabel>
								{t("resource_label", "Resource")}{" "}
								<span className="text-red-500">*</span>
							</FormLabel>
							{readOnlyResource ? (
								<>
									<div className="p-[var(--ui-space-2)] bg-muted rounded-md text-sm border border-input">
										{displayValue ||
											t("resource_placeholder", "Select a resource")}
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
										placeholder={t("resource_placeholder", "Select a resource")}
										disabled={!canEdit}
									/>
								</FormControl>
							)}
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Date, Time and Duration in 3 columns */}
				<div className="grid grid-cols-3 gap-[var(--ui-space-4)]">
					{/* Column 1: Date */}
					<div className="space-y-[var(--ui-space-4)]">
						<div className="flex justify-between items-center h-[var(--ui-space-5)]">
							<FormLabel className="m-0">
								{t("date_label", "Date")}{" "}
								<span className="text-red-500">*</span>
							</FormLabel>
							<FormField
								control={form.control}
								name="isAllDay"
								render={({
									field,
								}: {
									field: ControllerRenderProps<EventFormValues, "isAllDay">;
								}) => (
									<FormItem className="flex flex-row items-center space-x-[var(--ui-space-2)] space-y-[var(--ui-space-0)]">
										<FormControl>
											<Checkbox
												id="isAllDay"
												checked={field.value}
												onCheckedChange={field.onChange}
												disabled={!canEdit}
											/>
										</FormControl>
										<FormLabel
											htmlFor="isAllDay"
											className="font-normal cursor-pointer text-xs"
										>
											All Day
										</FormLabel>
									</FormItem>
								)}
							/>
						</div>
						<FormField
							name="startDate"
							control={form.control}
							render={({
								field,
							}: {
								field: ControllerRenderProps<EventFormValues, "startDate">;
							}) => (
								<FormItem>
									<FormControl>
										<DatePicker
											value={new Date(field.value)}
											disabled={!canEdit}
											onChange={(date) => {
												if (date) {
													const d = new Date(field.value);
													if (!isAllDay) {
														date.setHours(d.getHours(), d.getMinutes());
													} else {
														date.setHours(0, 0, 0, 0);
													}
													field.onChange(formatIsoDateTime(date));
												}
											}}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
					</div>

					{/* Column 2: Time */}
					<div className="space-y-[var(--ui-space-4)]">
						<div className="flex justify-between items-center h-[var(--ui-space-5)]">
							<FormLabel className="m-0">
								{t("start_time_label", "Start Time")}{" "}
								{!isAllDay && <span className="text-red-500">*</span>}
							</FormLabel>
						</div>
						<div className="flex items-center">
							{!isAllDay ? (
								<Input
									value={formatIsoTime(new Date(startDateVal))}
									readOnly={!canEdit}
									className="w-full cursor-pointer py-ui"
									onClick={() => canEdit && setIsTimeModalOpen(true)}
									tabIndex={-1}
									disabled={!canEdit}
								/>
							) : (
								<div className="w-full px-ui py-ui text-sm border border-dashed border-border rounded-md bg-muted/10">
									&nbsp;
								</div>
							)}
						</div>
					</div>

					{/* Column 3: Duration */}
					<FormField
						control={form.control}
						name="durationHours"
						render={({
							field,
						}: {
							field: ControllerRenderProps<EventFormValues, "durationHours">;
						}) => (
							<FormItem className="space-y-[var(--ui-space-4)]">
								<div className="flex justify-between items-center h-[var(--ui-space-5)]">
									<FormLabel className="m-0">
										{t("duration_label", "Duration")}
									</FormLabel>
								</div>
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
									<SelectContent className="max-h-[var(--ui-space-50)]">
										{[
											0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75,
											3, 3.5, 4, 4.5, 5,
										].map((h) => (
											<SelectItem key={h} value={String(h)}>
												{formatDurationDisplay(h)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormItem>
						)}
					/>
				</div>

				{/* Custom Fields */}
				{customFields.map((customField) => (
					<FormField
						key={customField.name}
						control={form.control}
						name={customField.name}
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									{customField.label}
									{customField.required && (
										<span className="text-red-500">*</span>
									)}
								</FormLabel>
								<FormControl>
									{customField.type === "textarea" ? (
										<Textarea
											{...field}
											value={(field.value as string) || ""}
											placeholder={customField.placeholder}
											disabled={!canEdit}
										/>
									) : customField.type === "select" ? (
										<Select
											onValueChange={field.onChange}
											value={(field.value as string) || ""}
											disabled={!canEdit}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder={customField.placeholder} />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{customField.options?.map(
													(opt: { label: string; value: string }) => (
														<SelectItem key={opt.value} value={opt.value}>
															{opt.label}
														</SelectItem>
													),
												)}
											</SelectContent>
										</Select>
									) : customField.type === "number" ? (
										<Input
											{...field}
											value={(field.value as string | number) || ""}
											type="number"
											placeholder={customField.placeholder}
											disabled={!canEdit}
										/>
									) : (
										<Input
											{...field}
											value={(field.value as string) || ""}
											placeholder={customField.placeholder}
											disabled={!canEdit}
										/>
									)}
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				))}

				{/* Conflict Warning */}
				{conflict && (
					<div className="p-[var(--ui-space-4)] bg-red-50 border border-red-500 rounded text-red-800 flex items-start gap-[var(--ui-space-2)]">
						<Icons.AlertTriangle className="w-[var(--ui-space-5)] h-[var(--ui-space-5)] flex-shrink-0" />
						<div>
							<strong className="block text-sm">Conflict Detected</strong>
							<span className="text-xs">
								{t("event_form_conflict_warning", "Clash with existing event")}{" "}
								(
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

				{/* Status (Standard Field) */}
				<FormField
					control={form.control}
					name="status"
					render={({
						field,
					}: {
						field: ControllerRenderProps<EventFormValues, "status">;
					}) => (
						<FormItem>
							<FormLabel>{t("status_label", "Status")}</FormLabel>
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

				{/* Note (Standard Field) */}
				<FormField
					control={form.control}
					name="note"
					render={({
						field,
					}: {
						field: ControllerRenderProps<EventFormValues, "note">;
					}) => (
						<FormItem>
							<FormLabel>{t("note_label", "Note")}</FormLabel>
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
				<div className="flex gap-[var(--ui-space-3)] pt-[var(--ui-space-4)] border-t border-border">
					{canEdit && isEditMode && onDelete && (
						<Button
							type="button"
							variant="outline-delete" // Make sure this variant exists or use destructive
							size="sm"
							onClick={onDelete}
							className="flex-1"
						>
							{t("delete_button", "Delete")}
						</Button>
					)}
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={onCancel}
						className="flex-1"
					>
						{canEdit ? t("cancel_button", "Cancel") : "Close"}
					</Button>
					{canEdit && (
						<Button
							type="submit"
							variant="default"
							size="sm"
							className="flex-1"
						>
							{t("save_button", "Save")}
						</Button>
					)}
				</div>
			</form>
		</Form>
	);
}
