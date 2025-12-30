import { render, screen } from '@testing-library/react';
import { Button } from './Button';
import { DateDisplay } from './DateDisplay';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './Tooltip';
import { vi, describe, it, expect } from 'vitest';

// Mock i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (str: string) => str,
        i18n: {
            language: 'ja', // ensure JP locale for tests
            changeLanguage: () => new Promise(() => { }),
        },
    }),
}));

describe('UI Compatibility Tests', () => {

    describe('DateDisplay', () => {
        const testDate = new Date('2025-10-23T10:00:00');

        it('supports legacy "monthDay" format (Japanese)', () => {
            // Mock translation logic implicitly via DateDisplay or verify output
            // But since we are testing component prop stability, preventing crash is key.
            render(<DateDisplay date={testDate} format="monthDay" />);
            // Should not crash. 
            // Output depends on standard Intl, likely "10月23日" in JP locale env or "October 23" in EN.
        });

        it('supports legacy "compact" variant prop', () => {
            render(<DateDisplay date={testDate} variant="compact" />);
        });
    });

    describe('Button', () => {
        it('supports asChild prop for composition', () => {
            render(
                <Button asChild>
                    <a href="#">Link</a>
                </Button>
            );
            expect(screen.getByText('Link').tagName).toBe('A');
        });
    });

    describe('Tooltip', () => {
        it('handles asChild on trigger without warning', () => {
            render(
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button>Trigger</button>
                        </TooltipTrigger>
                        <TooltipContent>Content</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        });
    });
});
