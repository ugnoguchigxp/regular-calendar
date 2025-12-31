import { useState, useRef, useCallback, useEffect } from 'react';

interface ResizablePanelProps {
    children: React.ReactNode;
    defaultWidth?: number;
    minWidth?: number;
    maxWidth?: number;
    storageKey?: string; // localStorage key for persistence
    className?: string;
}

export function ResizablePanel({
    children,
    defaultWidth = 256,
    minWidth = 180,
    maxWidth = 400,
    storageKey,
    className = '',
}: ResizablePanelProps) {
    const [width, setWidth] = useState(() => {
        // Load from localStorage if key provided
        if (storageKey && typeof window !== 'undefined') {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = parseInt(saved, 10);
                if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
                    return parsed;
                }
            }
        }
        return defaultWidth;
    });
    const isResizing = useRef(false);
    const panelRef = useRef<HTMLDivElement>(null);

    // Save to localStorage when width changes
    useEffect(() => {
        if (storageKey && typeof window !== 'undefined') {
            localStorage.setItem(storageKey, String(width));
        }
    }, [width, storageKey]);

    const startResize = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isResizing.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
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
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
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
            <div
                className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/30 active:bg-primary/50 transition-colors z-10"
                onMouseDown={startResize}
            />
        </div>
    );
}

