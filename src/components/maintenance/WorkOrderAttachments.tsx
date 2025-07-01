import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Paperclip, X, Download, Eye, Upload } from 'lucide-react';
import type { WorkOrder } from '@/types/eams';

interface WorkOrderAttachmentsProps {
    workOrder: WorkOrder;
    onAttachmentAdd: (file: File) => Promise<void>;
    onAttachmentDelete: (attachmentId: string) => Promise<void>;
}

export function WorkOrderAttachments({
    workOrder,
    onAttachmentAdd,
    onAttachmentDelete
}: WorkOrderAttachmentsProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            await handleFiles(files);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            await handleFiles(files);
        }
    };

    const handleFiles = async (files: File[]) => {
        for (const file of files) {
            try {
                await onAttachmentAdd(file);
            } catch (error) {
                console.error('Error uploading file:', error);
                // TODO: Add error notification
            }
        }
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return '🖼️';
        if (type.startsWith('video/')) return '🎥';
        if (type.startsWith('audio/')) return '🎵';
        if (type.includes('pdf')) return '📄';
        if (type.includes('word')) return '📝';
        if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
        return '📎';
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Paperclip className="h-5 w-5" />
                    Attachments
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Drop zone */}
                <div
                    className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center transition-colors ${isDragging
                            ? 'border-primary bg-primary/10'
                            : 'border-muted-foreground/20 hover:border-primary/50'
                        }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-1">
                        Drag and drop files here, or click to select
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Supported formats: Images, PDFs, Documents (max 10MB)
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        multiple
                        onChange={handleFileSelect}
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    />
                </div>

                {/* Attachments list */}
                <div className="space-y-2">
                    {workOrder.attachments?.map((attachment) => (
                        <div
                            key={attachment.id}
                            className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{getFileIcon(attachment.type)}</span>
                                <div>
                                    <p className="text-sm font-medium">{attachment.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatFileSize(attachment.size)} • Uploaded by {attachment.uploadedBy}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => window.open(attachment.url, '_blank')}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = attachment.url;
                                        link.download = attachment.name;
                                        link.click();
                                    }}
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onAttachmentDelete(attachment.id)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {(!workOrder.attachments || workOrder.attachments.length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No attachments yet
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 