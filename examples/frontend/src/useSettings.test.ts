import { renderHook, act } from "@testing-library/react";
import { useSettings } from "./useSettings";
import {
	useSettings as useLibrarySettings,
	type AppSettings,
} from "./presets/useSettings";
import i18n from "./i18n";

vi.mock("regular-calendar", () => ({
	useSettings: vi.fn(),
}));

vi.mock("./i18n", () => ({
	default: {
		language: "en",
		changeLanguage: vi.fn(),
	},
}));

describe("useSettings", () => {
	const mockLibrarySettings = {
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

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useLibrarySettings).mockReturnValue({
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
	});

	it("ライブラリのuseSettingsを呼び出し、その結果を返すこと", () => {
		const { result } = renderHook(() => useSettings());

		expect(useLibrarySettings).toHaveBeenCalledTimes(1);
		expect(useLibrarySettings).toHaveBeenCalledWith({
			onLanguageChange: expect.any(Function),
		});
		expect(result.current).toEqual(mockLibrarySettings);
	});

	it("onLanguageChangeコールバックがi18nの言語を変更すること", () => {
		renderHook(() => useSettings());

		const onLanguageChange = (useLibrarySettings as any).mock.calls[0]?.[0]
			?.onLanguageChange;

		act(() => {
			onLanguageChange?.("ja");
		});

		expect(i18n.changeLanguage).toHaveBeenCalledWith("ja");
	});

	it("言語が同じ場合、i18n.changeLanguageを呼ばないこと", () => {
		(i18n as any).language = "en";

		renderHook(() => useSettings());

		const onLanguageChange = (useLibrarySettings as any).mock.calls[0]?.[0]
			?.onLanguageChange;

		act(() => {
			onLanguageChange?.("en");
		});

		expect(i18n.changeLanguage).not.toHaveBeenCalled();
	});

	it("updateSettingsが正しく渡されること", () => {
		const { result } = renderHook(() => useSettings());

		act(() => {
			result.current.updateSettings({ theme: "dark" });
		});

		expect(mockLibrarySettings.updateSettings).toHaveBeenCalledWith({
			theme: "dark",
		});
	});

	it("resetSettingsが正しく渡されること", () => {
		const { result } = renderHook(() => useSettings());

		act(() => {
			result.current.resetSettings();
		});

		expect(mockLibrarySettings.resetSettings).toHaveBeenCalled();
	});
});
