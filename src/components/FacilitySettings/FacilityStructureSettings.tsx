import { useState } from 'react';
import { Resource, ResourceGroup } from '../../FacilitySchedule/FacilitySchedule.schema';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { useTranslation } from 'react-i18next';

interface FacilityStructureSettingsProps {
    groups: ResourceGroup[];
    resources: Resource[];

    // Group CRUD
    onCreateGroup: (group: Partial<ResourceGroup>) => Promise<void>;
    onUpdateGroup: (id: string, group: Partial<ResourceGroup>) => Promise<void>;
    onDeleteGroup: (id: string) => Promise<void>;

    // Resource CRUD
    onCreateResource: (resource: Partial<Resource>) => Promise<void>;
    onUpdateResource: (id: string, resource: Partial<Resource>) => Promise<void>;
    onDeleteResource: (id: string) => Promise<void>;

    onClose: () => void;
}

export function FacilityStructureSettings({
    groups,
    resources,
    onCreateGroup,
    onUpdateGroup,
    onDeleteGroup,
    onCreateResource,
    onUpdateResource,
    onDeleteResource,
    onClose,
}: FacilityStructureSettingsProps) {
    const { t } = useTranslation();
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
    const [editingResourceId, setEditingResourceId] = useState<string | null>(null);

    // Temporary state for editing inputs
    const [editValue, setEditValue] = useState('');

    const handleStartEditGroup = (group: ResourceGroup) => {
        setEditingGroupId(group.id);
        setEditValue(group.name);
    };

    const handleSaveGroup = async (id: string) => {
        if (editValue.trim()) {
            await onUpdateGroup(id, { name: editValue });
        }
        setEditingGroupId(null);
    };

    const handleCreateGroup = async () => {
        const name = prompt(t('facilitySettings.labels.enterGroupName') || 'Enter Group Name');
        if (name) {
            await onCreateGroup({ name });
        }
    };

    const handleDeleteGroupConfirm = async (id: string) => {
        if (confirm(t('facilitySettings.confirm.deleteGroupMessage'))) {
            await onDeleteGroup(id);
        }
    };

    // Resources

    const handleStartEditResource = (resource: Resource) => {
        setEditingResourceId(resource.id);
        setEditValue(resource.name);
    };

    const handleSaveResource = async (id: string) => {
        if (editValue.trim()) {
            await onUpdateResource(id, { name: editValue });
        }
        setEditingResourceId(null);
    };

    const handleCreateResource = async (groupId: string) => {
        const name = prompt(t('facilitySettings.labels.enterResourceName') || 'Enter Resource Name');
        if (name) {
            // Find max order
            const groupResources = resources.filter(r => r.groupId === groupId);
            const maxOrder = Math.max(0, ...groupResources.map(r => r.order));

            await onCreateResource({
                name,
                groupId,
                order: maxOrder + 1,
                isAvailable: true
            });
        }
    };

    const handleDeleteResourceConfirm = async (id: string) => {
        if (confirm(t('facilitySettings.confirm.deleteResourceMessage'))) {
            await onDeleteResource(id);
        }
    };

    // Style constants matched exactly to SettingsModal
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
        borderRadius: 'var(--radius)',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    };

    // Inner content styles matching SettingsModal patterns
    const sectionStyle: React.CSSProperties = { marginBottom: '24px' };
    const labelStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' };
    const rowStyle: React.CSSProperties = { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' };

    // Input style matching SettingsModal's inputs/selects
    const inputStyle: React.CSSProperties = {
        padding: '0 8px', // horizontal padding only, vertical centered by height
        borderRadius: 'var(--radius)',
        border: '1px solid hsl(var(--border))',
        backgroundColor: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))',
        fontSize: 'var(--ui-font-size-base)',
        height: 'var(--ui-component-height)',
        width: '100%' // flexible width
    };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>

                {/* Header matching SettingsModal */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', paddingBottom: '16px', borderBottom: '1px solid hsl(var(--border))' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>{t('facilitySettings.title')}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <Icons.X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Add Room Section Header */}
                    <div style={{ ...sectionStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '16px' }}>
                        <h3 className="text-md font-medium text-muted-foreground m-0">{t('facilitySettings.labels.groupName')}s & {t('facilitySettings.labels.resourceName')}s</h3>
                        <Button onClick={handleCreateGroup}>
                            <Icons.Plus className="h-4 w-4 mr-2" />
                            {t('facilitySettings.actions.addGroup')}
                        </Button>
                    </div>

                    {groups.map(group => (
                        <div key={group.id} style={{ ...sectionStyle, borderBottom: '1px solid hsl(var(--border))', paddingBottom: '24px', marginBottom: '24px' }}>
                            {/* Group Header (Label style) */}
                            <div style={labelStyle}>
                                {editingGroupId === group.id ? (
                                    <div style={{ display: 'flex', gap: '8px', flex: 1, alignItems: 'center' }}>
                                        <input
                                            style={{ ...inputStyle, flex: 1 }}
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            autoFocus
                                        />
                                        <Button onClick={() => handleSaveGroup(group.id)}>{t('eventModal.actions.save')}</Button>
                                        <Button variant="ghost" onClick={() => setEditingGroupId(null)}>{t('eventModal.actions.cancel')}</Button>
                                    </div>
                                ) : (
                                    <>
                                        <span style={{ fontSize: '16px' }}>{group.name}</span>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <Button variant="ghost" size="icon" onClick={() => handleStartEditGroup(group)}>
                                                <Icons.Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteGroupConfirm(group.id)}>
                                                <Icons.Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Resources Row */}
                            <div style={rowStyle}>
                                {resources.filter(r => r.groupId === group.id).sort((a, b) => a.order - b.order).map(resource => (
                                    <div key={resource.id} style={{ display: 'flex', alignItems: 'center', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)', padding: '4px 8px', backgroundColor: 'hsl(var(--muted) / 0.3)' }}>
                                        {editingResourceId === resource.id ? (
                                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                <input
                                                    style={{ ...inputStyle, width: '120px', height: '28px', fontSize: '13px' }}
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    autoFocus
                                                />
                                                <Button size="sm" onClick={() => handleSaveResource(resource.id)}>{t('eventModal.actions.save')}</Button>
                                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingResourceId(null)}><Icons.X className="h-3 w-3" /></Button>
                                            </div>
                                        ) : (
                                            <>
                                                <span style={{ marginRight: '8px', fontSize: '14px' }}>{resource.name}</span>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-50 hover:opacity-100" onClick={() => handleStartEditResource(resource)}>
                                                    <Icons.Edit className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive opacity-50 hover:opacity-100" onClick={() => handleDeleteResourceConfirm(resource.id)}>
                                                    <Icons.Trash className="h-3 w-3" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={() => handleCreateResource(group.id)}>
                                    <Icons.Plus className="h-3 w-3 mr-1" />
                                    {t('facilitySettings.actions.addResource')}
                                </Button>
                            </div>
                        </div>
                    ))}

                    {groups.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '32px', color: 'hsl(var(--muted-foreground))' }}>
                            {t('facilitySettings.labels.noGroups')}
                        </div>
                    )}
                </div>

                {/* Footer matching SettingsModal padding/border */}
                <div style={{ padding: '24px', borderTop: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={onClose}>{t('facilitySettings.actions.done')}</Button>
                </div>
            </div>
        </div>
    );
}
