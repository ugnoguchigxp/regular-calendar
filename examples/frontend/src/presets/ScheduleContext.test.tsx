import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ScheduleProvider, useScheduleContext } from "./ScheduleContext";

const createApiClient = () => ({
	getConfig: vi.fn(),
	getEvents: vi.fn(),
	getPersonnel: vi.fn(),
	createEvent: vi.fn(),
	updateEvent: vi.fn(),
	deleteEvent: vi.fn(),
	createGroup: vi.fn(),
	updateGroup: vi.fn(),
	deleteGroup: vi.fn(),
	createResource: vi.fn(),
	updateResource: vi.fn(),
	deleteResource: vi.fn(),
	updatePersonnelPriority: vi.fn(),
	getResourceAvailability: vi.fn(),
});

const Consumer = () => {
	const ctx = useScheduleContext();
	return (
		<div>
			<div>events:{ctx.events.length}</div>
			<div>personnel:{ctx.personnel.length}</div>
			<div>first-personnel:{ctx.personnel[0]?.name ?? "none"}</div>
			<button
				type="button"
				onClick={() =>
					ctx.createEvent({
						title: "New",
						startDate: new Date(),
						endDate: new Date(),
					})
				}
			>
				create
			</button>
			<button
				type="button"
				onClick={() => ctx.updateEvent("e1", { title: "Update" })}
			>
				update
			</button>
			<button type="button" onClick={() => ctx.deleteEvent("e1")}>
				delete
			</button>
			<button
				type="button"
				onClick={() => ctx.updatePersonnelPriority("p2", 1)}
			>
				priority
			</button>
			<button
				type="button"
				onClick={() =>
					ctx.fetchResourceAvailability(new Date("2024-01-10T00:00:00Z"))
				}
			>
				availability
			</button>
			<button
				type="button"
				onClick={() => ctx.fetchPersonnelEvents(["p1"], false)}
			>
				fetch
			</button>
			<button
				type="button"
				onClick={() => ctx.fetchPersonnelEvents(["p1"], true)}
			>
				append
			</button>
		</div>
	);
};

const BranchConsumer = () => {
	const ctx = useScheduleContext();
	return (
		<div>
			<div>personnel-events:{ctx.personnelEvents.length}</div>
			<div>error:{ctx.error ?? "none"}</div>
			<button type="button" onClick={() => ctx.fetchPersonnelEvents([], false)}>
				empty-clear
			</button>
			<button type="button" onClick={() => ctx.fetchPersonnelEvents([], true)}>
				empty-append
			</button>
			<button
				type="button"
				onClick={() =>
					ctx.fetchResourceAvailability(new Date("2024-01-10T00:00:00Z"))
				}
			>
				availability-error
			</button>
			<button
				type="button"
				onClick={() => ctx.updatePersonnelPriority("p1", 2)}
			>
				priority-error
			</button>
		</div>
	);
};

const ErrorConsumer = () => {
	const ctx = useScheduleContext();
	return <div>error:{ctx.error ?? "none"}</div>;
};

describe("ScheduleContext", () => {
	it("loads data and handles mutations", async () => {
		const apiClient = createApiClient();
		apiClient.getConfig.mockResolvedValue({
			groups: [],
			resources: [],
			settings: {
				startTime: "08:00",
				endTime: "18:00",
				weekStartsOn: 1,
				closedDays: [],
				defaultDuration: 1,
			},
		});
		apiClient.getEvents.mockResolvedValue([
			{
				id: "e1",
				resourceId: "r1",
				title: "Event",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: "e2",
				resourceId: null,
				title: "No Resource",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);
		apiClient.getPersonnel.mockResolvedValue([
			{ id: "p1", name: "Bob", priority: 0, email: "b@b.com", department: "X" },
			{
				id: "p2",
				name: "Alice",
				priority: 0,
				email: "a@a.com",
				department: "Y",
			},
		]);
		apiClient.createEvent.mockResolvedValue({
			id: "e3",
			resourceId: "r1",
			title: "Created",
		});
		apiClient.updateEvent.mockResolvedValue({
			id: "e1",
			resourceId: "r1",
			title: "Updated",
		});
		apiClient.deleteEvent.mockResolvedValue(undefined);
		apiClient.updatePersonnelPriority.mockResolvedValue({
			id: "p2",
			name: "Alice",
			priority: 1,
			email: "a@a.com",
			department: "Y",
		});
		apiClient.getResourceAvailability.mockResolvedValue([
			{ resourceId: "r1", isAvailable: true },
		]);

		const user = userEvent.setup();

		render(
			<ScheduleProvider apiClient={apiClient}>
				<Consumer />
			</ScheduleProvider>,
		);

		await waitFor(() => {
			expect(screen.getByText("events:1")).toBeInTheDocument();
		});
		expect(screen.getByText("personnel:2")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "create" }));
		await waitFor(() => {
			expect(screen.getByText("events:2")).toBeInTheDocument();
		});

		await user.click(screen.getByRole("button", { name: "update" }));
		await user.click(screen.getByRole("button", { name: "delete" }));

		await user.click(screen.getByRole("button", { name: "priority" }));
		await waitFor(() => {
			expect(screen.getByText("first-personnel:Alice")).toBeInTheDocument();
		});

		await user.click(screen.getByRole("button", { name: "availability" }));
		await user.click(screen.getByRole("button", { name: "availability" }));
		expect(apiClient.getResourceAvailability).toHaveBeenCalledTimes(1);

		await user.click(screen.getByRole("button", { name: "fetch" }));
		await user.click(screen.getByRole("button", { name: "append" }));
	});

	it("alerts when mutations fail", async () => {
		const apiClient = createApiClient();
		const alertMock = vi.fn();
		vi.stubGlobal("alert", alertMock);

		apiClient.getConfig.mockResolvedValue({
			groups: [],
			resources: [],
			settings: {
				startTime: "08:00",
				endTime: "18:00",
				weekStartsOn: 1,
				closedDays: [],
				defaultDuration: 1,
			},
		});
		apiClient.getEvents.mockResolvedValue([]);
		apiClient.getPersonnel.mockResolvedValue([]);
		apiClient.createEvent.mockRejectedValue(new Error("fail"));
		apiClient.updateEvent.mockRejectedValue(new Error("fail"));
		apiClient.deleteEvent.mockRejectedValue(new Error("fail"));

		const user = userEvent.setup();

		render(
			<ScheduleProvider apiClient={apiClient}>
				<Consumer />
			</ScheduleProvider>,
		);

		await waitFor(() => {
			expect(screen.getByText("events:0")).toBeInTheDocument();
		});

		await user.click(screen.getByRole("button", { name: "create" }));
		await user.click(screen.getByRole("button", { name: "update" }));
		await user.click(screen.getByRole("button", { name: "delete" }));

		expect(alertMock).toHaveBeenCalledTimes(3);
		vi.unstubAllGlobals();
	});

	it("covers empty personnel fetch and error branches", async () => {
		const apiClient = createApiClient();
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => { });

		apiClient.getConfig.mockResolvedValue({
			groups: [],
			resources: [],
			settings: {
				startTime: "08:00",
				endTime: "18:00",
				weekStartsOn: 1,
				closedDays: [],
				defaultDuration: 1,
			},
		});
		apiClient.getEvents.mockResolvedValue([]);
		apiClient.getPersonnel.mockResolvedValue([]);
		apiClient.getResourceAvailability.mockRejectedValue(
			new Error("availability error"),
		);
		apiClient.updatePersonnelPriority.mockRejectedValue(
			new Error("priority error"),
		);

		const user = userEvent.setup();

		render(
			<ScheduleProvider apiClient={apiClient as any}>
				<BranchConsumer />
			</ScheduleProvider>,
		);

		await waitFor(() => {
			expect(screen.getByText("personnel-events:0")).toBeInTheDocument();
		});

		await user.click(screen.getByRole("button", { name: "empty-append" }));
		await user.click(screen.getByRole("button", { name: "empty-clear" }));

		await user.click(
			screen.getByRole("button", { name: "availability-error" }),
		);
		await user.click(screen.getByRole("button", { name: "priority-error" }));

		expect(errorSpy).toHaveBeenCalled();
		errorSpy.mockRestore();
	});

	it("sets error state when initial load fails", async () => {
		const apiClient = createApiClient();
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => { });

		apiClient.getConfig.mockRejectedValue(new Error("config error"));
		apiClient.getEvents.mockResolvedValue([]);
		apiClient.getPersonnel.mockResolvedValue([]);

		render(
			<ScheduleProvider apiClient={apiClient as any}>
				<ErrorConsumer />
			</ScheduleProvider>,
		);

		await waitFor(() => {
			expect(screen.getByText("error:config error")).toBeInTheDocument();
		});

		errorSpy.mockRestore();
	});

	it("throws when useScheduleContext is used outside provider", () => {
		const BadConsumer = () => {
			useScheduleContext();
			return null;
		};

		expect(() => render(<BadConsumer />)).toThrow(
			"useScheduleContext must be used within a ScheduleProvider",
		);
	});
});
