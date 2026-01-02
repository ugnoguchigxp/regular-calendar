import { render, screen, fireEvent, act } from '@testing-library/react';
import { ConnectedEventModal } from './ConnectedEventModal';

const mockContext = vi.fn();
const mockUseEventForm = vi.fn();
const mockUseConflictCheck = vi.fn();
const mockUseAvailableResources = vi.fn();
const mockUseResourceDisplayNames = vi.fn();
const mockPrepareEventFormData = vi.fn();

vi.mock('./ScheduleContext', () => ({
    useScheduleContext: () => mockContext(),
}));

vi.mock('./hooks', () => ({
    useEventForm: (...args: any[]) => mockUseEventForm(...args),
    useConflictCheck: (...args: any[]) => mockUseConflictCheck(...args),
    useAvailableResources: (...args: any[]) => mockUseAvailableResources(...args),
    useResourceDisplayNames: (...args: any[]) => mockUseResourceDisplayNames(...args),
    prepareEventFormData: (...args: any[]) => mockPrepareEventFormData(...args),
}));

vi.mock('../components/ui/Modal', () => ({
    Modal: ({ children }: any) => <div>{children}</div>,
    ConfirmModal: ({ onConfirm }: any) => (
        <button type="button" onClick={onConfirm}>Confirm</button>
    ),
}));

vi.mock('../components/ui/Button', () => ({
    Button: ({ children, type = 'button', ...props }: any) => (
        <button type={type} {...props}>{children}</button>
    ),
}));

vi.mock('../components/ui/DatePicker', () => ({
    DatePicker: ({ onChange }: any) => <button type="button" onClick={() => onChange?.(new Date('2024-01-10T00:00:00Z'))}>Pick</button>,
}));

vi.mock('../components/ui/Form', () => ({
    Form: ({ children }: any) => <div>{children}</div>,
    FormControl: ({ children }: any) => <div>{children}</div>,
    FormItem: ({ children }: any) => <div>{children}</div>,
    FormLabel: ({ children }: any) => <label>{children}</label>,
    FormMessage: () => null,
    FormField: ({ name, render }: any) => {
        const valueMap: Record<string, any> = {
            startDate: '2024-01-10T08:00',
            durationHours: 1,
            resourceId: 'r1',
            isAllDay: false,
            title: '',
            attendee: '',
            status: 'booked',
            note: '',
            usage: 'Meeting',
        };
        return render({ field: { value: valueMap[name], onChange: vi.fn() } });
    },
}));

vi.mock('../components/ui/Input', () => ({
    Input: ({ onChange, ...props }: any) => <input {...props} onChange={onChange ?? (() => {})} />,
}));

vi.mock('../components/ui/Textarea', () => ({
    Textarea: (props: any) => <textarea {...props} />,
}));

vi.mock('../components/ui/KeypadModal', () => ({
    KeypadModal: () => null,
}));

vi.mock('../components/ui/Select', () => ({
    Select: ({ children }: any) => <div>{children}</div>,
    SelectTrigger: ({ children }: any) => <div>{children}</div>,
    SelectContent: ({ children }: any) => <div>{children}</div>,
    SelectItem: ({ children }: any) => <div>{children}</div>,
    SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

vi.mock('../components/ui/Icons', () => ({
    Icons: { AlertTriangle: () => null },
}));

vi.mock('../components/ui/EditableSelect', () => ({
    EditableSelect: (props: any) => <input value={props.value} readOnly />,
}));

vi.mock('../components/ui/Checkbox', () => ({
    Checkbox: ({ checked, onCheckedChange }: any) => (
        <input type="checkbox" checked={checked} onChange={() => onCheckedChange?.(!checked)} />
    ),
}));

const resources = [
    {
        id: 'r1',
        name: 'Room 1',
        order: 1,
        isAvailable: true,
        groupId: 'g1',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

const groups = [
    {
        id: 'g1',
        name: 'Group A',
        displayMode: 'grid',
        dimension: 1,
        resources,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

const events = [
    {
        id: 'e1',
        resourceId: 'r1',
        groupId: 'g1',
        title: 'Existing',
        attendee: '[]',
        startDate: new Date('2024-01-10T08:00:00Z'),
        endDate: new Date('2024-01-10T09:00:00Z'),
        status: 'booked',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

describe('ConnectedEventModal', () => {
    it('submits and deletes via hooks', async () => {
        const onSave = vi.fn();
        const onDelete = vi.fn();
        const onClose = vi.fn();

        mockContext.mockReturnValue({
            fetchResourceAvailability: vi.fn().mockResolvedValue([]),
            getResourceAvailabilityFromCache: vi.fn().mockReturnValue(undefined),
        });

        mockUseEventForm.mockReturnValue({
            form: {
                control: {},
                handleSubmit: (fn: any) => (e: any) => {
                    e.preventDefault();
                    fn({});
                },
                getValues: () => '2024-01-10T08:00',
                setValue: vi.fn(),
            },
            isEditMode: true,
            startDateVal: '2024-01-10T08:00',
            durationVal: 1,
            resourceIdVal: 'r1',
            isAllDay: false,
        });

        mockUseConflictCheck.mockReturnValue({
            existingSchedule: events[0],
        });

        mockUseAvailableResources.mockReturnValue(resources);
        mockUseResourceDisplayNames.mockReturnValue(new Map([['r1', 'Room 1 (Group A)']]));
        mockPrepareEventFormData.mockReturnValue({ prepared: true });

        vi.useFakeTimers();

        await act(async () => {
            render(
                <ConnectedEventModal
                    isOpen
                    event={events[0]}
                    resources={resources}
                    events={events}
                    groups={groups}
                    onClose={onClose}
                    onSave={onSave}
                    onDelete={onDelete}
                    currentUserId="owner"
                />
            );
        });

        await act(async () => {
            vi.runAllTimers();
            await Promise.resolve();
        });

        fireEvent.click(screen.getByRole('button', { name: /save_button/i }));
        expect(onSave).toHaveBeenCalledWith({ prepared: true });

        fireEvent.click(screen.getByRole('button', { name: /delete_button/i }));
        fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
        expect(onDelete).toHaveBeenCalledWith('e1');

        vi.useRealTimers();
    });
});
