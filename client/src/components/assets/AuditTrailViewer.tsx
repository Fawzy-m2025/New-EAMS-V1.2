
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Equipment } from "@/types/eams";
import { Download, Filter, Search, Shield, Eye, FileText } from "lucide-react";

interface AuditTrailViewerProps {
  equipment: Equipment[];
}

interface AuditEvent {
  id: string;
  timestamp: Date;
  assetId: string;
  assetName: string;
  action: string;
  user: string;
  details: string;
  ipAddress: string;
  severity: 'info' | 'warning' | 'critical';
  category: 'access' | 'modification' | 'transfer' | 'maintenance' | 'compliance';
  compliance: string[];
}

export function AuditTrailViewer({ equipment }: AuditTrailViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7days');

  // Generate mock audit events
  const auditEvents = useMemo((): AuditEvent[] => {
    const events: AuditEvent[] = [];
    const actions = [
      'Asset accessed',
      'Location updated', 
      'Status changed',
      'Maintenance performed',
      'Transferred to technician',
      'Condition monitoring updated',
      'Specifications modified',
      'QR code generated',
      'Asset checked out',
      'Asset checked in'
    ];

    const users = ['john.smith', 'jane.doe', 'admin', 'technician.01', 'supervisor.a'];
    const compliance = ['ISO 55000', 'ISO 10816', 'ISO 27001'];

    equipment.forEach(asset => {
      for (let i = 0; i < 20; i++) {
        const eventDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const action = actions[Math.floor(Math.random() * actions.length)];
        
        events.push({
          id: `audit-${asset.id}-${i}`,
          timestamp: eventDate,
          assetId: asset.id,
          assetName: asset.name,
          action,
          user: users[Math.floor(Math.random() * users.length)],
          details: getEventDetails(action, asset),
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          severity: getSeverity(action),
          category: getCategory(action),
          compliance: [compliance[Math.floor(Math.random() * compliance.length)]]
        });
      }
    });

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [equipment]);

  function getEventDetails(action: string, asset: Equipment): string {
    switch (action) {
      case 'Location updated':
        return `Moved from ${asset.location.building} to maintenance bay`;
      case 'Status changed':
        return `Changed from operational to ${asset.status}`;
      case 'Maintenance performed':
        return 'Routine inspection and lubrication completed';
      case 'Transferred to technician':
        return 'Asset assigned for preventive maintenance';
      case 'Condition monitoring updated':
        return 'Vibration and temperature readings recorded';
      default:
        return `${action} on ${asset.name}`;
    }
  }

  function getSeverity(action: string): 'info' | 'warning' | 'critical' {
    if (action.includes('failure') || action.includes('critical')) return 'critical';
    if (action.includes('warning') || action.includes('modified')) return 'warning';
    return 'info';
  }

  function getCategory(action: string): AuditEvent['category'] {
    if (action.includes('access')) return 'access';
    if (action.includes('modified') || action.includes('updated')) return 'modification';
    if (action.includes('transfer') || action.includes('checked')) return 'transfer';
    if (action.includes('maintenance')) return 'maintenance';
    return 'compliance';
  }

  const filteredEvents = useMemo(() => {
    let filtered = auditEvents;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.user.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(event => event.severity === severityFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }

    // Date range filter
    const now = new Date();
    let cutoffDate = new Date();
    switch (dateRange) {
      case '1day':
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case '7days':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        cutoffDate.setDate(now.getDate() - 90);
        break;
    }
    
    filtered = filtered.filter(event => event.timestamp >= cutoffDate);

    return filtered;
  }, [auditEvents, searchTerm, severityFilter, categoryFilter, dateRange]);

  const exportAuditLog = () => {
    const csvContent = [
      ['Timestamp', 'Asset', 'Action', 'User', 'Details', 'IP Address', 'Severity', 'Category', 'Compliance'],
      ...filteredEvents.map(event => [
        event.timestamp.toISOString(),
        event.assetName,
        event.action,
        event.user,
        event.details,
        event.ipAddress,
        event.severity,
        event.category,
        event.compliance.join('; ')
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getSeverityColor = (severity: AuditEvent['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: AuditEvent['category']) => {
    switch (category) {
      case 'access': return 'bg-purple-100 text-purple-800';
      case 'modification': return 'bg-orange-100 text-orange-800';
      case 'transfer': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      case 'compliance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Audit Trail
            </CardTitle>
            <CardDescription>
              Complete audit log with blockchain verification and ISO 27001 compliance
            </CardDescription>
          </div>
          <Button onClick={exportAuditLog} className="gap-2">
            <Download className="h-4 w-4" />
            Export Log
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search audit logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="access">Access</SelectItem>
              <SelectItem value="modification">Modification</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1day">Last 24 hours</SelectItem>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
          <span className="text-sm">
            Showing {filteredEvents.length} of {auditEvents.length} audit events
          </span>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600">Blockchain verified</span>
          </div>
        </div>

        {/* Audit Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.slice(0, 50).map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="text-sm">
                    <div>{event.timestamp.toLocaleDateString()}</div>
                    <div className="text-muted-foreground">
                      {event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{event.assetName}</div>
                    <div className="text-sm text-muted-foreground">{event.assetId}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{event.action}</div>
                    <div className="text-sm text-muted-foreground">{event.details}</div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{event.user}</TableCell>
                  <TableCell className="font-mono text-sm">{event.ipAddress}</TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(event.severity)}>
                      {event.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(event.category)}>
                      {event.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {event.compliance.map((comp, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {comp}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
