import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DayCell } from './DayCell';

describe('DayCell', () => {
    it('renders density details and handles click', async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();

        render(
            <DayCell
                date={new Date('2024-01-10T00:00:00Z')}
                density={50}
                isCurrentMonth
                isClosedDay={false}
                maxSlots={10}
                onClick={onClick}
            />
        );

        expect(screen.getByText('5/10')).toBeInTheDocument();
        expect(screen.getByText('50%')).toBeInTheDocument();

        await user.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalled();
    });

    it('hides density info for closed day', () => {
        render(
            <DayCell
                date={new Date('2024-01-10T00:00:00Z')}
                density={80}
                isCurrentMonth
                isClosedDay
                maxSlots={10}
            />
        );

        expect(screen.queryByText('8/10')).not.toBeInTheDocument();
        expect(screen.queryByText('80%')).not.toBeInTheDocument();
    });
});
