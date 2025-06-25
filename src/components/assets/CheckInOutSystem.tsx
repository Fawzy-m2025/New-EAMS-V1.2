
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Equipment } from "@/types/eams";
import { Users, Clock, AlertTriangle, CheckCircle, XCircle, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CheckInOutSystemProps {
  equipment: Equipment[];
}

interface CheckInOutRecord {
  id: string;
  assetId: string;
  assetName: string;
  action: 'check-in' | 'check-out';
  userId: string;
  userName: string;
  timestamp: Date;
  returnDeadline?: Date;
  purpose: string;
  notes?: string;
  status: 'active' | 'completed' | 'overdue';
}

export function CheckInOutSystem({ equipment }: CheckInOutSystemProps) {
  const { toast } = useToast();
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [action, setAction] = useState<'check-in' | 'check-out'>('check-out');
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [returnDeadline, setReturnDeadline] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Mock data for demonstration
  const [records, setRecords] = useState<CheckInOutRecord[]>([
    {
      id: '1',
      assetId: 'EQ-001',
      assetName: 'Centrifugal Pump A1',
      action: 'check-out',
      userId: 'U001',
      userName: 'John Smith',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      returnDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      purpose: 'Routine maintenance',
      notes: 'Annual inspection due',
      status: 'active'
    },
    {
      id: '2',
      assetId: 'EQ-002',
      assetName: 'Motor Control Panel B2',
      action: 'check-in',
      userId: 'U002',
      userName: 'Jane Doe',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      purpose: 'Electrical testing completed',
      status: 'completed'
    }
  ]);

  const stats = useMemo(() => {
    const checkedOut = records.filter(r => r.status === 'active' && r.action === 'check-out').length;
    const overdue = records.filter(r => r.status === 'overdue').length;
    const completedToday = records.filter(r => 
      r.timestamp.toDateString() === new Date().toDateString()
    ).length;
    
    return { checkedOut, overdue, completedToday };
  }, [records]);

  const handleSubmit = () => {
    if (!selectedAsset || !userId || !userName || !purpose) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const asset = equipment.find(e => e.id === selectedAsset);
    if (!asset) return;

    const newRecord: CheckInOutRecord = {
      id: Date.now().toString(),
      assetId: selectedAsset,
      assetName: asset.name,
      action,
      userId,
      userName,
      timestamp: new Date(),
      returnDeadline: returnDeadline ? new Date(returnDeadline) : undefined,
      purpose,
      notes,
      status: action === 'check-out' ? 'active' : 'completed'
    };

    setRecords(prev => [newRecord, ...prev]);
    
    // Reset form
    setSelectedAsset('');
    setUserId('');
    setUserName('');
    setPurpose('');
    setNotes('');
    setReturnDeadline('');
    setIsDialogOpen(false);

    toast({
      title: "Success",
      description: `Asset ${action === 'check-out' ? 'checked out' : 'checked in'} successfully.`,
    });
  };

  const getStatusColor = (status: CheckInOutRecord['status']) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: CheckInOutRecord['action']) => {
    return action === 'check-out' ? 
      <XCircle className="h-4 w-4 text-red-500" /> : 
      <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.checkedOut}</p>
                <p className="text-sm text-muted-foreground">Checked Out</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.overdue}</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedToday}</p>
                <p className="text-sm text-muted-foreground">Today's Activity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Check-In/Out Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Asset Check-In/Out System</CardTitle>
              <CardDescription>Manage asset assignments with automated notifications and return deadlines</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>New Transaction</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Asset Check-In/Out</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="action">Action</Label>
                      <Select value={action} onValueChange={(value: 'check-in' | 'check-out') => setAction(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="check-out">Check Out</SelectItem>
                          <SelectItem value="check-in">Check In</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="asset">Asset</Label>
                      <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select asset" />
                        </SelectTrigger>
                        <SelectContent>
                          {equipment.map(asset => (
                            <SelectItem key={asset.id} value={asset.id}>
                              {asset.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="userId">User ID</Label>
                      <Input
                        id="userId"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="U001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="userName">User Name</Label>
                      <Input
                        id="userName"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="John Smith"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="purpose">Purpose</Label>
                    <Input
                      id="purpose"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="Maintenance, testing, etc."
                    />
                  </div>

                  {action === 'check-out' && (
                    <div>
                      <Label htmlFor="returnDeadline">Return Deadline</Label>
                      <Input
                        id="returnDeadline"
                        type="datetime-local"
                        value={returnDeadline}
                        onChange={(e) => setReturnDeadline(e.target.value)}
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional notes..."
                    />
                  </div>

                  <Button onClick={handleSubmit} className="w-full">
                    {action === 'check-out' ? 'Check Out' : 'Check In'} Asset
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Return Deadline</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.assetName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(record.action)}
                        {record.action}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.userName}</div>
                        <div className="text-sm text-muted-foreground">{record.userId}</div>
                      </div>
                    </TableCell>
                    <TableCell>{record.purpose}</TableCell>
                    <TableCell className="text-sm">
                      {record.timestamp.toLocaleDateString()}<br />
                      {record.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell className="text-sm">
                      {record.returnDeadline ? (
                        <>
                          {record.returnDeadline.toLocaleDateString()}<br />
                          {record.returnDeadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
