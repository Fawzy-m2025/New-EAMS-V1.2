import { useEffect } from 'react';

type ShortcutHandler = (e: KeyboardEvent) => void;

interface ShortcutConfig {
    key: string;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    handler: ShortcutHandler;
    description: string;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in input fields
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                e.target instanceof HTMLSelectElement
            ) {
                return;
            }

            for (const shortcut of shortcuts) {
                if (
                    e.key.toLowerCase() === shortcut.key.toLowerCase() &&
                    !!shortcut.ctrlKey === e.ctrlKey &&
                    !!shortcut.altKey === e.altKey &&
                    !!shortcut.shiftKey === e.shiftKey
                ) {
                    e.preventDefault();
                    shortcut.handler(e);
                    break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);

    // Return list of available shortcuts for documentation
    const getShortcutList = () => {
        return shortcuts.map(shortcut => {
            const keys = [];
            if (shortcut.ctrlKey) keys.push('Ctrl');
            if (shortcut.altKey) keys.push('Alt');
            if (shortcut.shiftKey) keys.push('Shift');
            keys.push(shortcut.key.toUpperCase());

            return {
                keys: keys.join(' + '),
                description: shortcut.description
            };
        });
    };

    return { getShortcutList };
}; 