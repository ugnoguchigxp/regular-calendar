import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: {
			changeLanguage: vi.fn(),
		},
	}),
	initReactI18next: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserverMock {
	observe() {}
	unobserve() {}
	disconnect() {}
};

// Mock specific window/document methods if needed
window.matchMedia =
	window.matchMedia ||
	(() => ({
		matches: false,
		addListener: () => {},
		removeListener: () => {},
	}));
