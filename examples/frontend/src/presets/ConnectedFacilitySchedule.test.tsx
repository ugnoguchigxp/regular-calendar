import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConnectedFacilitySchedule } from "./ConnectedFacilitySchedule";
import { ScheduleProvider } from "regular-calendar";
import { I18nextProvider, initReactI18next } from "react-i18next";
import i18next from "i18next";

// Mock utilities but NOT regular-calendar main export
const mockTransform = vi.fn();
vi.mock("./utils/transformBookings", () => ({
	transformBookingsToEvents: (..._args: unknown[]) => mockTransform(),
}));

// Setup dummy i18n instance
const i18n = i18next.createInstance();
i18n.use(initReactI18next).init({
	lng: 'en',
	resources: {
		en: {
			translation: {}
		}
	}
});

describe("ConnectedFacilitySchedule", () => {
	beforeEach(() => {
		mockTransform.mockReturnValue([]);
	});

	it("fetches availability on mount", async () => {
		const fetchResourceAvailability = vi.fn().mockResolvedValue([]);
		const mockApiClient = {
			getEvents: vi.fn().mockResolvedValue([]),
			getConfig: vi.fn().mockResolvedValue({
				groups: [{ id: "g1", name: "Group 1" }],
				resources: [{ id: "r1", name: "Resource 1", groupId: "g1" }],
				settings: {},
			}),
			getSettings: vi.fn(),
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
			// Used by ScheduleContext (internal name fetchResourceAvailability, public API getResourceAvailability?)
			// ScheduleProvider calls apiClient.getResourceAvailability
			getResourceAvailability: fetchResourceAvailability,
			// Also keep fetchResourceAvailability if ScheduleContext uses it directly? No, it uses getResourceAvailability.
			fetchResourceAvailability,
			fetchPersonnelEvents: vi.fn(),
			getPersonnel: vi.fn().mockResolvedValue([]),
			getGroups: vi.fn().mockResolvedValue([]),
			getResources: vi.fn().mockResolvedValue([]),
		};

		await act(async () => {
			render(
				<I18nextProvider i18n={i18n}>
					<ScheduleProvider apiClient={mockApiClient as any}>
						<ConnectedFacilitySchedule
							settings={{
								weekStartsOn: 1,
								businessHoursStart: "08:00",
								businessHoursEnd: "18:00",
							}}
						/>
					</ScheduleProvider>
				</I18nextProvider>
			);
			await Promise.resolve();
		});

		// Select group to trigger fetch
		const user = userEvent.setup();
		await user.click(screen.getByText("Select Group"));
		await user.click(screen.getByText("Group 1"));

		await waitFor(() => {
			expect(fetchResourceAvailability).toHaveBeenCalled();
		});
	});
});
