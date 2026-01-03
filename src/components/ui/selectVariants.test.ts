import { describe, expect, it } from "vitest";
import { selectItemVariants, selectTriggerVariants } from "./selectVariants";

describe("selectVariants", () => {
	it("returns default trigger classes", () => {
		const classes = selectTriggerVariants();
		expect(classes).toContain("border");
		expect(classes).toContain("bg-background");
	});

	it("returns ghost trigger classes", () => {
		const classes = selectTriggerVariants({ variant: "ghost" });
		expect(classes).toContain("bg-transparent");
	});

	it("returns item classes with indicator padding", () => {
		const classes = selectItemVariants({
			padding: "withIndicator",
			size: "sm",
		});
		expect(classes).toContain("pl-");
		expect(classes).toContain("text-sm");
	});
});
