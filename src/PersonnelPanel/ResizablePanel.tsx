import { useCallback, useEffect, useRef, useState } from "react";
import { defaultStorage, type StorageAdapter } from "../utils/StorageAdapter";

interface ResizablePanelProps {
	children: React.ReactNode;
	defaultWidth?: number;
	minWidth?: number;
	maxWidth?: number;
	storageKey?: string; // storage key for persistence
	storage?: StorageAdapter;
	className?: string;
}

export function ResizablePanel({
	children,
	defaultWidth = 256,
	minWidth = 180,
	maxWidth = 400,
	storageKey,
	storage = defaultStorage,
	className = "",
}: ResizablePanelProps) {
	const [width, setWidth] = useState(() => {
		// Load from storage if key provided
		if (storageKey) {
			const saved = storage.getItem(storageKey);
			if (saved) {
				const parsed = parseInt(saved, 10);
				if (!Number.isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
					return parsed;
				}
			}
		}
		return defaultWidth;
	});
	const isResizing = useRef(false);
	const panelRef = useRef<HTMLDivElement>(null);

	// Save to storage when width changes
	useEffect(() => {
		if (storageKey) {
			storage.setItem(storageKey, String(width));
		}
	}, [width, storageKey, storage]);

	const startResize = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		isResizing.current = true;
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";
	}, []);

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!isResizing.current || !panelRef.current) return;

			const panelRect = panelRef.current.getBoundingClientRect();
			const newWidth = e.clientX - panelRect.left;

			if (newWidth >= minWidth && newWidth <= maxWidth) {
				setWidth(newWidth);
			}
		};

		const handleMouseUp = () => {
			if (isResizing.current) {
				isResizing.current = false;
				document.body.style.cursor = "";
				document.body.style.userSelect = "";
			}
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [minWidth, maxWidth]);

	return (
		<div
			ref={panelRef}
			className={`relative flex-shrink-0 ${className}`}
			style={{ width }}
		>
			{children}

			{/* Resize Handle */}
			<button
				type="button"
				aria-label="Resize"
				className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/30 active:bg-primary/50 transition-colors z-10"
				onMouseDown={startResize}
			/>
		</div>
	);
}
