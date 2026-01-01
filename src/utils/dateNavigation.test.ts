import { describe, it, expect, beforeEach, vi } from 'vitest';
import { navigateDate, getToday } from './dateNavigation';

describe('dateNavigation', () => {
    beforeEach(() => {
        vi.setSystemTime(new Date('2025-01-01T12:00:00Z'));
    });

    describe('navigateDate', () => {
        it('moves to next day in day view', () => {
            const date = new Date('2025-01-01T00:00:00Z');
            const result = navigateDate(date, 'day', 'next');
            expect(result.toISOString()).toBe('2025-01-02T00:00:00.000Z');
        });

        it('moves to previous day in day view', () => {
            const date = new Date('2025-01-02T00:00:00Z');
            const result = navigateDate(date, 'day', 'prev');
            expect(result.toISOString()).toBe('2025-01-01T00:00:00.000Z');
        });

        it('moves to next week in week view', () => {
            const date = new Date('2025-01-01T00:00:00Z');
            const result = navigateDate(date, 'week', 'next');
            expect(result.toISOString()).toBe('2025-01-08T00:00:00.000Z');
        });

        it('moves to previous week in week view', () => {
            const date = new Date('2025-01-08T00:00:00Z');
            const result = navigateDate(date, 'week', 'prev');
            expect(result.toISOString()).toBe('2025-01-01T00:00:00.000Z');
        });

        it('moves to next month in month view', () => {
            const date = new Date('2025-01-15T00:00:00Z');
            const result = navigateDate(date, 'month', 'next');
            expect(result.toISOString()).toBe('2025-02-15T00:00:00.000Z');
        });

        it('moves to previous month in month view', () => {
            const date = new Date('2025-02-15T00:00:00Z');
            const result = navigateDate(date, 'month', 'prev');
            expect(result.toISOString()).toBe('2025-01-15T00:00:00.000Z');
        });

        it('handles year boundaries in day view', () => {
            const date = new Date('2025-12-31T00:00:00Z');
            const result = navigateDate(date, 'day', 'next');
            expect(result.toISOString()).toBe('2026-01-01T00:00:00.000Z');
        });

        it('handles year boundaries in month view', () => {
            const date = new Date('2025-12-15T00:00:00Z');
            const result = navigateDate(date, 'month', 'next');
            expect(result.toISOString()).toBe('2026-01-15T00:00:00.000Z');
        });

        it('handles leap years in day view', () => {
            const date = new Date('2024-02-28T00:00:00Z');
            const result = navigateDate(date, 'day', 'next');
            expect(result.toISOString()).toBe('2024-02-29T00:00:00.000Z');
        });
    });

    describe('getToday', () => {
        it('returns today date with time reset to 0:00:00', () => {
            const today = getToday();
            const expected = new Date();
            expected.setHours(0, 0, 0, 0);
            
            expect(today.getFullYear()).toBe(expected.getFullYear());
            expect(today.getMonth()).toBe(expected.getMonth());
            expect(today.getDate()).toBe(expected.getDate());
            expect(today.getHours()).toBe(0);
            expect(today.getMinutes()).toBe(0);
            expect(today.getSeconds()).toBe(0);
            expect(today.getMilliseconds()).toBe(0);
        });
    });
});
