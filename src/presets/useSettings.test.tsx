import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEFAULT_SETTINGS, useSettings } from './useSettings';

const createStorage = () => ({
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
});

describe('useSettings', () => {
    it('loads settings from storage and applies theme', async () => {
        const storage = createStorage();
        storage.getItem.mockReturnValue(
            JSON.stringify({ theme: 'dark', language: 'ja', fontSize: 14, borderRadius: 6, density: 'compact' })
        );
        const onLanguageChange = vi.fn();

        const TestComponent = () => {
            const { settings } = useSettings({ storage, onLanguageChange });
            return <span data-testid="theme">{settings.theme}</span>;
        };

        render(<TestComponent />);

        await waitFor(() => {
            expect(screen.getByTestId('theme')).toHaveTextContent('dark');
        });

        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
        expect(onLanguageChange).toHaveBeenCalledWith('ja');
    });

    it('updates and resets settings', async () => {
        const storage = createStorage();
        storage.getItem.mockReturnValue(null);
        const user = userEvent.setup();
        const TestComponent = () => {
            const { settings, updateSettings } = useSettings({ storage });
            return (
                <div>
                    <span data-testid="density">{settings.density}</span>
                    <button type="button" onClick={() => updateSettings({ density: 'compact' })}>
                        update
                    </button>
                </div>
            );
        };

        render(<TestComponent />);

        expect(screen.getByTestId('density')).toHaveTextContent(DEFAULT_SETTINGS.density);

        await user.click(screen.getByRole('button', { name: 'update' }));
        await waitFor(() => {
            expect(screen.getByTestId('density')).toHaveTextContent('compact');
        });
        expect(storage.setItem).toHaveBeenCalled();

        expect(storage.removeItem).not.toHaveBeenCalled();
    });
});
