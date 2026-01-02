import type {
	FacilityScheduleSettings,
	TimeSlot,
} from "../FacilitySchedule.schema";

function timeToMinutes(time: string): number {
	const parts = time.split(":");
	const hours = Number.parseInt(parts[0] ?? "0", 10);
	const minutes = Number.parseInt(parts[1] ?? "0", 10);
	return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

export function generateTimeSlots(
	slotsPerDay: number,
	startTime: string,
	endTime: string,
	customTimeSlots?: TimeSlot[],
): TimeSlot[] {
	if (customTimeSlots && customTimeSlots.length === slotsPerDay) {
		return customTimeSlots;
	}

	const startMinutes = timeToMinutes(startTime);
	const endMinutes = timeToMinutes(endTime);
	const totalMinutes = endMinutes - startMinutes;
	const slotDuration = Math.floor(totalMinutes / Math.max(1, slotsPerDay));

	const labels = ["Morning", "Afternoon", "Evening", "Night"];
	const timeSlots: TimeSlot[] = [];

	for (let i = 0; i < slotsPerDay; i++) {
		const slotStart = startMinutes + slotDuration * i;
		const slotEnd =
			i === slotsPerDay - 1 ? endMinutes : slotStart + slotDuration;

		let label = labels[i] || `Slot ${i + 1}`;

		if (slotsPerDay === 4 && i >= 1 && i <= 2) {
			label = `Afternoon ${i}`;
		}

		timeSlots.push({
			id: String(i), // Schema defines id as string? Let's check schema. Usually string for generic.
			label,
			startTime: minutesToTime(slotStart),
			endTime: minutesToTime(slotEnd),
		});
	}

	return timeSlots;
}

export function getTimeSlot(
	scheduleStart: Date,
	timeSlots: TimeSlot[],
): TimeSlot | null {
	const hours = scheduleStart.getHours();
	const minutes = scheduleStart.getMinutes();
	const startMinutes = hours * 60 + minutes;

	for (const slot of timeSlots) {
		const slotStartMinutes = timeToMinutes(slot.startTime);
		const slotEndMinutes = timeToMinutes(slot.endTime);

		if (startMinutes >= slotStartMinutes && startMinutes < slotEndMinutes) {
			return slot;
		}
	}

	return null;
}

export function getDefaultSettings(): FacilityScheduleSettings {
	return {
		defaultDuration: 60, // minutes
		startTime: "08:00",
		endTime: "20:00",
		closedDays: [0], // Sunday
		weekStartsOn: 1, // Monday
		// NOTE: Schema might need timeSlots or generic structure
		// If schema is strict, I must adhere.
		// I'll stick to what I wrote in schema:
		/*
    export const FacilityScheduleSettingsSchema = z.object({
        startTime: z.string(),
        endTime: z.string(),
        defaultEventDuration: z.number(), // in minutes
        closedDays: z.array(z.number()),
        weekStartsOn: z.number().min(0).max(6), // 0=Sunday
        colorScheme: z.string().optional(),
    });
    */
		// There are no 'timeSlots' or 'treatmentsPerDay' in my new schema!
		// So 'generateTimeSlots' is extra "utility" logic that might not be stored in settings.
		// I will keep the utility functions independent of Settings object structure if possible.
	};
}

export function isClosedDay(date: Date, closedDays: number[]): boolean {
	const dayOfWeek = date.getDay();
	return closedDays.includes(dayOfWeek);
}
