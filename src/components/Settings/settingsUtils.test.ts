import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AppSettings } from "../../types";
import { applyThemeSettings } from "./settingsUtils";

describe("settingsUtils", () => {
	let mockElement: HTMLElement;

	beforeEach(() => {
		mockElement = document.createElement("div");
		document.body.appendChild(mockElement);
	});

	it("should apply dark theme settings", () => {
		const settings: AppSettings = {
			theme: "dark",
			density: "normal",
			borderRadius: 8,
			fontSize: 16,
			weekStartsOn: 1,
			businessHoursStart: "08:00",
			businessHoursEnd: "18:00",
			closedDays: [0],
			language: "ja",
			timeZone: "Asia/Tokyo",
			paginationEnabled: false,
			paginationPageSize: 8,
		};

		applyThemeSettings(settings, mockElement);

		expect(mockElement.style.getPropertyValue("--background")).toBe(
			"210 20% 10%",
		);
		expect(mockElement.style.getPropertyValue("--foreground")).toBe(
			"210 30% 96%",
		);
		expect(mockElement.style.getPropertyValue("--primary")).toBe("200 95% 42%");
		expect(mockElement.getAttribute("data-theme")).toBe("dark");
	});

	it("should apply light theme settings", () => {
		const settings: AppSettings = {
			theme: "light",
			density: "normal",
			borderRadius: 8,
			fontSize: 16,
			weekStartsOn: 1,
			businessHoursStart: "08:00",
			businessHoursEnd: "18:00",
			closedDays: [0],
			language: "ja",
			timeZone: "Asia/Tokyo",
			paginationEnabled: false,
			paginationPageSize: 8,
		};

		applyThemeSettings(settings, mockElement);

		expect(mockElement.style.getPropertyValue("--background")).toBe(
			"0 0% 100%",
		);
		expect(mockElement.style.getPropertyValue("--foreground")).toBe(
			"210 20% 10%",
		);
		expect(mockElement.style.getPropertyValue("--primary")).toBe("210 62% 49%");
		expect(mockElement.getAttribute("data-theme")).toBeNull();
	});

	it("should apply density attribute", () => {
		const settings: AppSettings = {
			theme: "light",
			density: "compact",
			borderRadius: 8,
			fontSize: 16,
			weekStartsOn: 1,
			businessHoursStart: "08:00",
			businessHoursEnd: "18:00",
			closedDays: [0],
			language: "ja",
			timeZone: "Asia/Tokyo",
			paginationEnabled: false,
			paginationPageSize: 8,
		};

		applyThemeSettings(settings, mockElement);

		expect(mockElement.getAttribute("data-density")).toBe("compact");
	});

	it("should apply spacious density", () => {
		const settings: AppSettings = {
			theme: "light",
			density: "spacious",
			borderRadius: 8,
			fontSize: 16,
			weekStartsOn: 1,
			businessHoursStart: "08:00",
			businessHoursEnd: "18:00",
			closedDays: [0],
			language: "ja",
			timeZone: "Asia/Tokyo",
			paginationEnabled: false,
			paginationPageSize: 8,
		};

		applyThemeSettings(settings, mockElement);

		expect(mockElement.getAttribute("data-density")).toBe("spacious");
	});

	it("should apply border radius", () => {
		const settings: AppSettings = {
			theme: "light",
			density: "normal",
			borderRadius: 12,
			fontSize: 16,
			weekStartsOn: 1,
			businessHoursStart: "08:00",
			businessHoursEnd: "18:00",
			closedDays: [0],
			language: "ja",
			timeZone: "Asia/Tokyo",
			paginationEnabled: false,
			paginationPageSize: 8,
		};

		applyThemeSettings(settings, mockElement);

		expect(mockElement.style.getPropertyValue("--radius")).toBe("12px");
	});

	it("should apply font size", () => {
		const settings: AppSettings = {
			theme: "light",
			density: "normal",
			borderRadius: 8,
			fontSize: 14,
			weekStartsOn: 1,
			businessHoursStart: "08:00",
			businessHoursEnd: "18:00",
			closedDays: [0],
			language: "ja",
			timeZone: "Asia/Tokyo",
			paginationEnabled: false,
			paginationPageSize: 8,
		};

		applyThemeSettings(settings, mockElement);

		expect(mockElement.style.getPropertyValue("--app-font-size")).toBe("14px");
		expect(mockElement.style.fontSize).toBe("14px");
	});

	it("should apply all dark theme CSS variables", () => {
		const settings: AppSettings = {
			theme: "dark",
			density: "normal",
			borderRadius: 8,
			fontSize: 16,
			weekStartsOn: 1,
			businessHoursStart: "08:00",
			businessHoursEnd: "18:00",
			closedDays: [0],
			language: "ja",
			timeZone: "Asia/Tokyo",
			paginationEnabled: false,
			paginationPageSize: 8,
		};

		applyThemeSettings(settings, mockElement);

		const expectedDarkColors = {
			"--background": "210 20% 10%",
			"--foreground": "210 30% 96%",
			"--card": "210 20% 16%",
			"--card-foreground": "210 30% 96%",
			"--popover": "210 20% 10%",
			"--popover-foreground": "210 30% 96%",
			"--primary": "200 95% 42%",
			"--primary-foreground": "210 20% 10%",
			"--secondary": "210 20% 22%",
			"--secondary-foreground": "210 30% 96%",
			"--muted": "210 20% 22%",
			"--muted-foreground": "210 15% 60%",
			"--accent": "210 85% 42%",
			"--accent-foreground": "210 30% 96%",
			"--destructive": "0 50% 55%",
			"--destructive-foreground": "0 0% 100%",
			"--border": "210 20% 30%",
			"--input": "210 20% 30%",
			"--ring": "200 95% 42%",
		};

		Object.entries(expectedDarkColors).forEach(([property, value]) => {
			expect(mockElement.style.getPropertyValue(property)).toBe(value);
		});
	});

	it("should apply all light theme CSS variables", () => {
		const settings: AppSettings = {
			theme: "light",
			density: "normal",
			borderRadius: 8,
			fontSize: 16,
			weekStartsOn: 1,
			businessHoursStart: "08:00",
			businessHoursEnd: "18:00",
			closedDays: [0],
			language: "ja",
			timeZone: "Asia/Tokyo",
			paginationEnabled: false,
			paginationPageSize: 8,
		};

		applyThemeSettings(settings, mockElement);

		const expectedLightColors = {
			"--background": "0 0% 100%",
			"--foreground": "210 20% 10%",
			"--card": "0 0% 96%",
			"--card-foreground": "210 20% 10%",
			"--popover": "0 0% 100%",
			"--popover-foreground": "210 20% 10%",
			"--primary": "210 62% 49%",
			"--primary-foreground": "220 30% 15%",
			"--secondary": "210 12% 82%",
			"--secondary-foreground": "210 20% 10%",
			"--muted": "210 12% 82%",
			"--muted-foreground": "210 10% 45%",
			"--accent": "210 12% 82%",
			"--accent-foreground": "210 20% 10%",
			"--destructive": "0 55% 60%",
			"--destructive-foreground": "0 40% 20%",
			"--border": "210 16% 60%",
			"--input": "210 16% 60%",
			"--ring": "210 62% 49%",
		};

		Object.entries(expectedLightColors).forEach(([property, value]) => {
			expect(mockElement.style.getPropertyValue(property)).toBe(value);
		});
	});

	it("should default to document.documentElement when no element provided", () => {
		const settings: AppSettings = {
			theme: "dark",
			density: "normal",
			borderRadius: 8,
			fontSize: 16,
			weekStartsOn: 1,
			businessHoursStart: "08:00",
			businessHoursEnd: "18:00",
			closedDays: [0],
			language: "ja",
			timeZone: "Asia/Tokyo",
			paginationEnabled: false,
			paginationPageSize: 8,
		};

		const originalSetProperty = document.documentElement.style.setProperty;

		const mockSetProperty = vi.fn();
		document.documentElement.style.setProperty = mockSetProperty;

		applyThemeSettings(settings);

		expect(mockSetProperty).toHaveBeenCalled();

		document.documentElement.style.setProperty = originalSetProperty;
	});
});
