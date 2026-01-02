import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConnectedFacilitySchedule } from "./ConnectedFacilitySchedule";

const mockContext = vi.fn();
const mockTransform = vi.fn();

vi.mock("./ScheduleContext", () => ({
	useScheduleContext: () => mockContext(),
}));

vi.mock("./utils/transformBookings", () => ({
	transformBookingsToEvents: (..._args: unknown[]) => mockTransform(),
}));

vi.mock("../FacilitySchedule/FacilitySchedule", () => ({
	FacilitySchedule: ({
		onEventCreate,
		onEventUpdate,
		onEventDelete,
	}: {
		onEventCreate: (data: { title: string }) => void;
		onEventUpdate: (id: string, data: { title: string }) => void;
		onEventDelete: (id: string) => void;
	}) => (
		<div>
			<button type="button" onClick={() => onEventCreate({ title: "New" })}>
				Create
			</button>
			<button
				type="button"
				onClick={() => onEventUpdate("e1", { title: "Update" })}
			>
				Update
			</button>
			<button type="button" onClick={() => onEventDelete("e1")}>
				Delete
			</button>
		</div>
	),
}));

vi.mock("../FacilitySchedule/components/EventModal/EventModal", () => ({
	EventModal: () => <div>Modal</div>,
}));

describe("ConnectedFacilitySchedule", () => {
	beforeEach(() => {
		mockTransform.mockReturnValue([]);
	});

	it("renders loading and error states", async () => {
		mockContext.mockReturnValue({
			resources: [],
			groups: [],
			settings: null,
			loading: true,
			error: null,
			createEvent: vi.fn(),
			updateEvent: vi.fn(),
			deleteEvent: vi.fn(),
			fetchResourceAvailability: vi.fn().mockResolvedValue([]),
			personnel: [],
		});

		await act(async () => {
			render(
				<ConnectedFacilitySchedule
					settings={{
						weekStartsOn: 1,
						businessHoursStart: "08:00",
						businessHoursEnd: "18:00",
					}}
				/>,
			);
			await Promise.resolve();
		});

		expect(screen.getByText("Loading schedule data...")).toBeInTheDocument();

		mockContext.mockReturnValue({
			resources: [],
			groups: [],
			settings: null,
			loading: false,
			error: "Oops",
			createEvent: vi.fn(),
			updateEvent: vi.fn(),
			deleteEvent: vi.fn(),
			fetchResourceAvailability: vi.fn().mockResolvedValue([]),
			personnel: [],
		});

		await act(async () => {
			render(
				<ConnectedFacilitySchedule
					settings={{
						weekStartsOn: 1,
						businessHoursStart: "08:00",
						businessHoursEnd: "18:00",
					}}
				/>,
			);
			await Promise.resolve();
		});

		expect(screen.getByText("Error: Oops")).toBeInTheDocument();
	});

	it("fetches availability and calls create/update/delete", async () => {
		const user = userEvent.setup();
		const fetchResourceAvailability = vi.fn().mockResolvedValue([]);
		const createEvent = vi.fn().mockResolvedValue(undefined);
		const updateEvent = vi.fn().mockResolvedValue(undefined);
		const deleteEvent = vi.fn().mockResolvedValue(undefined);

		mockTransform.mockReturnValue([
			{ id: "e1", title: "Event", resourceId: "r1" },
		]);

		mockContext.mockReturnValue({
			resources: [],
			groups: [],
			settings: { weekStartsOn: 1 },
			loading: false,
			error: null,
			createEvent,
			updateEvent,
			deleteEvent,
			fetchResourceAvailability,
			personnel: [
				{
					id: "p1",
					name: "Owner",
					priority: 0,
					email: "a@a.com",
					department: "X",
				},
			],
		});

		await act(async () => {
			render(
				<ConnectedFacilitySchedule
					settings={{
						weekStartsOn: 1,
						businessHoursStart: "08:00",
						businessHoursEnd: "18:00",
					}}
				/>,
			);
			await Promise.resolve();
		});

		await waitFor(() => {
			expect(fetchResourceAvailability).toHaveBeenCalled();
		});

		await user.click(screen.getByRole("button", { name: "Create" }));
		expect(createEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				extendedProps: expect.objectContaining({ ownerId: "p1" }),
			}),
		);

		await user.click(screen.getByRole("button", { name: "Update" }));
		expect(updateEvent).toHaveBeenCalledWith("e1", { title: "Update" });

		await user.click(screen.getByRole("button", { name: "Delete" }));
		expect(deleteEvent).toHaveBeenCalledWith("e1");
	});
});
