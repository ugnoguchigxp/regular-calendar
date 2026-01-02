import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScheduleHeader } from './ScheduleHeader';

const groups = [
    {
        id: 'g1',
        name: 'Group A',
        displayMode: 'grid',
        dimension: 1,
        resources: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'g2',
        name: 'Group B',
        displayMode: 'grid',
        dimension: 1,
        resources: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

describe('ScheduleHeader', () => {
    it('handles navigation, today, view change, and group selection', async () => {
        const user = userEvent.setup();
        const onNavigate = vi.fn();
        const onToday = vi.fn();
        const onViewChange = vi.fn();
        const onGroupChange = vi.fn();

        render(
            <ScheduleHeader
                currentDate={new Date('2024-01-10T00:00:00Z')}
                viewMode="day"
                groups={groups}
                selectedGroupId="g1"
                onNavigate={onNavigate}
                onToday={onToday}
                onViewChange={onViewChange}
                onGroupChange={onGroupChange}
            />
        );

        await user.click(screen.getByRole('button', { name: /today_button/i }));
        expect(onToday).toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: /view_week/i }));
        expect(onViewChange).toHaveBeenCalledWith('week');

        const iconButtons = screen.getAllByRole('button', { name: '' });
        await user.click(iconButtons[0]);
        expect(onNavigate).toHaveBeenCalledWith('prev');

        await user.click(iconButtons[1]);
        expect(onNavigate).toHaveBeenCalledWith('next');

        await user.click(screen.getByRole('button', { name: 'Group A' }));
        await user.click(screen.getByText('Group B'));
        expect(onGroupChange).toHaveBeenCalledWith('g2');
    });

    it('hides group selector when requested', () => {
        render(
            <ScheduleHeader
                currentDate={new Date('2024-01-10T00:00:00Z')}
                viewMode="day"
                groups={groups}
                selectedGroupId={null}
                hideGroupSelector
                onNavigate={vi.fn()}
                onToday={vi.fn()}
                onViewChange={vi.fn()}
                onGroupChange={vi.fn()}
            />
        );

        expect(screen.queryByRole('button', { name: 'Select Group' })).not.toBeInTheDocument();
    });
});
