import { describe, expect, it } from "vitest";
import {
	ShiftAssignmentSchema,
	ShiftSlotSchema,
	ShiftStaffSchema,
} from "./ShiftSelector.schema";

describe("ShiftSelector.schema", () => {
	it("supports slots", () => {
		expect(ShiftSlotSchema.parse("morning")).toBe("morning");
		expect(ShiftSlotSchema.parse("overnight")).toBe("overnight");
	});

	it("parses shift staff with attributes", () => {
		const parsed = ShiftStaffSchema.parse({
			id: "staff-1",
			name: "山田 看護師",
			role: "NS",
			department: "透析室",
			attributes: {
				team: "A",
				contract: "常勤",
			},
		});

		expect(parsed.id).toBe("staff-1");
		expect(parsed.department).toBe("透析室");
		expect(parsed.attributes?.team).toBe("A");
	});

	it("parses shift assignment with multiple slots", () => {
		const parsed = ShiftAssignmentSchema.parse({
			staffId: "staff-1",
			date: "2026-02-07",
			slots: ["morning", "afternoon"],
			source: "bulk",
		});

		expect(parsed.staffId).toBe("staff-1");
		expect(parsed.date).toBe("2026-02-07");
		expect(parsed.slots).toEqual(["morning", "afternoon"]);
		expect(parsed.source).toBe("bulk");
	});
});
