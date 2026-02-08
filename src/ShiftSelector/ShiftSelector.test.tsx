import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import type {
	ShiftAssignment,
	ShiftSelectorFilterBarProps,
	ShiftSelectorHeaderProps,
	ShiftSelectorMonthGridProps,
	ShiftSelectorStaffPanelProps,
	ShiftStaff,
} from "./index";
import { ShiftSelector } from "./ShiftSelector";

const staff: ShiftStaff[] = [
	{ id: "s1", name: "山田 NS", role: "NS", department: "看護" },
	{ id: "s2", name: "佐藤 Dr", role: "Dr", department: "医師" },
	{ id: "s3", name: "鈴木 Tech", role: "Tech", department: "技士" },
];

function TestStaffPanel({ onSelectionChange }: ShiftSelectorStaffPanelProps) {
	return (
		<div>
			<button type="button" onClick={() => onSelectionChange(["s1"])}>
				select-s1
			</button>
			<button type="button" onClick={() => onSelectionChange(["s1", "s2"])}>
				select-s1-s2
			</button>
		</div>
	);
}

function AutoSelectS1Panel({
	selectedIds,
	onSelectionChange,
}: ShiftSelectorStaffPanelProps) {
	useEffect(() => {
		if (selectedIds.length !== 1 || selectedIds[0] !== "s1") {
			onSelectionChange(["s1"]);
		}
	}, [selectedIds, onSelectionChange]);

	return <div data-testid="auto-select-s1">{selectedIds.join(",")}</div>;
}

function AutoSelectS1S2Panel({
	selectedIds,
	onSelectionChange,
}: ShiftSelectorStaffPanelProps) {
	useEffect(() => {
		if (
			selectedIds.length !== 2 ||
			selectedIds[0] !== "s1" ||
			selectedIds[1] !== "s2"
		) {
			onSelectionChange(["s1", "s2"]);
		}
	}, [selectedIds, onSelectionChange]);

	return <div data-testid="auto-select-s1s2">{selectedIds.join(",")}</div>;
}

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
				targetMonth={new Date("2026-02-01T00:00:00")}
				onChange={onChange}
				components={{
					StaffPanel: AutoSelectS1S2Panel,
					MonthGrid: TestMonthGrid,
				}}
			/>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("auto-select-s1s2")).toHaveTextContent("s1,s2");
		});
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
				targetMonth={new Date("2026-02-01T00:00:00")}
				onChange={onChange}
				components={{
					StaffPanel: AutoSelectS1Panel,
					MonthGrid: TestMonthGrid,
				}}
			/>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("auto-select-s1")).toHaveTextContent("s1");
		});
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
					StaffPanel: TestStaffPanel,
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
					StaffPanel: TestStaffPanel,
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

	it("accepts custom header / filter / month / staff components", () => {
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
		const StaffPanel = ({ personnel }: ShiftSelectorStaffPanelProps) => (
			<div data-testid="custom-staff">{personnel.length}</div>
		);

		render(
			<ShiftSelector
				staff={staff}
				targetMonth={new Date("2026-02-01T00:00:00")}
				components={{
					Header,
					FilterBar: Filter,
					MonthGrid: Month,
					StaffPanel,
				}}
			/>,
		);

		expect(screen.getByTestId("custom-header")).toBeInTheDocument();
		expect(screen.getByTestId("custom-filter")).toBeInTheDocument();
		expect(screen.getByTestId("custom-month")).toHaveTextContent("42");
		expect(screen.getByTestId("custom-staff")).toHaveTextContent("3");
	});
});
