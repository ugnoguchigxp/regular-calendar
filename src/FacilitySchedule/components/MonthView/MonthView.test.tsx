import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MonthView } from './MonthView';

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
    {
        id: 'r2',
        name: 'Room 2',
        order: 2,
        isAvailable: true,
        groupId: 'g2',
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
        startDate: new Date('2024-01-10T08:00:00Z'),
        endDate: new Date('2024-01-10T09:00:00Z'),
        status: 'booked',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

const settings = {
    defaultDuration: 1,
    startTime: '08:00',
    endTime: '18:00',
    closedDays: [],
    weekStartsOn: 1,
    timeSlots: [{ id: 't1', label: 'Slot', startTime: '08:00', endTime: '09:00' }],
};

describe('MonthView', () => {
    it('filters by group and handles day click', async () => {
        const user = userEvent.setup();
        const onDayClick = vi.fn();

        render(
            <MonthView
                month={new Date('2024-01-01T00:00:00Z')}
                resources={resources}
                events={events}
                settings={settings}
                selectedGroupId="g1"
                onDayClick={onDayClick}
            />
        );

        expect(screen.getByText(/Resources: 1/i)).toBeInTheDocument();

        const dayButtons = screen.getAllByRole('button');
        await user.click(dayButtons[0]);
        expect(onDayClick).toHaveBeenCalled();
    });
});
