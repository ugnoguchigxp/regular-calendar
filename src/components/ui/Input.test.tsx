import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('should render input with placeholder', () => {
    render(<Input placeholder="Enter text" />);

    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should render input with value', () => {
    render(<Input defaultValue="test value" />);

    expect(screen.getByRole('textbox')).toHaveValue('test value');
  });

  it('should handle controlled input', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Input value="initial" onChange={handleChange} />);

    await user.type(screen.getByRole('textbox'), ' more');

    expect(handleChange).toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />);

    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should render with type', () => {
    render(<Input type="password" />);

    const input = document.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('password');
  });

  it('should apply custom className', () => {
    render(<Input className="custom-class" />);

    expect(screen.getByRole('textbox')).toHaveClass('custom-class');
  });

  it('should handle focus', async () => {
    const user = userEvent.setup();

    render(<Input />);

    await user.click(screen.getByRole('textbox'));

    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('should handle blur', async () => {
    const user = userEvent.setup();

    render(<Input />);

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.tab();

    expect(input).not.toHaveFocus();
  });

  it('should render with required attribute', () => {
    render(<Input required />);

    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('should render with name attribute', () => {
    render(<Input name="test-input" />);

    expect(screen.getByRole('textbox')).toHaveAttribute('name', 'test-input');
  });

  it('should render with id attribute', () => {
    render(<Input id="test-id" />);

    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'test-id');
  });

  it('should handle max length', () => {
    render(<Input maxLength={10} />);

    expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '10');
  });

  it('should be read-only when readOnly prop is true', () => {
    render(<Input readOnly />);

    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
  });
});
