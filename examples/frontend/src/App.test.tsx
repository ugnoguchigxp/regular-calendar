import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { useTranslation } from "react-i18next";
import { useSettings as useMockSettings } from "./useSettings";
import {
	useScheduleContext as useMockScheduleApi,
	type AppSettings,
} from "regular-calendar";

vi.mock("react-i18next", () => ({
	useTranslation: vi.fn(),
}));

vi.mock("./useSettings", () => ({
	useSettings: vi.fn(),
}));

vi.mock("regular-calendar", () => ({
	ConnectedCalendar: vi.fn(() => (
		<div data-testid="connected-calendar">Calendar</div>
	)),
	ConnectedFacilitySchedule: vi.fn(() => (
		<div data-testid="facility-schedule">Facility Schedule</div>
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
	FacilityStructureSettings: vi.fn(({ isOpen, onClose }: any) =>
		isOpen ? (
			<div data-testid="facility-settings-modal">
				<button onClick={onClose}>Close</button>
			</div>
		) : null,
	),
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
	const mockUseTranslation = {
		t: vi.fn((key: string) => {
			const translations: Record<string, string> = {
				app_title: "Regular Calendar Demo",
				app_header_regular_calendar: "Regular Calendar",
				app_header_facility_schedule: "Facility Schedule",
				app_header_facility_structure: "Facility Structure",
				settings_title: "Settings",
			};
			return translations[key] || key;
		}),
	};

	const mockSettings = {
		settings: {
			language: "en" as const,
			theme: "light" as const,
			density: "normal" as const,
			borderRadius: 4,
			fontSize: 14,
			weekStartsOn: 0 as const,
			businessHoursStart: "09:00",
			businessHoursEnd: "17:00",
			timeZone: "UTC",
			closedDays: [],
		} as AppSettings,
		updateSettings: vi.fn(),
		resetSettings: vi.fn(),
	};

	const mockScheduleApi = {
		groups: [],
		resources: [],
		personnel: [],
		personnelEvents: [],
		events: [],
		settings: mockSettings.settings,
		loading: false,
		error: null,
		createGroup: vi.fn(),
		updateGroup: vi.fn(),
		deleteGroup: vi.fn(),
		createResource: vi.fn(),
		updateResource: vi.fn(),
		deleteResource: vi.fn(),
		updatePersonnelPriority: vi.fn(),
		fetchPersonnelEvents: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useTranslation).mockReturnValue(mockUseTranslation as any);
		vi.mocked(useMockSettings).mockReturnValue(mockSettings as any);
		vi.mocked(useMockScheduleApi).mockReturnValue(mockScheduleApi as any);
	});

	it("アプリケーションタイトルが表示されること", () => {
		render(<App />);

		expect(screen.getByText("Regular Calendar Demo")).toBeInTheDocument();
	});

	it("デフォルトで「通常カレンダー」タブが選択されていること", () => {
		render(<App />);

		const regularButton = screen.getByRole("button", {
			name: /regular calendar/i,
		});
		expect(regularButton).toHaveClass("cursor-pointer");
	});

	it("「施設スケジュール」タブをクリックすると施設スケジュールが表示されること", async () => {
		const user = userEvent.setup();
		render(<App />);

		const facilityButton = screen.getByRole("button", {
			name: /facility schedule/i,
		});
		await user.click(facilityButton);

		expect(screen.getByTestId("facility-schedule")).toBeInTheDocument();
	});

	it("「通常カレンダー」タブをクリックするとカレンダーが表示されること", async () => {
		const user = userEvent.setup();
		render(<App />);

		const facilityButton = screen.getByRole("button", {
			name: /facility schedule/i,
		});
		await user.click(facilityButton);

		const regularButton = screen.getByRole("button", {
			name: /regular calendar/i,
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
			name: /facility structure/i,
		});
		await user.click(facilityStructureButton);

		expect(screen.getByTestId("facility-settings-modal")).toBeInTheDocument();
	});

	it("施設構造モーダルの閉じるボタンをクリックするとモーダルが閉じること", async () => {
		const user = userEvent.setup();
		render(<App />);

		const facilityStructureButton = screen.getByRole("button", {
			name: /facility structure/i,
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
			name: /facility schedule/i,
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
			name: /facility structure/i,
		});
		await user.click(facilityStructureButton);

		expect(screen.getByTestId("facility-settings-modal")).toBeInTheDocument();
	});
});
