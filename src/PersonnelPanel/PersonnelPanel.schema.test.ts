import { describe, expect, it } from "vitest";
import type { Personnel } from "./PersonnelPanel.schema";

describe("PersonnelPanel.schema", () => {
	it("defines Personnel interface", () => {
		const personnel: Personnel = {
			id: "person-1",
			name: "John Doe",
			department: "Engineering",
			email: "john@example.com",
			priority: 0,
			createdAt: new Date("2025-01-01T00:00:00Z"),
			updatedAt: new Date("2025-01-01T00:00:00Z"),
		};

		expect(personnel.id).toBe("person-1");
		expect(personnel.name).toBe("John Doe");
		expect(personnel.department).toBe("Engineering");
		expect(personnel.email).toBe("john@example.com");
		expect(personnel.priority).toBe(0);
		expect(personnel.createdAt).toBeDefined();
		expect(personnel.updatedAt).toBeDefined();
	});

	it("allows Personnel without optional dates", () => {
		const personnel: Personnel = {
			id: "person-2",
			name: "Jane Smith",
			department: "Design",
			email: "jane@example.com",
			priority: 1,
		};

		expect(personnel.id).toBe("person-2");
		expect(personnel.createdAt).toBeUndefined();
		expect(personnel.updatedAt).toBeUndefined();
	});

	it("allows different priority values", () => {
		const lowPriority: Personnel = {
			id: "person-3",
			name: "Alice Brown",
			department: "Marketing",
			email: "alice@example.com",
			priority: -1,
		};

		const normalPriority: Personnel = {
			id: "person-4",
			name: "Bob Johnson",
			department: "Sales",
			email: "bob@example.com",
			priority: 0,
		};

		const highPriority: Personnel = {
			id: "person-5",
			name: "Charlie Wilson",
			department: "HR",
			email: "charlie@example.com",
			priority: 1,
		};

		expect(lowPriority.priority).toBe(-1);
		expect(normalPriority.priority).toBe(0);
		expect(highPriority.priority).toBe(1);
	});
});
