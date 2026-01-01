'use client';

import {
    type ReactNode,
    createContext,
    useContext,
    useEffect,
    useMemo,
} from 'react';
import { defaultThemeApplier, type ThemeApplier } from './ThemeApplier';

/**
 * UI Density presets
 */
export type UIDensity = 'compact' | 'normal' | 'spacious';

/**
 * Theme configuration options
 * All size values are in rem unless otherwise specified
 */
export interface ThemeConfig {
    /** UI density preset: 'compact' | 'normal' | 'spacious' */
    density?: UIDensity;

    /** Enable tablet mode (optimized for touch) */
    tabletMode?: boolean;

    /** Border radius in rem (e.g., 0.5 = 8px) */
    radius?: number;

    /** Base font size in rem (e.g., 0.875 = 14px) */
    fontSize?: number;

    /** Component height in rem */
    componentHeight?: number;

    /** List row height in rem */
    listRowHeight?: number;

    /** Horizontal component padding in rem */
    paddingX?: number;

    /** Vertical component padding in rem */
    paddingY?: number;

    /** Button horizontal padding in rem */
    buttonPaddingX?: number;

    /** Button vertical padding in rem */
    buttonPaddingY?: number;

    /** Base gap between elements in rem */
    gap?: number;

    /** Icon size in rem */
    iconSize?: number;

    /** Table cell padding in rem */
    tableCellPadding?: number;

    /** Minimum touch target size in px (for accessibility) */
    touchTargetMin?: number;

    /** Modal padding in rem */
    modalPadding?: number;

    /** Checkbox size in rem */
    checkboxSize?: number;

    /** Badge horizontal padding in rem */
    badgePaddingX?: number;

    /** Badge vertical padding in rem */
    badgePaddingY?: number;

    /** Card padding in rem */
    cardPadding?: number;

    /** Left drawer width in px */
    drawerWidthLeft?: number;

    /** Right drawer width in px */
    drawerWidthRight?: number;

    /** Step circle size in rem */
    stepCircleSize?: number;

    /** Switch width in rem */
    switchWidth?: number;

    /** Switch height in rem */
    switchHeight?: number;

    /** Switch thumb size in rem */
    switchThumbSize?: number;

    /** Keypad button height in rem */
    keypadButtonHeight?: number;
}

interface ThemeProviderProps {
    /** Theme configuration */
    config?: ThemeConfig;
    /** Child components */
    children: ReactNode;
    /** Theme applier for DOM operations (injectable for testing) */
    applier?: ThemeApplier;
}

const ThemeContext = createContext<ThemeConfig | undefined>(undefined);

/**
 * Hook to access current theme configuration
 */
export function useTheme(): ThemeConfig | undefined {
    return useContext(ThemeContext);
}

/**
 * ThemeProvider component for customizing UI tokens
 *
 * @example
 * ```tsx
 * <ThemeProvider config={{
 *   density: 'compact',
 *   radius: 0.5,
 *   fontSize: 0.875,
 * }}>
 *   <FacilitySchedule ... />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ config = {}, applier = defaultThemeApplier, children }: ThemeProviderProps) {
    // Memoize config to prevent unnecessary re-renders
    const memoizedConfig = useMemo(() => config, [
        config.density,
        config.tabletMode,
        config.radius,
        config.fontSize,
        config.componentHeight,
        config.listRowHeight,
        config.paddingX,
        config.paddingY,
        config.buttonPaddingX,
        config.buttonPaddingY,
        config.gap,
        config.iconSize,
        config.tableCellPadding,
        config.touchTargetMin,
        config.modalPadding,
        config.checkboxSize,
        config.badgePaddingX,
        config.badgePaddingY,
        config.cardPadding,
        config.drawerWidthLeft,
        config.drawerWidthRight,
        config.stepCircleSize,
        config.switchWidth,
        config.switchHeight,
        config.switchThumbSize,
        config.keypadButtonHeight,
    ]);

    useEffect(() => {
        applier.applyVariables(memoizedConfig);

        return () => {
            applier.removeVariables();
        };
    }, [memoizedConfig, applier]);

    return (
        <ThemeContext.Provider value={memoizedConfig}>
            {children}
        </ThemeContext.Provider>
    );
}
