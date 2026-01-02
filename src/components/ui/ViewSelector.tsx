import { Button } from "@/components/ui/Button";

export interface ViewOption {
	value: string;
	label: string;
}

interface ViewSelectorProps {
	currentView: string;
	onViewChange: (view: string) => void;
	options: ViewOption[];
	className?: string;
}

export function ViewSelector({
	currentView,
	onViewChange,
	options,
	className,
}: ViewSelectorProps) {
	return (
		<div className={`flex bg-muted p-1 rounded-md ${className || ""}`}>
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
