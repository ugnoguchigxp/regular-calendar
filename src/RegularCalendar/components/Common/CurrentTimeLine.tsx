/**
 * Current Time Line Component
 */

import type React from 'react';
import { getCurrentTimePosition, isCurrentTimeInRange } from '../../utils/calendarHelpers';

interface CurrentTimeLineProps {
    /** Time Interval (minutes) */
    interval: number;
    /** Is Today */
    isToday: boolean;
    /** Start Hour */
    startHour: number;
    /** End Hour */
    endHour: number;
    /** Relative positioning */
    relative?: boolean;
}

/**
 * Visual line indicating the current time
 */
export const CurrentTimeLine: React.FC<CurrentTimeLineProps> = ({
    interval,
    isToday,
    startHour,
    endHour,
    relative = false,
}) => {
    if (!isToday || !isCurrentTimeInRange(startHour, endHour)) {
        return null;
    }

    const position = getCurrentTimePosition(interval, startHour);

    return (
        <>
            {/* Current Time Dot */}
            <div
                className={`${relative ? 'absolute' : 'fixed'} left-0 w-2 h-2 bg-red-500 rounded-full -translate-x-1`}
                style={{ top: `${position}px`, zIndex: 20 }}
                aria-hidden="true"
            />
            {/* Current Time Line */}
            <div
                className={`${relative ? 'absolute' : 'fixed'} left-0 right-0 h-0.5 bg-red-500`}
                style={{ top: `${position}px`, zIndex: 20 }}
                aria-hidden="true"
            />
        </>
    );
};
