import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('should render unchecked checkbox', () => {
    render(<Checkbox />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should render checked checkbox', () => {
    render(<Checkbox defaultChecked />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should render controlled checkbox', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Checkbox checked={false} onCheckedChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Checkbox disabled />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('should not be clickable when disabled', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Checkbox disabled onCheckedChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    render(<Checkbox className="custom-class" />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('custom-class');
  });

  it('should toggle checked state on click', async () => {
    const user = userEvent.setup();

    render(<Checkbox />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('should handle indeterminate state', () => {
    render(<Checkbox checked="indeterminate" />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.getAttribute('data-state')).toBe('indeterminate');
  });

  it('should show check icon when checked', () => {
    render(<Checkbox checked />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.getAttribute('data-state')).toBe('checked');
  });

  it('should not show check icon when unchecked', () => {
    render(<Checkbox checked={false} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.getAttribute('data-state')).toBe('unchecked');
  });

  it('should have correct ARIA attributes', () => {
    render(<Checkbox aria-label="Test checkbox" />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Test checkbox');
  });

  it('should handle focus', async () => {
    const user = userEvent.setup();

    render(<Checkbox />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(checkbox).toHaveFocus();
  });

  it('should handle keyboard navigation', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Checkbox onCheckedChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    await user.keyboard('{Space}');

    expect(handleChange).toHaveBeenCalled();
  });

  it('should handle Enter key', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Checkbox onCheckedChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    await user.keyboard('{Enter}');

    expect(handleChange).toHaveBeenCalled();
  });

  it('should support name attribute', () => {
    render(<Checkbox name="test-checkbox" />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('should support value attribute', () => {
    render(<Checkbox value="test-value" />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('value', 'test-value');
  });

  it('should support required attribute', () => {
    render(<Checkbox required />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeRequired();
  });

  it('should apply data-state attribute', () => {
    render(<Checkbox checked />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-state', 'checked');
  });

  it('should not apply data-state when unchecked', () => {
    render(<Checkbox checked={false} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-state', 'unchecked');
  });
});
