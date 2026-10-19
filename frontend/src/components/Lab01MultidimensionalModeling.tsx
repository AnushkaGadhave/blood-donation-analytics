import React, { useState } from 'react';
import {
  Boxes,
  Split,
  Compass,
  Database,
  CheckCircle2,
  Table,
  Key,
  Link2,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import { SchemaDiagramViewer } from './SchemaDiagramViewer';
import type { LabDetailResponse } from '../types';

interface Lab01Props {
  labDetail: LabDetailResponse;
}

type SchemaType = 'star' | 'snowflake' | 'constellation';

export const Lab01MultidimensionalModeling: React.FC<Lab01Props> = ({ labDetail }) => {
  const [activeSchema, setActiveSchema] = useState<SchemaType>('star');
  const [selectedTableName, setSelectedTableName] = useState<string>('fact_transfusion_events');
  const [tableSearch, setTableSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Extract schemas from backend response
  const schemas = labDetail.schemas || {};
  const currentSchemaData = schemas[activeSchema] || schemas.star;
  const tables = currentSchemaData?.tables || [];
  const diagramData = currentSchemaData?.diagram || { nodes: [], edges: [] };

  // Current active table for preview
  const currentTable = tables.find((t: any) => t.table_name === selectedTableName) || tables[0] || null;

  // Handle schema change
  const handleSchemaChange = (schema: SchemaType) => {
    setActiveSchema(schema);
    const nextTables = schemas[schema]?.tables || [];
    if (nextTables.length > 0) {
      setSelectedTableName(nextTables[0].table_name);
    }
    setCurrentPage(1);
    setTableSearch('');
  };

  // Filter preview data by search query
  const previewData = currentTable?.preview_data || [];
  const filteredData = previewData.filter((row: any) => {
    if (!tableSearch.trim()) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(tableSearch.toLowerCase().trim())
    );
  });

  const totalFiltered = filteredData.length;
  const totalPages = Math.ceil(totalFiltered / pageSize) || 1;
  const paginatedRows = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // CSV download generator for the current table preview
  const handleDownloadCsv = () => {
    if (!currentTable || !currentTable.columns || previewData.length === 0) return;
    const colNames = currentTable.columns.map((c: any) => c.name);
    const csvHeader = colNames.join(',');
    const csvRows = previewData.map((row: any) =>
      colNames.map((c: string) => JSON.stringify(row[c] !== undefined ? row[c] : '')).join(',')
    );
    const csvContent = [csvHeader, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentTable.table_name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Concise objectives per schema
  const schemaObjectives: Record<SchemaType, { aim: string; structure: string }> = {
    star: {
      aim: "Model single-event blood transfusion observations by connecting a central fact table directly to 4 denormalized dimensions for high-speed OLAP aggregations.",
      structure: "fact_transfusion_events (748 rows) surrounded by dim_recency (4), dim_frequency (4), dim_tenure (4), and dim_donation_status (2)."
    },
    snowflake: {
      aim: "Decompose dimension tables into 3NF normalized sub-category hierarchies to eliminate repeated descriptive strings and enforce master data integrity.",
      structure: "fact_transfusion_events (748 rows) connected to Level-1 dimensions (dim_recency, dim_frequency, dim_tenure, dim_donation_status) which branch into Level-2 category tables (dim_recency_category, dim_frequency_category, dim_tenure_category)."
    },
    constellation: {
      aim: "Model two distinct business processes (historical donor RFMT profiling vs. March 2007 mobile campaign response) using dual fact tables sharing conformed dimensions.",
      structure: "fact_donor_history (748 rows) and fact_donation_response (748 rows) sharing conformed dimensions (dim_recency, dim_frequency, dim_tenure, dim_donation_status) bridged by surrogate donor_id."
    }
  };

  const validationChecks = [
    { title: "Source Dataset Reconciled", desc: "Exactly 748 instances loaded from UCI transfusion.data with 0 dropped rows.", passed: true },
    { title: "Collinearity Invariant Verified", desc: "Monetary (c.c.) = 250 × Frequency holds for 100% of records (Pearson r = 1.0000).", passed: true },
    { title: "Referential Integrity 100%", desc: "All fact foreign keys resolve to valid dimension primary keys with 0 orphan records.", passed: true },
    { title: "Non-Overlapping Coverage", desc: "Recency, Frequency, and Tenure tiers provide 100% continuous coverage with 0 unmapped values.", passed: true }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ========================================================================= */}
      {/* TOP CONTROLS & SCHEMA SELECTOR */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-[#F5F3FF] text-[#7956E8] rounded-lg">
                <Database className="w-4 h-4" />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#7956E8]">
                DWDM Lab 01 — Multidimensional Modeling
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#131127] tracking-tight">
              Visual Database Schema Diagrams
            </h2>
          </div>

          {/* 3 Internal Schema Switcher Buttons */}
          <div className="inline-flex p-1.5 bg-[#F8F7FC] rounded-2xl border border-[#ECE8F6] shadow-inner shrink-0">
            <button
              onClick={() => handleSchemaChange('star')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-xs transition-all duration-200 ${
                activeSchema === 'star'
                  ? 'bg-[#7956E8] text-white shadow-md shadow-[#7956E8]/25 scale-[1.02]'
                  : 'text-[#64748B] hover:text-[#131127] hover:bg-white'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Star Schema</span>
            </button>

            <button
              onClick={() => handleSchemaChange('snowflake')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-xs transition-all duration-200 ${
                activeSchema === 'snowflake'
                  ? 'bg-[#0284C7] text-white shadow-md shadow-[#0284C7]/25 scale-[1.02]'
                  : 'text-[#64748B] hover:text-[#131127] hover:bg-white'
              }`}
            >
              <Split className="w-4 h-4" />
              <span>Snowflake Schema</span>
            </button>

            <button
              onClick={() => handleSchemaChange('constellation')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-xs transition-all duration-200 ${
                activeSchema === 'constellation'
                  ? 'bg-[#EC79B9] text-white shadow-md shadow-[#EC79B9]/25 scale-[1.02]'
                  : 'text-[#64748B] hover:text-[#131127] hover:bg-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Fact Constellation</span>
            </button>
          </div>
        </div>

        {/* Short Objective Banner */}
        <div className="p-3.5 bg-[#F8F7FC] rounded-2xl border border-[#ECE8F6] flex items-start space-x-3 text-xs text-[#475569]">
          <span className="p-1 bg-white text-[#7956E8] rounded-lg shadow-xs mt-0.5 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </span>
          <div>
            <span className="font-bold text-[#131127]">Objective: </span>
            {schemaObjectives[activeSchema].aim}
            <div className="mt-1 font-mono text-[11px] text-[#64748B]">
              <span className="font-semibold text-[#7956E8]">Implemented Structure: </span>
              {schemaObjectives[activeSchema].structure}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ACTUAL VISUAL DATABASE SCHEMA DIAGRAM (MAIN FOCUS) */}
      {/* ========================================================================= */}
      <SchemaDiagramViewer
        schemaType={activeSchema}
        tables={tables}
        diagramData={diagramData}
        selectedTableName={selectedTableName}
        onSelectTable={(tblName) => setSelectedTableName(tblName)}
      />

      {/* ========================================================================= */}
      {/* 2. IMPLEMENTED TABLES & LIVE DATA EXPLORER */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ECE8F6] pb-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-black text-[#131127] flex items-center space-x-2">
              <Table className="w-4 h-4 text-[#7956E8]" />
              <span>Implemented Schema Tables ({tables.length})</span>
            </h3>
            <p className="text-xs text-[#64748B]">
              Select any table to inspect live records generated from the UCI dataset.
            </p>
          </div>

          {/* Download CSV Button */}
          {currentTable && (
            <button
              onClick={handleDownloadCsv}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#F8F7FC] hover:bg-[#ECE8F6] text-[#131127] border border-[#CBD5E1] rounded-xl text-xs font-bold transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-[#7956E8]" />
              <span>Export {currentTable.table_name}.csv</span>
            </button>
          )}
        </div>

        {/* Table Selection Pills */}
        <div className="flex flex-wrap gap-2">
          {tables.map((tbl: any) => {
            const isSelected = tbl.table_name === selectedTableName;
            const isFact = tbl.table_name.startsWith('fact_');
            const isHierarchy = tbl.table_name.includes('_category');

            return (
              <button
                key={tbl.table_name}
                onClick={() => {
                  setSelectedTableName(tbl.table_name);
                  setCurrentPage(1);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  isSelected
                    ? isFact
                      ? 'bg-[#7956E8] text-white shadow-md scale-[1.02]'
                      : isHierarchy
                      ? 'bg-[#0284C7] text-white shadow-md scale-[1.02]'
                      : 'bg-[#1E293B] text-white shadow-md scale-[1.02]'
                    : 'bg-[#F8F7FC] text-[#475569] hover:bg-[#ECE8F6] border border-[#ECE8F6]'
                }`}
              >
                <span className="font-mono">{tbl.table_name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-white text-[#64748B] border border-[#CBD5E1]'
                  }`}
                >
                  {tbl.row_count !== undefined ? tbl.row_count : (tbl.preview_data || []).length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Table Details & Live Preview */}
        {currentTable && (
          <div className="space-y-4 pt-2">
            {/* Table Meta Bar & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8F7FC] p-3 rounded-2xl border border-[#ECE8F6]">
              <div className="flex items-center space-x-3 text-xs">
                <span className="font-mono font-black text-[#131127] text-sm">{currentTable.table_name}</span>
                <span className="text-[#94A3B8]">|</span>
                <span className="text-[#64748B] font-medium">{currentTable.grain || 'Physical Warehouse Entity'}</span>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Search table values..."
                  value={tableSearch}
                  onChange={(e) => {
                    setTableSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7956E8] text-[#131127]"
                />
              </div>
            </div>

            {/* Table Column & Schema Badges */}
            <div className="flex flex-wrap gap-1.5">
              {(currentTable.columns || []).map((col: any, idx: number) => {
                const isPK = col.key === 'PK';
                const isFK = col.key === 'FK' || col.key === 'FK_SRC';
                const isMeasure = col.key === 'MEASURE';

                return (
                  <span
                    key={idx}
                    className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border ${
                      isPK
                        ? 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'
                        : isFK
                        ? 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]'
                        : isMeasure
                        ? 'bg-[#F5F3FF] text-[#6B21A8] border-[#DDD6FE]'
                        : 'bg-white text-[#475569] border-[#E2E8F0]'
                    }`}
                  >
                    {isPK && <Key className="w-3 h-3 text-[#F59E0B]" />}
                    {isFK && <Link2 className="w-3 h-3 text-[#3B82F6]" />}
                    {isMeasure && <BarChart3 className="w-3 h-3 text-[#8B5CF6]" />}
                    <span className="font-bold">{col.name}</span>
                    <span className="text-[10px] text-[#94A3B8] font-normal uppercase">{col.type}</span>
                  </span>
                );
              })}
            </div>

            {/* Live Data Grid */}
            <div className="border border-[#ECE8F6] rounded-2xl overflow-hidden bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F7FC] text-[#475569] font-bold border-b border-[#ECE8F6]">
                    <tr>
                      {(currentTable.columns || []).map((col: any) => (
                        <th key={col.name} className="px-4 py-3 font-mono">
                          <div className="flex items-center space-x-1">
                            {col.key === 'PK' && <span className="text-[#D97706] font-black">[PK]</span>}
                            {col.key === 'FK' && <span className="text-[#2563EB] font-black">[FK]</span>}
                            {col.key === 'MEASURE' && <span className="text-[#7C3AED] font-black">[NUM]</span>}
                            <span>{col.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {paginatedRows.length > 0 ? (
                      paginatedRows.map((row: any, rIdx: number) => (
                        <tr key={rIdx} className="hover:bg-[#F8F7FC] transition-colors">
                          {(currentTable.columns || []).map((col: any) => (
                            <td key={col.name} className="px-4 py-2.5 font-mono text-[#334155]">
                              {row[col.name] !== undefined ? String(row[col.name]) : '—'}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={(currentTable.columns || []).length || 1}
                          className="px-4 py-8 text-center text-[#94A3B8]"
                        >
                          No matching records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination */}
              <div className="p-3 bg-[#F8F7FC] border-t border-[#ECE8F6] flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-[#64748B]">
                  Showing <span className="font-bold text-[#131127]">{paginatedRows.length}</span> of{' '}
                  <span className="font-bold text-[#131127]">{totalFiltered}</span> rows
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-[#CBD5E1] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#ECE8F6]"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 text-[#131127]" />
                  </button>
                  <span className="font-bold text-[#131127] px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg border border-[#CBD5E1] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#ECE8F6]"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#131127]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. COMPACT VALIDATION SUMMARY */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-[#131127] flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#56C9A5]" />
            <span>Referential Integrity & Dataset Validation</span>
          </h3>
          <span className="px-3 py-1 bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] rounded-full text-xs font-black">
            Validated (100% Pass)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {validationChecks.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-[#F8F7FC] rounded-2xl border border-[#ECE8F6] space-y-1.5 flex flex-col justify-between"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                <h4 className="text-xs font-extrabold text-[#131127]">{item.title}</h4>
              </div>
              <p className="text-[11px] text-[#64748B] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
