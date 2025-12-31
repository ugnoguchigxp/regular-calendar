import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SmartFacilitySchedule } from './SmartFacilitySchedule';
import { SmartRegularCalendar } from './SmartRegularCalendar';
import { useSettings } from './useSettings';
import { useScheduleApi } from './useScheduleApi';
import { SettingsModal, FacilityStructureSettings } from 'regular-calendar';
import { Button } from '@/components/ui/Button';

import './index.css';

function App() {
    const { t } = useTranslation();
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
