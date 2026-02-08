import { z } from "zod";

export const ShiftSlotSchema = z.enum([
	"morning",
	"afternoon",
	"night",
	"overnight",
]);

export const ShiftStaffSchema = z.object({
	id: z.string(),
	name: z.string(),
	role: z.string(),
	department: z.string().optional(),
	color: z.string().optional(),
	attributes: z.record(z.string(), z.string()).optional(),
});

export const ShiftAssignmentSchema = z.object({
	staffId: z.string(),
	date: z.string(), // YYYY-MM-DD
	slots: z.array(ShiftSlotSchema).min(1),
	source: z.enum(["manual", "bulk", "template", "copy"]).default("manual"),
});

export type ShiftSlot = z.infer<typeof ShiftSlotSchema>;
export type ShiftStaff = z.infer<typeof ShiftStaffSchema>;
export type ShiftAssignment = z.infer<typeof ShiftAssignmentSchema>;
