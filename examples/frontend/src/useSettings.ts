import { useSettings as useLibrarySettings } from "./presets/useSettings";
import i18n from "./i18n";

export type { AppSettings } from "./presets/useSettings";

export function useSettings() {
	return useLibrarySettings({
		onLanguageChange: (language) => {
			if (i18n.language !== language) {
				i18n.changeLanguage(language);
			}
		},
	});
}
