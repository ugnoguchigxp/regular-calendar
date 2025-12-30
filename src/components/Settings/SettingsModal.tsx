import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import type { AppSettings } from '../../types';

export interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: AppSettings;
    onUpdateSettings: (partial: Partial<AppSettings>) => void;
    onResetSettings?: () => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

export function SettingsModal({
    isOpen,
    onClose,
    settings,
    onUpdateSettings,
    onResetSettings
}: SettingsModalProps) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    // Helper for instant update
    const update = (partial: Partial<AppSettings>) => {
        onUpdateSettings(partial);
    };

    // Get localized days
    const daysShort = t('settings.daysShort', { returnObjects: true }) as string[];

    // Style constants
    const overlayStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto'
    };

    const modalStyle: React.CSSProperties = {
        backgroundColor: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        pointerEvents: 'auto',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    };

    const sectionStyle: React.CSSProperties = { marginBottom: '24px' };
    const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' };
    const rowStyle: React.CSSProperties = { display: 'flex', gap: '8px', flexWrap: 'wrap' };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '16px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>{t('settings.title')}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        ✕
                    </Button>
                </div>

                {/* Language (New) */}
                <div style={sectionStyle}>
                    <label style={labelStyle}>{t('settings.language')}</label>
                    <div style={rowStyle}>
                        {(['ja', 'en'] as const).map(lang => (
                            <Button
                                key={lang}
                                variant={settings.language === lang ? 'default' : 'outline'}
                                onClick={() => update({ language: lang })}
                            >
                                {lang === 'ja' ? '日本語' : 'English'}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Theme */}
                <div style={sectionStyle}>
                    <label style={labelStyle}>{t('settings.theme')}</label>
                    <div style={rowStyle}>
                        {(['light', 'dark'] as const).map(theme => (
                            <Button
                                key={theme}
                                variant={settings.theme === theme ? 'default' : 'outline'}
                                onClick={() => update({ theme })}
                            >
                                {theme === 'light' ? t('settings.options.light') : t('settings.options.dark')}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Density */}
                <div style={sectionStyle}>
                    <label style={labelStyle}>{t('settings.density')}</label>
                    <div style={rowStyle}>
                        {(['compact', 'normal', 'spacious'] as const).map(density => (
                            <Button
                                key={density}
                                variant={settings.density === density ? 'default' : 'outline'}
                                onClick={() => update({ density })}
                            >
                                {density === 'compact' ? t('settings.options.compact') : density === 'normal' ? t('settings.options.normal') : t('settings.options.spacious')}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Border Radius */}
                <div style={sectionStyle}>
                    <label style={labelStyle}>{t('settings.radius')}: {settings.borderRadius}px</label>
                    <input
                        type="range"
                        min="0" max="16"
                        value={settings.borderRadius}
                        onChange={e => update({ borderRadius: Number(e.target.value) })}
                        style={{ width: '100%', cursor: 'pointer' }}
                    />
                </div>

                {/* Font Size */}
                <div style={sectionStyle}>
                    <label style={labelStyle}>{t('settings.fontSize')}: {settings.fontSize}px</label>
                    <input
                        type="range"
                        min="12" max="20"
                        value={settings.fontSize}
                        onChange={e => update({ fontSize: Number(e.target.value) })}
                        style={{ width: '100%', cursor: 'pointer' }}
                    />
                </div>

                {/* Week Start */}
                <div style={sectionStyle}>
                    <label style={labelStyle}>{t('settings.weekStart')}</label>
                    <select
                        value={settings.weekStartsOn}
                        onChange={e => update({ weekStartsOn: Number(e.target.value) as 0 | 1 })}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                    >
                        <option value={0}>{t('settings.options.sunday')}</option>
                        <option value={1}>{t('settings.options.monday')}</option>
                    </select>
                </div>

                {/* Business Hours */}
                <div style={sectionStyle}>
                    <label style={labelStyle}>{t('settings.businessHours')}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <select
                            value={settings.businessHoursStart}
                            onChange={e => update({ businessHoursStart: e.target.value })}
                            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                        >
                            {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <span>〜</span>
                        <select
                            value={settings.businessHoursEnd}
                            onChange={e => update({ businessHoursEnd: e.target.value })}
                            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                        >
                            {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>
                </div>

                {/* Closed Days */}
                <div style={sectionStyle}>
                    <label style={labelStyle}>{t('settings.closedDays')}</label>
                    <div style={rowStyle}>
                        {daysShort.map((day, index) => (
                            <Button
                                key={index}
                                variant={settings.closedDays.includes(index) ? 'destructive' : 'outline'}
                                size="sm" // Use small buttons for days
                                onClick={() => {
                                    const newDays = settings.closedDays.includes(index)
                                        ? settings.closedDays.filter(d => d !== index)
                                        : [...settings.closedDays, index];
                                    update({ closedDays: newDays });
                                }}
                                className="w-10 h-10 p-0"
                            >
                                {day}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Reset Button (Optional) */}
                {onResetSettings && (
                    <div style={{ marginTop: '32px', borderTop: '1px solid hsl(var(--border))', paddingTop: '16px' }}>
                        <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 hover:border-destructive" onClick={onResetSettings}>
                            Reset All Settings
                        </Button>
                    </div>
                )}

            </div>
        </div>
    );
}
