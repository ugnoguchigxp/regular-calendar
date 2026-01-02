import type { AppSettings } from "../../types";

export function applyThemeSettings(
	settings: AppSettings,
	rootElement: HTMLElement = document.documentElement,
) {
	// Theme colors
	if (settings.theme === "dark") {
		rootElement.style.setProperty("--background", "210 20% 10%");
		rootElement.style.setProperty("--foreground", "210 30% 96%");
		rootElement.style.setProperty("--card", "210 20% 16%");
		rootElement.style.setProperty("--card-foreground", "210 30% 96%");
		rootElement.style.setProperty("--popover", "210 20% 10%");
		rootElement.style.setProperty("--popover-foreground", "210 30% 96%");
		rootElement.style.setProperty("--primary", "200 95% 42%");
		rootElement.style.setProperty("--primary-foreground", "210 20% 10%");
		rootElement.style.setProperty("--secondary", "210 20% 22%");
		rootElement.style.setProperty("--secondary-foreground", "210 30% 96%");
		rootElement.style.setProperty("--muted", "210 20% 22%");
		rootElement.style.setProperty("--muted-foreground", "210 15% 60%");
		rootElement.style.setProperty("--accent", "210 85% 42%");
		rootElement.style.setProperty("--accent-foreground", "210 30% 96%");
		rootElement.style.setProperty("--destructive", "0 50% 55%");
		rootElement.style.setProperty("--destructive-foreground", "0 0% 100%");
		rootElement.style.setProperty("--border", "210 20% 30%");
		rootElement.style.setProperty("--input", "210 20% 30%");
		rootElement.style.setProperty("--ring", "200 95% 42%");
		rootElement.setAttribute("data-theme", "dark");
	} else {
		// Restore light theme defaults
		rootElement.style.setProperty("--background", "0 0% 100%");
		rootElement.style.setProperty("--foreground", "210 20% 10%");
		rootElement.style.setProperty("--card", "0 0% 96%");
		rootElement.style.setProperty("--card-foreground", "210 20% 10%");
		rootElement.style.setProperty("--popover", "0 0% 100%");
		rootElement.style.setProperty("--popover-foreground", "210 20% 10%");
		rootElement.style.setProperty("--primary", "210 62% 49%");
		rootElement.style.setProperty("--primary-foreground", "220 30% 15%");
		rootElement.style.setProperty("--secondary", "210 12% 82%");
		rootElement.style.setProperty("--secondary-foreground", "210 20% 10%");
		rootElement.style.setProperty("--muted", "210 12% 82%");
		rootElement.style.setProperty("--muted-foreground", "210 10% 45%");
		rootElement.style.setProperty("--accent", "210 12% 82%");
		rootElement.style.setProperty("--accent-foreground", "210 20% 10%");
		rootElement.style.setProperty("--destructive", "0 55% 60%");
		rootElement.style.setProperty("--destructive-foreground", "0 40% 20%");
		rootElement.style.setProperty("--border", "210 16% 60%");
		rootElement.style.setProperty("--input", "210 16% 60%");
		rootElement.style.setProperty("--ring", "210 62% 49%");
		rootElement.removeAttribute("data-theme");
	}

	// Density
	rootElement.setAttribute("data-density", settings.density);

	// Border radius
	rootElement.style.setProperty("--radius", `${settings.borderRadius}px`);

	// Font size
	rootElement.style.setProperty("--app-font-size", `${settings.fontSize}px`);
	rootElement.style.fontSize = `${settings.fontSize}px`;
}
