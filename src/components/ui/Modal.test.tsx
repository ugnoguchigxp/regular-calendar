import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal, { ConfirmModal } from './Modal';

describe('Modal', () => {
    it('renders content and calls onClose when closed', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        const onOpenChange = vi.fn();

        render(
            <Modal
                defaultOpen
                title="Details"
                description="Info"
                onClose={onClose}
                onOpenChange={onOpenChange}
            >
                <div>Body</div>
            </Modal>
        );

        expect(screen.getByText('Details')).toBeInTheDocument();
        expect(screen.getByText('Info')).toBeInTheDocument();
        expect(screen.getByText('Body')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /close/i }));
        expect(onOpenChange).toHaveBeenCalledWith(false);
        expect(onClose).toHaveBeenCalled();
    });

    it('calls onConfirm in ConfirmModal', async () => {
        const user = userEvent.setup();
        const onConfirm = vi.fn();
        const onClose = vi.fn();

        render(
            <ConfirmModal
                open
                title="Confirm"
                description="Are you sure?"
                onConfirm={onConfirm}
                onClose={onClose}
                onOpenChange={vi.fn()}
            />
        );

        await user.click(screen.getByRole('button', { name: 'Confirm' }));
        expect(onConfirm).toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(onClose).toHaveBeenCalled();
    });
});
