import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WeekView } from './WeekView';

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
        title: 'Event A',
        attendee: '[]',
        startDate: new Date('2024-01-08T08:00:00Z'),
        endDate: new Date('2024-01-08T09:00:00Z'),
        status: 'booked',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

const settings = {
    defaultDuration: 1,
    startTime: '08:00',
    endTime: '18:00',
    closedDays: [0],
    weekStartsOn: 0,
};

describe('WeekView', () => {
    it('renders events, closed days, and handles interactions', async () => {
        const user = userEvent.setup();
        const onEventClick = vi.fn();
        const onEmptySlotClick = vi.fn();

        render(
            <WeekView
                weekStart={new Date('2024-01-07T00:00:00Z')}
                resources={resources}
                events={events}
                settings={settings}
                groups={groups}
                onEventClick={onEventClick}
                onEmptySlotClick={onEmptySlotClick}
            />
        );

        const eventButton = screen.getByRole('button', { name: /Event A/i });
        expect(eventButton).toBeInTheDocument();
        await user.click(eventButton);
        expect(onEventClick).toHaveBeenCalled();

        expect(screen.getByText('Off')).toBeInTheDocument();

        const addButtons = screen.getAllByRole('button', { name: 'Add' });
        await user.click(addButtons[0]);
        expect(onEmptySlotClick).toHaveBeenCalled();

    });
});
