import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, CalendarIcon, Save, X } from 'lucide-react';
import type { WorkOrder, Priority } from '@/types/eams';
import { WorkOrderAttachments } from './WorkOrderAttachments';
import { glassCardClass } from '@/components/ui/card';

interface WorkOrderFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (workOrder: Partial<WorkOrder>) => void;
  workOrder?: WorkOrder;
  mode: 'create' | 'edit';
}

export function WorkOrderFormModal({
  open,
  onOpenChange,
  onSubmit,
  workOrder,
  mode
}: WorkOrderFormModalProps) {
  const [formData, setFormData] = useState<Partial<WorkOrder>>({
    title: '',
    description: '',
    priority: 'medium',
    equipmentName: '',
    location: '',
    type: 'Corrective',
    assignedTo: '',
    dueDate: '',
    estimatedHours: 0,
    procedures: [],
    category: '',
    tags: [],
    priority_reason: '',
    impact_assessment: '',
    completion_notes: '',
    quality_check: {
      performed: false,
      by: '',
      date: '',
      passed: false,
      notes: ''
    },
    attachments: []
  });

  useEffect(() => {
    if (workOrder && mode === 'edit') {
      setFormData({
        ...workOrder,
        assignedTo: Array.isArray(workOrder.assignedTo) ? workOrder.assignedTo.join(', ') : workOrder.assignedTo
      });
    } else if (mode === 'create') {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        equipmentName: '',
        location: '',
        type: 'Corrective',
        assignedTo: '',
        dueDate: '',
        estimatedHours: 0,
        procedures: [],
        category: '',
        tags: [],
        priority_reason: '',
        impact_assessment: '',
        completion_notes: '',
        quality_check: {
          performed: false,
          by: '',
          date: '',
          passed: false,
          notes: ''
        },
        attachments: []
      });
    }
  }, [workOrder, mode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      assignedTo: typeof formData.assignedTo === 'string' ? formData.assignedTo : formData.assignedTo || ''
    };

    onSubmit(submitData);
    onOpenChange(false);
  };

  const handleInputChange = (field: keyof WorkOrder, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAttachmentAdd = async (file: File) => {
    // TODO: Implement file upload to your backend/storage
    const newAttachment = {
      id: `att-${Date.now()}`,
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file), // Temporary URL for demo
      uploadedBy: 'Current User', // Replace with actual user
      uploadedAt: new Date().toISOString(),
      size: file.size
    };

    setFormData(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), newAttachment]
    }));
  };

  const handleAttachmentDelete = async (attachmentId: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter(att => att.id !== attachmentId) || []
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Work Order' : 'Edit Work Order'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Work order title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleInputChange('priority', value as Priority)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detailed description of the work to be performed"
                rows={3}
              />
            </div>
          </div>

          {/* Equipment and Location */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipmentName">Equipment</Label>
                <Input
                  id="equipmentName"
                  value={formData.equipmentName || ''}
                  onChange={(e) => handleInputChange('equipmentName', e.target.value)}
                  placeholder="Equipment name or ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Equipment location"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Work Order Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Preventive">Preventive</SelectItem>
                    <SelectItem value="Corrective">Corrective</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="Inspection">Inspection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input
                  id="assignedTo"
                  value={typeof formData.assignedTo === 'string' ? formData.assignedTo : formData.assignedTo?.join(', ') || ''}
                  onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                  placeholder="Technician name or team"
                />
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate || ''}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.estimatedHours || 0}
                  onChange={(e) => handleInputChange('estimatedHours', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* New fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category || ''}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mechanical">Mechanical</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="instrumentation">Instrumentation</SelectItem>
                    <SelectItem value="civil">Civil</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="Enter tags separated by commas"
                  value={formData.tags?.join(', ') || ''}
                  onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(t => t.trim()))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority_reason">Priority Reason</Label>
              <Textarea
                id="priority_reason"
                placeholder="Explain why this priority level was chosen"
                value={formData.priority_reason || ''}
                onChange={(e) => handleInputChange('priority_reason', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="impact_assessment">Impact Assessment</Label>
              <Textarea
                id="impact_assessment"
                placeholder="Describe the potential impact of this work"
                value={formData.impact_assessment || ''}
                onChange={(e) => handleInputChange('impact_assessment', e.target.value)}
              />
            </div>

            {mode === 'edit' && (
              <div className="space-y-2">
                <Label htmlFor="completion_notes">Completion Notes</Label>
                <Textarea
                  id="completion_notes"
                  placeholder="Add notes about the completion of this work order"
                  value={formData.completion_notes || ''}
                  onChange={(e) => handleInputChange('completion_notes', e.target.value)}
                />
              </div>
            )}

            {/* Quality Check Section */}
            {mode === 'edit' && (
              <div className="space-y-2 border rounded-lg p-4">
                <Label className="text-base font-semibold">Quality Check</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quality_check_performed">Status</Label>
                    <Select
                      value={formData.quality_check?.performed ? 'yes' : 'no'}
                      onValueChange={(value) => handleInputChange('quality_check', {
                        ...formData.quality_check,
                        performed: value === 'yes'
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Quality check status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Performed</SelectItem>
                        <SelectItem value="no">Not Performed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.quality_check?.performed && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="quality_check_by">Checked By</Label>
                        <Input
                          id="quality_check_by"
                          value={formData.quality_check?.by || ''}
                          onChange={(e) => handleInputChange('quality_check', {
                            ...formData.quality_check,
                            by: e.target.value
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quality_check_date">Check Date</Label>
                        <Input
                          id="quality_check_date"
                          type="date"
                          value={formData.quality_check?.date || ''}
                          onChange={(e) => handleInputChange('quality_check', {
                            ...formData.quality_check,
                            date: e.target.value
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quality_check_passed">Result</Label>
                        <Select
                          value={formData.quality_check?.passed ? 'passed' : 'failed'}
                          onValueChange={(value) => handleInputChange('quality_check', {
                            ...formData.quality_check,
                            passed: value === 'passed'
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select result" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="passed">Passed</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  <div className="space-y-2 col-span-full">
                    <Label htmlFor="quality_check_notes">Quality Check Notes</Label>
                    <Textarea
                      id="quality_check_notes"
                      value={formData.quality_check?.notes || ''}
                      onChange={(e) => handleInputChange('quality_check', {
                        ...formData.quality_check,
                        notes: e.target.value
                      })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Attachments Section */}
            <WorkOrderAttachments
              workOrder={formData as WorkOrder}
              onAttachmentAdd={handleAttachmentAdd}
              onAttachmentDelete={handleAttachmentDelete}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" className="hover-scale">
              <Save className="h-4 w-4 mr-2" />
              {mode === 'create' ? 'Create Work Order' : 'Update Work Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
