import React, { useEffect, useState } from 'react';

export function StyleDebug() {
    const [computed, setComputed] = useState<Record<string, string>>({});
    const ref = React.useRef<HTMLDivElement>(null);

    const checkStyles = () => {
        if (!ref.current) return;
        const style = window.getComputedStyle(ref.current);
        setComputed({
            borderRadius: style.borderRadius,
            backgroundColor: style.backgroundColor,
            fontSize: style.fontSize,
            radiusVar: style.getPropertyValue('--radius'),
            bgVar: style.getPropertyValue('--background'),
            fontSizeVar: style.getPropertyValue('--app-font-size'),
            uiHeight: style.getPropertyValue('--ui-component-height'),
        });
    };

    useEffect(() => {
        checkStyles();
        const interval = setInterval(checkStyles, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed bottom-4 right-4 p-4 bg-white border border-red-500 shadow-xl z-50 text-black text-sm font-mono opacity-90">
            <h3 className="font-bold border-b border-gray-300 mb-2">Style Debugger</h3>

            <div ref={ref} className="bg-primary text-primary-foreground rounded-lg p-2 mb-2 text-base">
                Sample Element (bg-primary, rounded-lg)
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <span className="text-gray-500">Active --radius:</span>
                <span>{computed.radiusVar || 'undefined'}</span>

                <span className="text-gray-500">Active --background:</span>
                <span>{computed.bgVar || 'undefined'}</span>

                <span className="text-gray-500">Active --app-font-size:</span>
                <span>{computed.fontSizeVar || 'undefined'}</span>

                <span className="text-gray-500">Active --ui-height:</span>
                <span>{computed.uiHeight || 'undefined'}</span>

                <hr className="col-span-2 my-1 border-gray-200" />

                <span className="text-gray-500">Computed Radius:</span>
                <span className={computed.borderRadius !== computed.radiusVar && computed.radiusVar ? 'text-red-600 font-bold' : ''}>
                    {computed.borderRadius}
                </span>

                <span className="text-gray-500">Computed Bg:</span>
                <span>{computed.backgroundColor}</span>

                <span className="text-gray-500">Computed Font:</span>
                <span>{computed.fontSize}</span>
            </div>

            <div className="mt-2 text-xs text-gray-500">
                If Computed Radius is distinct from var, Tailwind config is ignored.
            </div>

            <button
                onClick={() => {
                    const report = `
Style Debug Report:
------------------
Active --radius: ${computed.radiusVar}
Active --background: ${computed.bgVar}
Active --app-font-size: ${computed.fontSizeVar}
Active --ui-height: ${computed.uiHeight}
Computed Radius: ${computed.borderRadius}
Computed Bg: ${computed.backgroundColor}
Computed Font: ${computed.fontSize}
                    `.trim();
                    navigator.clipboard.writeText(report);
                    alert('Copied to clipboard!');
                }}
                className="mt-3 w-full bg-white text-gray-800 border border-gray-300 py-1 px-2 rounded hover:bg-gray-100 text-xs shadow-sm"
            >
                Copy Report for Prompt
            </button>
        </div>
    );
}
