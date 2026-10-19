import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  RefreshCw,
  ArrowRight,
  Database,
  Sparkles,
  Layers,
  Filter,
  Upload,
  TrendingUp,
  FileSpreadsheet,
  Network
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ScatterChart,
  Scatter,
  Cell,
  ZAxis
} from 'recharts';
import { api } from '../services/api';
import type { LabDetailResponse } from '../types';

interface Lab09Props {
  labDetail?: LabDetailResponse;
}

type ViewMode = 'overview' | 'itemsets' | 'rules' | 'network' | 'scatter';

const WORKFLOW_STEPS = [
  { id: 'trans', step: '01', title: 'Transactions', desc: 'Item Baskets' },
  { id: 'onehot', step: '02', title: 'One-Hot Matrix', desc: 'Boolean Encoding' },
  { id: 'apriori', step: '03', title: 'Apriori Mining', desc: 'L1, L2, L3 Itemsets' },
  { id: 'rules', step: '04', title: 'Derive Rules', desc: 'Support & Confidence' },
  { id: 'network', step: '05', title: 'Network Graph', desc: 'Item Association Map' }
];

export const Lab09AprioriRules: React.FC<Lab09Props> = ({ labDetail }) => {
  const [activeView, setActiveView] = useState<ViewMode>('overview');
  const [data, setData] = useState<any>(labDetail || null);
  const [loading, setLoading] = useState<boolean>(!labDetail);
  const [error, setError] = useState<string | null>(null);

  // Mining Parameters
  const [datasetType, setDatasetType] = useState<string>('donor_profiles');
  const [minSupport, setMinSupport] = useState<number>(0.08);
  const [minConfidence, setMinConfidence] = useState<number>(0.40);
  const [minLift, setMinLift] = useState<number>(1.0);
  const [maxRules, setMaxRules] = useState<number>(30);
  const [miningLoading, setMiningLoading] = useState<boolean>(false);

  // Filtering & Search
  const [selectedItemFilter, setSelectedItemFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'lift' | 'confidence' | 'support'>('lift');

  // Custom Upload Modal
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [customCsvText, setCustomCsvText] = useState<string>('');
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Network Highlight State
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitial() {
      try {
        setLoading(true);
        const res = await api.getLab9Overview();
        setData(res);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load Lab 09 Apriori data');
      } finally {
        setLoading(false);
      }
    }
    if (!data?.association_rules) {
      loadInitial();
    }
  }, []);

  const handleMineRules = async (dsType?: string) => {
    const ds = dsType || datasetType;
    try {
      setMiningLoading(true);
      const res = await api.mineAprioriRules({
        dataset_type: ds,
        min_support: minSupport,
        min_confidence: minConfidence,
        min_lift: minLift,
        max_rules: maxRules
      });
      setData(res);
      setDatasetType(ds);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Rule mining failed');
    } finally {
      setMiningLoading(false);
    }
  };

  const handleCustomUpload = async () => {
    if (!customCsvText.trim()) {
      setUploadError('Please paste or write CSV transaction data.');
      return;
    }
    try {
      setUploadLoading(true);
      setUploadError(null);
      await api.uploadCustomTransactionsRaw(customCsvText);
      setUploadModalOpen(false);
      setDatasetType('custom');
      await handleMineRules('custom');
    } catch (err: any) {
      setUploadError(err.message || 'Custom CSV parsing failed');
    } finally {
      setUploadLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-10 h-10 text-[#56C9A5] animate-spin" />
        <p className="text-gray-600 font-medium">Mining Frequent Itemsets & Generating Association Rules...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 space-y-2">
        <h3 className="font-bold text-lg">Error Loading Lab 09</h3>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const datasetInfo = data?.dataset_info || {};
  const summaryMetrics = data?.summary_metrics || {};
  const itemsetDistribution = data?.itemset_distribution || [];
  const topFrequentItemsets = data?.top_frequent_itemsets || [];
  const associationRules: any[] = data?.association_rules || [];
  const networkGraph = data?.network_graph || { nodes: [], edges: [] };
  const observation = data?.observation || '';

  // Filter and sort rules
  const filteredRules = associationRules
    .filter(r => {
      if (selectedItemFilter === 'all') return true;
      return (
        r.antecedent.toLowerCase().includes(selectedItemFilter.toLowerCase()) ||
        r.consequent.toLowerCase().includes(selectedItemFilter.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortBy === 'lift') return b.lift - a.lift;
      if (sortBy === 'confidence') return b.confidence - a.confidence;
      return b.support - a.support;
    });

  // Extract all distinct items for filtering
  const allItems: string[] = datasetInfo.items_list || [];

  // Network graph node positions (circular layout)
  const nodes = networkGraph.nodes || [];
  const edges = networkGraph.edges || [];
  const centerX = 250;
  const centerY = 200;
  const radius = 140;

  const nodePositions: Record<string, { x: number; y: number; node: any }> = {};
  nodes.forEach((n: any, idx: number) => {
    const angle = (idx / Math.max(1, nodes.length)) * 2 * Math.PI - Math.PI / 2;
    nodePositions[n.id] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      node: n
    };
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. HEADER & DATASET BADGE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-100/50 via-teal-50/20 to-transparent rounded-full pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-emerald-100 text-[#56C9A5] font-bold text-xs rounded-full uppercase tracking-wider">
                DWDM Lab 09
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 font-semibold text-xs rounded-full border border-teal-100">
                <Database className="w-3.5 h-3.5" />
                {datasetInfo.name || 'UCI Donor Behavioral Profiles'}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-lime-50 text-lime-700 font-semibold text-xs rounded-full border border-lime-100">
                <Network className="w-3.5 h-3.5" />
                Apriori Algorithm
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Apriori Association Rule Mining & Basket Analysis
            </h1>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">
              Discover frequent itemsets and high-lift association rules. Explore antecedent-consequent dependencies across donor cohorts and retail baskets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-2xl transition"
            >
              <Upload className="w-4 h-4" />
              <span>Upload CSV</span>
            </button>
            <button
              onClick={() => handleMineRules()}
              disabled={miningLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#56C9A5] hover:bg-[#45b793] text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${miningLoading ? 'animate-spin' : ''}`} />
              <span>{miningLoading ? 'Mining...' : 'Mine Rules'}</span>
            </button>
          </div>
        </div>

        {/* WORKFLOW PIPELINE */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {WORKFLOW_STEPS.map((wf) => (
              <div
                key={wf.id}
                className="bg-emerald-50/50 rounded-2xl p-3 border border-emerald-100/70 flex items-center gap-2.5"
              >
                <span className="w-7 h-7 rounded-xl bg-[#56C9A5] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                  {wf.step}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-gray-900 truncate">{wf.title}</div>
                  <div className="text-[11px] text-gray-500 truncate">{wf.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. COMPACT VIEW SWITCHER & INTERACTIVE CONTROLS */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center p-1 bg-gray-100/80 rounded-2xl w-full lg:w-auto overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview Dashboard', icon: BarChart2 },
            { id: 'itemsets', label: 'Frequent Itemsets (L1-L4)', icon: Layers },
            { id: 'rules', label: 'Discovered Rules Table', icon: FileSpreadsheet },
            { id: 'network', label: 'Association Network Map', icon: Network },
            { id: 'scatter', label: 'Support vs Confidence', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as ViewMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-[#56C9A5] shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* INLINE DATASET SELECTOR & THRESHOLDS */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          <div className="flex items-center gap-1 bg-emerald-50/60 p-1 rounded-2xl border border-emerald-100">
            {[
              { key: 'donor_profiles', label: 'Donor Profiles' },
              { key: 'retail_grocery', label: 'Retail Grocery' }
            ].map(ds => (
              <button
                key={ds.key}
                onClick={() => handleMineRules(ds.key)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  datasetType === ds.key
                    ? 'bg-[#56C9A5] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-emerald-100/70'
                }`}
              >
                {ds.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-2xl border border-gray-200 text-xs">
            <span className="font-bold text-gray-700">Supp:</span>
            <select
              value={minSupport}
              onChange={e => setMinSupport(parseFloat(e.target.value))}
              className="bg-white px-2 py-0.5 rounded-lg border border-gray-200 font-semibold text-gray-800 text-xs"
            >
              <option value="0.04">4%</option>
              <option value="0.08">8%</option>
              <option value="0.12">12%</option>
              <option value="0.20">20%</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-2xl border border-gray-200 text-xs">
            <span className="font-bold text-gray-700">Conf:</span>
            <select
              value={minConfidence}
              onChange={e => setMinConfidence(parseFloat(e.target.value))}
              className="bg-white px-2 py-0.5 rounded-lg border border-gray-200 font-semibold text-gray-800 text-xs"
            >
              <option value="0.20">20%</option>
              <option value="0.30">30%</option>
              <option value="0.40">40%</option>
              <option value="0.50">50%</option>
              <option value="0.60">60%</option>
              <option value="0.75">75%</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-2xl border border-gray-200 text-xs">
            <span className="font-bold text-gray-700">Lift:</span>
            <select
              value={minLift}
              onChange={e => setMinLift(parseFloat(e.target.value))}
              className="bg-white px-2 py-0.5 rounded-lg border border-gray-200 font-semibold text-gray-800 text-xs"
            >
              <option value="0.8">0.8</option>
              <option value="1.0">1.0</option>
              <option value="1.2">1.2</option>
              <option value="1.5">1.5</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-2xl border border-gray-200 text-xs">
            <span className="font-bold text-gray-700">Max:</span>
            <select
              value={maxRules}
              onChange={e => setMaxRules(parseInt(e.target.value, 10))}
              className="bg-white px-2 py-0.5 rounded-lg border border-gray-200 font-semibold text-gray-800 text-xs"
            >
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. COMPACT METRICS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm relative overflow-hidden">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Transactions</div>
          <div className="text-3xl font-black text-[#56C9A5]">{datasetInfo.total_transactions?.toLocaleString() || 748}</div>
          <div className="text-xs text-gray-500 mt-1 font-medium">{datasetInfo.total_items || 10} unique item attributes</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm relative overflow-hidden">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Frequent Itemsets</div>
          <div className="text-3xl font-black text-gray-900">{summaryMetrics.total_frequent_itemsets ?? 0}</div>
          <div className="text-xs text-emerald-600 mt-1 font-medium">Min Support ≥ {(minSupport * 100).toFixed(0)}%</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm relative overflow-hidden">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Discovered Rules</div>
          <div className="text-3xl font-black text-indigo-600">{summaryMetrics.total_rules_discovered ?? 0}</div>
          <div className="text-xs text-indigo-600 mt-1 font-medium">Min Conf ≥ {(minConfidence * 100).toFixed(0)}%</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm relative overflow-hidden">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Max Lift Discovered</div>
          <div className="text-3xl font-black text-purple-600">{summaryMetrics.max_lift_discovered ?? 1.0}</div>
          <div className="text-xs text-purple-600 mt-1 font-medium">&gt; 1.0 indicates strong positive association</div>
        </div>
      </div>

      {/* 4. MAIN VIEW CONTENT */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* TOP FREQUENT ITEMSETS BAR */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">Top Frequent Itemsets by Support</h3>
                  <p className="text-xs text-gray-500">Percentage of transactions containing the item combination</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-[#56C9A5] text-xs font-bold rounded-xl border border-emerald-100">
                  Top 8 Itemsets
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={topFrequentItemsets.slice(0, 8)}
                    margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
                    <XAxis type="number" unit="%" domain={[0, 100]} />
                    <YAxis dataKey="itemset" type="category" width={140} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(val: any) => [`${val}%`, 'Support']} />
                    <Bar dataKey="support_pct" fill="#56C9A5" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ITEMSET TIER DISTRIBUTION */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">Itemset Size Distribution (L1 - L4)</h3>
                  <p className="text-xs text-gray-500">Itemsets categorized by cardinality / item count</p>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={itemsetDistribution} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
                    <XAxis dataKey="tier" tick={{ fontSize: 11 }} />
                    <YAxis label={{ value: 'Count of Itemsets', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(val: any) => [val, 'Count']} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {itemsetDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* TOP RULES PREVIEW & NETWORK PREVIEW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* TOP 5 RULES CARD */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">Highest Lift Association Rules</h3>
                  <p className="text-xs text-gray-500">Top rules demonstrating strongest co-occurrence strength</p>
                </div>
                <button
                  onClick={() => setActiveView('rules')}
                  className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#56C9A5] text-xs font-bold rounded-xl transition"
                >
                  View All Rules ➔
                </button>
              </div>

              <div className="space-y-3">
                {filteredRules.slice(0, 5).map((rule: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-50/70 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md">
                          {rule.antecedent}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                          {rule.consequent}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Supp: {rule.support_pct}% | Conf: {rule.confidence_pct}% | Leverage: {rule.leverage}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-black text-purple-700">Lift {rule.lift}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">{rule.strength}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MINI NETWORK GRAPH PREVIEW */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-gray-900 text-lg mb-1">Association Network Map</h3>
                <p className="text-xs text-gray-500 mb-3">Item connections from top rules</p>
                
                <div className="h-56 bg-gray-50/70 rounded-2xl border border-gray-200/80 relative overflow-hidden flex items-center justify-center">
                  <svg viewBox="0 0 500 400" className="w-full h-full">
                    {/* Edges */}
                    {edges.map((edge: any, idx: number) => {
                      const src = nodePositions[edge.source];
                      const tgt = nodePositions[edge.target];
                      if (!src || !tgt) return null;
                      return (
                        <line
                          key={idx}
                          x1={src.x}
                          y1={src.y}
                          x2={tgt.x}
                          y2={tgt.y}
                          stroke="#56C9A5"
                          strokeWidth="1.5"
                          strokeOpacity="0.4"
                        />
                      );
                    })}

                    {/* Nodes */}
                    {nodes.map((node: any) => {
                      const pos = nodePositions[node.id];
                      if (!pos) return null;
                      return (
                        <g key={node.id}>
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r="12"
                            fill={node.color}
                            stroke="#fff"
                            strokeWidth="2"
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              <button
                onClick={() => setActiveView('network')}
                className="mt-3 w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-[#56C9A5] text-xs font-bold rounded-xl transition text-center"
              >
                Open Interactive Network ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. FULL FREQUENT ITEMSETS VIEW */}
      {activeView === 'itemsets' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
            <h3 className="font-extrabold text-gray-900 text-xl mb-1">Frequent Itemsets Table</h3>
            <p className="text-xs text-gray-500 mb-6">
              Item combinations satisfying Minimum Support threshold (≥ {(minSupport * 100).toFixed(0)}%)
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px]">
                    <th className="pb-3">Tier</th>
                    <th className="pb-3">Frequent Itemset</th>
                    <th className="pb-3 text-right">Support %</th>
                    <th className="pb-3 text-right">Transaction Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topFrequentItemsets.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-emerald-50/30 transition">
                      <td className="py-3 font-bold text-gray-500">{item.tier}</td>
                      <td className="py-3 font-semibold text-gray-900">{item.itemset}</td>
                      <td className="py-3 text-right font-black text-[#56C9A5]">{item.support_pct}%</td>
                      <td className="py-3 text-right text-gray-600">{item.transaction_count} baskets</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. ASSOCIATION RULES TABLE VIEW */}
      {activeView === 'rules' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-extrabold text-gray-900 text-xl">Association Rules Catalog</h3>
                <p className="text-xs text-gray-500">
                  Discovered implication rules: Antecedent (IF) ➔ Consequent (THEN)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-2xl border border-gray-200 text-xs">
                  <Filter className="w-3.5 h-3.5 text-gray-500" />
                  <span className="font-bold text-gray-600">Filter Item:</span>
                  <select
                    value={selectedItemFilter}
                    onChange={e => setSelectedItemFilter(e.target.value)}
                    className="bg-white px-2 py-1 rounded-xl border border-gray-200 font-semibold text-gray-800 text-xs"
                  >
                    <option value="all">All Items</option>
                    {allItems.map(item => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-2xl border border-gray-200 text-xs">
                  <span className="font-bold text-gray-600">Sort By:</span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="bg-white px-2 py-1 rounded-xl border border-gray-200 font-semibold text-gray-800 text-xs"
                  >
                    <option value="lift">Lift (Strength)</option>
                    <option value="confidence">Confidence %</option>
                    <option value="support">Support %</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px]">
                    <th className="pb-3">#</th>
                    <th className="pb-3">Antecedent (IF)</th>
                    <th className="pb-3">Consequent (THEN)</th>
                    <th className="pb-3 text-right">Support</th>
                    <th className="pb-3 text-right">Confidence</th>
                    <th className="pb-3 text-right">Lift</th>
                    <th className="pb-3 text-right">Leverage</th>
                    <th className="pb-3 text-right">Conviction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRules.map((rule: any, idx: number) => (
                    <tr key={idx} className="hover:bg-emerald-50/40 transition">
                      <td className="py-3 font-bold text-gray-400">{idx + 1}</td>
                      <td className="py-3 font-semibold text-purple-900">{rule.antecedent}</td>
                      <td className="py-3 font-semibold text-emerald-900">{rule.consequent}</td>
                      <td className="py-3 text-right font-medium text-gray-700">{rule.support_pct}%</td>
                      <td className="py-3 text-right font-bold text-emerald-600">{rule.confidence_pct}%</td>
                      <td className="py-3 text-right font-black text-purple-700">{rule.lift}</td>
                      <td className="py-3 text-right text-gray-500">{rule.leverage}</td>
                      <td className="py-3 text-right text-gray-500">{rule.conviction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. INTERACTIVE NETWORK GRAPH VIEW */}
      {activeView === 'network' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
            <h3 className="font-extrabold text-gray-900 text-xl mb-1">Interactive Association Network Map</h3>
            <p className="text-xs text-gray-500 mb-6">
              Hover over an item node to highlight associated antecedent/consequent rules
            </p>

            <div className="h-[480px] bg-gray-50/80 rounded-3xl border border-gray-200 p-4 relative overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 500 400" className="w-full h-full">
                {/* Edges */}
                {edges.map((edge: any, idx: number) => {
                  const src = nodePositions[edge.source];
                  const tgt = nodePositions[edge.target];
                  if (!src || !tgt) return null;
                  const isHighlighted = hoveredNode && (edge.source === hoveredNode || edge.target === hoveredNode);
                  return (
                    <g key={`edge-${idx}`}>
                      <line
                        x1={src.x}
                        y1={src.y}
                        x2={tgt.x}
                        y2={tgt.y}
                        stroke={isHighlighted ? '#7956E8' : '#56C9A5'}
                        strokeWidth={isHighlighted ? 3 : 1.5}
                        strokeOpacity={hoveredNode ? (isHighlighted ? 1 : 0.15) : 0.45}
                      />
                    </g>
                  );
                })}

                {/* Nodes */}
                {nodes.map((node: any) => {
                  const pos = nodePositions[node.id];
                  if (!pos) return null;
                  const isHovered = hoveredNode === node.id;
                  return (
                    <g
                      key={node.id}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isHovered ? 18 : 14}
                        fill={node.color}
                        stroke="#fff"
                        strokeWidth="3"
                        className="transition-all duration-200 shadow-lg"
                      />
                      <text
                        x={pos.x}
                        y={pos.y > centerY ? pos.y + 24 : pos.y - 18}
                        textAnchor="middle"
                        fill="#1F2937"
                        fontSize="9"
                        fontWeight="bold"
                        className="select-none pointer-events-none"
                      >
                        {node.label.length > 22 ? node.label.slice(0, 20) + '...' : node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {hoveredNode && (
                <div className="absolute bottom-4 left-4 p-3 bg-gray-900/90 backdrop-blur text-white rounded-2xl text-xs space-y-1 shadow-2xl border border-gray-700">
                  <div className="font-bold text-emerald-300">{hoveredNode}</div>
                  <div className="text-[11px] text-gray-300">
                    Active relations in top rules highlighted in violet.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. SUPPORT VS CONFIDENCE SCATTER */}
      {activeView === 'scatter' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
            <h3 className="font-extrabold text-gray-900 text-xl mb-1">Support vs Confidence Rule Map</h3>
            <p className="text-xs text-gray-500 mb-6">
              Each circle represents a rule; color and size reflect Lift
            </p>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
                  <XAxis
                    type="number"
                    dataKey="support_pct"
                    name="Support %"
                    unit="%"
                    label={{ value: 'Rule Support (%)', position: 'bottom', offset: 0 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="confidence_pct"
                    name="Confidence %"
                    unit="%"
                    label={{ value: 'Rule Confidence (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <ZAxis type="number" dataKey="lift" range={[40, 200]} name="Lift" />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload || payload.length === 0) return null;
                      const r = payload[0].payload;
                      return (
                        <div className="bg-gray-900 text-white p-3 rounded-2xl text-xs space-y-1 shadow-xl">
                          <div className="font-bold text-emerald-300">{r.rule_representation}</div>
                          <div>Support: <span className="font-bold">{r.support_pct}%</span></div>
                          <div>Confidence: <span className="font-bold">{r.confidence_pct}%</span></div>
                          <div>Lift: <span className="font-bold text-purple-300">{r.lift}</span></div>
                        </div>
                      );
                    }}
                  />
                  <Scatter name="Rules" data={filteredRules}>
                    {filteredRules.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.lift > 1.8 ? '#7956E8' : entry.lift > 1.2 ? '#56C9A5' : '#58B8F5'}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 9. DYNAMIC DATA-DRIVEN OBSERVATIONS */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent p-6 rounded-3xl border border-emerald-200/80">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-[#56C9A5] text-white rounded-2xl shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-gray-900 text-sm">Dynamic Apriori Association Findings</h4>
            <p className="text-xs text-gray-700 leading-relaxed">{observation}</p>
          </div>
        </div>
      </div>

      {/* 10. CUSTOM CSV UPLOAD MODAL */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-gray-900 text-lg">Upload Custom Basket Transactions</h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Paste comma-separated item rows (one transaction per row) to run Apriori on custom transaction baskets.
            </p>

            {uploadError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {uploadError}
              </div>
            )}

            <textarea
              value={customCsvText}
              onChange={e => setCustomCsvText(e.target.value)}
              placeholder="Milk, Bread, Butter&#10;Bread, Butter, Eggs&#10;Milk, Cookies, Coffee&#10;Bread, Milk, Butter, Eggs&#10;Milk, Eggs, Yogurt"
              rows={8}
              className="w-full p-3 bg-gray-50 rounded-2xl border border-gray-200 font-mono text-xs focus:ring-2 focus:ring-[#56C9A5] focus:outline-none"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setUploadModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomUpload}
                disabled={uploadLoading}
                className="px-5 py-2 bg-[#56C9A5] text-white text-xs font-bold rounded-xl hover:bg-[#45b793] transition disabled:opacity-50"
              >
                {uploadLoading ? 'Parsing...' : 'Parse & Mine'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
