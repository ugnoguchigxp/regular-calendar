import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
	ConnectedCalendar,
	ConnectedFacilitySchedule,
	ScheduleProvider,
	useScheduleContext as useScheduleApi,
	SettingsModal,
	FacilityStructureSettings,
	PersonnelPanel,
	ResizablePanel,
	getPersonnelColor,
} from "regular-calendar";
import { useSettings } from "./useSettings";
import { Button } from "@/components/ui/Button";

import "./index.css";

// Demo: "Me" is the first personnel (p1)
const MY_PERSONNEL_ID = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";

function AppContent() {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState<"facility" | "regular">("regular");
	const { settings, updateSettings, resetSettings } = useSettings();
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [isFacilitySettingsOpen, setIsFacilitySettingsOpen] = useState(false);
	const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<string[]>(
		[],
	);

	const {
		groups,
		resources,
		personnel,
		personnelEvents,
		createGroup,
		updateGroup,
		deleteGroup,
		createResource,
		updateResource,
		deleteResource,
		updatePersonnelPriority,
		fetchPersonnelEvents,
	} = useScheduleApi();

	// Track which personnel IDs we have already fetched
	const [fetchedPersonnelIds, setFetchedPersonnelIds] = useState<Set<string>>(
		new Set(),
	);

	// "Me" + selected personnel IDs for display
	const visiblePersonnelIds = useMemo(() => {
		const ids = new Set([MY_PERSONNEL_ID, ...selectedPersonnelIds]);
		return Array.from(ids);
	}, [selectedPersonnelIds]);

	// Fetch only NEW personnel events (diff fetch)
	useEffect(() => {
		const newIds = visiblePersonnelIds.filter(
			(id) => !fetchedPersonnelIds.has(id),
		);

		if (newIds.length > 0) {
			// Fetch only the new personnel's events
			fetchPersonnelEvents(newIds, true); // true = append mode
			setFetchedPersonnelIds((prev) => {
				const updated = new Set(prev);
				newIds.forEach((id) => updated.add(id));
				return updated;
			});
		}
		// When removing personnel, we don't fetch - just filter in coloredPersonnelEvents
	}, [visiblePersonnelIds, fetchedPersonnelIds, fetchPersonnelEvents]);

	// Create color map: "me" gets first color, then selected personnel
	const personnelColorMap = useMemo(() => {
		const map = new Map<string, string>();
		// "Me" always gets the first color
		map.set(MY_PERSONNEL_ID, getPersonnelColor(0));
		// Other selected personnel get subsequent colors
		selectedPersonnelIds.forEach((id, index) => {
			if (id !== MY_PERSONNEL_ID) {
				map.set(id, getPersonnelColor(index + 1));
			}
		});
		return map;
	}, [selectedPersonnelIds]);

	// Filter and color personnel events based on visible personnel
	const coloredPersonnelEvents = useMemo(() => {
		// Filter to only show visible personnel's events
		const visibleSet = new Set(visiblePersonnelIds);

		return personnelEvents.flatMap((event) => {
			const matches: { personnelId: string; color: string }[] = [];

			// Check parsed attendee list for visible personnel
			try {
				if (event.attendee && event.attendee !== "[]") {
					const attendees = JSON.parse(event.attendee);
					if (Array.isArray(attendees)) {
						attendees.forEach((a: any) => {
							if (a.personnelId && visibleSet.has(a.personnelId)) {
								const color = personnelColorMap.get(a.personnelId);
								if (color) {
									matches.push({ personnelId: a.personnelId, color });
								}
							}
						});
					}
				}
			} catch {} // ignore parse error

			// Fallback to legacy extendedProps if no matches found in attendees
			if (matches.length === 0) {
				const personnelId = event.extendedProps?.personnelId;
				if (personnelId && visibleSet.has(personnelId)) {
					const color = personnelColorMap.get(personnelId);
					if (color) {
						matches.push({ personnelId, color });
					}
				}
			}

			// Return exploded events (one per visible attendee)
			return matches.map((match) => ({
				...event,
				// Make ID unique for Rendering/DndKit (OriginalID + PersonnelID)
				id: `${event.id}_${match.personnelId}`,
				color: match.color,
				extendedProps: {
					...event.extendedProps,
					// Store real ID to be restored on click/edit
					realId: event.id,
				},
			}));
		});
	}, [personnelEvents, visiblePersonnelIds, personnelColorMap]);

	return (
		<div className="h-screen flex flex-col bg-background text-foreground">
			<nav className="p-4 border-b border-border flex gap-4 items-center">
				<h2 className="m-0 mr-4 text-lg font-bold">{t("app_title")}</h2>

				<Button
					onClick={() => setActiveTab("facility")}
					variant={activeTab === "facility" ? "default" : "ghost"}
					className="cursor-pointer"
				>
					{t("app_header_facility_schedule")}
				</Button>

				<Button
					onClick={() => setActiveTab("regular")}
					variant={activeTab === "regular" ? "default" : "ghost"}
					className="cursor-pointer"
				>
					{t("app_header_regular_calendar")}
				</Button>

				<div className="flex-1" />

				<Button
					variant="outline"
					onClick={() => setIsFacilitySettingsOpen(true)}
				>
					{t("app_header_facility_structure")}
				</Button>

				<Button
					variant="ghost"
					size="icon"
					onClick={() => setIsSettingsOpen(true)}
					title={t("settings_title")}
				>
					⚙️
				</Button>
			</nav>

			<div className="flex-1 overflow-hidden flex">
				{/* Left: PersonnelPanel - Desktop only, Resizable */}
				{activeTab === "regular" && (
					<ResizablePanel
						defaultWidth={256}
						minWidth={180}
						maxWidth={400}
						storageKey="personnelPanelWidth"
						className="hidden lg:block border-r border-border"
					>
						<PersonnelPanel
							personnel={personnel}
							selectedIds={selectedPersonnelIds}
							onSelectionChange={setSelectedPersonnelIds}
							onPriorityChange={updatePersonnelPriority}
							className="h-full"
							colorMap={personnelColorMap}
						/>
					</ResizablePanel>
				)}

				{/* Right: Calendar */}
				<div className="flex-1 overflow-hidden">
					{activeTab === "facility" ? (
						<ConnectedFacilitySchedule settings={settings} />
					) : (
						<ConnectedCalendar
							settings={settings}
							additionalEvents={coloredPersonnelEvents}
							currentUserId={MY_PERSONNEL_ID}
						/>
					)}
				</div>
			</div>

			<SettingsModal
				isOpen={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
				settings={settings}
				onUpdateSettings={updateSettings}
				onResetSettings={resetSettings}
			/>

			{isFacilitySettingsOpen && (
				<FacilityStructureSettings
					groups={groups}
					resources={resources}
					onCreateGroup={async (d) => {
						await createGroup(d);
					}}
					onUpdateGroup={async (id, d) => {
						await updateGroup(id, d);
					}}
					onDeleteGroup={async (id) => {
						await deleteGroup(id);
					}}
					onCreateResource={async (d) => {
						await createResource(d);
					}}
					onUpdateResource={async (id, d) => {
						await updateResource(id, d);
					}}
					onDeleteResource={async (id) => {
						await deleteResource(id);
					}}
					onClose={() => setIsFacilitySettingsOpen(false)}
				/>
			)}
		</div>
	);
}

function App() {
	return (
		<ScheduleProvider>
			<AppContent />
		</ScheduleProvider>
	);
}

export default App;
