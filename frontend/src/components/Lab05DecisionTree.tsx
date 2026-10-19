import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  BarChart2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Database,
  Sparkles,
  Award,
  Layers,
  Activity,
  Maximize2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { api } from '../services/api';
import type { LabDetailResponse } from '../types';

interface Lab05Props {
  labDetail?: LabDetailResponse;
}

type ViewMode = 'overview' | 'relevance' | 'tree' | 'evaluation' | 'predict';

const WORKFLOW_STEPS = [
  { id: 'data', step: '01', title: 'Blood Dataset', desc: '748 rows, RFMT' },
  { id: 'target', step: '02', title: 'Target Prep', desc: 'March 2007 Response' },
  { id: 'mi', step: '03', title: 'Mutual Info', desc: 'Attribute Relevance' },
  { id: 'split', step: '04', title: 'Stratified Split', desc: '70% Train / 30% Test' },
  { id: 'tree', step: '05', title: 'Decision Tree', desc: 'Entropy Criterion' },
  { id: 'eval', step: '06', title: 'Evaluation', desc: 'Metrics & Inference' }
];

export const Lab05DecisionTree: React.FC<Lab05Props> = ({ labDetail }) => {
  const [activeView, setActiveView] = useState<ViewMode>('overview');
  const [data, setData] = useState<any>(labDetail || null);
  const [loading, setLoading] = useState<boolean>(!labDetail);
  const [error, setError] = useState<string | null>(null);

  // Model Hyperparameters
  const [maxDepth, setMaxDepth] = useState<number>(3);
  const [minLeaf, setMinLeaf] = useState<number>(5);
  const [selectedFeats, setSelectedFeats] = useState<string[]>([
    'recency_months',
    'frequency_times',
    'time_months'
  ]);
  const [retraining, setRetraining] = useState<boolean>(false);

  // Single Record Prediction State
  const [predRecency, setPredRecency] = useState<number>(4);
  const [predFrequency, setPredFrequency] = useState<number>(5);
  const [predTime, setPredTime] = useState<number>(20);
  const [predResult, setPredResult] = useState<any>(null);
  const [predLoading, setPredLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadInitial() {
      try {
        setLoading(true);
        const res = await api.getLab5Overview();
        setData(res);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load Lab 05 data');
      } finally {
        setLoading(false);
      }
    }
    if (!data?.mutual_information) {
      loadInitial();
    }
  }, []);

  // Real-time Prediction
  useEffect(() => {
    async function doPredict() {
      if (!data?.metrics) return;
      try {
        setPredLoading(true);
        const res = await api.predictLab5Record({
          recency: predRecency,
          frequency: predFrequency,
          time: Math.max(predTime, predRecency),
          selected_features: selectedFeats,
          max_depth: maxDepth,
          min_samples_leaf: minLeaf
        });
        setPredResult(res);
      } catch (err: any) {
        console.error('Prediction failed:', err);
      } finally {
        setPredLoading(false);
      }
    }
    doPredict();
  }, [predRecency, predFrequency, predTime, maxDepth, minLeaf, selectedFeats, data]);

  const handleRetrain = async () => {
    try {
      setRetraining(true);
      const res = await api.trainDecisionTree({
        selected_features: selectedFeats,
        max_depth: maxDepth,
        min_samples_leaf: minLeaf,
        criterion: 'entropy'
      });
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Retraining failed');
    } finally {
      setRetraining(false);
    }
  };

  const toggleFeature = (feat: string) => {
    if (selectedFeats.includes(feat)) {
      if (selectedFeats.length > 1) {
        setSelectedFeats(selectedFeats.filter((f) => f !== feat));
      }
    } else {
      setSelectedFeats([...selectedFeats, feat]);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3 bg-white rounded-3xl border border-[#ECE8F6] p-8 shadow-xs">
        <RefreshCw className="w-8 h-8 animate-spin text-[#FF786B]" />
        <p className="text-xs font-semibold text-[#4E4B66]">
          Calculating Mutual Information &amp; Training Decision Tree...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-[#FFF5F4] border border-[#FF786B]/30 rounded-3xl text-[#131127] space-y-3 shadow-xs">
        <div className="flex items-center space-x-2 font-bold text-[#FF786B]">
          <AlertTriangle className="w-5 h-5" />
          <span>Error in Lab 05 Suite</span>
        </div>
        <p className="text-sm text-[#4E4B66]">{error || 'No data returned.'}</p>
      </div>
    );
  }

  const mi = data.mutual_information || { ranking: [] };
  const metrics = data.metrics || {};
  const cm = data.confusion_matrix || { matrix: [[0, 0], [0, 0]] };
  const importances = data.feature_importance || [];
  const treeRoot = data.tree_structure;

  // Recursive Decision Tree Node Renderer
  const renderTreeNode = (node: any) => {
    if (!node) return null;
    const isLeaf = node.is_leaf;
    const predDonor = node.predicted_class === 1;

    return (
      <div className="flex flex-col items-center">
        {/* Node Box */}
        <div
          className={`p-3 rounded-2xl border text-center shadow-xs transition-all w-48 ${
            isLeaf
              ? predDonor
                ? 'bg-[#FFF5F4] border-[#FF786B] ring-2 ring-[#FF786B]/30'
                : 'bg-[#F8F7FC] border-[#ECE8F6]'
              : 'bg-white border-[#ECE8F6] hover:border-[#FF786B]'
          }`}
        >
          {!isLeaf ? (
            <div className="space-y-1">
              <div className="text-[10px] font-black uppercase text-[#FF786B] bg-[#FFF5F4] px-2 py-0.5 rounded inline-block">
                {node.condition_str}
              </div>
              <div className="text-[10px] text-[#8C87A8]">
                Entropy: <strong>{node.entropy}</strong> • Samples: <strong>{node.samples}</strong>
              </div>
              <div className="text-[9px] text-[#4E4B66]">
                Non-Donors: {node.value?.[0]} | Donors: {node.value?.[1]}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded inline-block ${
                  predDonor ? 'bg-[#FF786B] text-white' : 'bg-[#E5E3EF] text-[#4E4B66]'
                }`}
              >
                Leaf: {node.class_label}
              </span>
              <div className="text-[10px] text-[#8C87A8]">
                Samples: <strong>{node.samples}</strong> (Entropy: {node.entropy})
              </div>
              <div className="text-[9px] font-bold text-[#FF786B]">
                {node.class_distribution_pct?.donors}% Donor Probability
              </div>
            </div>
          )}
        </div>

        {/* Children Branches */}
        {!isLeaf && node.children && node.children.length === 2 && (
          <div className="w-full mt-3">
            <div className="flex justify-around items-start relative pt-3 border-t border-[#ECE8F6]">
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-[#059669] bg-[#EDF9F5] px-1.5 py-0.2 rounded -mt-6 mb-1">
                  True (≤)
                </span>
                {renderTreeNode(node.children[0])}
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-[#E11D48] bg-[#FFF5F4] px-1.5 py-0.2 rounded -mt-6 mb-1">
                  False (&gt;)
                </span>
                {renderTreeNode(node.children[1])}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ------------------------------------------------------------------- */}
      {/* 1. TOP HEADER & METRIC STRIP                                        */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1EEFB] pb-3.5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-[#FFF5F4] text-[#E11D48]">
              <GitBranch className="w-5 h-5 text-[#FF786B]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FFF5F4] text-[#E11D48]">
                  Lab 05 — Decision Tree
                </span>
                <span className="text-[11px] font-medium text-[#8C87A8]">
                  • Mutual Information &amp; Tree Splitting
                </span>
              </div>
              <h2 className="text-lg font-black text-[#131127] pt-0.5">
                Attribute Relevance &amp; Decision Tree Classification
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F8F7FC] text-[#7956E8] border border-[#ECE8F6]">
              <Database className="w-3.5 h-3.5" />
              <span>data/raw/transfusion.data</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FFF5F4] text-[#E11D48] border border-[#FECDD3]">
              <span>Stratified 70/30 (523 / 225)</span>
            </span>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-[#F8F7FC] p-3 rounded-2xl border border-[#ECE8F6] space-y-0.5">
            <div className="text-[10px] font-bold text-[#8C87A8] uppercase">Test Accuracy</div>
            <div className="text-lg font-black text-[#131127]">{(metrics.accuracy * 100).toFixed(1)}%</div>
            <p className="text-[9px] text-[#4E4B66]">Overall accuracy</p>
          </div>
          <div className="bg-[#F8F7FC] p-3 rounded-2xl border border-[#ECE8F6] space-y-0.5">
            <div className="text-[10px] font-bold text-[#8C87A8] uppercase">Precision</div>
            <div className="text-lg font-black text-[#7956E8]">{(metrics.precision * 100).toFixed(1)}%</div>
            <p className="text-[9px] text-[#4E4B66]">Donor class precision</p>
          </div>
          <div className="bg-[#F8F7FC] p-3 rounded-2xl border border-[#ECE8F6] space-y-0.5">
            <div className="text-[10px] font-bold text-[#8C87A8] uppercase">Recall</div>
            <div className="text-lg font-black text-[#FF786B]">{(metrics.recall * 100).toFixed(1)}%</div>
            <p className="text-[9px] text-[#4E4B66]">True positive capture</p>
          </div>
          <div className="bg-[#F8F7FC] p-3 rounded-2xl border border-[#ECE8F6] space-y-0.5">
            <div className="text-[10px] font-bold text-[#8C87A8] uppercase">F1-Score</div>
            <div className="text-lg font-black text-[#56C9A5]">{metrics.f1_score}</div>
            <p className="text-[9px] text-[#4E4B66]">Harmonic mean</p>
          </div>
          <div className="bg-[#F8F7FC] p-3 rounded-2xl border border-[#ECE8F6] space-y-0.5">
            <div className="text-[10px] font-bold text-[#8C87A8] uppercase">Top MI Feature</div>
            <div className="text-xs font-black text-[#131127] truncate">{mi.top_feature}</div>
            <p className="text-[9px] text-[#E11D48] font-bold">MI = {mi.top_score}</p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 2. TOP-OF-PAGE NAVIGATION (5 VIEWS)                                 */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white p-4 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#F1EEFB] pb-2">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-[#FF786B]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-[#131127]">
              Lab 05 Navigation Explorer
            </h3>
          </div>
          <span className="text-[11px] font-bold text-[#E11D48] bg-[#FFF5F4] px-2.5 py-0.5 rounded-lg">
            5 Interactive Views
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {[
            { id: 'overview', label: 'Overview', sub: '2×2 Visual Dashboard', icon: BarChart2 },
            { id: 'relevance', label: 'Mutual Information', sub: 'Attribute Relevance Ranking', icon: Layers },
            { id: 'tree', label: 'Decision Tree Diagram', sub: 'Interactive Node Splits', icon: GitBranch },
            { id: 'evaluation', label: 'Evaluation & Matrix', sub: 'Confusion Matrix & Report', icon: Activity },
            { id: 'predict', label: 'Predict Donor Class', sub: 'Single-Record Tracer', icon: Sparkles }
          ].map((item) => {
            const isSelected = activeView === item.id;
            const ItemIcon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as ViewMode)}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                  isSelected
                    ? 'bg-[#FFF5F4] border-[#FECDD3] shadow-xs ring-2 ring-[#FF786B]/40'
                    : 'bg-[#F8F7FC] border-[#ECE8F6] hover:bg-white hover:border-[#FF786B]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="p-1.5 rounded-xl"
                    style={{
                      backgroundColor: isSelected ? '#FF786B' : '#E5E3EF',
                      color: isSelected ? '#FFFFFF' : '#4E4B66'
                    }}
                  >
                    <ItemIcon className="w-4 h-4" />
                  </div>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#E11D48]" />}
                </div>
                <div>
                  <div className="text-xs font-black text-[#131127] truncate">{item.label}</div>
                  <div className="text-[10px] text-[#8C87A8] truncate">{item.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 3. WORKFLOW PIPELINE                                                */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#F1EEFB] pb-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#131127]">
            Decision Tree Modeling Workflow
          </h4>
          <span className="text-[10px] text-[#8C87A8]">Entropy-based splitting</span>
        </div>
        <div className="overflow-x-auto pb-1">
          <div className="flex items-center space-x-2 min-w-[700px] p-0.5">
            {WORKFLOW_STEPS.map((st, idx) => (
              <React.Fragment key={st.id}>
                <div className="flex-1 p-2.5 rounded-2xl bg-[#F8F7FC] border border-[#ECE8F6]">
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-[#E5E3EF] text-[#4E4B66]">
                    {st.step}
                  </span>
                  <div className="text-xs font-black text-[#131127] pt-0.5 truncate">{st.title}</div>
                  <div className="text-[9px] text-[#8C87A8] truncate">{st.desc}</div>
                </div>
                {idx < WORKFLOW_STEPS.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-[#8C87A8] shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 4. INTERACTIVE HYPERPARAMETER TOOLBAR                                */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#ECE8F6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
          <div className="flex items-center space-x-2">
            <span className="text-[#8C87A8]">Max Depth:</span>
            <input
              type="range"
              min="2"
              max="8"
              value={maxDepth}
              onChange={(e) => setMaxDepth(parseInt(e.target.value))}
              className="accent-[#FF786B] cursor-pointer"
            />
            <span className="px-2 py-0.5 bg-[#FFF5F4] text-[#E11D48] rounded font-black">{maxDepth}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[#8C87A8]">Min Leaf Samples:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={minLeaf}
              onChange={(e) => setMinLeaf(parseInt(e.target.value))}
              className="accent-[#FF786B] cursor-pointer"
            />
            <span className="px-2 py-0.5 bg-[#FFF5F4] text-[#E11D48] rounded font-black">{minLeaf}</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-[#8C87A8]">Features:</span>
            {['recency_months', 'frequency_times', 'monetary_cc', 'time_months'].map((f) => (
              <button
                key={f}
                onClick={() => toggleFeature(f)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                  selectedFeats.includes(f)
                    ? 'bg-[#FF786B] text-white border-[#FF786B]'
                    : 'bg-[#F8F7FC] text-[#8C87A8] border-[#ECE8F6]'
                }`}
              >
                {f.replace('_months', '').replace('_times', '').replace('_cc', '')}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleRetrain}
          disabled={retraining}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF786B] text-white hover:bg-[#E11D48] transition-all cursor-pointer flex items-center space-x-1.5 self-start md:self-auto"
        >
          {retraining && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
          <span>Retrain Tree</span>
        </button>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* VIEW 1: OVERVIEW DASHBOARD (2×2 GRID)                               */}
      {/* ------------------------------------------------------------------- */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Mutual Information Ranking */}
            <div className="bg-white p-5 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#F1EEFB] pb-2">
                  <h4 className="text-sm font-black text-[#131127]">1. Attribute Relevance (Mutual Information)</h4>
                  <span className="text-[10px] font-bold text-[#FF786B] bg-[#FFF5F4] px-2 py-0.5 rounded">Relevance</span>
                </div>
                <p className="text-xs text-[#4E4B66] pt-1">
                  Non-linear information gain of each donor feature with the March 2007 response.
                </p>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mi.ranking || []} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1EEFB" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#4E4B66' }} />
                    <YAxis dataKey="short_label" type="category" tick={{ fontSize: 10, fill: '#4E4B66' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                    <Bar dataKey="mi_score" name="MI Score" fill="#FF786B" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#FFF5F4] text-xs text-[#E11D48] font-medium flex items-center justify-between">
                <span>Top Ranked: <strong>{mi.top_feature}</strong></span>
                <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-lg border border-[#FECDD3]">MI = {mi.top_score}</span>
              </div>
            </div>

            {/* Chart 2: Feature Importance in Decision Tree */}
            <div className="bg-white p-5 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#F1EEFB] pb-2">
                  <h4 className="text-sm font-black text-[#131127]">2. Decision Tree Feature Importance</h4>
                  <span className="text-[10px] font-bold text-[#7956E8] bg-[#F5F3FF] px-2 py-0.5 rounded">Tree Gini/Entropy</span>
                </div>
                <p className="text-xs text-[#4E4B66] pt-1">
                  Relative contribution of each feature across all tree decision splits.
                </p>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={importances} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1EEFB" vertical={false} />
                    <XAxis dataKey="short_label" tick={{ fontSize: 10, fill: '#4E4B66' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#4E4B66' }} unit="%" />
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                    <Bar dataKey="importance_pct" name="Importance %" fill="#7956E8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#F5F3FF] text-xs text-[#5534C4] font-medium flex items-center justify-between">
                <span>Primary Split Feature: <strong>{importances[0]?.label || 'None'}</strong></span>
                <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-lg border border-[#DDD6FE]">
                  {importances[0]?.importance_pct}% Split Weight
                </span>
              </div>
            </div>

            {/* Chart 3: Confusion Matrix Heatmap */}
            <div className="bg-white p-5 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#F1EEFB] pb-2">
                  <h4 className="text-sm font-black text-[#131127]">3. Confusion Matrix (225 Test Donors)</h4>
                  <span className="text-[10px] font-bold text-[#56C9A5] bg-[#EDF9F5] px-2 py-0.5 rounded">Accuracy {(metrics.accuracy * 100).toFixed(1)}%</span>
                </div>
                <p className="text-xs text-[#4E4B66] pt-1">
                  Actual vs. Predicted class counts on 30% held-out test data.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 bg-[#F8F7FC] rounded-2xl text-center">
                <div className="p-3 rounded-xl bg-[#EDF9F5] border border-[#A7F3D0]">
                  <div className="text-[10px] font-bold text-[#065F46]">True Negatives (TN)</div>
                  <div className="text-2xl font-black text-[#059669]">{cm.tn}</div>
                  <div className="text-[9px] text-[#065F46]">Correctly predicted non-donors</div>
                </div>
                <div className="p-3 rounded-xl bg-[#FFF5F4] border border-[#FECDD3]">
                  <div className="text-[10px] font-bold text-[#E11D48]">False Positives (FP)</div>
                  <div className="text-2xl font-black text-[#E11D48]">{cm.fp}</div>
                  <div className="text-[9px] text-[#E11D48]">Non-donors misclassified as donors</div>
                </div>
                <div className="p-3 rounded-xl bg-[#FFF5F4] border border-[#FECDD3]">
                  <div className="text-[10px] font-bold text-[#E11D48]">False Negatives (FN)</div>
                  <div className="text-2xl font-black text-[#E11D48]">{cm.fn}</div>
                  <div className="text-[9px] text-[#E11D48]">Donors misclassified as non-donors</div>
                </div>
                <div className="p-3 rounded-xl bg-[#EDF9F5] border border-[#A7F3D0]">
                  <div className="text-[10px] font-bold text-[#065F46]">True Positives (TP)</div>
                  <div className="text-2xl font-black text-[#059669]">{cm.tp}</div>
                  <div className="text-[9px] text-[#065F46]">Correctly predicted donors</div>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#EDF9F5] text-xs text-[#065F46] font-medium flex items-center justify-between">
                <span>Correct Predictions: <strong>{cm.tn + cm.tp} / 225</strong></span>
                <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-lg border border-[#A7F3D0]">
                  F1 = {metrics.f1_score}
                </span>
              </div>
            </div>

            {/* Chart 4: Decision Tree Structure Preview */}
            <div className="bg-white p-5 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#F1EEFB] pb-2">
                  <h4 className="text-sm font-black text-[#131127]">4. Decision Tree Architecture</h4>
                  <button
                    onClick={() => setActiveView('tree')}
                    className="text-[10px] font-bold text-[#FF786B] hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Full Tree Diagram</span>
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-[#4E4B66] pt-1">
                  Root split: <code className="font-bold text-[#FF786B]">{treeRoot?.condition_str}</code> (Entropy: {treeRoot?.entropy}).
                </p>
              </div>

              <div className="p-4 bg-[#F8F7FC] rounded-2xl border border-[#ECE8F6] flex justify-center items-center min-h-[160px] overflow-hidden">
                <div className="scale-75 origin-top">{renderTreeNode(treeRoot)}</div>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#FFF5F4] text-xs text-[#E11D48] font-medium flex items-center justify-between">
                <span>Tree Parameters: <strong>Depth={maxDepth}, MinLeaf={minLeaf}</strong></span>
                <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-lg border border-[#FECDD3]">Criterion: Entropy</span>
              </div>
            </div>
          </div>

          {/* Dynamic Observation */}
          <div className="p-4 rounded-3xl bg-[#FFF5F4] border border-[#FECDD3] text-xs text-[#131127] space-y-1">
            <div className="font-black text-[#E11D48] flex items-center space-x-1.5">
              <Award className="w-4 h-4" />
              <span>Analytical Observation (Dynamically Generated):</span>
            </div>
            <p className="text-[#4E4B66]">{data.observation}</p>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* VIEW 2: MUTUAL INFORMATION RELEVANCE                                */}
      {/* ------------------------------------------------------------------- */}
      {activeView === 'relevance' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-4">
            <div className="border-b border-[#F1EEFB] pb-3">
              <h3 className="text-base font-black text-[#131127]">Mutual Information Ranking</h3>
              <p className="text-xs text-[#4E4B66] pt-0.5">
                Mutual Information measures the reduction in uncertainty for the March 2007 response given each donor feature.
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mi.ranking || []} layout="vertical" margin={{ top: 10, right: 30, bottom: 10, left: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1EEFB" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#4E4B66' }} />
                  <YAxis dataKey="label" type="category" tick={{ fontSize: 10, fill: '#4E4B66' }} width={140} />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                  <Bar dataKey="mi_score" name="MI Score" fill="#FF786B" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8F7FC] text-[#8C87A8] font-bold">
                    <th className="p-3 rounded-l-xl">Feature</th>
                    <th className="p-3">Mutual Information Score</th>
                    <th className="p-3">Relative Ranking</th>
                    <th className="p-3 rounded-r-xl">Role in Tree</th>
                  </tr>
                </thead>
                <tbody>
                  {mi.ranking?.map((row: any, idx: number) => (
                    <tr key={row.feature} className="border-b border-[#F1EEFB]">
                      <td className="p-3 font-extrabold text-[#131127]">{row.label}</td>
                      <td className="p-3 font-bold text-[#E11D48]">{row.mi_score}</td>
                      <td className="p-3 font-semibold text-[#4E4B66]">Rank #{idx + 1}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-[#EDF9F5] text-[#059669]">
                          {idx === 0 ? 'Primary Split' : idx === 1 ? 'Secondary Split' : 'Sub-branch'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* VIEW 3: INTERACTIVE DECISION TREE DIAGRAM                           */}
      {/* ------------------------------------------------------------------- */}
      {activeView === 'tree' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1EEFB] pb-3">
              <div>
                <h3 className="text-base font-black text-[#131127]">Visual Decision Tree Architecture</h3>
                <p className="text-xs text-[#4E4B66] pt-0.5">
                  Trained with entropy impurity reduction on 523 training donor records (max_depth={maxDepth}).
                </p>
              </div>
              <span className="text-xs font-bold text-[#E11D48] bg-[#FFF5F4] px-3 py-1 rounded-xl border border-[#FECDD3]">
                Entropy Splits
              </span>
            </div>

            <div className="p-6 bg-[#F8F7FC] rounded-3xl border border-[#ECE8F6] overflow-x-auto min-h-[420px] flex justify-center">
              <div className="py-4">{renderTreeNode(treeRoot)}</div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* VIEW 4: EVALUATION & CONFUSION MATRIX                               */}
      {/* ------------------------------------------------------------------- */}
      {activeView === 'evaluation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Confusion Matrix Breakdown */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-4">
              <h3 className="text-base font-black text-[#131127] border-b border-[#F1EEFB] pb-2">
                Confusion Matrix (30% Test Split)
              </h3>
              <div className="grid grid-cols-2 gap-3 p-4 bg-[#F8F7FC] rounded-2xl text-center">
                <div className="p-4 rounded-xl bg-[#EDF9F5] border border-[#A7F3D0]">
                  <div className="text-xs font-bold text-[#065F46]">True Negatives (TN)</div>
                  <div className="text-3xl font-black text-[#059669]">{cm.tn}</div>
                  <div className="text-[10px] text-[#065F46] pt-1">Correctly identified non-donors</div>
                </div>
                <div className="p-4 rounded-xl bg-[#FFF5F4] border border-[#FECDD3]">
                  <div className="text-xs font-bold text-[#E11D48]">False Positives (FP)</div>
                  <div className="text-3xl font-black text-[#E11D48]">{cm.fp}</div>
                  <div className="text-[10px] text-[#E11D48] pt-1">Non-donors predicted as donors</div>
                </div>
                <div className="p-4 rounded-xl bg-[#FFF5F4] border border-[#FECDD3]">
                  <div className="text-xs font-bold text-[#E11D48]">False Negatives (FN)</div>
                  <div className="text-3xl font-black text-[#E11D48]">{cm.fn}</div>
                  <div className="text-[10px] text-[#E11D48] pt-1">Donors missed by the tree</div>
                </div>
                <div className="p-4 rounded-xl bg-[#EDF9F5] border border-[#A7F3D0]">
                  <div className="text-xs font-bold text-[#065F46]">True Positives (TP)</div>
                  <div className="text-3xl font-black text-[#059669]">{cm.tp}</div>
                  <div className="text-[10px] text-[#065F46] pt-1">Correctly identified donors</div>
                </div>
              </div>
            </div>

            {/* Performance Metrics Breakdown */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-4">
              <h3 className="text-base font-black text-[#131127] border-b border-[#F1EEFB] pb-2">
                Classification Performance Summary
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-[#F8F7FC] rounded-2xl flex justify-between items-center">
                  <span className="font-bold text-xs text-[#131127]">Test Accuracy:</span>
                  <span className="font-black text-[#059669]">{(metrics.accuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="p-3 bg-[#F8F7FC] rounded-2xl flex justify-between items-center">
                  <span className="font-bold text-xs text-[#131127]">Training Accuracy:</span>
                  <span className="font-black text-[#7956E8]">{(metrics.train_accuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="p-3 bg-[#F8F7FC] rounded-2xl flex justify-between items-center">
                  <span className="font-bold text-xs text-[#131127]">Precision (Positive Predictive Value):</span>
                  <span className="font-black text-[#FF786B]">{(metrics.precision * 100).toFixed(1)}%</span>
                </div>
                <div className="p-3 bg-[#F8F7FC] rounded-2xl flex justify-between items-center">
                  <span className="font-bold text-xs text-[#131127]">Recall (Sensitivity):</span>
                  <span className="font-black text-[#FF786B]">{(metrics.recall * 100).toFixed(1)}%</span>
                </div>
                <div className="p-3 bg-[#F8F7FC] rounded-2xl flex justify-between items-center">
                  <span className="font-bold text-xs text-[#131127]">F1-Score:</span>
                  <span className="font-black text-[#56C9A5]">{metrics.f1_score}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* VIEW 5: PREDICT DONOR CLASS & TRACE DECISION PATH                   */}
      {/* ------------------------------------------------------------------- */}
      {activeView === 'predict' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Controls Form */}
            <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-4">
              <h3 className="text-sm font-black text-[#131127] border-b border-[#F1EEFB] pb-2">
                Donor Profile Inputs
              </h3>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[#131127]">
                  <span>Recency (months since last donation):</span>
                  <span className="text-[#FF786B] font-black">{predRecency} months</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="74"
                  value={predRecency}
                  onChange={(e) => setPredRecency(parseInt(e.target.value))}
                  className="w-full accent-[#FF786B] cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[#131127]">
                  <span>Frequency (total past donations):</span>
                  <span className="text-[#7956E8] font-black">{predFrequency} donations</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={predFrequency}
                  onChange={(e) => setPredFrequency(parseInt(e.target.value))}
                  className="w-full accent-[#7956E8] cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[#131127]">
                  <span>Time / Tenure (months since 1st donation):</span>
                  <span className="text-[#56C9A5] font-black">{predTime} months</span>
                </div>
                <input
                  type="range"
                  min={Math.max(2, predRecency)}
                  max="98"
                  value={predTime}
                  onChange={(e) => setPredTime(parseInt(e.target.value))}
                  className="w-full accent-[#56C9A5] cursor-pointer"
                />
              </div>

              {/* Quick Presets */}
              <div className="pt-2 space-y-1.5">
                <span className="text-[10px] font-bold text-[#8C87A8] uppercase">Quick Presets:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setPredRecency(2);
                      setPredFrequency(1);
                      setPredTime(2);
                    }}
                    className="p-2 rounded-xl text-xs font-bold bg-[#F8F7FC] hover:bg-[#FFF5F4] border border-[#ECE8F6] cursor-pointer"
                  >
                    1st Time
                  </button>
                  <button
                    onClick={() => {
                      setPredRecency(4);
                      setPredFrequency(6);
                      setPredTime(24);
                    }}
                    className="p-2 rounded-xl text-xs font-bold bg-[#F8F7FC] hover:bg-[#FFF5F4] border border-[#ECE8F6] cursor-pointer"
                  >
                    Regular
                  </button>
                  <button
                    onClick={() => {
                      setPredRecency(2);
                      setPredFrequency(20);
                      setPredTime(60);
                    }}
                    className="p-2 rounded-xl text-xs font-bold bg-[#F8F7FC] hover:bg-[#FFF5F4] border border-[#ECE8F6] cursor-pointer"
                  >
                    Super
                  </button>
                </div>
              </div>
            </div>

            {/* Inference & Decision Path Output */}
            <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#F1EEFB] pb-3">
                  <h3 className="text-base font-black text-[#131127]">Tree Classification Outcome</h3>
                  {predLoading && <RefreshCw className="w-4 h-4 animate-spin text-[#FF786B]" />}
                </div>

                <div className="my-5 p-6 rounded-3xl bg-[#FFF5F4] border border-[#FECDD3] text-center space-y-2">
                  <div className="text-xs font-bold text-[#E11D48] uppercase tracking-wider">
                    Predicted Class
                  </div>
                  <div className="text-3xl font-black text-[#131127]">{predResult?.prediction_label}</div>
                  <p className="text-xs font-bold text-[#FF786B]">
                    Confidence: {predResult?.confidence_pct}%
                  </p>
                </div>
              </div>

              {/* Traced Decision Path */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#131127]">Traced Tree Decision Path:</div>
                <div className="p-3 rounded-2xl bg-[#F8F7FC] border border-[#ECE8F6] space-y-1.5 text-xs font-mono">
                  {predResult?.decision_path?.map((step: string, sIdx: number) => (
                    <div key={sIdx} className="flex items-center space-x-2 text-[#4E4B66]">
                      <ArrowRight className="w-3.5 h-3.5 text-[#FF786B] shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                  <div className="pt-1 text-[#059669] font-bold">➔ Output: {predResult?.prediction_label}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
