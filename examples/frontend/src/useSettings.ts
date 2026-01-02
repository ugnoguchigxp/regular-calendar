import { useSettings as useLibrarySettings } from "regular-calendar";
import i18n from "./i18n";

export type { AppSettings } from "regular-calendar";

export function useSettings() {
	return useLibrarySettings({
		onLanguageChange: (language) => {
			if (i18n.language !== language) {
				i18n.changeLanguage(language);
			}
		},
	});
}
