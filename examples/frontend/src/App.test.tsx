import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { useTranslation } from "react-i18next";
import { useSettings as useMockSettings } from "./useSettings";
import {
	useScheduleContext as useMockScheduleApi,
} from "./presets/ScheduleContext";


vi.mock("react-i18next", () => ({
	useTranslation: vi.fn(),
}));

vi.mock("./useSettings", () => ({
	useSettings: vi.fn(),
}));

vi.mock("./presets/ConnectedFacilitySchedule", () => ({
	ConnectedFacilitySchedule: vi.fn(() => (
		<div data-testid="facility-schedule">Facility Schedule</div>
	)),
}));

vi.mock("./presets/ConnectedCalendar", () => ({
	ConnectedCalendar: vi.fn(() => (
		<div data-testid="connected-calendar">Calendar</div>
	)),
}));

vi.mock("regular-calendar", () => ({
	ConnectedCalendar: vi.fn(() => (
		<div data-testid="connected-calendar">Calendar</div>
	)),
	Button: vi.fn(({ children, ...props }: any) => (
		<button {...props}>{children}</button>
	)),
	ScheduleProvider: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	SettingsModal: vi.fn(
		({ isOpen, onClose, onUpdateSettings, onResetSettings }: any) =>
			isOpen ? (
				<div data-testid="settings-modal">
					<button onClick={onClose}>Close</button>
					<button onClick={() => onUpdateSettings({ theme: "dark" as const })}>
						Update
					</button>
					<button onClick={onResetSettings}>Reset</button>
				</div>
			) : null,
	),
	FacilityStructureSettings: vi.fn(({ onClose }: any) => (
		<div data-testid="facility-settings-modal">
			<button onClick={onClose}>Close</button>
		</div>
	)),
	PersonnelPanel: vi.fn(() => (
		<div data-testid="personnel-panel">Personnel Panel</div>
	)),
	ResizablePanel: vi.fn(({ children }: any) => (
		<div data-testid="resizable-panel">{children}</div>
	)),
	getPersonnelColor: vi.fn((index: number) => `color-${index}`),
	useScheduleContext: vi.fn(),
}));

describe("App", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useTranslation).mockReturnValue({
			t: ((k: string) => k) as any,
			i18n: { language: "en", changeLanguage: vi.fn() } as any,
			ready: true,
		} as any);
		vi.mocked(useMockSettings).mockReturnValue({
			settings: {
				theme: "light",
				density: "normal",
				borderRadius: 8,
				fontSize: 14,
				weekStartsOn: 0,
				businessHoursStart: "09:00",
				businessHoursEnd: "18:00",
				closedDays: [],
				language: "en",
				timeZone: "UTC",
			},
			updateSettings: vi.fn(),
			resetSettings: vi.fn(),
		});
		vi.mocked(useMockScheduleApi).mockReturnValue({
			events: [],
			resources: [],
			groups: [],
			settings: null,
			loading: false,
			error: null,
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
			fetchResourceAvailability: vi.fn(),
			fetchPersonnelEvents: vi.fn(),
			personnel: [],
			personnelEvents: [],
			getResourceAvailabilityFromCache: vi.fn(),
		});
	});

	it("アプリケーションタイトルが表示されること", () => {
		render(<App />);

		expect(screen.getByText("app_title")).toBeInTheDocument();
	});

	it("デフォルトで「通常カレンダー」タブが選択されていること", () => {
		render(<App />);

		const regularButton = screen.getByRole("button", {
			name: /app_header_regular_calendar/i,
		});
		expect(regularButton).toHaveClass("cursor-pointer");
	});

	it("「施設スケジュール」タブをクリックすると施設スケジュールが表示されること", async () => {
		const user = userEvent.setup();
		render(<App />);

		const facilityButton = screen.getByRole("button", {
			name: /app_header_facility_schedule/i,
		});
		await user.click(facilityButton);

		expect(screen.getByTestId("facility-schedule")).toBeInTheDocument();
	});

	it("「通常カレンダー」タブをクリックするとカレンダーが表示されること", async () => {
		const user = userEvent.setup();
		render(<App />);

		const facilityButton = screen.getByRole("button", {
			name: /app_header_facility_schedule/i,
		});
		await user.click(facilityButton);

		const regularButton = screen.getByRole("button", {
			name: /app_header_regular_calendar/i,
		});
		await user.click(regularButton);

		expect(screen.getByTestId("connected-calendar")).toBeInTheDocument();
	});

	it("設定ボタンをクリックすると設定モーダルが表示されること", async () => {
		const user = userEvent.setup();
		render(<App />);

		const settingsButton = screen.getByRole("button", { name: /⚙️/i });
		await user.click(settingsButton);

		expect(screen.getByTestId("settings-modal")).toBeInTheDocument();
	});

	it("設定モーダルの閉じるボタンをクリックするとモーダルが閉じること", async () => {
		const user = userEvent.setup();
		render(<App />);

		const settingsButton = screen.getByRole("button", { name: /⚙️/i });
		await user.click(settingsButton);

		const closeButton = screen.getByRole("button", { name: "Close" });
		await user.click(closeButton);

		expect(screen.queryByTestId("settings-modal")).not.toBeInTheDocument();
	});

	it("「施設構造」ボタンをクリックすると施設構造モーダルが表示されること", async () => {
		const user = userEvent.setup();
		render(<App />);

		const facilityStructureButton = screen.getByRole("button", {
			name: /app_header_facility_structure/i,
		});
		await user.click(facilityStructureButton);

		expect(screen.getByTestId("facility-settings-modal")).toBeInTheDocument();
	});

	it("施設構造モーダルの閉じるボタンをクリックするとモーダルが閉じること", async () => {
		const user = userEvent.setup();
		render(<App />);

		const facilityStructureButton = screen.getByRole("button", {
			name: /app_header_facility_structure/i,
		});
		await user.click(facilityStructureButton);

		const closeButton = screen.getByRole("button", { name: "Close" });
		await user.click(closeButton);

		expect(
			screen.queryByTestId("facility-settings-modal"),
		).not.toBeInTheDocument();
	});

	it("通常カレンダータブが選択されている場合、PersonnelPanelが表示されること", () => {
		render(<App />);

		expect(screen.getByTestId("personnel-panel")).toBeInTheDocument();
		expect(screen.getByTestId("resizable-panel")).toBeInTheDocument();
	});

	it("施設スケジュールタブが選択されている場合、PersonnelPanelが表示されないこと", async () => {
		const user = userEvent.setup();
		render(<App />);

		const facilityButton = screen.getByRole("button", {
			name: /app_header_facility_schedule/i,
		});
		await user.click(facilityButton);

		expect(screen.queryByTestId("personnel-panel")).not.toBeInTheDocument();
	});

	it("SettingsModalに正しいpropsが渡されること", async () => {
		const user = userEvent.setup();
		render(<App />);

		const settingsButton = screen.getByRole("button", { name: /⚙️/i });
		await user.click(settingsButton);

		expect(screen.getByTestId("settings-modal")).toBeInTheDocument();
	});

	it("FacilityStructureSettingsに正しいpropsが渡されること", async () => {
		const user = userEvent.setup();
		render(<App />);

		const facilityStructureButton = screen.getByRole("button", {
			name: /app_header_facility_structure/i,
		});
		await user.click(facilityStructureButton);

		expect(screen.getByTestId("facility-settings-modal")).toBeInTheDocument();
	});
});
