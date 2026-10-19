import React, { useState, useEffect } from 'react';
import {
  GitMerge,
  BarChart2,
  RefreshCw,
  Database,
  Sparkles,
  Layers,
  SlidersHorizontal
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

interface Lab08Props {
  labDetail?: LabDetailResponse;
}

type ViewMode = 'overview' | 'dendrogram' | 'comparison' | 'clusters';

const WORKFLOW_STEPS = [
  { id: 'features', step: '01', title: 'Select Features', desc: 'Recency, Frequency, Tenure' },
  { id: 'standardize', step: '02', title: 'Standardize', desc: 'Zero Mean, Unit Variance' },
  { id: 'linkage', step: '03', title: 'Compute Linkages', desc: 'Ward, Complete, Avg, Single' },
  { id: 'cut', step: '04', title: 'Cut Dendrogram', desc: 'Partition into K Clusters' },
  { id: 'evaluate', step: '05', title: 'Compare Metrics', desc: 'Silhouette & Davies-Bouldin' }
];

const FEATURE_LABELS: Record<string, string> = {
  recency_months: 'Recency (months)',
  frequency_times: 'Frequency (times)',
  monetary_cc: 'Monetary (c.c.)',
  time_months: 'Time / Tenure (months)'
};

const DEFAULT_FEATURES = ['recency_months', 'frequency_times', 'time_months'];
const X_AXIS_FEAT = 'recency_months';
const Y_AXIS_FEAT = 'frequency_times';

export const Lab08HierarchicalClustering: React.FC<Lab08Props> = ({ labDetail }) => {
  const [activeView, setActiveView] = useState<ViewMode>('overview');
  const [data, setData] = useState<any>(labDetail || null);
  const [loading, setLoading] = useState<boolean>(!labDetail);
  const [error, setError] = useState<string | null>(null);

  // Hierarchical Clustering Controls
  const [kValue, setKValue] = useState<number>(4);
  const [selectedLinkage, setSelectedLinkage] = useState<string>('ward');
  const [clusteringLoading, setClusteringLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadInitial() {
      try {
        setLoading(true);
        const res = await api.getLab8Overview();
        setData(res);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load Lab 08 Hierarchical data');
      } finally {
        setLoading(false);
      }
    }
    if (!data?.benchmarks) {
      loadInitial();
    }
  }, []);

  const handleRecluster = async (linkageChoice?: string, kChoice?: number) => {
    const lk = linkageChoice || selectedLinkage;
    const k = kChoice || kValue;
    try {
      setClusteringLoading(true);
      const res = await api.clusterHierarchical({
        k,
        linkage_method: lk,
        features: DEFAULT_FEATURES,
        x_axis_feature: X_AXIS_FEAT,
        y_axis_feature: Y_AXIS_FEAT
      });
      setData(res);
      setSelectedLinkage(lk);
      setKValue(k);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Hierarchical recalculation failed');
    } finally {
      setClusteringLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-10 h-10 text-[#58B8F5] animate-spin" />
        <p className="text-gray-600 font-medium">Computing Dendrograms & Agglomerative Linkages...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 space-y-2">
        <h3 className="font-bold text-lg">Error Loading Lab 08</h3>
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

  const benchmarks = data?.benchmarks || [];
  const activeBenchmark = benchmarks.find((b: any) => b.method_key === selectedLinkage) || benchmarks[0] || {};
  const dendro = data?.dendrogram || { lines: [], cut_threshold: 0, sample_size: 40 };
  const clusterDistribution = data?.cluster_distribution || [];
  const clusterProfiles = data?.cluster_profiles || [];
  const scatterPoints = data?.scatter_points || [];
  const observation = data?.observation || '';
  const bestLinkageName = data?.best_linkage || 'Ward Linkage';

  // Dendrogram SVG coordinate bounds
  const dendroLines = dendro.lines || [];
  const maxY = dendroLines.length > 0
    ? Math.max(...dendroLines.flatMap((l: any) => l.y_coords)) * 1.15
    : 10;
  const maxX = dendroLines.length > 0
    ? Math.max(...dendroLines.flatMap((l: any) => l.x_coords)) + 10
    : 400;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. HEADER & DATASET BADGE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-sky-100/50 via-cyan-50/20 to-transparent rounded-full pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-sky-100 text-[#58B8F5] font-bold text-xs rounded-full uppercase tracking-wider">
                DWDM Lab 08
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 font-semibold text-xs rounded-full border border-emerald-100">
                <Database className="w-3.5 h-3.5" />
                UCI Blood Transfusion (748 records)
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-700 font-semibold text-xs rounded-full border border-sky-100">
                <GitMerge className="w-3.5 h-3.5" />
                Agglomerative Tree
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Hierarchical Agglomerative Clustering
            </h1>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">
              Construct bottom-up tree hierarchies and dendrograms. Compare Ward, Complete, Average, and Single linkage strategies on standardized blood donor features.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleRecluster()}
              disabled={clusteringLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#58B8F5] hover:bg-[#43a5e3] text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${clusteringLoading ? 'animate-spin' : ''}`} />
              <span>{clusteringLoading ? 'Computing...' : 'Recalculate (K=' + kValue + ')'}</span>
            </button>
          </div>
        </div>

        {/* WORKFLOW PIPELINE */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {WORKFLOW_STEPS.map((wf) => (
              <div
                key={wf.id}
                className="bg-sky-50/50 rounded-2xl p-3 border border-sky-100/70 flex items-center gap-2.5"
              >
                <span className="w-7 h-7 rounded-xl bg-[#58B8F5] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
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
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-sky-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center p-1 bg-gray-100/80 rounded-2xl w-full lg:w-auto overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview Dashboard', icon: BarChart2 },
            { id: 'dendrogram', label: 'Interactive Dendrogram Tree', icon: GitMerge },
            { id: 'comparison', label: '4-Linkage Comparison', icon: Layers },
            { id: 'clusters', label: 'Cluster Scatter & Profiles', icon: SlidersHorizontal }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as ViewMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-[#58B8F5] shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* INLINE LINKAGE & K SELECTOR */}
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-end">
          {/* Linkage Selector */}
          <div className="flex items-center gap-1 bg-sky-50/60 p-1.5 rounded-2xl border border-sky-100">
            {['ward', 'complete', 'average', 'single'].map(lMethod => (
              <button
                key={lMethod}
                onClick={() => handleRecluster(lMethod, kValue)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                  selectedLinkage === lMethod
                    ? 'bg-[#58B8F5] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-sky-100/70'
                }`}
              >
                {lMethod}
              </button>
            ))}
          </div>

          {/* K Selector */}
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-2xl border border-gray-200">
            <span className="text-xs font-bold text-gray-700">Clusters (K):</span>
            <div className="flex items-center gap-1">
              {[2, 3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  onClick={() => handleRecluster(selectedLinkage, num)}
                  className={`w-7 h-7 text-xs font-bold rounded-lg transition ${
                    kValue === num
                      ? 'bg-[#58B8F5] text-white shadow-sm'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. COMPACT METRICS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm relative overflow-hidden">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Linkage</div>
          <div className="text-2xl font-black text-[#58B8F5] capitalize">{selectedLinkage} Linkage</div>
          <div className="text-xs text-gray-500 mt-1 font-medium">Euclidean Distance Metric</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm relative overflow-hidden">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Silhouette</div>
          <div className="text-3xl font-black text-emerald-600">{activeBenchmark.silhouette_score ?? 'N/A'}</div>
          <div className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
            <span>Highest:</span>
            <span className="font-bold underline">{bestLinkageName}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm relative overflow-hidden">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Davies-Bouldin Index</div>
          <div className="text-3xl font-black text-indigo-600">{activeBenchmark.davies_bouldin ?? 'N/A'}</div>
          <div className="text-xs text-indigo-600 mt-1 font-medium">Cluster overlap index</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm relative overflow-hidden">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Dendrogram Cut Threshold</div>
          <div className="text-3xl font-black text-purple-600">{dendro.cut_threshold ?? 'N/A'}</div>
          <div className="text-xs text-purple-600 mt-1 font-medium">Distance height for K={kValue}</div>
        </div>
      </div>

      {/* 4. MAIN VIEW CONTENT */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 4-LINKAGE BENCHMARK BAR CHART */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">Linkage Silhouette Comparison</h3>
                  <p className="text-xs text-gray-500">Benchmark Ward vs Complete vs Average vs Single at K={kValue}</p>
                </div>
                <span className="px-2.5 py-1 bg-sky-50 text-[#58B8F5] text-xs font-bold rounded-xl border border-sky-100">
                  4 Linkages
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={benchmarks} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
                    <XAxis dataKey="method_name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 0.7]} label={{ value: 'Silhouette Score', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(val: any) => [val, 'Silhouette Score']} />
                    <Bar dataKey="silhouette_score" radius={[8, 8, 0, 0]}>
                      {benchmarks.map((entry: any) => (
                        <Cell
                          key={entry.method_key}
                          fill={entry.method_key === selectedLinkage ? '#58B8F5' : '#D1D5DB'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* DENDROGRAM MINI PREVIEW */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-lg">Dendrogram Tree ({selectedLinkage})</h3>
                    <p className="text-xs text-gray-500">Hierarchical merges of 40 representative donors with cut line</p>
                  </div>
                  <button
                    onClick={() => setActiveView('dendrogram')}
                    className="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-[#58B8F5] text-xs font-bold rounded-xl transition"
                  >
                    Full View ➔
                  </button>
                </div>

                {/* MINI SVG DENDROGRAM */}
                <div className="h-56 bg-gray-50/70 rounded-2xl p-2 border border-gray-200/80 overflow-hidden relative">
                  <svg viewBox={`0 0 ${maxX} ${maxY}`} className="w-full h-full" preserveAspectRatio="none">
                    {/* Horizontal Cut Line */}
                    {dendro.cut_threshold > 0 && (
                      <line
                        x1="0"
                        y1={maxY - dendro.cut_threshold}
                        x2={maxX}
                        y2={maxY - dendro.cut_threshold}
                        stroke="#FF786B"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                    )}

                    {/* Dendrogram Lines */}
                    {dendroLines.map((line: any, idx: number) => {
                      const xs = line.x_coords;
                      const ys = line.y_coords;
                      const dPath = `M ${xs[0]} ${maxY - ys[0]} L ${xs[1]} ${maxY - ys[1]} L ${xs[2]} ${maxY - ys[2]} L ${xs[3]} ${maxY - ys[3]}`;
                      return (
                        <path
                          key={idx}
                          d={dPath}
                          fill="none"
                          stroke="#58B8F5"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-[10px] font-bold text-red-500 border border-red-200">
                    Cut Height: {dendro.cut_threshold} (K={kValue})
                  </div>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-gray-500 flex justify-between">
                <span>Representative 40-donor sample</span>
                <span className="font-semibold text-gray-700">Linkage: {selectedLinkage}</span>
              </div>
            </div>
          </div>

          {/* CLUSTER SIZES & 2D SCATTER PREVIEW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CLUSTER SIZES */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <h3 className="font-extrabold text-gray-900 text-lg mb-1">Cluster Size Breakdown</h3>
              <p className="text-xs text-gray-500 mb-4">Donors assigned under {selectedLinkage} linkage</p>
              <div className="space-y-3">
                {clusterDistribution.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 bg-gray-50/70 rounded-2xl border border-gray-100">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.cluster_name}</span>
                      </div>
                      <span className="text-[#58B8F5]">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                      />
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1.5 flex justify-between">
                      <span>{item.donor_count} donors</span>
                      <span>Return: {clusterProfiles[idx]?.return_rate_pct ?? 'N/A'}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2D SCATTER */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">2D Agglomerative Clusters</h3>
                  <p className="text-xs text-gray-500">
                    {FEATURE_LABELS[X_AXIS_FEAT]} vs {FEATURE_LABELS[Y_AXIS_FEAT]}
                  </p>
                </div>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name={FEATURE_LABELS[X_AXIS_FEAT]}
                      label={{ value: FEATURE_LABELS[X_AXIS_FEAT], position: 'bottom', offset: 0 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name={FEATURE_LABELS[Y_AXIS_FEAT]}
                      label={{ value: FEATURE_LABELS[Y_AXIS_FEAT], angle: -90, position: 'insideLeft' }}
                    />
                    <ZAxis range={[25, 30]} />
                    <Tooltip
                      content={({ payload }) => {
                        if (!payload || payload.length === 0) return null;
                        const pt = payload[0].payload;
                        return (
                          <div className="bg-gray-900 text-white p-3 rounded-2xl text-xs space-y-1 shadow-xl">
                            <div className="font-bold text-sky-300">{pt.cluster_name} (Donor #{pt.id})</div>
                            <div>Recency: <span className="font-bold">{pt.recency} mos</span></div>
                            <div>Frequency: <span className="font-bold">{pt.frequency} times</span></div>
                            <div>Tenure: <span className="font-bold">{pt.time} mos</span></div>
                            <div>Donated: <span className="font-bold">{pt.donated === 1 ? 'Yes' : 'No'}</span></div>
                          </div>
                        );
                      }}
                    />
                    <Scatter name="Donors" data={scatterPoints}>
                      {scatterPoints.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} opacity={0.65} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. FULL DENDROGRAM VIEW */}
      {activeView === 'dendrogram' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-extrabold text-gray-900 text-xl">
                  Interactive Dendrogram Tree ({selectedLinkage.toUpperCase()})
                </h3>
                <p className="text-xs text-gray-500">
                  Visual hierarchy of agglomerative merges. Horizontal dashed line indicates the cut threshold producing K={kValue} clusters.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-600">Switch Linkage:</span>
                <div className="flex items-center gap-1 bg-sky-50 p-1 rounded-xl border border-sky-100">
                  {['ward', 'complete', 'average', 'single'].map(m => (
                    <button
                      key={m}
                      onClick={() => handleRecluster(m, kValue)}
                      className={`px-3 py-1 text-xs font-bold capitalize rounded-lg transition ${
                        selectedLinkage === m ? 'bg-[#58B8F5] text-white' : 'text-gray-600 hover:bg-sky-100'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* FULL DENDROGRAM SVG CONTAINER */}
            <div className="h-[450px] bg-gray-50/70 rounded-3xl p-6 border border-gray-200/80 relative overflow-hidden flex flex-col justify-between">
              <svg viewBox={`0 0 ${maxX} ${maxY}`} className="w-full h-full" preserveAspectRatio="none">
                {/* Horizontal Cut Line */}
                {dendro.cut_threshold > 0 && (
                  <g>
                    <line
                      x1="0"
                      y1={maxY - dendro.cut_threshold}
                      x2={maxX}
                      y2={maxY - dendro.cut_threshold}
                      stroke="#FF786B"
                      strokeWidth="2.5"
                      strokeDasharray="6 4"
                    />
                    <text
                      x={maxX - 100}
                      y={maxY - dendro.cut_threshold - 6}
                      fill="#FF786B"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      Cut Threshold: {dendro.cut_threshold}
                    </text>
                  </g>
                )}

                {/* Tree Linkage Lines */}
                {dendroLines.map((line: any, idx: number) => {
                  const xs = line.x_coords;
                  const ys = line.y_coords;
                  const dPath = `M ${xs[0]} ${maxY - ys[0]} L ${xs[1]} ${maxY - ys[1]} L ${xs[2]} ${maxY - ys[2]} L ${xs[3]} ${maxY - ys[3]}`;
                  return (
                    <path
                      key={idx}
                      d={dPath}
                      fill="none"
                      stroke="#58B8F5"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  );
                })}
              </svg>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
                <span>40 Representative Blood Donor Observations (Leaves)</span>
                <span>Distance Metric: Euclidean Space</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. LINKAGE METHOD COMPARISON */}
      {activeView === 'comparison' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
            <h3 className="font-extrabold text-gray-900 text-xl mb-1">Four Linkage Methods Benchmark</h3>
            <p className="text-xs text-gray-500 mb-6">
              Compare cluster cohesion (Silhouette) and separation (Davies-Bouldin) across all 4 classical linkage strategies.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benchmarks.map((b: any) => (
                <div
                  key={b.method_key}
                  onClick={() => handleRecluster(b.method_key, kValue)}
                  className={`p-6 rounded-3xl border-2 transition cursor-pointer flex flex-col justify-between ${
                    b.method_key === selectedLinkage
                      ? 'border-[#58B8F5] bg-sky-50/40 shadow-md ring-2 ring-sky-200'
                      : 'border-gray-200/80 bg-white hover:border-sky-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: b.color }} />
                        <h4 className="font-black text-gray-900 text-base">{b.method_name}</h4>
                      </div>
                      {b.method_key === selectedLinkage && (
                        <span className="px-2.5 py-1 bg-[#58B8F5] text-white text-xs font-bold rounded-xl">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-4">{b.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <div className="bg-white p-3 rounded-2xl border border-gray-100">
                      <div className="text-[11px] font-bold text-gray-400 uppercase">Silhouette Score</div>
                      <div className="text-xl font-black text-emerald-600">{b.silhouette_score}</div>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border border-gray-100">
                      <div className="text-[11px] font-bold text-gray-400 uppercase">Davies-Bouldin</div>
                      <div className="text-xl font-black text-indigo-600">{b.davies_bouldin}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. CLUSTERS & PROFILES VIEW */}
      {activeView === 'clusters' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
            <h3 className="font-extrabold text-gray-900 text-xl mb-1">Hierarchical Cluster Behavioral Profiles</h3>
            <p className="text-xs text-gray-500 mb-6">
              Empirical mean and median feature statistics derived under {selectedLinkage} linkage (K={kValue})
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clusterProfiles.map((c: any) => (
                <div
                  key={c.cluster_id}
                  className="bg-gray-50/70 rounded-3xl p-5 border border-gray-200/80 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }} />
                        <h4 className="font-black text-gray-900 text-base">{c.cluster_name}</h4>
                      </div>
                      <span className="px-2.5 py-1 bg-white text-gray-800 text-xs font-bold rounded-xl border border-gray-200">
                        {c.donor_count} Donors ({c.percentage}%)
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {Object.entries(c.feature_stats || {}).map(([featKey, stats]: [string, any]) => (
                        <div key={featKey} className="bg-white p-3 rounded-2xl border border-gray-100">
                          <div className="text-xs font-bold text-gray-700 mb-1">{stats.short || stats.label}</div>
                          <div className="grid grid-cols-3 text-[11px] text-gray-500 pt-1 border-t border-gray-50">
                            <div>Mean: <span className="font-semibold text-gray-800">{stats.mean}</span></div>
                            <div>Median: <span className="font-semibold text-gray-800">{stats.median}</span></div>
                            <div>Range: <span className="font-semibold text-gray-800">{stats.min}-{stats.max}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-600">March 2007 Return Rate:</span>
                    <span className="font-bold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg">
                      {c.return_rate_pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. DYNAMIC DATA-DRIVEN OBSERVATIONS */}
      <div className="bg-gradient-to-r from-sky-500/10 via-cyan-500/10 to-transparent p-6 rounded-3xl border border-sky-200/80">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-[#58B8F5] text-white rounded-2xl shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-gray-900 text-sm">Dynamic Hierarchical Linkage Findings</h4>
            <p className="text-xs text-gray-700 leading-relaxed">{observation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
