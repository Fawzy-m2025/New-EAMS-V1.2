import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, 
  ChevronDown, 
  Search, 
  MapPin, 
  Building, 
  Layers, 
  Settings, 
  Plus, 
  Edit, 
  Trash2,
  Factory,
  Gauge,
  Zap,
  Wrench
} from 'lucide-react';
import type { HierarchyTreeNode, HierarchyLevel } from "@/types/eams";

interface HierarchyTreeNavigationProps {
  treeData: HierarchyTreeNode[];
  selectedNodeId?: string;
  onNodeSelect: (nodeId: string, node: HierarchyTreeNode) => void;
  onNodeExpand?: (nodeId: string, expanded: boolean) => void;
  onAddChild?: (parentNodeId: string, parentLevel: HierarchyLevel) => void;
  onEditNode?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  className?: string;
}

export function HierarchyTreeNavigation({
  treeData,
  selectedNodeId,
  onNodeSelect,
  onNodeExpand,
  onAddChild,
  onEditNode,
  onDeleteNode,
  className = ""
}: HierarchyTreeNavigationProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Filter tree data based on search term
  const filteredTreeData = useMemo(() => {
    if (!searchTerm) return treeData;
    
    const filterNode = (node: HierarchyTreeNode): HierarchyTreeNode | null => {
      const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase());
      const filteredChildren = node.children
        .map(child => filterNode(child))
        .filter(Boolean) as HierarchyTreeNode[];
      
      if (matchesSearch || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren
        };
      }
      
      return null;
    };
    
    return treeData
      .map(node => filterNode(node))
      .filter(Boolean) as HierarchyTreeNode[];
  }, [treeData, searchTerm]);

  // Get icon for hierarchy level
  const getHierarchyIcon = (level: HierarchyLevel, status?: string) => {
    const iconProps = { className: "h-4 w-4" };
    
    switch (level) {
      case 'zone':
        return <MapPin {...iconProps} className={`h-4 w-4 ${status === 'active' ? 'text-green-500' : 'text-gray-500'}`} />;
      case 'station':
        return <Building {...iconProps} className={`h-4 w-4 ${status === 'active' ? 'text-blue-500' : 'text-gray-500'}`} />;
      case 'line':
        return <Layers {...iconProps} className={`h-4 w-4 ${status === 'active' ? 'text-purple-500' : 'text-gray-500'}`} />;
      case 'system':
        return <Factory {...iconProps} className={`h-4 w-4 ${status === 'active' ? 'text-orange-500' : 'text-gray-500'}`} />;
      case 'equipment':
        return <Settings {...iconProps} className={`h-4 w-4 ${status === 'operational' ? 'text-green-500' : status === 'maintenance' ? 'text-yellow-500' : status === 'fault' ? 'text-red-500' : 'text-gray-500'}`} />;
      default:
        return <Settings {...iconProps} />;
    }
  };

  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
      case 'operational':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'fault':
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Handle node expansion
  const handleNodeExpand = (nodeId: string) => {
    const newExpandedNodes = new Set(expandedNodes);
    if (expandedNodes.has(nodeId)) {
      newExpandedNodes.delete(nodeId);
    } else {
      newExpandedNodes.add(nodeId);
    }
    setExpandedNodes(newExpandedNodes);
    onNodeExpand?.(nodeId, newExpandedNodes.has(nodeId));
  };

  // Render tree node
  const renderTreeNode = (node: HierarchyTreeNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNodeId === node.id;
    const hasChildren = node.children.length > 0;
    
    return (
      <div key={node.id} className="select-none">
        <div
          className={`
            flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors
            ${isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'}
          `}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
          onClick={() => onNodeSelect(node.id, node)}
        >
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleNodeExpand(node.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          ) : (
            <div className="w-6" />
          )}

          {/* Node Icon */}
          {getHierarchyIcon(node.level, node.status)}

          {/* Node Name */}
          <span className={`flex-1 text-sm ${isSelected ? 'font-medium' : ''}`}>
            {node.name}
          </span>

          {/* Asset Count Badge */}
          {node.assetCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {node.assetCount}
            </Badge>
          )}

          {/* Status Badge */}
          {node.status && (
            <Badge className={`text-xs ${getStatusColor(node.status)}`}>
              {node.status}
            </Badge>
          )}

          {/* Quick Actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onAddChild && node.level !== 'equipment' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChild(node.id, node.level);
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
            
            {onEditNode && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditNode(node.id);
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            
            {onDeleteNode && node.level !== 'zone' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNode(node.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Render Children */}
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={`h-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Asset Hierarchy
        </CardTitle>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          {filteredTreeData.length > 0 ? (
            <div className="p-2 space-y-1 group">
              {filteredTreeData.map(node => renderTreeNode(node))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              {searchTerm ? 'No assets found matching your search.' : 'No assets available.'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
