import type * as React from "react";
import { cn } from "@/components/ui/utils";

export const Icons = {
	Spinner: ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
		const { role: _role, ...restProps } = props;
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className={cn("animate-spin", className)}
				{...restProps}
				role="presentation"
			>
				<path d="M21 12a9 9 0 1 1-6.219-8.56" />
			</svg>
		);
	},
	Check: ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
		const { role: _role, ...restProps } = props;
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className={className}
				{...restProps}
				role="presentation"
			>
				<polyline points="20 6 9 17 4 12" />
			</svg>
		);
	},
	X: ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
		const { role: _role, ...restProps } = props;
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className={className}
				{...restProps}
				role="presentation"
			>
				<line x1="18" y1="6" x2="6" y2="18" />
				<line x1="6" y1="6" x2="18" y2="18" />
			</svg>
		);
	},
	ChevronLeft: ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
		const { role: _role, ...restProps } = props;
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className={className}
				{...restProps}
				role="presentation"
			>
				<path d="M15 18l-6-6 6-6" />
			</svg>
		);
	},
	ChevronRight: ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
		const { role: _role, ...restProps } = props;
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className={className}
				{...restProps}
				role="presentation"
			>
				<path d="M9 18l6-6-6-6" />
			</svg>
		);
	},
	ChevronDown: ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
		const { role: _role, ...restProps } = props;
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className={className}
				{...restProps}
				role="presentation"
			>
				<path d="M6 9l6 6 6-6" />
			</svg>
		);
	},
	Calendar: ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
		const { role: _role, ...restProps } = props;
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className={className}
				{...restProps}
				role="presentation"
			>
				<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
				<line x1="16" y1="2" x2="16" y2="6" />
				<line x1="8" y1="2" x2="8" y2="6" />
				<line x1="3" y1="10" x2="21" y2="10" />
			</svg>
		);
	},
	Plus: ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
		const { role: _role, ...restProps } = props;
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className={className}
				{...restProps}
				role="presentation"
			>
				<line x1="12" y1="5" x2="12" y2="19" />
				<line x1="5" y1="12" x2="19" y2="12" />
			</svg>
		);
	},
	Edit: ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
		const { role: _role, ...restProps } = props;
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className={className}
				{...restProps}
				role="presentation"
			>
				<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
				<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
			</svg>
		);
	},
	Trash: ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
		const { role: _role, ...restProps } = props;
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className={className}
				{...restProps}
				role="presentation"
			>
				<polyline points="3 6 5 6 21 6" />
				<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
			</svg>
		);
	},
	AlertTriangle: ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
		const { role: _role, ...restProps } = props;
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className={className}
				{...restProps}
				role="presentation"
			>
				<path d="M10.29 3.86L1.82 18a2 2 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
				<line x1="12" y1="9" x2="12" y2="13" />
				<line x1="12" y1="17" x2="12.01" y2="17" />
			</svg>
		);
	},
};
