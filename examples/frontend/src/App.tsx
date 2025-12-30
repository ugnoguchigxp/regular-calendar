import { useState } from 'react';
import { SmartFacilitySchedule } from './SmartFacilitySchedule';
import { SmartRegularCalendar } from './SmartRegularCalendar';
import { useSettings } from './useSettings';
import { useScheduleApi } from './useScheduleApi';
import { SettingsModal, FacilityStructureSettings } from 'regular-calendar';
import { Button } from '@/components/ui/Button';

import './index.css';

function App() {
    const [activeTab, setActiveTab] = useState<'facility' | 'regular'>('regular');
    const { settings, updateSettings, resetSettings } = useSettings();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isFacilitySettingsOpen, setIsFacilitySettingsOpen] = useState(false);

    const {
        groups,
        resources,
        createGroup,
        updateGroup,
        deleteGroup,
        createResource,
        updateResource,
        deleteResource
    } = useScheduleApi();

    return (
        <div className="h-screen flex flex-col bg-background text-foreground">
            <nav className="p-4 border-b border-border flex gap-4 items-center">
                <h2 className="m-0 mr-4 text-lg font-bold">Regular Calendar Demo</h2>

                <Button
                    onClick={() => setActiveTab('facility')}
                    variant={activeTab === 'facility' ? 'default' : 'ghost'}
                    className="cursor-pointer"
                >
                    Facility Schedule
                </Button>

                <Button
                    onClick={() => setActiveTab('regular')}
                    variant={activeTab === 'regular' ? 'default' : 'ghost'}
                    className="cursor-pointer"
                >
                    Regular Calendar
                </Button>

                <div className="flex-1" />

                <Button
                    variant="outline"
                    onClick={() => setIsFacilitySettingsOpen(true)}
                >
                    Facility Struct
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSettingsOpen(true)}
                    title="設定"
                >
                    ⚙️
                </Button>
            </nav>

            <div className="flex-1 overflow-hidden">
                {activeTab === 'facility' ? (
                    <SmartFacilitySchedule settings={settings} />
                ) : (
                    <SmartRegularCalendar settings={settings} />
                )}
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

export default App;
