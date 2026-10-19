import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  RefreshCw,
  Database,
  Sparkles,
  Award,
  Layers,
  Crosshair,
  TrendingDown,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
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

interface Lab07Props {
  labDetail?: LabDetailResponse;
}

type ViewMode = 'overview' | 'elbow_metrics' | 'scatter' | 'profiles';

const WORKFLOW_STEPS = [
  { id: 'features', step: '01', title: 'Feature Selection', desc: 'Recency, Frequency, Tenure' },
  { id: 'scaling', step: '02', title: 'StandardScaler', desc: 'Zero Mean, Unit Variance' },
  { id: 'elbow', step: '03', title: 'Elbow & Silhouette', desc: 'K=1..10 Optimization' },
  { id: 'kmeans', step: '04', title: 'K-Means Fit', desc: 'Centroid Convergence' },
  { id: 'profiles', step: '05', title: 'Cluster Profiles', desc: 'Segment Behavioral Stats' }
];

const FEATURE_LABELS: Record<string, string> = {
  recency_months: 'Recency (months)',
  frequency_times: 'Frequency (times)',
  monetary_cc: 'Monetary (c.c.)',
  time_months: 'Time / Tenure (months)'
};

export const Lab07KMeansClustering: React.FC<Lab07Props> = ({ labDetail }) => {
  const [activeView, setActiveView] = useState<ViewMode>('overview');
  const [data, setData] = useState<any>(labDetail || null);
  const [loading, setLoading] = useState<boolean>(!labDetail);
  const [error, setError] = useState<string | null>(null);

  // Clustering Controls
  const [kValue, setKValue] = useState<number>(3);
  const [useScaling, setUseScaling] = useState<boolean>(true);
  const [selectedFeatures] = useState<string[]>([
    'recency_months',
    'frequency_times',
    'time_months'
  ]);
  const [xAxisFeat, setXAxisFeat] = useState<string>('recency_months');
  const [yAxisFeat, setYAxisFeat] = useState<string>('frequency_times');
  const [clusteringLoading, setClusteringLoading] = useState<boolean>(false);

  // Selected Cluster for Inspection
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null);

  useEffect(() => {
    async function loadInitial() {
      try {
        setLoading(true);
        const res = await api.getLab7Overview();
        setData(res);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load Lab 07 K-Means data');
      } finally {
        setLoading(false);
      }
    }
    if (!data?.elbow_curve) {
      loadInitial();
    }
  }, []);

  const handleRecluster = async () => {
    try {
      setClusteringLoading(true);
      const res = await api.clusterKMeans({
        k: kValue,
        features: selectedFeatures,
        use_scaling: useScaling,
        x_axis_feature: xAxisFeat,
        y_axis_feature: yAxisFeat
      });
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Clustering recalculation failed');
    } finally {
      setClusteringLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-10 h-10 text-[#7956E8] animate-spin" />
        <p className="text-gray-600 font-medium">Executing K-Means Clustering & Calculating Metrics...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 space-y-2">
        <h3 className="font-bold text-lg">Error Loading Lab 07</h3>
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

  const metrics = data?.metrics || {};
  const elbowCurve = data?.elbow_curve || [];
  const silhouetteCurve = data?.silhouette_curve || [];
  const daviesBouldinCurve = data?.davies_bouldin_curve || [];
  const clusterDistribution = data?.cluster_distribution || [];
  const clusterProfiles = data?.cluster_profiles || [];
  const scatterPoints = data?.scatter_points || [];
  const centroids2D = data?.centroids_2d || [];
  const observation = data?.observation || '';

  // Calculate best silhouette K
  const bestSilEntry = silhouetteCurve.length > 0
    ? silhouetteCurve.reduce((prev: any, curr: any) => curr.silhouette > prev.silhouette ? curr : prev, silhouetteCurve[0])
    : { k: 3, silhouette: 0.5 };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. HEADER & DATASET BADGE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-100/50 via-indigo-50/20 to-transparent rounded-full pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-purple-100 text-[#7956E8] font-bold text-xs rounded-full uppercase tracking-wider">
                DWDM Lab 07
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 font-semibold text-xs rounded-full border border-emerald-100">
                <Database className="w-3.5 h-3.5" />
                UCI Blood Transfusion (748 instances)
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-full border border-indigo-100">
                <Crosshair className="w-3.5 h-3.5" />
                Unsupervised Clustering
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              K-Means Clustering & Donor Segmentation
            </h1>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">
              Partition 748 blood donors into cohesive behavioral clusters. Evaluate Elbow (Inertia/WCSS), Silhouette, and Davies-Bouldin metrics to discover natural donor cohorts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRecluster}
              disabled={clusteringLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#7956E8] hover:bg-[#6844db] text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${clusteringLoading ? 'animate-spin' : ''}`} />
              <span>{clusteringLoading ? 'Clustering...' : 'Recalculate (K=' + kValue + ')'}</span>
            </button>
          </div>
        </div>

        {/* WORKFLOW PIPELINE */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {WORKFLOW_STEPS.map((wf) => (
              <div
                key={wf.id}
                className="bg-purple-50/50 rounded-2xl p-3 border border-purple-100/70 flex items-center gap-2.5"
              >
                <span className="w-7 h-7 rounded-xl bg-[#7956E8] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
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
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-purple-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center p-1 bg-gray-100/80 rounded-2xl w-full lg:w-auto overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview Dashboard', icon: BarChart2 },
            { id: 'elbow_metrics', label: 'Elbow & Silhouette Analysis', icon: TrendingDown },
            { id: 'scatter', label: '2D Cluster Scatter Plot', icon: Crosshair },
            { id: 'profiles', label: 'Cluster Behavioral Profiles', icon: Layers }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as ViewMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-[#7956E8] shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* INLINE HYPERPARAMETER BAR */}
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-end">
          <div className="flex items-center gap-2 bg-purple-50/60 px-3 py-1.5 rounded-2xl border border-purple-100">
            <span className="text-xs font-bold text-gray-700">Clusters (K):</span>
            <div className="flex items-center gap-1">
              {[2, 3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  onClick={() => setKValue(num)}
                  className={`w-7 h-7 text-xs font-bold rounded-lg transition ${
                    kValue === num
                      ? 'bg-[#7956E8] text-white shadow-sm'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-gray-50 px-3 py-2 rounded-2xl border border-gray-200 cursor-pointer">
            <input
              type="checkbox"
              checked={useScaling}
              onChange={e => setUseScaling(e.target.checked)}
              className="rounded text-[#7956E8] focus:ring-[#7956E8]"
            />
            <span>StandardScaler</span>
          </label>
        </div>
      </div>

      {/* 3. COMPACT METRICS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-sm relative overflow-hidden">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Clusters (K)</div>
          <div className="text-3xl font-black text-[#7956E8]">{metrics.active_k || kValue}</div>
          <div className="text-xs text-purple-600 mt-1 font-semibold flex items-center gap-1">
            <span>Optimal K by Silhouette:</span>
            <span className="font-bold underline">K={bestSilEntry.k}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-sm relative overflow-hidden">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Inertia (WCSS)</div>
          <div className="text-3xl font-black text-gray-900">{metrics.inertia?.toLocaleString() || 'N/A'}</div>
          <div className="text-xs text-gray-500 mt-1 font-medium">Within-cluster sum of squares</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-sm relative overflow-hidden">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Silhouette Score</div>
          <div className="text-3xl font-black text-emerald-600">{metrics.silhouette_score ?? 'N/A'}</div>
          <div className="text-xs text-emerald-600 mt-1 font-medium">Cohesion vs Separation (-1 to +1)</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-sm relative overflow-hidden">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Davies-Bouldin Index</div>
          <div className="text-3xl font-black text-indigo-600">{metrics.davies_bouldin_score ?? 'N/A'}</div>
          <div className="text-xs text-indigo-600 mt-1 font-medium">Cluster similarity (lower is better)</div>
        </div>
      </div>

      {/* 4. MAIN VIEW CONTENT */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ELBOW CURVE CHART */}
            <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">Elbow Method (Inertia vs K)</h3>
                  <p className="text-xs text-gray-500">Inertia decreases as K increases; look for the "elbow" bend</p>
                </div>
                <span className="px-2.5 py-1 bg-purple-50 text-[#7956E8] text-xs font-bold rounded-xl border border-purple-100">
                  K = 1..10
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={elbowCurve} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
                    <XAxis dataKey="k" label={{ value: 'Number of Clusters (K)', position: 'bottom', offset: 0 }} />
                    <YAxis label={{ value: 'Inertia (WCSS)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      formatter={(val: any) => [val, 'Inertia (WCSS)']}
                      labelFormatter={(label) => `Clusters: K = ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="wcss"
                      stroke="#7956E8"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#7956E8' }}
                      activeDot={{ r: 8, fill: '#FF786B' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* SILHOUETTE SCORE VS K */}
            <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">Silhouette Score Analysis</h3>
                  <p className="text-xs text-gray-500">Measures cluster cohesion and separation (higher is better)</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100">
                  Peak at K={bestSilEntry.k}
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={silhouetteCurve} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
                    <XAxis dataKey="k" label={{ value: 'Clusters (K)', position: 'bottom', offset: 0 }} />
                    <YAxis domain={[0, 0.7]} label={{ value: 'Silhouette Score', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      formatter={(val: any) => [val, 'Silhouette Score']}
                      labelFormatter={(label) => `K = ${label}`}
                    />
                    <Bar dataKey="silhouette" radius={[8, 8, 0, 0]}>
                      {silhouetteCurve.map((entry: any) => (
                        <Cell
                          key={entry.k}
                          fill={entry.k === kValue ? '#7956E8' : entry.k === bestSilEntry.k ? '#56C9A5' : '#D1D5DB'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 2D CLUSTER SCATTER PREVIEW & DISTRIBUTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CLUSTER DISTRIBUTION */}
            <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-gray-900 text-lg mb-1">Donor Cohort Distribution</h3>
                <p className="text-xs text-gray-500 mb-4">Donors assigned to each cluster (K={kValue})</p>
                <div className="space-y-3">
                  {clusterDistribution.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedClusterId(idx)}
                      className={`p-3 rounded-2xl border transition cursor-pointer ${
                        selectedClusterId === idx
                          ? 'border-[#7956E8] bg-purple-50/50 ring-2 ring-purple-200'
                          : 'border-gray-100 hover:border-purple-200 bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span>{item.cluster_name}</span>
                        </div>
                        <span className="text-[#7956E8]">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                        />
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1.5 flex justify-between">
                        <span>{item.donor_count} donors</span>
                        <span>Return rate: {clusterProfiles[idx]?.return_rate_pct ?? 'N/A'}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 p-3 bg-purple-50 rounded-2xl border border-purple-100 text-xs text-purple-800 font-medium flex items-center gap-2">
                <Info className="w-4 h-4 text-[#7956E8] flex-shrink-0" />
                <span>Click a cluster to inspect its detailed feature averages below.</span>
              </div>
            </div>

            {/* 2D SCATTER PREVIEW */}
            <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">2D Cluster Projection</h3>
                  <p className="text-xs text-gray-500">
                    Showing {FEATURE_LABELS[xAxisFeat]} vs {FEATURE_LABELS[yAxisFeat]} with Centroids (✦)
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <select
                    value={xAxisFeat}
                    onChange={e => setXAxisFeat(e.target.value)}
                    className="p-1.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700"
                  >
                    {selectedFeatures.map(f => (
                      <option key={f} value={f}>X: {FEATURE_LABELS[f]}</option>
                    ))}
                  </select>
                  <select
                    value={yAxisFeat}
                    onChange={e => setYAxisFeat(e.target.value)}
                    className="p-1.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700"
                  >
                    {selectedFeatures.map(f => (
                      <option key={f} value={f}>Y: {FEATURE_LABELS[f]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name={FEATURE_LABELS[xAxisFeat]}
                      label={{ value: FEATURE_LABELS[xAxisFeat], position: 'bottom', offset: 0 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name={FEATURE_LABELS[yAxisFeat]}
                      label={{ value: FEATURE_LABELS[yAxisFeat], angle: -90, position: 'insideLeft' }}
                    />
                    <ZAxis range={[25, 30]} />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ payload }) => {
                        if (!payload || payload.length === 0) return null;
                        const pt = payload[0].payload;
                        return (
                          <div className="bg-gray-900 text-white p-3 rounded-2xl text-xs space-y-1 shadow-xl">
                            <div className="font-bold text-purple-300">{pt.cluster_name} (Donor #{pt.id})</div>
                            <div>Recency: <span className="font-bold">{pt.recency} mos</span></div>
                            <div>Frequency: <span className="font-bold">{pt.frequency} times</span></div>
                            <div>Tenure: <span className="font-bold">{pt.time} mos</span></div>
                            <div>Donated March 2007: <span className="font-bold">{pt.donated === 1 ? 'Yes' : 'No'}</span></div>
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

      {/* 5. ELBOW & METRICS VIEW */}
      {activeView === 'elbow_metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ELBOW WCSS */}
            <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">Inertia (Within-Cluster Sum of Squares)</h3>
                  <p className="text-xs text-gray-500">Evaluates compactness of clusters across K = 1 to 10</p>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={elbowCurve} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
                    <XAxis dataKey="k" label={{ value: 'Cluster Count (K)', position: 'bottom', offset: 0 }} />
                    <YAxis label={{ value: 'Inertia', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(val: any) => [val, 'Inertia']} />
                    <Line
                      type="monotone"
                      dataKey="wcss"
                      stroke="#7956E8"
                      strokeWidth={3}
                      dot={{ r: 6, fill: '#7956E8' }}
                      activeDot={{ r: 9, fill: '#FF786B' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* METRICS SUMMARY EXPLAINER */}
            <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-gray-900 text-lg">Metric Evaluation Rules</h3>
              
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-xs text-purple-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-[#7956E8]" />
                  <span>Elbow Inflection Point</span>
                </div>
                <p className="text-gray-600">
                  Select the point $K$ where the marginal drop in inertia begins leveling off significantly.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Silhouette Score (Higher is Better)</span>
                </div>
                <p className="text-gray-600">
                  Peak occurs at <span className="font-bold text-emerald-700">K = {bestSilEntry.k}</span> (Score = {bestSilEntry.silhouette}). Indicates donor points match their own cluster well.
                </p>
              </div>

              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-xs text-indigo-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <Crosshair className="w-4 h-4 text-indigo-600" />
                  <span>Davies-Bouldin Index (Lower is Better)</span>
                </div>
                <p className="text-gray-600">
                  Measures the average similarity between each cluster and its most similar counterpart.
                </p>
              </div>
            </div>
          </div>

          {/* DAVIES-BOULDIN CHART */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm">
            <h3 className="font-extrabold text-gray-900 text-lg mb-1">Davies-Bouldin Index across K (K=2..10)</h3>
            <p className="text-xs text-gray-500 mb-4">Lower score implies better cluster separation and less overlap</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={daviesBouldinCurve} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
                  <XAxis dataKey="k" label={{ value: 'Clusters (K)', position: 'bottom', offset: 0 }} />
                  <YAxis label={{ value: 'Davies-Bouldin Index', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(val: any) => [val, 'Davies-Bouldin Index']} />
                  <Bar dataKey="davies_bouldin" fill="#58B8F5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 6. FULL 2D SCATTER VIEW */}
      {activeView === 'scatter' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-extrabold text-gray-900 text-xl">Interactive 2D Cluster Space</h3>
                <p className="text-xs text-gray-500">
                  Inspect donor observations, cluster boundaries, and unscaled centroids.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200">
                  <span className="text-xs font-bold text-gray-600">X-Axis:</span>
                  <select
                    value={xAxisFeat}
                    onChange={e => setXAxisFeat(e.target.value)}
                    className="bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800"
                  >
                    {selectedFeatures.map(f => (
                      <option key={f} value={f}>{FEATURE_LABELS[f]}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200">
                  <span className="text-xs font-bold text-gray-600">Y-Axis:</span>
                  <select
                    value={yAxisFeat}
                    onChange={e => setYAxisFeat(e.target.value)}
                    className="bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800"
                  >
                    {selectedFeatures.map(f => (
                      <option key={f} value={f}>{FEATURE_LABELS[f]}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleRecluster}
                  className="px-4 py-2 bg-[#7956E8] text-white text-xs font-bold rounded-xl hover:bg-[#6844db] transition"
                >
                  Update Projection
                </button>
              </div>
            </div>

            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name={FEATURE_LABELS[xAxisFeat]}
                    label={{ value: FEATURE_LABELS[xAxisFeat], position: 'bottom', offset: 10 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name={FEATURE_LABELS[yAxisFeat]}
                    label={{ value: FEATURE_LABELS[yAxisFeat], angle: -90, position: 'insideLeft', offset: 0 }}
                  />
                  <ZAxis range={[30, 35]} />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload || payload.length === 0) return null;
                      const pt = payload[0].payload;
                      return (
                        <div className="bg-gray-900 text-white p-3 rounded-2xl text-xs space-y-1 shadow-2xl border border-gray-700">
                          <div className="font-bold text-purple-300">{pt.cluster_name} (Donor #{pt.id})</div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-300">
                            <div>Recency: <span className="font-bold text-white">{pt.recency} mos</span></div>
                            <div>Frequency: <span className="font-bold text-white">{pt.frequency} donations</span></div>
                            <div>Tenure: <span className="font-bold text-white">{pt.time} mos</span></div>
                            <div>Response: <span className="font-bold text-white">{pt.donated === 1 ? 'Donated' : 'No'}</span></div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Scatter name="Donors" data={scatterPoints}>
                    {scatterPoints.map((entry: any, index: number) => (
                      <Cell key={`scatter-cell-${index}`} fill={entry.color} opacity={0.7} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* CENTROID SUMMARY TABLE */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Unscaled 2D Cluster Centroids
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {centroids2D.map((c: any) => (
                  <div
                    key={c.cluster_id}
                    className="p-3 bg-purple-50/40 rounded-2xl border border-purple-100 flex items-center gap-3"
                  >
                    <span
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <div className="text-xs">
                      <div className="font-bold text-gray-900">{c.cluster_name}</div>
                      <div className="text-gray-500">
                        ({c.x} {FEATURE_LABELS[xAxisFeat].split(' ')[0]}, {c.y} {FEATURE_LABELS[yAxisFeat].split(' ')[0]})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. CLUSTER BEHAVIORAL PROFILES */}
      {activeView === 'profiles' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm">
            <h3 className="font-extrabold text-gray-900 text-xl mb-1">Detailed Cluster Profiles</h3>
            <p className="text-xs text-gray-500 mb-6">
              Empirical mean and median feature statistics derived from the 748 UCI donor records
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
                        <span
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: c.color }}
                        />
                        <h4 className="font-black text-gray-900 text-base">{c.cluster_name}</h4>
                      </div>
                      <span className="px-2.5 py-1 bg-white text-gray-800 text-xs font-bold rounded-xl border border-gray-200">
                        {c.donor_count} Donors ({c.percentage}%)
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {Object.entries(c.feature_stats || {}).map(([featKey, stats]: [string, any]) => (
                        <div key={featKey} className="bg-white p-3 rounded-2xl border border-gray-100">
                          <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                            <span>{stats.short || stats.label}</span>
                            <span className="text-[#7956E8]">Centroid: {stats.centroid}</span>
                          </div>
                          <div className="grid grid-cols-3 text-[11px] text-gray-500 pt-1 border-t border-gray-50">
                            <div>Mean: <span className="font-semibold text-gray-800">{stats.mean}</span></div>
                            <div>Median: <span className="font-semibold text-gray-800">{stats.median}</span></div>
                            <div>Min-Max: <span className="font-semibold text-gray-800">{stats.min}-{stats.max}</span></div>
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
      <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent p-6 rounded-3xl border border-purple-200/80">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-[#7956E8] text-white rounded-2xl shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-gray-900 text-sm">Dynamic Unsupervised Cluster Findings</h4>
            <p className="text-xs text-gray-700 leading-relaxed">{observation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
