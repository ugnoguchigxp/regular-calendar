import { describe, expect, it, vi } from "vitest";
import { DOMThemeApplier, MockThemeApplier } from "./ThemeApplier";

const fullConfig = {
	density: "compact",
	tabletMode: true,
	radius: 0.5,
	fontSize: 0.875,
	componentHeight: 2.5,
	listRowHeight: 2,
	paddingX: 1,
	paddingY: 0.5,
	gap: 0.75,
	iconSize: 1,
	modalPadding: 1.25,
	checkboxSize: 1,
	buttonPaddingX: 0.75,
	buttonPaddingY: 0.5,
	badgePaddingX: 0.5,
	badgePaddingY: 0.25,
	cardPadding: 1,
	drawerWidthLeft: 240,
	drawerWidthRight: 280,
	stepCircleSize: 1.25,
	switchWidth: 2.5,
	switchHeight: 1.5,
	switchThumbSize: 1.25,
	keypadButtonHeight: 3,
};

describe("ThemeApplier", () => {
	it("applies and removes CSS variables in the DOM", () => {
		const applier = new DOMThemeApplier();
		const setSpy = vi.spyOn(document.documentElement.style, "setProperty");
		const removeSpy = vi.spyOn(
			document.documentElement.style,
			"removeProperty",
		);

		applier.applyVariables(fullConfig);
		applier.removeVariables();

		expect(setSpy).toHaveBeenCalledWith("--ui-density", "compact");
		expect(setSpy).toHaveBeenCalledWith("--drawer-width-left", "240px");
		expect(removeSpy).toHaveBeenCalledWith("--ui-density");
		expect(removeSpy).toHaveBeenCalledWith("--drawer-width-right");

		setSpy.mockRestore();
		removeSpy.mockRestore();
	});

	it("bails out when window is unavailable", () => {
		const applier = new DOMThemeApplier();
		const globalWithWindow = globalThis as typeof globalThis & {
			window?: Window;
		};
		const originalWindow = globalWithWindow.window;

		globalWithWindow.window = undefined;

		expect(() => applier.applyVariables({ density: "compact" })).not.toThrow();
		expect(() => applier.removeVariables()).not.toThrow();

		globalWithWindow.window = originalWindow;
	});

	it("tracks applied config in mock applier", () => {
		const applier = new MockThemeApplier();

		applier.applyVariables({ density: "normal" });
		expect(applier.appliedConfig).toEqual({ density: "normal" });

		applier.removeVariables();
		expect(applier.appliedConfig).toBeUndefined();

		applier.applyVariables({ density: "compact" });
		applier.reset();
		expect(applier.appliedConfig).toBeUndefined();
	});
});
