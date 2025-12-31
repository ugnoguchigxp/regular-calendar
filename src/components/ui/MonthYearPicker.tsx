
import * as React from 'react';
import { Button } from './Button';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';
import { cn } from './utils';

interface MonthYearPickerProps {
    date: Date;
    onDateChange: (date: Date) => void;
    children: React.ReactNode;
    fromYear?: number;
    toYear?: number;
}

export function MonthYearPicker({ date, onDateChange, children, fromYear, toYear }: MonthYearPickerProps) {
    const [year, setYear] = React.useState(date.getFullYear());
    const [open, setOpen] = React.useState(false);

    // Sync internal state when prop changes
    React.useEffect(() => {
        setYear(date.getFullYear());
    }, [date]);

    const months = Array.from({ length: 12 }, (_, i) => i);
    const currentYear = new Date().getFullYear();

    // Determine year range
    const startYear = fromYear ?? (currentYear - 50);
    const endYear = toYear ?? (currentYear + 50);

    // Generate years array
    const years = React.useMemo(() => {
        const arr = [];
        for (let y = startYear; y <= endYear; y++) {
            arr.push(y);
        }
        return arr;
    }, [startYear, endYear]);

    const handleMonthClick = (monthIndex: number) => {
        const newDate = new Date(date);
        newDate.setFullYear(year);
        newDate.setMonth(monthIndex);
        if (newDate.getMonth() !== monthIndex) {
            newDate.setDate(0);
        }
        onDateChange(newDate);
        setOpen(false);
    };

    const scrollRef = React.useRef<HTMLDivElement>(null);

    // Use callback ref to scroll when the container is mounted
    const handleScrollContainerRef = React.useCallback((node: HTMLDivElement | null) => {
        scrollRef.current = node;
        if (node && open) {
            // Container just mounted while popover is open - scroll to selected
            const scrollToSelected = () => {
                const selectedYearEl = node.querySelector('[data-selected="true"]') as HTMLElement;
                if (selectedYearEl) {
                    const elementTop = selectedYearEl.offsetTop;
                    const elementHeight = selectedYearEl.offsetHeight;
                    const containerHeight = node.clientHeight;
                    const targetScrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);
                    node.scrollTop = targetScrollTop;
                }
            };
            // Small delay to ensure layout is complete
            setTimeout(scrollToSelected, 0);
            setTimeout(scrollToSelected, 50);
        }
    }, [open, year]);

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <div role="button" className="cursor-pointer hover:bg-muted/50 rounded px-2 py-1 transition-colors">
                    {children}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="flex h-[300px]">
                    {/* Left: Year List (3 columns) */}
                    <div
                        className="w-[200px] h-full border-r border-border overflow-y-auto relative"
                        ref={handleScrollContainerRef}
                        style={{ scrollbarWidth: 'thin' }}
                    >
                        <div className="p-2 grid grid-cols-3 gap-1">
                            {years.map(y => (
                                <Button
                                    key={y}
                                    variant={y === year ? "default" : "ghost"}
                                    size="sm"
                                    data-selected={y === year}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setYear(y);
                                    }}
                                    className="w-full justify-center font-normal px-0"
                                >
                                    {y}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Month Grid */}
                    <div className="w-[240px] p-3 flex flex-col">
                        <div className="text-center font-bold mb-2">
                            {year}年
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {months.map(m => {
                                const isCurrent = m === date.getMonth() && year === date.getFullYear();
                                return (
                                    <Button
                                        key={m}
                                        variant={isCurrent ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleMonthClick(m)}
                                        className={cn("h-10", isCurrent && "pointer-events-none")}
                                    >
                                        {m + 1}月
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
