import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type {
	ShiftAssignment,
	ShiftSelectorFilterBarProps,
	ShiftSelectorHeaderProps,
	ShiftSelectorMonthGridProps,
	ShiftStaff,
} from "./index";
import { ShiftSelector } from "./ShiftSelector";
import type { ShiftAssignmentDiff } from "./ShiftSelector.utils";
import { calculateAssignmentDiff, hasDiff } from "./ShiftSelector.utils";

const staff: ShiftStaff[] = [
	{ id: "s1", name: "山田 NS", role: "NS", department: "看護" },
	{ id: "s2", name: "佐藤 Dr", role: "Dr", department: "医師" },
	{ id: "s3", name: "鈴木 Tech", role: "Tech", department: "技士" },
];

function TestMonthGrid({
	dayCells,
	eraseMode,
	onDateClick,
	onDeleteAssignment,
	onClearDateAssignments,
}: ShiftSelectorMonthGridProps) {
	const target = dayCells.find((cell) => cell.dateKey === "2026-02-10");
	const rows = target
		? target.assignments
				.map((row) => `${row.staffName}:${row.slots.join("+")}`)
				.join("|")
		: "";

	return (
		<div>
			<div data-testid="rows-0210">{rows}</div>
			<div data-testid="erase-mode">{String(eraseMode)}</div>
			<button type="button" onClick={() => onDateClick("2026-02-10")}>
				assign-0210
			</button>
			<button
				type="button"
				onClick={() => onDeleteAssignment("2026-02-10", "s1")}
			>
				delete-s1
			</button>
			<button
				type="button"
				onClick={() => onClearDateAssignments("2026-02-10")}
			>
				clear-0210
			</button>
		</div>
	);
}

function latestAssignments(mock: ReturnType<typeof vi.fn>): ShiftAssignment[] {
	const call = mock.mock.calls[mock.mock.calls.length - 1] as
		| [ShiftAssignment[]]
		| undefined;
	return call?.[0] ?? [];
}

describe("ShiftSelector", () => {
	it("assigns selected slots to multiple selected staff", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();

		render(
			<ShiftSelector
				staff={staff}
				selectedStaffIds={["s1", "s2"]}
				targetMonth={new Date("2026-02-01T00:00:00")}
				onChange={onChange}
				components={{
					MonthGrid: TestMonthGrid,
				}}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "assign-0210" }));

		await waitFor(() => {
			expect(latestAssignments(onChange)).toEqual(
				expect.arrayContaining([
					{
						staffId: "s1",
						date: "2026-02-10",
						slots: ["morning"],
						source: "bulk",
					},
					{
						staffId: "s2",
						date: "2026-02-10",
						slots: ["morning"],
						source: "bulk",
					},
				]),
			);
		});
	});

	it("supports assigning multiple slots", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();

		render(
			<ShiftSelector
				staff={staff}
				selectedStaffIds={["s1"]}
				targetMonth={new Date("2026-02-01T00:00:00")}
				onChange={onChange}
				components={{
					MonthGrid: TestMonthGrid,
				}}
			/>,
		);

		await user.click(screen.getAllByLabelText("午後")[0]);
		await user.click(screen.getByRole("button", { name: "assign-0210" }));

		await waitFor(() => {
			expect(latestAssignments(onChange)).toEqual(
				expect.arrayContaining([
					{
						staffId: "s1",
						date: "2026-02-10",
						slots: ["morning", "afternoon"],
						source: "manual",
					},
				]),
			);
		});
	});

	it("filters visible slots and keeps sort order by slot time", async () => {
		const user = userEvent.setup();
		const initialAssignments: ShiftAssignment[] = [
			{ staffId: "s1", date: "2026-02-10", slots: ["night"], source: "manual" },
			{
				staffId: "s2",
				date: "2026-02-10",
				slots: ["morning"],
				source: "manual",
			},
			{
				staffId: "s3",
				date: "2026-02-10",
				slots: ["morning"],
				source: "manual",
			},
		];

		render(
			<ShiftSelector
				staff={staff}
				targetMonth={new Date("2026-02-01T00:00:00")}
				initialAssignments={initialAssignments}
				components={{
					MonthGrid: TestMonthGrid,
				}}
			/>,
		);

		expect(screen.getByTestId("rows-0210")).toHaveTextContent(
			"佐藤 Dr:morning|鈴木 Tech:morning|山田 NS:night",
		);

		await user.click(screen.getAllByLabelText("夜間")[1]);

		await waitFor(() => {
			expect(screen.getByTestId("rows-0210")).toHaveTextContent(
				"佐藤 Dr:morning|鈴木 Tech:morning",
			);
			expect(screen.getByTestId("rows-0210")).not.toHaveTextContent(
				"山田 NS:night",
			);
		});
	});

	it("toggles erase mode and supports delete / clear actions", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();

		render(
			<ShiftSelector
				staff={staff}
				targetMonth={new Date("2026-02-01T00:00:00")}
				initialAssignments={[
					{
						staffId: "s1",
						date: "2026-02-10",
						slots: ["morning"],
						source: "manual",
					},
					{
						staffId: "s2",
						date: "2026-02-10",
						slots: ["afternoon"],
						source: "manual",
					},
				]}
				onChange={onChange}
				components={{
					MonthGrid: TestMonthGrid,
				}}
			/>,
		);

		expect(screen.getByTestId("erase-mode")).toHaveTextContent("false");
		await user.click(screen.getByRole("button", { name: "削除モード" }));
		expect(screen.getByTestId("erase-mode")).toHaveTextContent("true");

		await user.click(screen.getByRole("button", { name: "delete-s1" }));
		await waitFor(() => {
			expect(latestAssignments(onChange)).toEqual([
				{
					staffId: "s2",
					date: "2026-02-10",
					slots: ["afternoon"],
					source: "manual",
				},
			]);
		});

		await user.click(screen.getByRole("button", { name: "clear-0210" }));
		await waitFor(() => {
			expect(latestAssignments(onChange)).toEqual([]);
		});
	});

	it("accepts custom header / filter / month components", () => {
		const Header = ({ onToday }: ShiftSelectorHeaderProps) => (
			<button type="button" data-testid="custom-header" onClick={onToday}>
				header
			</button>
		);
		const Filter = ({ eraseMode }: ShiftSelectorFilterBarProps) => (
			<div data-testid="custom-filter">{String(eraseMode)}</div>
		);
		const Month = ({ dayCells }: ShiftSelectorMonthGridProps) => (
			<div data-testid="custom-month">{dayCells.length}</div>
		);

		render(
			<ShiftSelector
				staff={staff}
				targetMonth={new Date("2026-02-01T00:00:00")}
				components={{
					Header,
					FilterBar: Filter,
					MonthGrid: Month,
				}}
			/>,
		);

		expect(screen.getByTestId("custom-header")).toBeInTheDocument();
		expect(screen.getByTestId("custom-filter")).toBeInTheDocument();
		expect(screen.getByTestId("custom-month")).toHaveTextContent("42");
	});

	it("calls onConfirm with diff when confirm button is clicked", async () => {
		const user = userEvent.setup();
		const onConfirm = vi.fn();
		const initialAssignments: ShiftAssignment[] = [
			{
				staffId: "s1",
				date: "2026-02-10",
				slots: ["morning"],
				source: "manual",
			},
		];

		render(
			<ShiftSelector
				staff={staff}
				selectedStaffIds={["s2"]}
				targetMonth={new Date("2026-02-01T00:00:00")}
				initialAssignments={initialAssignments}
				onConfirm={onConfirm}
				components={{
					MonthGrid: TestMonthGrid,
				}}
			/>,
		);

		// Add a new assignment
		await user.click(screen.getByRole("button", { name: "assign-0210" }));

		// Click confirm button
		await user.click(screen.getByRole("button", { name: "確定" }));

		await waitFor(() => {
			expect(onConfirm).toHaveBeenCalled();
			const diff = onConfirm.mock.calls[0][0] as ShiftAssignmentDiff;
			expect(diff.added).toHaveLength(1);
			expect(diff.added[0]).toMatchObject({
				staffId: "s2",
				date: "2026-02-10",
				slots: ["morning"],
			});
		});
	});

	it("disables confirm button when no changes", () => {
		const onConfirm = vi.fn();
		const initialAssignments: ShiftAssignment[] = [
			{
				staffId: "s1",
				date: "2026-02-10",
				slots: ["morning"],
				source: "manual",
			},
		];

		render(
			<ShiftSelector
				staff={staff}
				targetMonth={new Date("2026-02-01T00:00:00")}
				initialAssignments={initialAssignments}
				onConfirm={onConfirm}
			/>,
		);

		const confirmButton = screen.getByRole("button", { name: "確定" });
		expect(confirmButton).toBeDisabled();
	});
});

describe("calculateAssignmentDiff", () => {
	it("detects added assignments", () => {
		const original: ShiftAssignment[] = [];
		const current: ShiftAssignment[] = [
			{
				staffId: "s1",
				date: "2026-02-10",
				slots: ["morning"],
				source: "manual",
			},
		];

		const diff = calculateAssignmentDiff(original, current);

		expect(diff.added).toHaveLength(1);
		expect(diff.added[0].staffId).toBe("s1");
		expect(diff.updated).toHaveLength(0);
		expect(diff.deleted).toHaveLength(0);
	});

	it("detects updated assignments", () => {
		const original: ShiftAssignment[] = [
			{
				staffId: "s1",
				date: "2026-02-10",
				slots: ["morning"],
				source: "manual",
			},
		];
		const current: ShiftAssignment[] = [
			{
				staffId: "s1",
				date: "2026-02-10",
				slots: ["morning", "afternoon"],
				source: "manual",
			},
		];

		const diff = calculateAssignmentDiff(original, current);

		expect(diff.added).toHaveLength(0);
		expect(diff.updated).toHaveLength(1);
		expect(diff.updated[0].slots).toEqual(["morning", "afternoon"]);
		expect(diff.deleted).toHaveLength(0);
	});

	it("detects deleted assignments", () => {
		const original: ShiftAssignment[] = [
			{
				staffId: "s1",
				date: "2026-02-10",
				slots: ["morning"],
				source: "manual",
			},
		];
		const current: ShiftAssignment[] = [];

		const diff = calculateAssignmentDiff(original, current);

		expect(diff.added).toHaveLength(0);
		expect(diff.updated).toHaveLength(0);
		expect(diff.deleted).toHaveLength(1);
		expect(diff.deleted[0]).toEqual({ staffId: "s1", date: "2026-02-10" });
	});

	it("handles mixed changes", () => {
		const original: ShiftAssignment[] = [
			{
				staffId: "s1",
				date: "2026-02-10",
				slots: ["morning"],
				source: "manual",
			},
			{
				staffId: "s2",
				date: "2026-02-10",
				slots: ["afternoon"],
				source: "manual",
			},
		];
		const current: ShiftAssignment[] = [
			{
				staffId: "s1",
				date: "2026-02-10",
				slots: ["morning", "night"],
				source: "manual",
			},
			{
				staffId: "s3",
				date: "2026-02-10",
				slots: ["overnight"],
				source: "manual",
			},
		];

		const diff = calculateAssignmentDiff(original, current);

		expect(diff.added).toHaveLength(1);
		expect(diff.added[0].staffId).toBe("s3");
		expect(diff.updated).toHaveLength(1);
		expect(diff.updated[0].staffId).toBe("s1");
		expect(diff.deleted).toHaveLength(1);
		expect(diff.deleted[0].staffId).toBe("s2");
	});

	it("returns empty diff when no changes", () => {
		const assignments: ShiftAssignment[] = [
			{
				staffId: "s1",
				date: "2026-02-10",
				slots: ["morning"],
				source: "manual",
			},
		];

		const diff = calculateAssignmentDiff(assignments, assignments);

		expect(diff.added).toHaveLength(0);
		expect(diff.updated).toHaveLength(0);
		expect(diff.deleted).toHaveLength(0);
	});
});

describe("hasDiff", () => {
	it("returns true when there are changes", () => {
		const original: ShiftAssignment[] = [];
		const current: ShiftAssignment[] = [
			{
				staffId: "s1",
				date: "2026-02-10",
				slots: ["morning"],
				source: "manual",
			},
		];

		expect(hasDiff(original, current)).toBe(true);
	});

	it("returns false when no changes", () => {
		const assignments: ShiftAssignment[] = [
			{
				staffId: "s1",
				date: "2026-02-10",
				slots: ["morning"],
				source: "manual",
			},
		];

		expect(hasDiff(assignments, assignments)).toBe(false);
	});
});
