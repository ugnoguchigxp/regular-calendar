import { render, screen } from '@testing-library/react';
import { LegendBar } from './LegendBar';

describe('LegendBar', () => {
    it('renders boundary labels', () => {
        render(<LegendBar />);
        expect(screen.getByText('0%')).toBeInTheDocument();
        expect(screen.getByText('100%')).toBeInTheDocument();
    });
});
