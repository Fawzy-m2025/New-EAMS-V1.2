import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Keyboard } from 'lucide-react';

interface ShortcutInfo {
    keys: string;
    description: string;
}

interface KeyboardShortcutsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    shortcuts: ShortcutInfo[];
}

export function KeyboardShortcutsDialog({
    open,
    onOpenChange,
    shortcuts
}: KeyboardShortcutsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Keyboard className="h-5 w-5" />
                        Keyboard Shortcuts
                    </DialogTitle>
                    <DialogDescription>
                        Use these keyboard shortcuts to quickly navigate and perform actions
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shortcuts.map((shortcut, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                            <span className="text-sm">{shortcut.description}</span>
                            <Badge variant="outline" className="font-mono">
                                {shortcut.keys}
                            </Badge>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
} 