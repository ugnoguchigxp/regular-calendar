import { describe, it, expect } from 'vitest';
import { PERSONNEL_COLORS, getPersonnelColor, createPersonnelColorMap } from './personnelColors';

describe('personnelColors', () => {
    describe('PERSONNEL_COLORS', () => {
        it('has exactly 20 colors', () => {
            expect(PERSONNEL_COLORS).toHaveLength(20);
        });

        it('contains valid hex color codes', () => {
            PERSONNEL_COLORS.forEach((color) => {
                expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
            });
        });

        it('has distinct colors', () => {
            const uniqueColors = new Set(PERSONNEL_COLORS);
            expect(uniqueColors.size).toBe(PERSONNEL_COLORS.length);
        });
    });

    describe('getPersonnelColor', () => {
        it('returns color for index 0', () => {
            expect(getPersonnelColor(0)).toBe(PERSONNEL_COLORS[0]);
        });

        it('returns color for index within range', () => {
            expect(getPersonnelColor(5)).toBe(PERSONNEL_COLORS[5]);
            expect(getPersonnelColor(19)).toBe(PERSONNEL_COLORS[19]);
        });

        it('cycles through colors for indices beyond range', () => {
            expect(getPersonnelColor(20)).toBe(PERSONNEL_COLORS[0]);
            expect(getPersonnelColor(21)).toBe(PERSONNEL_COLORS[1]);
            expect(getPersonnelColor(40)).toBe(PERSONNEL_COLORS[0]);
        });

        it('returns undefined for negative indices (modulo behavior)', () => {
            // JavaScript's % operator returns negative for negative inputs
            // -1 % 20 = -1, so PERSONNEL_COLORS[-1] is undefined
            expect(getPersonnelColor(-1)).toBeUndefined();
            expect(getPersonnelColor(-2)).toBeUndefined();
        });
    });

    describe('createPersonnelColorMap', () => {
        it('creates map for single id', () => {
            const map = createPersonnelColorMap(['person1']);
            expect(map.get('person1')).toBe(PERSONNEL_COLORS[0]);
            expect(map.size).toBe(1);
        });

        it('creates map for multiple ids', () => {
            const map = createPersonnelColorMap(['person1', 'person2', 'person3']);
            expect(map.get('person1')).toBe(PERSONNEL_COLORS[0]);
            expect(map.get('person2')).toBe(PERSONNEL_COLORS[1]);
            expect(map.get('person3')).toBe(PERSONNEL_COLORS[2]);
            expect(map.size).toBe(3);
        });

        it('cycles colors for many ids', () => {
            const ids = ['person1', 'person2', 'person3', 'person4', 'person5'];
            const map = createPersonnelColorMap(ids);
            expect(map.get('person5')).toBe(PERSONNEL_COLORS[4]);
        });

        it('handles empty array', () => {
            const map = createPersonnelColorMap([]);
            expect(map.size).toBe(0);
        });

        it('handles more ids than colors', () => {
            const ids = Array.from({ length: 25 }, (_, i) => `person${i}`);
            const map = createPersonnelColorMap(ids);
            expect(map.get('person20')).toBe(PERSONNEL_COLORS[0]);
            expect(map.get('person24')).toBe(PERSONNEL_COLORS[4]);
            expect(map.size).toBe(25);
        });
    });
});
