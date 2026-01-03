import { Button } from "@/components/ui/Button";

export interface ViewOption<T extends string = string> {
	value: T;
	label: string;
}

interface ViewSelectorProps<T extends string = string> {
	currentView: T;
	onViewChange: (view: T) => void;
	options: ViewOption<T>[];
	className?: string;
}

export function ViewSelector<T extends string = string>({
	currentView,
	onViewChange,
	options,
	className,
}: ViewSelectorProps<T>) {
	return (
		<div
			className={`flex bg-muted p-[calc(var(--ui-gap-base)/2)] rounded-md ${className || ""}`}
		>
			{options.map((option) => (
				<Button
					key={option.value}
					variant={currentView === option.value ? "default" : "ghost"}
					size="default"
					onClick={() => onViewChange(option.value)}
					className="flex-1"
				>
					{option.label}
				</Button>
			))}
		</div>
	);
}
