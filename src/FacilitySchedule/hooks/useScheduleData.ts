import { useMemo } from "react";
import type {
	Resource,
	ResourceGroup,
	ScheduleEvent,
} from "../FacilitySchedule.schema";

interface UseScheduleDataOptions {
	events: ScheduleEvent[];
	resources: Resource[];
	groups: ResourceGroup[];
	selectedGroupId: string | null;
}

export function useScheduleData({
	events,
	resources,
	groups,
	selectedGroupId,
}: UseScheduleDataOptions) {
	// If selectedGroupId is "ALL", allow it. Otherwise default to first group if null.
	const effectiveGroupId = useMemo(
		() => selectedGroupId ?? groups[0]?.id ?? null,
		[selectedGroupId, groups],
	);

	const filteredResources = useMemo(() => {
		if (effectiveGroupId === "ALL") {
			// Sort resources by filtered groups order or just by groupId to keep them together
			return [...resources].sort((a, b) => {
				// We might want to sort by group order if groups array has an order
				const groupAIndex = groups.findIndex(g => g.id === a.groupId);
				const groupBIndex = groups.findIndex(g => g.id === b.groupId);
				if (groupAIndex !== groupBIndex) return groupAIndex - groupBIndex;
				return 0;
			});
		}
		return effectiveGroupId
			? resources.filter((r) => r.groupId === effectiveGroupId)
			: resources;
	}, [resources, effectiveGroupId, groups]);

	const filteredEvents = useMemo(() => {
		if (effectiveGroupId === "ALL") return events;

		return effectiveGroupId
			? events.filter((e) => e.groupId === effectiveGroupId)
			: events;
	}, [events, effectiveGroupId]);

	return {
		effectiveGroupId,
		filteredResources,
		filteredEvents,
	};
}
