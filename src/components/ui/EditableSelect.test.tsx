import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditableSelect } from './EditableSelect';

describe('EditableSelect', () => {
    beforeAll(() => {
        Element.prototype.scrollIntoView = vi.fn();
    });

    it('opens on focus and selects option with keyboard', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(
            <EditableSelect
                value=""
                onChange={onChange}
                options={['A', 'B']}
                placeholder="Type"
            />
        );

        const input = screen.getByPlaceholderText('Type');
        await user.click(input);
        await user.keyboard('{ArrowDown}{Enter}');

        expect(onChange).toHaveBeenCalledWith('A');
    });

    it('selects option on click and closes list', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(
            <EditableSelect
                value=""
                onChange={onChange}
                options={['A', 'B']}
            />
        );

        const input = screen.getByRole('textbox');
        await user.click(input);

        await user.click(screen.getByRole('button', { name: 'B' }));
        expect(onChange).toHaveBeenCalledWith('B');
        expect(screen.queryByRole('button', { name: 'A' })).not.toBeInTheDocument();
    });
});
