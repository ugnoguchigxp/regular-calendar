import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("utils", () => {
	describe("cn", () => {
		it("merges class names", () => {
			expect(cn("foo", "bar")).toBe("foo bar");
		});

		it("handles conditional classes", () => {
			expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
		});

		it("handles arrays", () => {
			expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
		});

		it("handles objects", () => {
			expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
		});

		it("removes conflicting tailwind classes", () => {
			expect(cn("px-[var(--ui-space-2)] px-[var(--ui-space-4)]")).toBe(
				"px-[var(--ui-space-4)]",
			);
		});

		it("handles undefined and null values", () => {
			expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
		});

		it("handles empty inputs", () => {
			expect(cn()).toBe("");
		});

		it("handles mixed input types", () => {
			expect(
				cn("px-[var(--ui-space-2)]", { py: true, py2: false }, ["text-sm"]),
			).toBe("px-[var(--ui-space-2)] py text-sm");
		});
	});
});
