import React, { useEffect, useState } from 'react';
import {
  Database,
  Download,
  Search,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Info,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import type { DatasetOverview, PaginatedRecordsResponse } from '../types';

export const DatasetOverviewView: React.FC = () => {
  const [overview, setOverview] = useState<DatasetOverview | null>(null);
  const [recordsData, setRecordsData] = useState<PaginatedRecordsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Table state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortBy, setSortBy] = useState<string>('donor_id');
  const [sortDir, setSortDir] = useState<string>('asc');
  const [search, setSearch] = useState<string>('');
  const [targetFilter, setTargetFilter] = useState<number | undefined>(undefined);

  // Load Overview once
  useEffect(() => {
    async function loadOverview() {
      try {
        setLoading(true);
        const data = await api.getDatasetOverview();
        setOverview(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load dataset overview.');
      } finally {
        setLoading(false);
      }
    }
    loadOverview();
  }, []);

  // Load Table records whenever table params change
  useEffect(() => {
    async function loadRecords() {
      try {
        setTableLoading(true);
        const data = await api.getDatasetRecords({
          page,
          page_size: pageSize,
          sort_by: sortBy,
          sort_dir: sortDir,
          search: search.trim() || undefined,
          target_filter: targetFilter
        });
        setRecordsData(data);
      } catch (err: any) {
        console.error('Error fetching records:', err);
      } finally {
        setTableLoading(false);
      }
    }
    loadRecords();
  }, [page, pageSize, sortBy, sortDir, search, targetFilter]);

  const handleSort = (colName: string) => {
    if (sortBy === colName) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(colName);
      setSortDir('asc');
    }
    setPage(1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <div className="w-10 h-10 border-4 border-[#E9E4FC] border-t-[#7956E8] rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-[#4E4B66]">Loading UCI Dataset Overview &amp; Records...</p>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="p-6 bg-[#FFF5F4] border border-[#FF786B]/30 rounded-2xl text-[#131127] space-y-3 shadow-sm">
        <div className="flex items-center space-x-2 font-bold text-[#FF786B]">
          <AlertCircle className="w-5 h-5" />
          <span>Error Loading Dataset</span>
        </div>
        <p className="text-sm text-[#4E4B66]">{error || 'Could not retrieve dataset.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header & Academic Citation Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-[#F0F8FE] text-[#58B8F5] rounded-2xl shadow-xs">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131127] tracking-tight">
                UCI Blood Transfusion Service Center Dataset
              </h1>
              <p className="text-xs sm:text-sm text-[#7E7A9B] font-medium">
                Official Benchmark Dataset • 748 Records • 5 Attributes • RFMTC Marketing Model
              </p>
            </div>
          </div>
          <a
            href={overview.uci_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#F8F7FC] hover:bg-[#F1EEFB] text-[#7956E8] border border-[#ECE8F6] text-xs font-bold rounded-2xl transition self-start sm:self-auto shadow-xs"
          >
            <span>UCI Repository Link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="p-4 bg-[#F8F7FC] rounded-2xl border border-[#ECE8F6] text-xs text-[#4E4B66] space-y-2">
          <div className="flex items-center space-x-2 font-bold text-[#131127]">
            <Info className="w-4 h-4 text-[#7956E8]" />
            <span>Official Academic Citation &amp; Provenance</span>
          </div>
          <p className="font-mono bg-white p-3 rounded-xl border border-[#ECE8F6] text-[#131127] leading-relaxed">
            Yeh, I-Cheng, Yang, King-Jang, and Ting, Tao-Ming, &quot;Knowledge discovery on RFM model using Bernoulli sequence,&quot; <em>Expert Systems with Applications</em>, 2008 (doi:10.1016/j.eswa.2008.07.018).
          </p>
          <p className="text-[#7E7A9B] leading-relaxed">
            <strong className="text-[#131127]">Study Context:</strong> Blood Transfusion Service Center in Hsin-Chu City, Taiwan. Mobile transfusion bus visits university campus every 3 months. Selected 748 randomly sampled donors from the center database to evaluate return propensity in March 2007.
          </p>
        </div>
      </div>

      {/* Quality Audit Cards (Pastel Tints with Saturated Accents) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-[#EDF9F5] rounded-3xl border border-[#D1F5EA] shadow-xs space-y-2 card-hover">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#0D9488] uppercase tracking-wider">Completeness Audit</span>
            <div className="p-2 bg-[#56C9A5] text-white rounded-xl shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#131127]">0 Missing Values</div>
          <p className="text-xs text-[#4E4B66]">
            100% attribute completeness across all 748 records. Zero imputation required.
          </p>
        </div>

        <div className="p-5 bg-[#F0F8FE] rounded-3xl border border-[#BAE6FD]/60 shadow-xs space-y-2 card-hover">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#58B8F5] uppercase tracking-wider">Behavioral Profiles</span>
            <div className="p-2 bg-[#58B8F5] text-white rounded-xl shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#131127]">533 Unique Tuples</div>
          <p className="text-xs text-[#4E4B66]">
            215 donor instances share identical RFMT profiles (e.g. 1st-time donors), representing true behavioral clusters.
          </p>
        </div>

        <div className="p-5 bg-[#FEF9E7] rounded-3xl border border-[#FDEFC2] shadow-xs space-y-2 card-hover">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#B45309] uppercase tracking-wider">Collinearity Invariant</span>
            <div className="p-2 bg-[#FFD166] text-[#78350F] rounded-xl shadow-xs">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#131127]">M = 250 × F (r = 1.0)</div>
          <p className="text-xs text-[#4E4B66]">
            Every donation event equals exactly 250 c.c. of blood. Monetary cc provides 0 additional variance over Frequency.
          </p>
        </div>
      </div>

      {/* Data Dictionary Table */}
      <div className="bg-white p-6 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-4">
        <div className="border-b border-[#F1EEFB] pb-3.5">
          <h2 className="text-base font-extrabold text-[#131127]">RFMTC Data Dictionary &amp; Attribute Specifications</h2>
          <p className="text-xs text-[#7E7A9B]">Complete listing of input features, measurement units, and target role</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F8F7FC] text-[#7E7A9B] text-xs font-bold uppercase tracking-wider border-b border-[#ECE8F6]">
              <tr>
                <th className="py-3 px-3">RFM Code</th>
                <th className="py-3 px-3">Standard Attribute Name</th>
                <th className="py-3 px-4">Description &amp; Meaning</th>
                <th className="py-3 px-3">Type / Unit</th>
                <th className="py-3 px-3 text-center">Value Range</th>
                <th className="py-3 px-3 text-right">Modeling Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1EEFB]">
              {overview.data_dictionary.map((item) => (
                <tr key={item.name} className="hover:bg-[#F8F7FC] transition">
                  <td className="py-3.5 px-3 font-extrabold text-[#7956E8] font-mono text-xs">{item.rfm_code}</td>
                  <td className="py-3.5 px-3 font-bold text-[#131127] font-mono text-xs">{item.name}</td>
                  <td className="py-3.5 px-4 text-[#4E4B66] leading-relaxed">{item.description}</td>
                  <td className="py-3.5 px-3 text-[#131127]">
                    <span className="inline-block bg-[#F8F7FC] border border-[#ECE8F6] px-2 py-0.5 rounded-lg text-xs font-medium">
                      {item.unit}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center text-[#131127] font-bold">
                    {item.min} – {item.max.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        item.role.includes('Target')
                          ? 'bg-[#FFF5F4] text-[#FF786B] border border-[#FFE4E1]'
                          : item.role.includes('Collinear')
                          ? 'bg-[#FEF9E7] text-[#B45309] border border-[#FDEFC2]'
                          : 'bg-[#EDF9F5] text-[#0D9488] border border-[#D1F5EA]'
                      }`}
                    >
                      {item.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Paginated Dataset Explorer */}
      <div className="bg-white p-6 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1EEFB] pb-4">
          <div>
            <h2 className="text-base font-extrabold text-[#131127]">Dataset Records Explorer</h2>
            <p className="text-xs text-[#7E7A9B]">
              Showing {recordsData ? `${recordsData.records.length} of ${recordsData.total_records}` : '...'} donor records
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#8C87A8]" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search values..."
                className="pl-8 pr-3 py-1.5 text-xs bg-[#F8F7FC] border border-[#ECE8F6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7956E8]/30 focus:border-[#7956E8] text-[#131127]"
              />
            </div>

            {/* Target Filter Dropdown */}
            <select
              value={targetFilter === undefined ? '' : targetFilter}
              onChange={(e) => {
                const val = e.target.value;
                setTargetFilter(val === '' ? undefined : Number(val));
                setPage(1);
              }}
              className="py-1.5 px-3 text-xs bg-[#F8F7FC] border border-[#ECE8F6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7956E8]/30 focus:border-[#7956E8] text-[#131127] font-medium"
            >
              <option value="">All Classes (748)</option>
              <option value="1">Class 1: Donated (178)</option>
              <option value="0">Class 0: Did Not Donate (570)</option>
            </select>

            {/* CSV Export Button */}
            <a
              href={api.getExportCsvUrl(targetFilter)}
              download
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-[#7956E8] hover:bg-[#6844D8] text-white text-xs font-bold rounded-xl shadow-md shadow-[#7956E8]/20 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto relative min-h-[300px]">
          {tableLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center z-10">
              <div className="w-7 h-7 border-3 border-[#E9E4FC] border-t-[#7956E8] rounded-full animate-spin"></div>
            </div>
          )}

          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F8F7FC] text-[#7E7A9B] text-xs font-bold uppercase tracking-wider border-b border-[#ECE8F6]">
              <tr>
                <th
                  onClick={() => handleSort('donor_id')}
                  className="py-3 px-3 cursor-pointer hover:text-[#7956E8] transition"
                >
                  Donor # {sortBy === 'donor_id' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('recency_months')}
                  className="py-3 px-3 cursor-pointer hover:text-[#7956E8] transition"
                >
                  Recency (months) {sortBy === 'recency_months' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('frequency_times')}
                  className="py-3 px-3 cursor-pointer hover:text-[#7956E8] transition"
                >
                  Frequency (times) {sortBy === 'frequency_times' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('monetary_cc')}
                  className="py-3 px-3 cursor-pointer hover:text-[#7956E8] transition"
                >
                  Monetary (c.c.) {sortBy === 'monetary_cc' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('time_months')}
                  className="py-3 px-3 cursor-pointer hover:text-[#7956E8] transition"
                >
                  Time (months) {sortBy === 'time_months' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('donated_march_2007')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-[#7956E8] transition"
                >
                  Donated March 2007 {sortBy === 'donated_march_2007' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1EEFB]">
              {recordsData && recordsData.records.length > 0 ? (
                recordsData.records.map((r) => (
                  <tr key={r.donor_id} className="hover:bg-[#F8F7FC] font-mono text-xs transition">
                    <td className="py-2.5 px-3 font-bold text-[#7956E8]">#{r.donor_id}</td>
                    <td className="py-2.5 px-3 text-[#131127] font-semibold">{r.recency_months}</td>
                    <td className="py-2.5 px-3 text-[#131127] font-semibold">{r.frequency_times}</td>
                    <td className="py-2.5 px-3 text-[#131127] font-semibold">{r.monetary_cc.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-[#131127] font-semibold">{r.time_months}</td>
                    <td className="py-2.5 px-3 text-right font-sans">
                      {r.donated_march_2007 === 1 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF5F4] text-[#FF786B] border border-[#FFE4E1]">
                          1 (Donated)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-[#58B8F5] bg-[#F0F8FE] border border-[#BAE6FD]/40">
                          0 (No)
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#8C87A8] text-xs font-medium">
                    No matching donor records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {recordsData && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#F1EEFB] text-xs text-[#7E7A9B]">
            <div className="flex items-center space-x-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-[#F8F7FC] border border-[#ECE8F6] rounded-lg px-2.5 py-1 text-xs text-[#131127] font-medium"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>
                Page {recordsData.page} of {recordsData.total_pages}
              </span>
            </div>

            <div className="flex items-center space-x-1.5 self-end sm:self-auto">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 bg-[#F8F7FC] hover:bg-[#F1EEFB] border border-[#ECE8F6] disabled:opacity-40 rounded-xl transition text-[#131127]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(recordsData.total_pages, p + 1))}
                disabled={page === recordsData.total_pages}
                className="p-1.5 bg-[#F8F7FC] hover:bg-[#F1EEFB] border border-[#ECE8F6] disabled:opacity-40 rounded-xl transition text-[#131127]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
