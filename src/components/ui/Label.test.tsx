import { render, screen } from '@testing-library/react';
import { Label } from './Label';

describe('Label', () => {
  it('renders label text', () => {
    render(<Label htmlFor="test">Test Label</Label>);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Label htmlFor="test" className="custom-class">Test</Label>
    );
    const label = container.querySelector('label');
    expect(label).toHaveClass('custom-class');
  });

  it('passes htmlFor prop', () => {
    const { container } = render(
      <Label htmlFor="test-input">Test Label</Label>
    );
    const label = container.querySelector('label');
    expect(label).toHaveAttribute('for', 'test-input');
  });

  it('merges classes correctly', () => {
    const { container } = render(
      <Label htmlFor="test" className="bg-red-500">Test</Label>
    );
    const label = container.querySelector('label');
    expect(label).toHaveClass('text-sm', 'font-medium', 'bg-red-500');
  });
});
