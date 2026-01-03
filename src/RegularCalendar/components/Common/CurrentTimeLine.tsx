/**
 * Current Time Line Component
 */

import React from "react";
import {
	getCurrentTimePosition,
	isCurrentTimeInRange,
} from "../../utils/calendarHelpers";

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
	/** Time Zone */
	timeZone?: string;
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
	timeZone = "Asia/Tokyo",
}) => {
	// State to force re-render/update position
	const [now, setNow] = React.useState(new Date());

	React.useEffect(() => {
		// Update every minute
		const timer = setInterval(() => {
			setNow(new Date());
		}, 60000);

		return () => clearInterval(timer);
	}, []);

	if (!isToday || !isCurrentTimeInRange(startHour, endHour, timeZone)) {
		return null;
	}

	const position = getCurrentTimePosition(interval, startHour, timeZone);

	return (
		<>
			{/* Current Time Dot */}
			<div
				className={`${relative ? "absolute" : "fixed"} left-[var(--ui-space-0)] w-[var(--ui-space-2)] h-[var(--ui-space-2)] bg-red-500 rounded-full -translate-x-[var(--ui-space-1)]`}
				style={{ top: `${position}px`, zIndex: 20 }}
				aria-hidden="true"
				title={`Current time: ${now.toLocaleTimeString()}`}
			/>
			{/* Current Time Line */}
			<div
				className={`${relative ? "absolute" : "fixed"} left-[var(--ui-space-0)] right-[var(--ui-space-0)] h-[var(--ui-space-0-5)] bg-red-500`}
				style={{ top: `${position}px`, zIndex: 20 }}
				aria-hidden="true"
			/>
		</>
	);
};
