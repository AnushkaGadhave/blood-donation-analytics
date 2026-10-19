import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  MarkerType,
  Panel,
  type Node,
  type Edge,
  type NodeProps
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Database,
  Table,
  Key,
  Link2,
  BarChart3,
  Sparkles
} from 'lucide-react';

export interface ColumnDef {
  name: string;
  type: string;
  key?: 'PK' | 'FK' | 'FK_SRC' | 'MEASURE' | 'ATTR';
  desc?: string;
}

export interface TableNodeData extends Record<string, unknown> {
  tableName: string;
  tableType: 'fact' | 'dimension' | 'hierarchy';
  categoryLabel: string;
  rowCount: number;
  grain: string;
  color: string;
  columns: ColumnDef[];
  isSelected?: boolean;
  onSelectTable?: (tableName: string) => void;
}

// -----------------------------------------------------------------------------
// CUSTOM DATABASE TABLE NODE FOR REACT FLOW
// -----------------------------------------------------------------------------
const DatabaseTableNode: React.FC<NodeProps<Node<TableNodeData>>> = ({ data, selected }) => {
  const {
    tableName,
    tableType,
    categoryLabel,
    rowCount,
    columns = [],
    onSelectTable
  } = data;

  const isFact = tableType === 'fact';
  const isHierarchy = tableType === 'hierarchy';

  // Header background theme
  const headerBg = isFact
    ? 'bg-gradient-to-r from-[#7956E8] to-[#906CF7] text-white'
    : isHierarchy
    ? 'bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white'
    : 'bg-gradient-to-r from-[#1E293B] to-[#334155] text-white';

  const borderColor = isFact
    ? 'border-[#7956E8] ring-2 ring-[#7956E8]/20'
    : isHierarchy
    ? 'border-[#0284C7]'
    : 'border-[#CBD5E1]';

  return (
    <div
      onClick={() => onSelectTable && onSelectTable(tableName)}
      className={`w-[290px] sm:w-[310px] bg-white rounded-2xl shadow-lg border transition-all duration-200 cursor-pointer overflow-hidden ${borderColor} ${
        selected ? 'ring-4 ring-[#FF786B] shadow-2xl scale-[1.02]' : 'hover:shadow-xl hover:border-[#7956E8]'
      }`}
    >
      {/* 4 Directional Multi-Handles for Clean Orthogonal Routing */}
      <Handle type="target" position={Position.Left} id="left-in" className="!w-3 !h-3 !bg-[#7956E8] !border-2 !border-white" />
      <Handle type="source" position={Position.Left} id="left-out" className="!w-3 !h-3 !bg-[#7956E8] !border-2 !border-white" />
      <Handle type="target" position={Position.Right} id="right-in" className="!w-3 !h-3 !bg-[#7956E8] !border-2 !border-white" />
      <Handle type="source" position={Position.Right} id="right-out" className="!w-3 !h-3 !bg-[#7956E8] !border-2 !border-white" />
      <Handle type="target" position={Position.Top} id="top-in" className="!w-3 !h-3 !bg-[#7956E8] !border-2 !border-white" />
      <Handle type="source" position={Position.Top} id="top-out" className="!w-3 !h-3 !bg-[#7956E8] !border-2 !border-white" />
      <Handle type="target" position={Position.Bottom} id="bottom-in" className="!w-3 !h-3 !bg-[#7956E8] !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} id="bottom-out" className="!w-3 !h-3 !bg-[#7956E8] !border-2 !border-white" />

      {/* Table Header */}
      <div className={`p-3.5 ${headerBg} flex items-center justify-between`}>
        <div className="flex items-center space-x-2.5 min-w-0">
          <span className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
            {isFact ? <Database className="w-4 h-4 text-white" /> : <Table className="w-4 h-4 text-white" />}
          </span>
          <div className="min-w-0">
            <h4 className="text-sm font-black tracking-tight truncate font-mono">{tableName}</h4>
            <span className="text-[10px] font-semibold text-white/80 uppercase tracking-wider block">
              {categoryLabel}
            </span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-white/25 text-white backdrop-blur-sm shrink-0">
          {rowCount.toLocaleString()} rows
        </span>
      </div>

      {/* Column Schema Definition */}
      <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto divide-y divide-[#F1F5F9]">
        {columns.map((col, idx) => {
          const isPK = col.key === 'PK';
          const isFK = col.key === 'FK' || col.key === 'FK_SRC';
          const isMeasure = col.key === 'MEASURE';

          return (
            <div
              key={idx}
              className={`flex items-center justify-between text-xs py-1.5 px-2 rounded-lg transition-colors ${
                isPK
                  ? 'bg-[#FFFBEB] font-semibold text-[#92400E]'
                  : isFK
                  ? 'bg-[#EFF6FF] font-medium text-[#1E40AF]'
                  : isMeasure
                  ? 'bg-[#F5F3FF] font-medium text-[#6B21A8]'
                  : 'text-[#475569] hover:bg-[#F8FAFC]'
              }`}
            >
              <div className="flex items-center space-x-2 min-w-0">
                {/* Key Badge */}
                {isPK && (
                  <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-[#FDE68A] text-[#92400E] border border-[#F59E0B]/30 shrink-0 flex items-center gap-0.5">
                    <Key className="w-2.5 h-2.5" /> PK
                  </span>
                )}
                {isFK && (
                  <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-[#BFDBFE] text-[#1E40AF] border border-[#3B82F6]/30 shrink-0 flex items-center gap-0.5">
                    <Link2 className="w-2.5 h-2.5" /> FK
                  </span>
                )}
                {isMeasure && (
                  <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-[#DDD6FE] text-[#6B21A8] border border-[#8B5CF6]/30 shrink-0 flex items-center gap-0.5">
                    <BarChart3 className="w-2.5 h-2.5" /> NUM
                  </span>
                )}
                {!isPK && !isFK && !isMeasure && (
                  <span className="w-6 text-[9px] text-center text-[#94A3B8] font-mono shrink-0">
                    attr
                  </span>
                )}

                {/* Column Name */}
                <span className="font-mono text-[12px] truncate" title={col.desc || col.name}>
                  {col.name}
                </span>
              </div>

              {/* Data Type */}
              <span className="text-[10px] font-mono text-[#94A3B8] uppercase ml-2 shrink-0">
                {col.type}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const nodeTypes = {
  dbTable: DatabaseTableNode
};

// -----------------------------------------------------------------------------
// MAIN SCHEMA DIAGRAM VIEWER COMPONENT
// -----------------------------------------------------------------------------
interface SchemaDiagramViewerProps {
  schemaType: 'star' | 'snowflake' | 'constellation';
  tables: any[];
  diagramData: any;
  selectedTableName?: string;
  onSelectTable: (tableName: string) => void;
}

export const SchemaDiagramViewer: React.FC<SchemaDiagramViewerProps> = ({
  schemaType,
  tables,
  diagramData,
  selectedTableName,
  onSelectTable
}) => {
  // Generate React Flow Nodes with exact pixel layout positions
  const nodes: Node<TableNodeData>[] = useMemo(() => {
    const rawNodes = diagramData?.nodes || [];

    return rawNodes.map((n: any) => {
      // Find matching table definition to get real row count and columns
      const tblDef = tables.find((t: any) => t.table_name === n.id) || {};
      const columns: ColumnDef[] = n.columns || tblDef.columns || [];
      const rowCount = tblDef.row_count !== undefined ? tblDef.row_count : n.rows || 0;
      const isSelected = selectedTableName === n.id;

      // Schema-specific coordinates ensuring zero overlap
      let position = n.position || { x: 100, y: 100 };

      if (schemaType === 'star') {
        if (n.id === 'fact_transfusion_events') position = { x: 420, y: 100 };
        else if (n.id === 'dim_recency') position = { x: 40, y: 20 };
        else if (n.id === 'dim_frequency') position = { x: 800, y: 20 };
        else if (n.id === 'dim_tenure') position = { x: 40, y: 350 };
        else if (n.id === 'dim_donation_status') position = { x: 800, y: 350 };
      } else if (schemaType === 'snowflake') {
        if (n.id === 'fact_transfusion_events') position = { x: 500, y: 120 };
        // Recency branch (Left Top)
        else if (n.id === 'dim_recency_category') position = { x: 20, y: 20 };
        else if (n.id === 'dim_recency') position = { x: 260, y: 20 };
        // Frequency branch (Right Top)
        else if (n.id === 'dim_frequency') position = { x: 870, y: 20 };
        else if (n.id === 'dim_frequency_category') position = { x: 1120, y: 20 };
        // Tenure branch (Left Bottom)
        else if (n.id === 'dim_tenure_category') position = { x: 20, y: 360 };
        else if (n.id === 'dim_tenure') position = { x: 260, y: 360 };
        // Status branch (Right Bottom)
        else if (n.id === 'dim_donation_status') position = { x: 870, y: 360 };
      } else if (schemaType === 'constellation') {
        if (n.id === 'fact_donor_history') position = { x: 240, y: 140 };
        else if (n.id === 'fact_donation_response') position = { x: 740, y: 140 };
        else if (n.id === 'dim_recency') position = { x: 20, y: 20 };
        else if (n.id === 'dim_frequency') position = { x: 490, y: 10 };
        else if (n.id === 'dim_tenure') position = { x: 960, y: 20 };
        else if (n.id === 'dim_donation_status') position = { x: 490, y: 410 };
      }

      return {
        id: n.id,
        type: 'dbTable',
        position,
        selected: isSelected,
        data: {
          tableName: n.id,
          tableType: n.type || (n.id.startsWith('fact_') ? 'fact' : n.id.includes('_category') ? 'hierarchy' : 'dimension'),
          categoryLabel: n.category || (n.id.startsWith('fact_') ? 'Fact Table' : n.id.includes('_category') ? '3NF Category Table' : 'Dimension Table'),
          rowCount,
          grain: n.grain || tblDef.grain || '',
          color: n.color || '#7956E8',
          columns,
          isSelected,
          onSelectTable
        }
      };
    });
  }, [diagramData, tables, schemaType, selectedTableName, onSelectTable]);

  // Generate React Flow Edges with smooth curves & markers
  const edges: Edge[] = useMemo(() => {
    const rawEdges = diagramData?.edges || [];

    return rawEdges.map((e: any, idx: number) => {
      const isBridge = e.id?.includes('bridge') || (e.source?.startsWith('fact_') && e.target?.startsWith('fact_'));
      const strokeColor = isBridge ? '#7956E8' : e.style?.stroke || '#0284C7';

      return {
        id: e.id || `edge-${idx}`,
        source: e.source,
        target: e.target,
        label: e.label || '1 : N',
        type: 'smoothstep',
        animated: isBridge,
        style: {
          stroke: strokeColor,
          strokeWidth: isBridge ? 3 : 2.5,
          strokeDasharray: isBridge ? '6,6' : undefined
        },
        labelStyle: {
          fill: '#1E293B',
          fontWeight: 700,
          fontSize: 11,
          fontFamily: 'monospace'
        },
        labelBgStyle: {
          fill: '#FFFFFF',
          fillOpacity: 0.95,
          rx: 6,
          ry: 6
        },
        labelBgPadding: [6, 4] as [number, number],
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
          width: 18,
          height: 18
        }
      };
    });
  }, [diagramData]);

  return (
    <div className="w-full bg-[#FAFAFE] rounded-3xl border border-[#E2E8F0] shadow-md overflow-hidden relative">
      {/* Diagram Canvas Banner */}
      <div className="p-4 bg-white border-b border-[#ECE8F6] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <span className="p-2 bg-[#F5F3FF] text-[#7956E8] rounded-xl">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-black text-[#131127] uppercase tracking-wide">
              Visual Database ERD Diagram — {schemaType.toUpperCase()} SCHEMA
            </h3>
            <p className="text-xs text-[#6B7280]">
              Interactive canvas with real tables, primary keys, foreign keys, and referential join lines.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-[#F8F7FC] px-3 py-1.5 rounded-xl border border-[#ECE8F6]">
          <span className="font-extrabold text-[#7956E8] uppercase text-[10px] tracking-wider">Legend:</span>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7956E8]"></span>
            <span className="text-[#475569] font-medium">Fact Table</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]"></span>
            <span className="text-[#475569] font-medium">Dimension</span>
          </div>
          {schemaType === 'snowflake' && (
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]"></span>
              <span className="text-[#475569] font-medium">3NF Category</span>
            </div>
          )}
          <div className="flex items-center space-x-1.5 pl-2 border-l border-[#CBD5E1]">
            <span className="px-1 py-0.2 text-[9px] font-bold bg-[#FDE68A] text-[#92400E] rounded">PK</span>
            <span className="text-[#64748B]">Primary Key</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="px-1 py-0.2 text-[9px] font-bold bg-[#BFDBFE] text-[#1E40AF] rounded">FK</span>
            <span className="text-[#64748B]">Foreign Key</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="px-1 py-0.2 text-[9px] font-bold bg-[#DDD6FE] text-[#6B21A8] rounded">NUM</span>
            <span className="text-[#64748B]">Measure</span>
          </div>
        </div>
      </div>

      {/* Interactive React Flow Canvas */}
      <div className="h-[620px] w-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.2}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#CBD5E1" gap={20} size={1.5} />
          <Controls className="!bg-white !shadow-lg !border !border-[#E2E8F0] !rounded-xl !overflow-hidden" />
          <Panel position="bottom-left" className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#ECE8F6] text-[11px] text-[#64748B] shadow-sm">
            💡 <span className="font-semibold text-[#131127]">Tip:</span> Click any table box to inspect its rows or pan/zoom with mouse/trackpad.
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};
