import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SmartFacilitySchedule } from './SmartFacilitySchedule';
import { SmartRegularCalendar } from './SmartRegularCalendar';
import { useSettings } from './useSettings';
import { useScheduleApi } from './useScheduleApi';
import { SettingsModal, FacilityStructureSettings, PersonnelPanel, ResizablePanel, getPersonnelColor } from 'regular-calendar';
import { Button } from '@/components/ui/Button';

import './index.css';

import { ScheduleProvider } from './ScheduleContext';

// Demo: "Me" is the first personnel (p1)
const MY_PERSONNEL_ID = 'p1';

function AppContent() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'facility' | 'regular'>('regular');
    const { settings, updateSettings, resetSettings } = useSettings();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isFacilitySettingsOpen, setIsFacilitySettingsOpen] = useState(false);
    const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<string[]>([]);

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
    const [fetchedPersonnelIds, setFetchedPersonnelIds] = useState<Set<string>>(new Set());

    // "Me" + selected personnel IDs for display
    const visiblePersonnelIds = useMemo(() => {
        const ids = new Set([MY_PERSONNEL_ID, ...selectedPersonnelIds]);
        return Array.from(ids);
    }, [selectedPersonnelIds]);

    // Fetch only NEW personnel events (diff fetch)
    useEffect(() => {
        const newIds = visiblePersonnelIds.filter(id => !fetchedPersonnelIds.has(id));

        if (newIds.length > 0) {
            // Fetch only the new personnel's events
            fetchPersonnelEvents(newIds, true); // true = append mode
            setFetchedPersonnelIds(prev => {
                const updated = new Set(prev);
                newIds.forEach(id => updated.add(id));
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
        return personnelEvents
            .filter(event => {
                const personnelId = event.extendedProps?.personnelId;
                return personnelId && visibleSet.has(personnelId);
            })
            .map(event => {
                const personnelId = event.extendedProps?.personnelId;
                const color = personnelId ? personnelColorMap.get(personnelId) : undefined;
                return color ? { ...event, color } : event;
            });
    }, [personnelEvents, visiblePersonnelIds, personnelColorMap]);

    return (
        <div className="h-screen flex flex-col bg-background text-foreground">
            <nav className="p-4 border-b border-border flex gap-4 items-center">
                <h2 className="m-0 mr-4 text-lg font-bold">{t('app_title')}</h2>

                <Button
                    onClick={() => setActiveTab('facility')}
                    variant={activeTab === 'facility' ? 'default' : 'ghost'}
                    className="cursor-pointer"
                >
                    {t('app_header_facility_schedule')}
                </Button>

                <Button
                    onClick={() => setActiveTab('regular')}
                    variant={activeTab === 'regular' ? 'default' : 'ghost'}
                    className="cursor-pointer"
                >
                    {t('app_header_regular_calendar')}
                </Button>

                <div className="flex-1" />

                <Button
                    variant="outline"
                    onClick={() => setIsFacilitySettingsOpen(true)}
                >
                    {t('app_header_facility_structure')}
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSettingsOpen(true)}
                    title={t('settings_title')}
                >
                    ⚙️
                </Button>
            </nav>

            <div className="flex-1 overflow-hidden flex">
                {/* Left: PersonnelPanel - Desktop only, Resizable */}
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

                {/* Right: Calendar */}
                <div className="flex-1 overflow-hidden">
                    {activeTab === 'facility' ? (
                        <SmartFacilitySchedule settings={settings} />
                    ) : (
                        <SmartRegularCalendar
                            settings={settings}
                            additionalEvents={coloredPersonnelEvents}
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
                    onCreateGroup={createGroup}
                    onUpdateGroup={updateGroup}
                    onDeleteGroup={deleteGroup}
                    onCreateResource={createResource}
                    onUpdateResource={updateResource}
                    onDeleteResource={deleteResource}
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
