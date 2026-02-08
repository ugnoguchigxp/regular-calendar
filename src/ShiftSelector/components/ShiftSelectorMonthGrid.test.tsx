import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ShiftDayCellView } from "../ShiftSelector.types";
import { ShiftSelectorMonthGrid } from "./ShiftSelectorMonthGrid";

const createMockDayCells = (): ShiftDayCellView[] => {
	return [
		{
			dateKey: "2026-02-09",
			date: new Date("2026-02-09"),
			inCurrentMonth: true,
			isToday: false,
			assignments: [],
		},
		{
			dateKey: "2026-02-10",
			date: new Date("2026-02-10"),
			inCurrentMonth: true,
			isToday: true,
			assignments: [
				{
					staffId: "s1",
					staffName: "山田 NS",
					slots: ["morning", "afternoon"],
					sortIndex: 0,
				},
				{
					staffId: "s2",
					staffName: "佐藤 Dr",
					slots: ["night"],
					sortIndex: 1,
				},
			],
		},
		{
			dateKey: "2026-02-11",
			date: new Date("2026-02-11"),
			inCurrentMonth: false,
			isToday: false,
			assignments: [],
		},
	];
};

describe("ShiftSelectorMonthGrid", () => {
	it("renders week labels", () => {
		const dayCells = createMockDayCells();

		render(
			<ShiftSelectorMonthGrid
				weekLabels={["月", "火", "水", "木", "金", "土", "日"]}
				dayCells={dayCells}
				eraseMode={false}
				onDateClick={vi.fn()}
				onClearDateAssignments={vi.fn()}
				onDeleteAssignment={vi.fn()}
			/>,
		);

		expect(screen.getByText("月")).toBeInTheDocument();
		expect(screen.getByText("日")).toBeInTheDocument();
	});

	it("renders day cells with assignments", () => {
		const dayCells = createMockDayCells();

		render(
			<ShiftSelectorMonthGrid
				weekLabels={["月", "火", "水", "木", "金", "土", "日"]}
				dayCells={dayCells}
				eraseMode={false}
				onDateClick={vi.fn()}
				onClearDateAssignments={vi.fn()}
				onDeleteAssignment={vi.fn()}
			/>,
		);

		expect(screen.getByText("山田 NS")).toBeInTheDocument();
		expect(screen.getByText("佐藤 Dr")).toBeInTheDocument();
		expect(screen.getByText("午前")).toBeInTheDocument();
		expect(screen.getByText("夜間")).toBeInTheDocument();
	});

	it("calls onDateClick when cell is clicked", async () => {
		const user = userEvent.setup();
		const onDateClick = vi.fn();
		const dayCells = createMockDayCells();

		render(
			<ShiftSelectorMonthGrid
				weekLabels={["月"]}
				dayCells={dayCells}
				eraseMode={false}
				onDateClick={onDateClick}
				onClearDateAssignments={vi.fn()}
				onDeleteAssignment={vi.fn()}
			/>,
		);

		const buttons = screen.getAllByRole("button");
		await user.click(buttons[0]);

		expect(onDateClick).toHaveBeenCalled();
	});

	it("shows delete buttons in erase mode", async () => {
		const user = userEvent.setup();
		const onDeleteAssignment = vi.fn();
		const onClearDateAssignments = vi.fn();
		const dayCells = createMockDayCells();

		render(
			<ShiftSelectorMonthGrid
				weekLabels={["月"]}
				dayCells={dayCells}
				eraseMode={true}
				onDateClick={vi.fn()}
				onClearDateAssignments={onClearDateAssignments}
				onDeleteAssignment={onDeleteAssignment}
			/>,
		);

		// Should show "全消去" and "削除" buttons in erase mode
		expect(screen.getAllByText("全消去").length).toBeGreaterThan(0);
		expect(screen.getAllByText("削除").length).toBeGreaterThan(0);

		// Click delete button
		const deleteButtons = screen.getAllByText("削除");
		await user.click(deleteButtons[0]);

		expect(onDeleteAssignment).toHaveBeenCalledWith("2026-02-10", "s1");
	});

	it("calls onClearDateAssignments when clear button is clicked", async () => {
		const user = userEvent.setup();
		const onClearDateAssignments = vi.fn();
		const dayCells = createMockDayCells();

		render(
			<ShiftSelectorMonthGrid
				weekLabels={["月"]}
				dayCells={dayCells}
				eraseMode={true}
				onDateClick={vi.fn()}
				onClearDateAssignments={onClearDateAssignments}
				onDeleteAssignment={vi.fn()}
			/>,
		);

		const clearButtons = screen.getAllByText("全消去");
		await user.click(clearButtons[0]);

		expect(onClearDateAssignments).toHaveBeenCalled();
	});

	it("renders non-clickable divs in erase mode", () => {
		const dayCells = createMockDayCells();

		render(
			<ShiftSelectorMonthGrid
				weekLabels={["月"]}
				dayCells={dayCells}
				eraseMode={true}
				onDateClick={vi.fn()}
				onClearDateAssignments={vi.fn()}
				onDeleteAssignment={vi.fn()}
			/>,
		);

		// In erase mode, cells should be divs not buttons (for date clicking)
		const cellButtons = screen
			.getAllByRole("button")
			.filter((btn) => btn.textContent?.match(/^\d+$/));
		expect(cellButtons).toHaveLength(0);
	});

	it("highlights today's date", () => {
		const dayCells = createMockDayCells();

		render(
			<ShiftSelectorMonthGrid
				weekLabels={["月"]}
				dayCells={dayCells}
				eraseMode={false}
				onDateClick={vi.fn()}
				onClearDateAssignments={vi.fn()}
				onDeleteAssignment={vi.fn()}
			/>,
		);

		// The today cell (Feb 10) should have special styling
		const dayNumber = screen.getByText("10");
		expect(dayNumber).toHaveClass("text-primary");
	});
});
