import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Personnel } from "../../PersonnelPanel/PersonnelPanel.schema";
import type { AttendeeInfo } from "../FacilitySchedule.schema";
import {
	parseAttendees,
	stringifyAttendees,
	useAttendeeManagement,
} from "./useAttendeeManagement";

describe("parseAttendees", () => {
	it("returns empty array for empty string", () => {
		expect(parseAttendees("")).toEqual([]);
	});

	it("parses JSON array of attendees", () => {
		const result = parseAttendees(
			JSON.stringify([
				{
					name: "John Doe",
					email: "john@example.com",
					personnelId: "1",
					type: "personnel",
				},
				{ name: "Jane Smith", type: "external" },
			]),
		);

		expect(result).toHaveLength(2);
		expect(result[0].name).toBe("John Doe");
		expect(result[0].type).toBe("personnel");
		expect(result[1].name).toBe("Jane Smith");
		expect(result[1].type).toBe("external");
	});

	it("parses comma-separated names", () => {
		const result = parseAttendees("John Doe, Jane Smith, Alice Brown");

		expect(result).toHaveLength(3);
		expect(result[0].name).toBe("John Doe");
		expect(result[0].type).toBe("external");
		expect(result[1].name).toBe("Jane Smith");
		expect(result[2].name).toBe("Alice Brown");
	});

	it("parses Japanese comma-separated names", () => {
		const result = parseAttendees("田中太郎、山田花子、鈴木一郎");

		expect(result).toHaveLength(3);
		expect(result[0].name).toBe("田中太郎");
		expect(result[1].name).toBe("山田花子");
		expect(result[2].name).toBe("鈴木一郎");
	});

	it("trims whitespace from names", () => {
		const result = parseAttendees("  John Doe  ,  Jane Smith  ");

		expect(result).toHaveLength(2);
		expect(result[0].name).toBe("John Doe");
		expect(result[1].name).toBe("Jane Smith");
	});

	it("filters empty names", () => {
		const result = parseAttendees("John Doe,, Jane Smith,");

		expect(result).toHaveLength(2);
	});
});

describe("stringifyAttendees", () => {
	it("converts empty array to empty JSON array string", () => {
		expect(stringifyAttendees([])).toBe("[]");
	});

	it("converts attendees to JSON string", () => {
		const result = stringifyAttendees([
			{ name: "John Doe", type: "external" },
			{ name: "Jane Smith", type: "external" },
		]);

		expect(result).toBe(
			'[{"name":"John Doe","type":"external"},{"name":"Jane Smith","type":"external"}]',
		);
	});
});

describe("useAttendeeManagement", () => {
	const mockPersonnel: Personnel[] = [
		{
			id: "person-1",
			name: "John Doe",
			department: "Engineering",
			email: "john@example.com",
			priority: 0,
		},
		{
			id: "person-2",
			name: "Jane Smith",
			department: "Design",
			email: "jane@example.com",
			priority: 1,
		},
	];

	it("returns helper functions", () => {
		const { result } = renderHook(() =>
			useAttendeeManagement({
				personnel: mockPersonnel,
				isEditMode: false,
			}),
		);

		expect(result.current.parseAttendees).toBeInstanceOf(Function);
		expect(result.current.stringifyAttendees).toBeInstanceOf(Function);
		expect(result.current.processAttendeesForSubmit).toBeInstanceOf(Function);
	});

	describe("processAttendeesForSubmit", () => {
		it("returns shouldDelete false in edit mode when attendees are empty", () => {
			const { result } = renderHook(() =>
				useAttendeeManagement({
					personnel: mockPersonnel,
					isEditMode: true,
				}),
			);

			const output = result.current.processAttendeesForSubmit("[]");

			expect(output.finalAttendees).toBe("[]");
			expect(output.shouldDelete).toBe(false);
		});

		it("returns shouldDelete false in edit mode when attendee string is empty", () => {
			const { result } = renderHook(() =>
				useAttendeeManagement({
					personnel: mockPersonnel,
					isEditMode: true,
				}),
			);

			const output = result.current.processAttendeesForSubmit("");

			expect(output.finalAttendees).toBe("[]");
			expect(output.shouldDelete).toBe(false);
		});

		it("returns shouldDelete false in edit mode when attendees exist", () => {
			const { result } = renderHook(() =>
				useAttendeeManagement({
					personnel: mockPersonnel,
					isEditMode: true,
				}),
			);

			const attendees = [{ name: "John Doe", type: "external" }];
			const output = result.current.processAttendeesForSubmit(
				JSON.stringify(attendees),
			);

			expect(output.shouldDelete).toBe(false);
			expect(output.finalAttendees).toContain("John Doe");
		});

		it("adds current user to attendees in create mode if not already included", () => {
			const { result } = renderHook(() =>
				useAttendeeManagement({
					personnel: mockPersonnel,
					currentUserId: "person-1",
					isEditMode: false,
				}),
			);

			const attendees = [{ name: "Jane Smith", type: "external" }];
			const output = result.current.processAttendeesForSubmit(
				JSON.stringify(attendees),
			);

			const parsed = JSON.parse(output.finalAttendees) as AttendeeInfo[];
			expect(parsed).toHaveLength(2);
			expect(parsed.some((a) => a.personnelId === "person-1")).toBe(true);
		});

		it("does not add current user if already included", () => {
			const { result } = renderHook(() =>
				useAttendeeManagement({
					personnel: mockPersonnel,
					currentUserId: "person-1",
					isEditMode: false,
				}),
			);

			const attendees = [
				{ name: "John Doe", type: "personnel", personnelId: "person-1" },
				{ name: "Jane Smith", type: "external" },
			];
			const output = result.current.processAttendeesForSubmit(
				JSON.stringify(attendees),
			);

			const parsed = JSON.parse(output.finalAttendees) as AttendeeInfo[];
			expect(parsed).toHaveLength(2);
			expect(parsed.filter((a) => a.personnelId === "person-1")).toHaveLength(
				1,
			);
		});

		it("does not add current user in edit mode", () => {
			const { result } = renderHook(() =>
				useAttendeeManagement({
					personnel: mockPersonnel,
					currentUserId: "person-1",
					isEditMode: true,
				}),
			);

			const attendees = [{ name: "Jane Smith", type: "external" }];
			const output = result.current.processAttendeesForSubmit(
				JSON.stringify(attendees),
			);

			const parsed = JSON.parse(output.finalAttendees);
			expect(parsed).toHaveLength(1);
			expect(parsed[0].name).toBe("Jane Smith");
		});

		it("handles invalid JSON gracefully", () => {
			const { result } = renderHook(() =>
				useAttendeeManagement({
					personnel: mockPersonnel,
					isEditMode: false,
				}),
			);

			const output = result.current.processAttendeesForSubmit("invalid json");

			expect(output.finalAttendees).toBe("[]");
			expect(output.shouldDelete).toBe(false);
		});

		it("handles personnel not found for currentUserId", () => {
			const { result } = renderHook(() =>
				useAttendeeManagement({
					personnel: mockPersonnel,
					currentUserId: "person-999",
					isEditMode: false,
				}),
			);

			const attendees = [{ name: "Jane Smith", type: "external" }];
			const output = result.current.processAttendeesForSubmit(
				JSON.stringify(attendees),
			);

			const parsed = JSON.parse(output.finalAttendees);
			expect(parsed).toHaveLength(1);
			expect(parsed[0].name).toBe("Jane Smith");
		});
	});
});
