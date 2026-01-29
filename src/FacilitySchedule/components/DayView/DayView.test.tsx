import { render, screen } from "@testing-library/react";
import { DayView } from "./DayView";

const settings = {
	defaultDuration: 1,
	startTime: "08:00",
	endTime: "10:00",
	closedDays: [],
	weekStartsOn: 0 as const,
};

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

const events = [
	{
		id: "e1",
		resourceId: "r1",
		groupId: "g1",
		title: "Checkup",
		attendee: "Patient A",
		startDate: new Date("2024-01-10T08:00:00"),
		endDate: new Date("2024-01-10T09:00:00"),
		status: "booked",
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

describe("DayView", () => {
	it("renders resource columns and events", () => {
		render(
			<DayView
				currentDate={new Date("2024-01-10T00:00:00Z")}
				resources={resources}
				events={events}
				settings={settings}
			/>,
		);

		expect(screen.getByText("Room 1")).toBeInTheDocument();
		expect(screen.getAllByText("Checkup").length).toBeGreaterThan(0);
	});

	it("renders vertical orientation with grouped resources", () => {
		const groupedResources = [
			{
				id: "r1",
				name: "Room 1",
				order: 1,
				isAvailable: true,
				groupId: "g1",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: "r2",
				name: "Room 2",
				order: 2,
				isAvailable: true,
				groupId: "g2",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		];

		const groups = [
			{
				id: "g1",
				name: "Group A",
				displayMode: "grid" as const,
				dimension: 1,
				resources: [groupedResources[0]],
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: "g2",
				name: "Group B",
				displayMode: "grid" as const,
				dimension: 1,
				resources: [groupedResources[1]],
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		];

		render(
			<DayView
				currentDate={new Date("2024-01-10T00:00:00Z")}
				resources={groupedResources}
				events={events}
				settings={{ ...settings, orientation: "vertical" }}
				groups={groups}
			/>,
		);

		expect(screen.getByText("Group A")).toBeInTheDocument();
		expect(screen.getByText("Group B")).toBeInTheDocument();
		expect(screen.getByText("Room 1")).toBeInTheDocument();
		expect(screen.getByText("Room 2")).toBeInTheDocument();
	});

	it("renders horizontal orientation with all-day events", () => {
		const allDayEvent = {
			...events[0],
			id: "e2",
			title: "All Day",
			isAllDay: true,
			startDate: new Date("2024-01-10T00:00:00"),
			endDate: new Date("2024-01-10T23:59:00"),
		};

		const groups = [
			{
				id: "g1",
				name: "Group A",
				displayMode: "grid" as const,
				dimension: 1,
				resources,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		];

		render(
			<DayView
				currentDate={new Date("2024-01-10T00:00:00Z")}
				resources={resources}
				events={[...events, allDayEvent]}
				settings={{ ...settings, orientation: "horizontal" }}
				groups={groups}
			/>,
		);

		expect(screen.getByText("Group A")).toBeInTheDocument();
		expect(screen.getAllByText("All Day").length).toBeGreaterThan(0);
	});
});
