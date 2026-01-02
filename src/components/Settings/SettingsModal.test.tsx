import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AppSettings } from "../../types";
import { SettingsModal } from "./SettingsModal";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

describe("SettingsModal", () => {
	const mockSettings: AppSettings = {
		language: "ja",
		theme: "light",
		density: "normal",
		fontSize: 14,
		borderRadius: 8,
		weekStartsOn: 0,
		businessHoursStart: "09:00",
		businessHoursEnd: "18:00",
		closedDays: [0, 6],
		timeZone: "Asia/Tokyo",
	};

	const mockOnUpdateSettings = vi.fn();
	const mockOnClose = vi.fn();
	const mockOnResetSettings = vi.fn();

	it("does not render when isOpen is false", () => {
		render(
			<SettingsModal
				isOpen={false}
				onClose={mockOnClose}
				settings={mockSettings}
				onUpdateSettings={mockOnUpdateSettings}
			/>,
		);

		expect(screen.queryByText("settings_title")).not.toBeInTheDocument();
	});

	it("renders when isOpen is true", () => {
		render(
			<SettingsModal
				isOpen={true}
				onClose={mockOnClose}
				settings={mockSettings}
				onUpdateSettings={mockOnUpdateSettings}
			/>,
		);

		expect(screen.getByText("settings_title")).toBeInTheDocument();
	});

	it("calls onClose when clicking overlay", () => {
		render(
			<SettingsModal
				isOpen={true}
				onClose={mockOnClose}
				settings={mockSettings}
				onUpdateSettings={mockOnUpdateSettings}
			/>,
		);

		const overlay = document.querySelector("button[aria-label]");
		if (!overlay) throw new Error("Overlay not found");
		fireEvent.click(overlay);
		expect(mockOnClose).toHaveBeenCalled();
	});

	it("calls onClose when clicking close button", () => {
		render(
			<SettingsModal
				isOpen={true}
				onClose={mockOnClose}
				settings={mockSettings}
				onUpdateSettings={mockOnUpdateSettings}
			/>,
		);

		const closeButton = screen.getByText("✕").closest("button");
		if (!closeButton) throw new Error("Close button not found");
		fireEvent.click(closeButton);
		expect(mockOnClose).toHaveBeenCalled();
	});

	it("calls onUpdateSettings when changing language", () => {
		render(
			<SettingsModal
				isOpen={true}
				onClose={mockOnClose}
				settings={mockSettings}
				onUpdateSettings={mockOnUpdateSettings}
			/>,
		);

		const englishButton = screen.getByText("English");
		fireEvent.click(englishButton);
		expect(mockOnUpdateSettings).toHaveBeenCalledWith({ language: "en" });
	});

	it("calls onUpdateSettings when changing theme", () => {
		render(
			<SettingsModal
				isOpen={true}
				onClose={mockOnClose}
				settings={mockSettings}
				onUpdateSettings={mockOnUpdateSettings}
			/>,
		);

		const darkButton = screen.getByText("option_dark");
		fireEvent.click(darkButton);
		expect(mockOnUpdateSettings).toHaveBeenCalledWith({ theme: "dark" });
	});

	it("calls onUpdateSettings when changing density", () => {
		render(
			<SettingsModal
				isOpen={true}
				onClose={mockOnClose}
				settings={mockSettings}
				onUpdateSettings={mockOnUpdateSettings}
			/>,
		);

		const compactButton = screen.getByText("option_compact");
		fireEvent.click(compactButton);
		expect(mockOnUpdateSettings).toHaveBeenCalledWith({ density: "compact" });
	});

	it("calls onUpdateSettings when toggling closed days", () => {
		render(
			<SettingsModal
				isOpen={true}
				onClose={mockOnClose}
				settings={mockSettings}
				onUpdateSettings={mockOnUpdateSettings}
			/>,
		);

		const sundayButton = screen.getByText("days_short_sun").closest("button");
		if (!sundayButton) throw new Error("Sunday button not found");
		fireEvent.click(sundayButton);
		expect(mockOnUpdateSettings).toHaveBeenCalledWith({ closedDays: [6] });
	});

	it("renders reset button when onResetSettings is provided", () => {
		render(
			<SettingsModal
				isOpen={true}
				onClose={mockOnClose}
				settings={mockSettings}
				onUpdateSettings={mockOnUpdateSettings}
				onResetSettings={mockOnResetSettings}
			/>,
		);

		expect(screen.getByText("Reset All Settings")).toBeInTheDocument();
	});

	it("does not render reset button when onResetSettings is not provided", () => {
		render(
			<SettingsModal
				isOpen={true}
				onClose={mockOnClose}
				settings={mockSettings}
				onUpdateSettings={mockOnUpdateSettings}
			/>,
		);

		expect(screen.queryByText("Reset All Settings")).not.toBeInTheDocument();
	});

	it("calls onResetSettings when clicking reset button", () => {
		render(
			<SettingsModal
				isOpen={true}
				onClose={mockOnClose}
				settings={mockSettings}
				onUpdateSettings={mockOnUpdateSettings}
				onResetSettings={mockOnResetSettings}
			/>,
		);

		const resetButton = screen
			.getByText("Reset All Settings")
			.closest("button");
		if (!resetButton) throw new Error("Reset button not found");
		fireEvent.click(resetButton);
		expect(mockOnResetSettings).toHaveBeenCalled();
	});
});
