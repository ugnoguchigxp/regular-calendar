export {
	useScheduleContext,
} from "regular-calendar";

import { ScheduleProvider as PackageScheduleProvider } from "regular-calendar";
import { createScheduleApiClient } from "./api";

const defaultApiClient = createScheduleApiClient("/api");

export const AppScheduleProvider = ({
	children,
	apiClient = defaultApiClient,
}: any) => {
	const onError = (err: Error) => {
		if (typeof alert === "function") {
			alert(err.message);
		}
	};

	return (
		<PackageScheduleProvider apiClient={apiClient} onError={onError}>
			{children}
		</PackageScheduleProvider>
	);
};

export type {
	ScheduleContextType,
	ScheduleProviderProps,
} from "regular-calendar";
