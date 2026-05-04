import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../button.tsx';

describe('Button', () => {
    it('renders children correctly', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);
        fireEvent.click(screen.getByText('Click me'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies variant class correctly', () => {
        render(<Button variant="ghost">Ghost</Button>);
        const button = screen.getByText('Ghost');
        expect(button).toHaveClass('hover:bg-muted hover:text-foreground');
    });

    it('applies size class correctly', () => {
        render(<Button size="sm">Small</Button>);
        const button = screen.getByText('Small');
        expect(button).toHaveClass('h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem]');
    });

    it('is disabled when props disabled is true', () => {
        render(<Button disabled>Submit</Button>);
        expect(screen.getByText('Submit')).toBeDisabled();
    });

    it('renders as anchor when asChild is true', () => {
        render(<Button asChild><a href="/test">Link</a></Button>);
        expect(screen.getByRole('link', { name: 'Link' })).toBeInTheDocument();
    });
});
