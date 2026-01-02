import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KeypadModal } from './KeypadModal';

vi.mock('./Modal', () => ({
    Modal: ({ children }: any) => <div>{children}</div>,
}));

describe('KeypadModal', () => {
    it('submits number input and validates empty', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();

        render(
            <KeypadModal open onClose={vi.fn()} onSubmit={onSubmit} variant="number" />
        );

        await user.click(screen.getByRole('button', { name: '1' }));
        await user.click(screen.getByRole('button', { name: '2' }));
        await user.click(screen.getByRole('button', { name: 'OK' }));
        expect(onSubmit).toHaveBeenCalledWith('12');

        await user.click(screen.getByRole('button', { name: 'C' }));
        await user.click(screen.getByRole('button', { name: 'OK' }));
        expect(screen.getByText('値を入力してください')).toBeInTheDocument();
    });

    it('validates phone hyphen usage', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();

        render(
            <KeypadModal open onClose={vi.fn()} onSubmit={onSubmit} variant="phone" />
        );

        await user.click(screen.getByRole('button', { name: '-' }));
        await user.click(screen.getByRole('button', { name: 'OK' }));
        expect(screen.getByText('ハイフンで終わることはできません')).toBeInTheDocument();
    });

    it('validates time format before submit', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();

        render(
            <KeypadModal open onClose={vi.fn()} onSubmit={onSubmit} variant="time" />
        );

        await user.click(screen.getByRole('button', { name: '2' }));
        await user.click(screen.getByRole('button', { name: '9' }));
        await user.click(screen.getByRole('button', { name: '6' }));
        await user.click(screen.getByRole('button', { name: '0' }));
        await user.click(screen.getByRole('button', { name: 'OK' }));

        expect(screen.getByText('有効な時刻を 4 桁で入力してください（例: 0930）')).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();
    });
});
