import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { ConnectedEventModal } from "./ConnectedEventModal";

const mockContext = vi.fn();
const mockUseEventForm = vi.fn();
const mockUseConflictCheck = vi.fn();
const mockUseAvailableResources = vi.fn();
const mockUseResourceDisplayNames = vi.fn();
const mockPrepareEventFormData = vi.fn();

vi.mock("./ScheduleContext", () => ({
	useScheduleContext: () => mockContext(),
}));

vi.mock("./hooks", () => ({
	useEventForm: (..._args: unknown[]) => mockUseEventForm(),
	useConflictCheck: (..._args: unknown[]) => mockUseConflictCheck(),
	useAvailableResources: (..._args: unknown[]) => mockUseAvailableResources(),
	useResourceDisplayNames: (..._args: unknown[]) =>
		mockUseResourceDisplayNames(),
	prepareEventFormData: (..._args: unknown[]) => mockPrepareEventFormData(),
}));

vi.mock("../components/ui/Modal", () => ({
	Modal: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	ConfirmModal: ({ onConfirm }: { onConfirm: () => void }) => (
		<button type="button" onClick={onConfirm}>
			Confirm
		</button>
	),
}));

vi.mock("../components/ui/Button", () => ({
	Button: ({
		children,
		type = "button",
		...props
	}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
		children: ReactNode;
	}) => (
		<button type={type} {...props}>
			{children}
		</button>
	),
}));

vi.mock("../components/ui/DatePicker", () => ({
	DatePicker: ({ onChange }: { onChange?: (date: Date) => void }) => (
		<button
			type="button"
			onClick={() => onChange?.(new Date("2024-01-10T00:00:00Z"))}
		>
			Pick
		</button>
	),
}));

vi.mock("../components/ui/Form", () => ({
	Form: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	FormControl: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	FormItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	FormLabel: ({ children }: { children: ReactNode }) => <span>{children}</span>,
	FormMessage: () => null,
	FormField: ({
		name,
		render,
	}: {
		name: string;
		render: (props: {
			field: { value: unknown; onChange: (value: unknown) => void };
		}) => ReactNode;
	}) => {
		const valueMap: Record<string, unknown> = {
			startDate: "2024-01-10T08:00",
			durationHours: 1,
			resourceId: "r1",
			isAllDay: false,
			title: "",
			attendee: "",
			status: "booked",
			note: "",
			usage: "Meeting",
		};
		return render({ field: { value: valueMap[name], onChange: vi.fn() } });
	},
}));

vi.mock("../components/ui/Input", () => ({
	Input: ({
		onChange,
		...props
	}: React.InputHTMLAttributes<HTMLInputElement>) => (
		<input {...props} onChange={onChange ?? (() => {})} />
	),
}));

vi.mock("../components/ui/Textarea", () => ({
	Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
		<textarea {...props} />
	),
}));

vi.mock("../components/ui/KeypadModal", () => ({
	KeypadModal: () => null,
}));

vi.mock("../components/ui/Select", () => ({
	Select: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	SelectTrigger: ({ children }: { children: ReactNode }) => (
		<div>{children}</div>
	),
	SelectContent: ({ children }: { children: ReactNode }) => (
		<div>{children}</div>
	),
	SelectItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	SelectValue: ({ placeholder }: { placeholder?: string }) => (
		<span>{placeholder}</span>
	),
}));

vi.mock("../components/ui/Icons", () => ({
	Icons: { AlertTriangle: () => null },
}));

vi.mock("../components/ui/EditableSelect", () => ({
	EditableSelect: ({ value }: { value?: string | number }) => (
		<input value={value} readOnly />
	),
}));

vi.mock("../components/ui/Checkbox", () => ({
	Checkbox: ({
		checked,
		onCheckedChange,
	}: {
		checked?: boolean;
		onCheckedChange?: (checked: boolean) => void;
	}) => (
		<input
			type="checkbox"
			checked={checked}
			onChange={() => onCheckedChange?.(!checked)}
		/>
	),
}));

const resources = [
	{
		id: "r1",
		name: "Room 1",
		order: 1,
		isAvailable: true,
		groupId: "g1",
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

const groups = [
	{
		id: "g1",
		name: "Group A",
		displayMode: "grid",
		dimension: 1,
		resources,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

const events = [
	{
		id: "e1",
		resourceId: "r1",
		groupId: "g1",
		title: "Existing",
		attendee: "[]",
		startDate: new Date("2024-01-10T08:00:00Z"),
		endDate: new Date("2024-01-10T09:00:00Z"),
		status: "booked",
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

describe("ConnectedEventModal", () => {
	it("submits and deletes via hooks", async () => {
		const onSave = vi.fn();
		const onDelete = vi.fn();
		const onClose = vi.fn();

		const fetchResourceAvailability = vi.fn().mockResolvedValue([]);
		mockContext.mockReturnValue({
			fetchResourceAvailability,
			getResourceAvailabilityFromCache: vi.fn().mockReturnValue(undefined),
		});

		mockUseEventForm.mockReturnValue({
			form: {
				control: {},
				handleSubmit:
					(fn: (data: Record<string, unknown>) => void) =>
					(e: { preventDefault: () => void }) => {
						e.preventDefault();
						fn({});
					},
				getValues: () => "2024-01-10T08:00",
				setValue: vi.fn(),
			},
			isEditMode: true,
			startDateVal: "2024-01-10T08:00",
			durationVal: 1,
			resourceIdVal: "r1",
			isAllDay: false,
		});

		mockUseConflictCheck.mockReturnValue({
			existingSchedule: events[0],
		});

		mockUseAvailableResources.mockReturnValue(resources);
		mockUseResourceDisplayNames.mockReturnValue(
			new Map([["r1", "Room 1 (Group A)"]]),
		);
		mockPrepareEventFormData.mockReturnValue({ prepared: true });

		vi.useFakeTimers();

		await act(async () => {
			render(
				<ConnectedEventModal
					isOpen
					event={events[0]}
					resources={resources}
					events={events}
					groups={groups}
					onClose={onClose}
					onSave={onSave}
					onDelete={onDelete}
					currentUserId="owner"
				/>,
			);
		});

		await act(async () => {
			vi.runAllTimers();
			await Promise.resolve();
			await Promise.resolve();
		});

		fireEvent.click(screen.getByRole("button", { name: /save_button/i }));
		expect(onSave).toHaveBeenCalledWith({ prepared: true });

		fireEvent.click(screen.getByRole("button", { name: /delete_button/i }));
		fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
		expect(onDelete).toHaveBeenCalledWith("e1");

		vi.useRealTimers();
	});

	it("renders read-only mode when not owner", async () => {
		mockContext.mockReturnValue({
			fetchResourceAvailability: vi.fn().mockResolvedValue([]),
			getResourceAvailabilityFromCache: vi.fn().mockReturnValue(undefined),
		});

		mockUseEventForm.mockReturnValue({
			form: {
				control: {},
				handleSubmit:
					(fn: (data: Record<string, unknown>) => void) =>
					(e: { preventDefault: () => void }) => {
						e.preventDefault();
						fn({});
					},
				getValues: () => "2024-01-10T08:00",
				setValue: vi.fn(),
			},
			isEditMode: true,
			startDateVal: "2024-01-10T08:00",
			durationVal: 1,
			resourceIdVal: "r1",
			isAllDay: false,
		});

		mockUseConflictCheck.mockReturnValue(undefined);
		mockUseAvailableResources.mockReturnValue(resources);
		mockUseResourceDisplayNames.mockReturnValue(
			new Map([["r1", "Room 1 (Group A)"]]),
		);
		mockPrepareEventFormData.mockReturnValue({ prepared: true });

		await act(async () => {
			render(
				<ConnectedEventModal
					isOpen
					event={{ ...events[0], extendedProps: { ownerId: "owner" } }}
					resources={resources}
					events={events}
					groups={groups}
					onClose={vi.fn()}
					onSave={vi.fn()}
					onDelete={vi.fn()}
					currentUserId="other"
				/>,
			);
			await Promise.resolve();
		});

		expect(
			screen.queryByRole("button", { name: /save_button/i }),
		).not.toBeInTheDocument();
		expect(
			screen.getByText(
				"You cannot edit this event because you are not the owner.",
			),
		).toBeInTheDocument();
	});

	it("uses cached availability and shows read-only resource display", async () => {
		const fetchResourceAvailability = vi.fn().mockResolvedValue([]);
		mockContext.mockReturnValue({
			fetchResourceAvailability,
			getResourceAvailabilityFromCache: vi
				.fn()
				.mockReturnValue([{ resourceId: "r1", isAvailable: true }]),
		});

		mockUseEventForm.mockReturnValue({
			form: {
				control: {},
				handleSubmit:
					(fn: (data: Record<string, unknown>) => void) =>
					(e: { preventDefault: () => void }) => {
						e.preventDefault();
						fn({});
					},
				getValues: () => "2024-01-10T08:00",
				setValue: vi.fn(),
			},
			isEditMode: false,
			startDateVal: "2024-01-10T08:00",
			durationVal: 1,
			resourceIdVal: "r1",
			isAllDay: false,
		});

		mockUseConflictCheck.mockReturnValue(undefined);
		mockUseAvailableResources.mockReturnValue(resources);
		mockUseResourceDisplayNames.mockReturnValue(
			new Map([["r1", "Room 1 (Group A)"]]),
		);
		mockPrepareEventFormData.mockReturnValue({ prepared: true });

		await act(async () => {
			render(
				<ConnectedEventModal
					isOpen
					resources={resources}
					events={events}
					groups={groups}
					onClose={vi.fn()}
					onSave={vi.fn()}
					readOnlyResource={true}
				/>,
			);
			await Promise.resolve();
		});

		expect(fetchResourceAvailability).not.toHaveBeenCalled();
		expect(screen.getByText("Room 1 (Group A)")).toBeInTheDocument();
	});

	it("hides time input when all-day is selected", async () => {
		mockContext.mockReturnValue({
			fetchResourceAvailability: vi.fn().mockResolvedValue([]),
			getResourceAvailabilityFromCache: vi.fn().mockReturnValue(undefined),
		});

		mockUseEventForm.mockReturnValue({
			form: {
				control: {},
				handleSubmit:
					(fn: (data: Record<string, unknown>) => void) =>
					(e: { preventDefault: () => void }) => {
						e.preventDefault();
						fn({});
					},
				getValues: () => "2024-01-10T08:00",
				setValue: vi.fn(),
			},
			isEditMode: false,
			startDateVal: "2024-01-10T08:00",
			durationVal: 1,
			resourceIdVal: "missing",
			isAllDay: true,
		});

		mockUseConflictCheck.mockReturnValue(undefined);
		mockUseAvailableResources.mockReturnValue(resources);
		mockUseResourceDisplayNames.mockReturnValue(
			new Map([["r1", "Room 1 (Group A)"]]),
		);
		mockPrepareEventFormData.mockReturnValue({ prepared: true });

		await act(async () => {
			render(
				<ConnectedEventModal
					isOpen
					resources={resources}
					events={events}
					groups={groups}
					onClose={vi.fn()}
					onSave={vi.fn()}
				/>,
			);
			await Promise.resolve();
		});

		expect(screen.queryByDisplayValue("08:00")).not.toBeInTheDocument();
		expect(screen.getByDisplayValue("missing")).toBeInTheDocument();
	});
});
