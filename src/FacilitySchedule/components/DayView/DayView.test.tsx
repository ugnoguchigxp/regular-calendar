import { render, screen } from '@testing-library/react';
import { DayView } from './DayView';

const settings = {
    defaultDuration: 1,
    startTime: '08:00',
    endTime: '10:00',
    closedDays: [],
    weekStartsOn: 1,
};

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

const events = [
    {
        id: 'e1',
        resourceId: 'r1',
        groupId: 'g1',
        title: 'Checkup',
        attendee: 'Patient A',
        startDate: new Date('2024-01-10T08:00:00'),
        endDate: new Date('2024-01-10T09:00:00'),
        status: 'booked',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

describe('DayView', () => {
    it('renders resource columns and events', () => {
        render(
            <DayView
                currentDate={new Date('2024-01-10T00:00:00Z')}
                resources={resources}
                events={events}
                settings={settings}
            />
        );

        expect(screen.getByText('Room 1')).toBeInTheDocument();
        expect(screen.getAllByText('Checkup').length).toBeGreaterThan(0);
    });
});
