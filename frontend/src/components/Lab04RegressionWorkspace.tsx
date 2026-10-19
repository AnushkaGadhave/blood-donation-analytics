import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Layers,
  BarChart3,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Database,
  ShieldCheck,
  Sliders,
  Award,
  Activity,
  Info,
  Droplet
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  ReferenceLine
} from 'recharts';
import { api } from '../services/api';
import type { LabDetailResponse } from '../types';

interface Lab04Props {
  labDetail?: LabDetailResponse;
}

type ModelView = 'overview' | 'slr' | 'mlr' | 'comparison' | 'residual' | 'predict';

const WORKFLOW_STEPS = [
  { id: 'data', step: '01', title: 'Blood Dataset', desc: '748 rows, 4 features', targetView: 'overview' as ModelView },
  { id: 'features', step: '02', title: 'Feature Selection', desc: 'R, F, T → Monetary', targetView: 'overview' as ModelView },
  { id: 'split', step: '03', title: 'Train/Test Split', desc: '80% Train / 20% Test', targetView: 'comparison' as ModelView },
  { id: 'train', step: '04', title: 'SLR & MLR', desc: 'Scikit-Learn OLS', targetView: 'slr' as ModelView },
  { id: 'evaluate', step: '05', title: 'Evaluation', desc: 'R², MSE, RMSE, MAE', targetView: 'comparison' as ModelView },
  { id: 'predict', step: '06', title: 'Monetary Prediction', desc: 'Interactive Estimator', targetView: 'predict' as ModelView }
];

export const Lab04RegressionWorkspace: React.FC<Lab04Props> = ({ labDetail }) => {
  const [activeView, setActiveView] = useState<ModelView>('overview');
  const [regData, setRegData] = useState<any>(labDetail || null);
  const [loading, setLoading] = useState<boolean>(!labDetail);
  const [error, setError] = useState<string | null>(null);

  // Comparison metric filter
  const [selectedMetric, setSelectedMetric] = useState<'r2' | 'rmse' | 'mse' | 'mae'>('r2');

  // Prediction State (Predict Monetary Volume in c.c.)
  const [predModelType, setPredModelType] = useState<'slr' | 'mlr'>('slr');
  const [predFreq, setPredFreq] = useState<number>(6);
  const [predRecency, setPredRecency] = useState<number>(4);
  const [predTime, setPredTime] = useState<number>(24);
  const [predResult, setPredResult] = useState<any>(null);
  const [predLoading, setPredLoading] = useState<boolean>(false);

  // Fetch regression suite data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getRegressionOverview();
        setRegData(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch regression models payload');
      } finally {
        setLoading(false);
      }
    }
    if (!regData?.dataset_info) {
      loadData();
    }
  }, []);

  // Compute prediction in real-time
  useEffect(() => {
    async function computePred() {
      if (!regData?.slr || !regData?.mlr) return;
      try {
        setPredLoading(true);
        // Ensure logical constraint: tenure (Time) >= months since last donation (Recency)
        const validTime = Math.max(predTime, predRecency);
        const res = await api.predictMonetary({
          model_type: predModelType,
          frequency: predFreq,
          recency: predRecency,
          time: validTime
        });
        setPredResult(res);
      } catch (err: any) {
        console.error('Prediction failed:', err);
      } finally {
        setPredLoading(false);
      }
    }
    computePred();
  }, [predModelType, predFreq, predRecency, predTime, regData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4 bg-white rounded-3xl border border-[#ECE8F6] p-8 shadow-xs">
        <RefreshCw className="w-10 h-10 animate-spin text-[#FFD166]" />
        <div className="text-center space-y-1">
          <h3 className="text-base font-bold text-[#131127]">Training Blood Donation Regression Models</h3>
          <p className="text-xs text-[#4E4B66]">
            Fitting Scikit-learn Linear Regression on 748 UCI records with 80/20 train-test evaluation...
          </p>
        </div>
      </div>
    );
  }

  if (error || !regData) {
    return (
      <div className="p-6 bg-[#FFF5F4] border border-[#FF786B]/30 rounded-3xl text-[#131127] space-y-3 shadow-xs">
        <div className="flex items-center space-x-2 font-bold text-[#FF786B]">
          <AlertTriangle className="w-5 h-5" />
          <span>Error Loading Regression Workspace</span>
        </div>
        <p className="text-sm text-[#4E4B66]">{error || 'No regression model data received from API.'}</p>
      </div>
    );
  }

  const ds = regData.dataset_info || {};
  const slr = regData.slr || {};
  const mlr = regData.mlr || {};
  const comparison = regData.comparison || {};
  const corrMatrix = regData.correlation_matrix || { columns: [], cells: [] };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ------------------------------------------------------------------- */}
      {/* 1. TOP HEADER & DATASET SOURCE BANNER                                */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1EEFB] pb-3.5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-[#FEF9E7] text-[#B45309]">
              <TrendingUp className="w-5 h-5 text-[#FFD166]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FEF9E7] text-[#B45309]">
                  Lab 04 — Linear Regression
                </span>
                <span className="text-[11px] font-medium text-[#8C87A8]">
                  • {ds.name || 'UCI Blood Transfusion Service Center Dataset'}
                </span>
              </div>
              <h2 className="text-lg font-black text-[#131127] pt-0.5">
                Simple &amp; Multiple Linear Regression Analytics
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F8F7FC] text-[#7956E8] border border-[#ECE8F6]">
              <Database className="w-3.5 h-3.5" />
              <span>data/raw/transfusion.data</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#EDF9F5] text-[#059669] border border-[#A7F3D0]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>80/20 Train/Test Split (598 / 150)</span>
            </span>
          </div>
        </div>

        {/* Dynamic Metric Badges Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-[#F8F7FC] p-3 rounded-2xl border border-[#ECE8F6] space-y-0.5">
            <div className="flex items-center justify-between text-[#8C87A8]">
              <span className="text-[10px] font-bold uppercase">Dataset Records</span>
              <Database className="w-3 h-3 text-[#7956E8]" />
            </div>
            <div className="text-lg font-black text-[#131127]">{ds.total_records || 748} donors</div>
            <p className="text-[9px] text-[#4E4B66]">598 Train / 150 Test</p>
          </div>

          <div className="bg-[#F8F7FC] p-3 rounded-2xl border border-[#ECE8F6] space-y-0.5">
            <div className="flex items-center justify-between text-[#8C87A8]">
              <span className="text-[10px] font-bold uppercase">Regression Target</span>
              <Droplet className="w-3 h-3 text-[#FF786B]" />
            </div>
            <div className="text-lg font-black text-[#FF786B]">Monetary (c.c.)</div>
            <p className="text-[9px] text-[#8C87A8]">Total Donated Volume</p>
          </div>

          <div className="bg-[#F8F7FC] p-3 rounded-2xl border border-[#ECE8F6] space-y-0.5">
            <div className="flex items-center justify-between text-[#8C87A8]">
              <span className="text-[10px] font-bold uppercase">SLR R² Score</span>
              <TrendingUp className="w-3 h-3 text-[#58B8F5]" />
            </div>
            <div className="text-lg font-black text-[#0284C7]">{slr.metrics?.r2?.toFixed(4) || '1.0000'}</div>
            <p className="text-[9px] text-[#4E4B66]">Frequency Only (100%)</p>
          </div>

          <div className="bg-[#F8F7FC] p-3 rounded-2xl border border-[#ECE8F6] space-y-0.5">
            <div className="flex items-center justify-between text-[#8C87A8]">
              <span className="text-[10px] font-bold uppercase">MLR R² Score</span>
              <Sparkles className="w-3 h-3 text-[#059669]" />
            </div>
            <div className="text-lg font-black text-[#059669]">{mlr.metrics?.r2?.toFixed(4) || '1.0000'}</div>
            <p className="text-[9px] text-[#059669] font-bold">Rec + Freq + Time (100%)</p>
          </div>

          <div className="bg-[#F8F7FC] p-3 rounded-2xl border border-[#ECE8F6] space-y-0.5 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-[#8C87A8]">
              <span className="text-[10px] font-bold uppercase">Best Model</span>
              <Award className="w-3 h-3 text-[#7956E8]" />
            </div>
            <div className="text-sm font-black text-[#7956E8] truncate">SLR (Parsimonious)</div>
            <p className="text-[9px] text-[#059669] font-bold">Exact 250 c.c. fit</p>
          </div>
        </div>

        {/* Deterministic Invariant Notice Banner */}
        <div className="p-3 bg-[#FEF9E7] border border-[#FDE68A] rounded-2xl flex items-start space-x-2.5 text-xs text-[#92400E]">
          <Info className="w-4 h-4 shrink-0 text-[#B45309] mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Dataset Invariant &amp; Econometric Ground Truth: </span>
            <span>
              In the UCI dataset, every donation contributes exactly 250 c.c. of blood (
              <code className="font-bold text-[#7956E8] bg-white px-1.5 py-0.5 rounded border border-[#FDE68A]">
                Monetary = Frequency × 250 c.c.
              </code>
              , Pearson <strong>r = 1.0000</strong>). Both SLR and MLR correctly learn this physical unit conversion factor (
              <code className="font-bold text-[#7956E8] bg-white px-1 py-0.2 rounded">β_Freq = +250.0</code>
              ).
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 2. TOP-OF-PAGE NAVIGATION SELECTOR (6 COMPACT OPTIONS)              */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white p-4 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#F1EEFB] pb-2">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-[#7956E8]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-[#131127]">
              Lab 04 Navigation Explorer
            </h3>
          </div>
          <span className="text-[11px] font-bold text-[#7956E8] bg-[#F5F3FF] px-2.5 py-0.5 rounded-lg">
            6 Interactive Views
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[
            { id: 'overview', label: 'Overview', sub: '2×2 Visual Dashboard', icon: LayoutDashboard, accent: '#FFD166' },
            { id: 'slr', label: 'Simple Linear Regression', sub: 'Frequency → Monetary', icon: TrendingUp, accent: '#58B8F5' },
            { id: 'mlr', label: 'Multiple Linear Regression', sub: 'R, F, T → Monetary', icon: Layers, accent: '#7956E8' },
            { id: 'comparison', label: 'Model Comparison', sub: 'SLR vs MLR Metrics', icon: BarChart3, accent: '#56C9A5' },
            { id: 'residual', label: 'Residual Analysis', sub: 'Error Distributions', icon: Activity, accent: '#FF786B' },
            { id: 'predict', label: 'Predict Monetary Volume', sub: 'Volume Estimator', icon: Sparkles, accent: '#EC79B9' }
          ].map((item) => {
            const isSelected = activeView === item.id;
            const ItemIcon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as ModelView)}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                  isSelected
                    ? 'bg-[#FEF9E7] border-[#FDE68A] shadow-xs ring-2 ring-[#FFD166]/40'
                    : 'bg-[#F8F7FC] border-[#ECE8F6] hover:bg-white hover:border-[#FFD166]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="p-1.5 rounded-xl"
                    style={{
                      backgroundColor: isSelected ? '#FFD166' : '#E5E3EF',
                      color: isSelected ? '#131127' : '#4E4B66'
                    }}
                  >
                    <ItemIcon className="w-4 h-4" />
                  </div>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#B45309]" />}
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
      {/* 3. VISUAL WORKFLOW PIPELINE                                         */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#F1EEFB] pb-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#131127]">
            Blood Donation Regression Workflow Pipeline
          </h4>
          <span className="text-[10px] text-[#8C87A8]">Click any stage to jump</span>
        </div>
        <div className="overflow-x-auto pb-1">
          <div className="flex items-center space-x-2 min-w-[750px] p-0.5">
            {WORKFLOW_STEPS.map((st, idx) => {
              const isActive = activeView === st.targetView;
              return (
                <React.Fragment key={st.id}>
                  <button
                    onClick={() => setActiveView(st.targetView)}
                    className={`flex-1 p-2.5 rounded-2xl text-left border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#FEF9E7] border-[#FDE68A] ring-2 ring-[#FFD166]/30'
                        : 'bg-[#F8F7FC] border-[#ECE8F6] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-[#E5E3EF] text-[#4E4B66]">
                        {st.step}
                      </span>
                      {isActive && <CheckCircle2 className="w-3 h-3 text-[#B45309]" />}
                    </div>
                    <div className="text-xs font-black text-[#131127] truncate">{st.title}</div>
                    <div className="text-[9px] text-[#8C87A8] truncate">{st.desc}</div>
                  </button>
                  {idx < WORKFLOW_STEPS.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-[#8C87A8] shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* VIEW 1: OVERVIEW DASHBOARD (2×2 GRID)                               */}
      {/* ------------------------------------------------------------------- */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Frequency vs Monetary Scatter + Fitted SLR Line */}
            <div className="bg-white p-5 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#F1EEFB] pb-2">
                  <h4 className="text-sm font-black text-[#131127]">1. Frequency vs. Monetary with Fitted SLR Line</h4>
                  <span className="text-[10px] font-bold text-[#58B8F5] bg-[#F0F8FE] px-2 py-0.5 rounded">SLR Fit</span>
                </div>
                <p className="text-xs text-[#4E4B66] pt-1">
                  Observed blood volume against donation frequency with fitted line: <code className="font-bold text-[#7956E8]">{slr.equation}</code>.
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1EEFB" />
                    <XAxis
                      dataKey="frequency"
                      type="number"
                      domain={[0, 52]}
                      label={{ value: 'Donation Frequency (times)', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#8C87A8' }}
                      tick={{ fontSize: 10, fill: '#4E4B66' }}
                    />
                    <YAxis
                      dataKey="actual_monetary"
                      type="number"
                      domain={[0, 13000]}
                      label={{ value: 'Monetary Volume (c.c.)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#8C87A8' }}
                      tick={{ fontSize: 10, fill: '#4E4B66' }}
                    />
                    <Tooltip
                      formatter={(val: any, name?: any) => [
                        `${val} c.c.`,
                        name === 'Observed Donors' ? 'Actual Volume' : 'Fitted Volume'
                      ]}
                      labelFormatter={(label) => `Frequency: ${label} donations`}
                      contentStyle={{ borderRadius: '12px', fontSize: '11px' }}
                    />
                    <Scatter name="Observed Donors" data={slr.scatter_points || []} fill="#58B8F5" opacity={0.7} />
                    <Line
                      data={slr.fit_line || []}
                      type="linear"
                      dataKey="fitted_monetary"
                      stroke="#7956E8"
                      strokeWidth={3}
                      dot={false}
                      name="Fitted SLR Line"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#F0F8FE] text-xs text-[#0284C7] font-medium flex items-center justify-between">
                <span>R² Variance Explained: <strong>{(slr.metrics?.r2 * 100).toFixed(1)}%</strong></span>
                <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-lg border border-[#BAE6FD]">Slope = +{slr.slope} c.c.</span>
              </div>
            </div>

            {/* Chart 2: Actual vs Predicted Monetary (150 Test Samples) */}
            <div className="bg-white p-5 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#F1EEFB] pb-2">
                  <h4 className="text-sm font-black text-[#131127]">2. Actual vs. Predicted Monetary (150 Test Samples)</h4>
                  <span className="text-[10px] font-bold text-[#059669] bg-[#EDF9F5] px-2 py-0.5 rounded">MLR Test</span>
                </div>
                <p className="text-xs text-[#4E4B66] pt-1">
                  150 held-out test predictions evaluated against the ideal diagonal line (y = x).
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1EEFB" />
                    <XAxis
                      dataKey="actual"
                      type="number"
                      domain={[0, 13000]}
                      label={{ value: 'Actual Monetary (c.c.)', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#8C87A8' }}
                      tick={{ fontSize: 10, fill: '#4E4B66' }}
                    />
                    <YAxis
                      dataKey="predicted"
                      type="number"
                      domain={[0, 13000]}
                      label={{ value: 'Predicted Monetary (c.c.)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#8C87A8' }}
                      tick={{ fontSize: 10, fill: '#4E4B66' }}
                    />
                    <Tooltip
                      formatter={(val: any, name?: any) => [`${val} c.c.`, name || 'Prediction']}
                      contentStyle={{ borderRadius: '12px', fontSize: '11px' }}
                    />
                    <Scatter name="Test Predictions" data={mlr.test_predictions || []} fill="#56C9A5" />
                    <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 12500, y: 12500 }]} stroke="#FF786B" strokeDasharray="4 4" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#EDF9F5] text-xs text-[#065F46] font-medium flex items-center justify-between">
                <span>MLR Test Accuracy: <strong>R² = {mlr.metrics?.r2?.toFixed(4)}</strong></span>
                <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-lg border border-[#A7F3D0]">RMSE = {mlr.metrics?.rmse} c.c.</span>
              </div>
            </div>

            {/* Chart 3: Model Performance Comparison Bar Chart */}
            <div className="bg-white p-5 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#F1EEFB] pb-2">
                  <h4 className="text-sm font-black text-[#131127]">3. SLR vs. MLR Model-Metric Comparison</h4>
                  <span className="text-[10px] font-bold text-[#7956E8] bg-[#F5F3FF] px-2 py-0.5 rounded">Test Benchmark</span>
                </div>
                <p className="text-xs text-[#4E4B66] pt-1">
                  Side-by-side performance across R², RMSE, MSE, and MAE on identical 150 test instances.
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { metric: 'R² (x100)', SLR: (slr.metrics?.r2 || 1.0) * 100, MLR: (mlr.metrics?.r2 || 1.0) * 100 },
                      { metric: 'MAE (c.c.)', SLR: slr.metrics?.mae || 0, MLR: mlr.metrics?.mae || 0 },
                      { metric: 'RMSE (c.c.)', SLR: slr.metrics?.rmse || 0, MLR: mlr.metrics?.rmse || 0 }
                    ]}
                    margin={{ top: 10, right: 10, bottom: 20, left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1EEFB" vertical={false} />
                    <XAxis dataKey="metric" tick={{ fontSize: 10, fill: '#4E4B66' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#4E4B66' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                    <Bar dataKey="SLR" name="SLR (Frequency)" fill="#58B8F5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="MLR" name="MLR (R + F + T)" fill="#7956E8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#F5F3FF] text-xs text-[#5534C4] font-medium flex items-center justify-between">
                <span>Model Fit: <strong>R² = 1.0000 (Exact Fit)</strong></span>
                <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-lg border border-[#DDD6FE]">SLR is Parsimonious</span>
              </div>
            </div>

            {/* Chart 4: Residuals vs Predicted Monetary Plot */}
            <div className="bg-white p-5 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#F1EEFB] pb-2">
                  <h4 className="text-sm font-black text-[#131127]">4. Residuals vs. Predicted Monetary</h4>
                  <span className="text-[10px] font-bold text-[#FF786B] bg-[#FFF5F4] px-2 py-0.5 rounded">Residual Check</span>
                </div>
                <p className="text-xs text-[#4E4B66] pt-1">
                  Residual error points plotted around the zero-residual reference line (y = 0).
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1EEFB" />
                    <XAxis
                      dataKey="predicted"
                      type="number"
                      domain={[0, 13000]}
                      label={{ value: 'Predicted Monetary (c.c.)', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#8C87A8' }}
                      tick={{ fontSize: 10, fill: '#4E4B66' }}
                    />
                    <YAxis
                      dataKey="residual"
                      type="number"
                      domain={[-1, 1]}
                      label={{ value: 'Residual (Actual - Pred)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#8C87A8' }}
                      tick={{ fontSize: 10, fill: '#4E4B66' }}
                    />
                    <Tooltip
                      formatter={(val: any) => [`${val} c.c.`, 'Residual Error']}
                      contentStyle={{ borderRadius: '12px', fontSize: '11px' }}
                    />
                    <ReferenceLine y={0} stroke="#FF786B" strokeWidth={2} strokeDasharray="3 3" />
                    <Scatter name="Residual Points" data={mlr.test_predictions || []} fill="#7956E8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#FFF5F4] text-xs text-[#E11D48] font-medium flex items-center justify-between">
                <span>Mean Residual: <strong>0.00 c.c.</strong></span>
                <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-lg border border-[#FECDD3]">Exact Residual Zero</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* VIEW 2: SIMPLE LINEAR REGRESSION (SLR)                              */}
      {/* ------------------------------------------------------------------- */}
      {activeView === 'slr' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1EEFB] pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#58B8F5] bg-[#F0F8FE] px-2 py-0.5 rounded">
                  Single Predictor Model
                </span>
                <h3 className="text-base font-black text-[#131127]">
                  Simple Linear Regression: Frequency → Monetary Volume
                </h3>
              </div>
              <div className="px-3 py-1.5 bg-[#F0F8FE] text-[#0284C7] rounded-xl text-xs font-mono font-bold">
                {slr.equation}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 bg-[#F8F7FC] rounded-2xl border border-[#ECE8F6]">
                <div className="text-[10px] text-[#8C87A8] font-bold">Intercept (β₀)</div>
                <div className="text-base font-black text-[#131127]">{slr.intercept} c.c.</div>
                <p className="text-[9px] text-[#4E4B66]">Base blood volume</p>
              </div>
              <div className="p-3 bg-[#F8F7FC] rounded-2xl border border-[#ECE8F6]">
                <div className="text-[10px] text-[#8C87A8] font-bold">Slope (β₁)</div>
                <div className="text-base font-black text-[#7956E8]">+{slr.slope} c.c.</div>
                <p className="text-[9px] text-[#4E4B66]">Volume per donation</p>
              </div>
              <div className="p-3 bg-[#F8F7FC] rounded-2xl border border-[#ECE8F6]">
                <div className="text-[10px] text-[#8C87A8] font-bold">Test R² Score</div>
                <div className="text-base font-black text-[#059669]">{slr.metrics?.r2?.toFixed(4)}</div>
                <p className="text-[9px] text-[#4E4B66]">100% Variance Explained</p>
              </div>
              <div className="p-3 bg-[#F8F7FC] rounded-2xl border border-[#ECE8F6]">
                <div className="text-[10px] text-[#8C87A8] font-bold">Test RMSE</div>
                <div className="text-base font-black text-[#FF786B]">{slr.metrics?.rmse} c.c.</div>
                <p className="text-[9px] text-[#4E4B66]">Root mean squared error</p>
              </div>
              <div className="p-3 bg-[#F8F7FC] rounded-2xl border border-[#ECE8F6]">
                <div className="text-[10px] text-[#8C87A8] font-bold">Test MAE</div>
                <div className="text-base font-black text-[#B45309]">{slr.metrics?.mae} c.c.</div>
                <p className="text-[9px] text-[#4E4B66]">Mean absolute error</p>
              </div>
            </div>
          </div>

          {/* 3 SLR Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Fitted Regression Line */}
            <div className="bg-white p-5 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-3">
              <h4 className="text-sm font-black text-[#131127] border-b border-[#F1EEFB] pb-2">
                Fitted Regression Line
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1EEFB" />
                    <XAxis
                      dataKey="frequency"
                      type="number"
                      domain={[0, 52]}
                      label={{ value: 'Frequency (times)', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#8C87A8' }}
                      tick={{ fontSize: 10, fill: '#4E4B66' }}
                    />
                    <YAxis
                      dataKey="actual_monetary"
                      type="number"
                      domain={[0, 13000]}
                      label={{ value: 'Monetary (c.c.)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#8C87A8' }}
                      tick={{ fontSize: 10, fill: '#4E4B66' }}
                    />
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                    <Scatter name="Observed" data={slr.scatter_points || []} fill="#58B8F5" opacity={0.65} />
                    <Line
                      data={slr.fit_line || []}
                      type="linear"
                      dataKey="fitted_monetary"
                      stroke="#7956E8"
                      strokeWidth={3}
                      dot={false}
                      name="Fitted OLS Line"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Actual vs Predicted Scatter */}
            <div className="bg-white p-5 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-3">
              <h4 className="text-sm font-black text-[#131127] border-b border-[#F1EEFB] pb-2">
                Actual vs. Predicted Values
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1EEFB" />
                    <XAxis
                      dataKey="actual"
                      type="number"
                      domain={[0, 13000]}
                      label={{ value: 'Actual (c.c.)', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#8C87A8' }}
                      tick={{ fontSize: 10, fill: '#4E4B66' }}
                    />
                    <YAxis
                      dataKey="predicted"
                      type="number"
                      domain={[0, 13000]}
                      label={{ value: 'Predicted (c.c.)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#8C87A8' }}
                      tick={{ fontSize: 10, fill: '#4E4B66' }}
                    />
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                    <Scatter name="Test Points" data={slr.test_predictions || []} fill="#56C9A5" />
                    <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 12500, y: 12500 }]} stroke="#FF786B" strokeDasharray="3 3" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3. Residuals vs Predicted Values */}
            <div className="bg-white p-5 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-3">
              <h4 className="text-sm font-black text-[#131127] border-b border-[#F1EEFB] pb-2">
                Residuals vs. Predicted Values
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1EEFB" />
                    <XAxis
                      dataKey="predicted"
                      type="number"
                      domain={[0, 13000]}
                      label={{ value: 'Predicted (c.c.)', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#8C87A8' }}
                      tick={{ fontSize: 10, fill: '#4E4B66' }}
                    />
                    <YAxis
                      dataKey="residual"
                      type="number"
                      domain={[-1, 1]}
                      label={{ value: 'Residual Error (c.c.)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#8C87A8' }}
                      tick={{ fontSize: 10, fill: '#4E4B66' }}
                    />
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                    <ReferenceLine y={0} stroke="#FF786B" strokeWidth={2} strokeDasharray="3 3" />
                    <Scatter name="Residuals" data={slr.test_predictions || []} fill="#7956E8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* VIEW 3: MULTIPLE LINEAR REGRESSION (MLR)                            */}
      {/* ------------------------------------------------------------------- */}
      {activeView === 'mlr' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1EEFB] pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7956E8] bg-[#F5F3FF] px-2 py-0.5 rounded">
                  Multi-Predictor Model
                </span>
                <h3 className="text-base font-black text-[#131127]">
                  Multiple Linear Regression (Recency + Frequency + Time → Monetary)
                </h3>
              </div>
              <div className="px-3 py-1.5 bg-[#F5F3FF] text-[#5534C4] rounded-xl text-xs font-mono font-bold">
                {mlr.equation}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 bg-[#F8F7FC] rounded-2xl border border-[#ECE8F6]">
                <div className="text-[10px] text-[#8C87A8] font-bold">Intercept (β₀)</div>
                <div className="text-base font-black text-[#131127]">{mlr.intercept} c.c.</div>
                <p className="text-[9px] text-[#4E4B66]">Base constant</p>
              </div>
              <div className="p-3 bg-[#F8F7FC] rounded-2xl border border-[#ECE8F6]">
                <div className="text-[10px] text-[#8C87A8] font-bold">Recency (β₁)</div>
                <div className="text-base font-black text-[#7956E8]">{mlr.coefficients?.Recency} c.c.</div>
                <p className="text-[9px] text-[#4E4B66]">0.0 per month elapsed</p>
              </div>
              <div className="p-3 bg-[#F8F7FC] rounded-2xl border border-[#ECE8F6]">
                <div className="text-[10px] text-[#8C87A8] font-bold">Frequency (β₂)</div>
                <div className="text-base font-black text-[#B45309]">+{mlr.coefficients?.Frequency} c.c.</div>
                <p className="text-[9px] text-[#4E4B66]">250.0 per donation</p>
              </div>
              <div className="p-3 bg-[#F8F7FC] rounded-2xl border border-[#ECE8F6]">
                <div className="text-[10px] text-[#8C87A8] font-bold">Time / Tenure (β₃)</div>
                <div className="text-base font-black text-[#059669]">{mlr.coefficients?.Time} c.c.</div>
                <p className="text-[9px] text-[#4E4B66]">0.0 per month tenure</p>
              </div>
              <div className="p-3 bg-[#F8F7FC] rounded-2xl border border-[#ECE8F6]">
                <div className="text-[10px] text-[#8C87A8] font-bold">Test R² Score</div>
                <div className="text-base font-black text-[#059669]">{mlr.metrics?.r2?.toFixed(4)}</div>
                <p className="text-[9px] text-[#059669] font-bold">100% Variance Explained</p>
              </div>
            </div>
          </div>

          {/* MLR Charts Grid: Coefficients + Correlation Heatmap + Actual vs Pred */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feature Coefficients Bar Chart */}
            <div className="bg-white p-5 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-3">
              <h4 className="text-sm font-black text-[#131127] border-b border-[#F1EEFB] pb-2">
                Feature Regression Coefficients (Slopes)
              </h4>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mlr.feature_coefficients || []} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1EEFB" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#4E4B66' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#4E4B66' }} />
                    <Tooltip
                      formatter={(val: any, _name: any, item: any) => [`${val} c.c.`, item.payload.impact]}
                      contentStyle={{ borderRadius: '12px', fontSize: '11px' }}
                    />
                    <Bar dataKey="coefficient" name="Coefficient (c.c.)" fill="#7956E8" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-[#4E4B66]">
                Only <strong>Frequency</strong> has a non-zero coefficient (+250.0 c.c.) because total blood volume is strictly determined by donation count.
              </p>
            </div>

            {/* 4×4 Correlation Heatmap */}
            <div className="bg-white p-5 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-3">
              <h4 className="text-sm font-black text-[#131127] border-b border-[#F1EEFB] pb-2">
                Numeric Variables Correlation Matrix (4×4)
              </h4>
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-center border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="p-2 font-bold text-[#8C87A8] text-left">Feature</th>
                      {corrMatrix.columns?.map((col: string) => (
                        <th key={col} className="p-2 font-bold text-[#131127]">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {corrMatrix.raw_keys?.map((rowCol: string, rIdx: number) => {
                      const rowCells = corrMatrix.cells?.filter((c: any) => c.row === rowCol) || [];
                      const rowLabel = corrMatrix.columns[rIdx];
                      return (
                        <tr key={rowCol} className="border-t border-[#F1EEFB]">
                          <td className="p-2 font-extrabold text-[#131127] text-left">{rowLabel}</td>
                          {rowCells.map((cell: any, cIdx: number) => {
                            const val = cell.correlation;
                            let bg = cell.is_perfect ? '#FEF9E7' : val > 0.6 ? '#D1FAE5' : val > 0.2 ? '#F0F8FE' : val < -0.1 ? '#FFF5F4' : '#FFFFFF';
                            return (
                              <td key={cIdx} className="p-1">
                                <div
                                  className="p-2 rounded-xl font-bold"
                                  style={{ backgroundColor: bg, color: cell.is_perfect ? '#B45309' : '#131127' }}
                                >
                                  {val > 0 ? `+${val.toFixed(3)}` : val.toFixed(3)}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-[#4E4B66]">
                Note the perfect collinearity between <strong>Frequency</strong> and <strong>Monetary</strong> (<code className="font-bold text-[#B45309]">r = 1.000</code>).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* VIEW 4: MODEL COMPARISON                                            */}
      {/* ------------------------------------------------------------------- */}
      {activeView === 'comparison' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1EEFB] pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#56C9A5] bg-[#EDF9F5] px-2 py-0.5 rounded">
                  Model Evaluation Benchmark
                </span>
                <h3 className="text-base font-black text-[#131127]">
                  SLR vs. MLR Evaluation Benchmark (Identical 150 Test Samples)
                </h3>
              </div>
              {/* Metric Selector Buttons */}
              <div className="flex items-center space-x-1 bg-[#F8F7FC] p-1 rounded-xl border border-[#ECE8F6]">
                {(['r2', 'rmse', 'mse', 'mae'] as const).map((mKey) => (
                  <button
                    key={mKey}
                    onClick={() => setSelectedMetric(mKey)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                      selectedMetric === mKey ? 'bg-[#56C9A5] text-white shadow-2xs' : 'text-[#4E4B66] hover:bg-[#EDF9F5]'
                    }`}
                  >
                    {mKey}
                  </button>
                ))}
              </div>
            </div>

            {/* Model Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8F7FC] text-[#8C87A8] font-bold">
                    <th className="p-3 rounded-l-xl">Evaluation Metric</th>
                    <th className="p-3">Simple Linear Regression (SLR)</th>
                    <th className="p-3">Multiple Linear Regression (MLR)</th>
                    <th className="p-3">Delta Difference</th>
                    <th className="p-3 rounded-r-xl">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.metrics?.map((row: any) => (
                    <tr key={row.metric_key} className="border-b border-[#F1EEFB] hover:bg-[#EDF9F5]/30">
                      <td className="p-3">
                        <div className="font-extrabold text-[#131127]">{row.metric}</div>
                        <div className="text-[10px] text-[#8C87A8]">{row.description}</div>
                      </td>
                      <td className="p-3 font-semibold text-[#4E4B66]">{row.slr_value}</td>
                      <td className="p-3 font-bold text-[#059669]">{row.mlr_value}</td>
                      <td className="p-3 font-semibold text-[#7956E8]">
                        {row.delta === 0 ? '0.000 (Tied)' : row.delta > 0 ? `+${row.delta}` : row.delta}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-[#EDF9F5] text-[#059669] border border-[#A7F3D0]">
                          {row.winner}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 bg-[#EDF9F5] rounded-2xl border border-[#A7F3D0] text-xs text-[#065F46] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-[#56C9A5]" />
                <span>
                  <strong>Parsimony Assessment:</strong> {comparison.parsimony_note}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* VIEW 5: RESIDUAL ANALYSIS                                           */}
      {/* ------------------------------------------------------------------- */}
      {activeView === 'residual' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1EEFB] pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF786B] bg-[#FFF5F4] px-2 py-0.5 rounded">
                  Residual Diagnostics
                </span>
                <h3 className="text-base font-black text-[#131127]">
                  Residual Error Analysis &amp; Diagnostic Distributions
                </h3>
              </div>
              <span className="text-xs font-bold text-[#4E4B66] bg-[#F8F7FC] px-3 py-1 rounded-xl border border-[#ECE8F6]">
                Zero-Error Baseline (e = Actual - Predicted)
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SLR Residuals vs Predicted */}
              <div className="p-4 rounded-2xl bg-[#F8F7FC] border border-[#ECE8F6] space-y-2">
                <div className="flex items-center justify-between border-b border-[#ECE8F6] pb-1.5">
                  <h5 className="text-xs font-bold text-[#131127]">SLR: Residuals vs. Predicted Monetary</h5>
                  <span className="text-[9px] font-bold text-[#58B8F5]">Single Predictor</span>
                </div>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ECE8F6" />
                      <XAxis dataKey="predicted" type="number" domain={[0, 13000]} label={{ value: 'Predicted (c.c.)', position: 'insideBottom', offset: -10, fontSize: 9, fill: '#8C87A8' }} />
                      <YAxis dataKey="residual" type="number" domain={[-1, 1]} label={{ value: 'Residual (c.c.)', angle: -90, position: 'insideLeft', fontSize: 9, fill: '#8C87A8' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                      <ReferenceLine y={0} stroke="#FF786B" strokeWidth={2} strokeDasharray="3 3" />
                      <Scatter name="SLR Residuals" data={slr.test_predictions || []} fill="#58B8F5" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* MLR Residuals vs Predicted */}
              <div className="p-4 rounded-2xl bg-[#F8F7FC] border border-[#ECE8F6] space-y-2">
                <div className="flex items-center justify-between border-b border-[#ECE8F6] pb-1.5">
                  <h5 className="text-xs font-bold text-[#131127]">MLR: Residuals vs. Predicted Monetary</h5>
                  <span className="text-[9px] font-bold text-[#7956E8]">Multi Predictor</span>
                </div>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ECE8F6" />
                      <XAxis dataKey="predicted" type="number" domain={[0, 13000]} label={{ value: 'Predicted (c.c.)', position: 'insideBottom', offset: -10, fontSize: 9, fill: '#8C87A8' }} />
                      <YAxis dataKey="residual" type="number" domain={[-1, 1]} label={{ value: 'Residual (c.c.)', angle: -90, position: 'insideLeft', fontSize: 9, fill: '#8C87A8' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                      <ReferenceLine y={0} stroke="#FF786B" strokeWidth={2} strokeDasharray="3 3" />
                      <Scatter name="MLR Residuals" data={mlr.test_predictions || []} fill="#7956E8" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* SLR Residual Histogram */}
              <div className="p-4 rounded-2xl bg-[#F8F7FC] border border-[#ECE8F6] space-y-2">
                <div className="flex items-center justify-between border-b border-[#ECE8F6] pb-1.5">
                  <h5 className="text-xs font-bold text-[#131127]">SLR: Residual Distribution Histogram</h5>
                  <span className="text-[9px] font-bold text-[#58B8F5]">150 Test Samples</span>
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={slr.residual_histogram || []} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ECE8F6" vertical={false} />
                      <XAxis dataKey="bin_label" tick={{ fontSize: 9, fill: '#4E4B66' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#4E4B66' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                      <Bar dataKey="count" name="Frequency" fill="#58B8F5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* MLR Residual Histogram */}
              <div className="p-4 rounded-2xl bg-[#F8F7FC] border border-[#ECE8F6] space-y-2">
                <div className="flex items-center justify-between border-b border-[#ECE8F6] pb-1.5">
                  <h5 className="text-xs font-bold text-[#131127]">MLR: Residual Distribution Histogram</h5>
                  <span className="text-[9px] font-bold text-[#7956E8]">150 Test Samples</span>
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mlr.residual_histogram || []} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ECE8F6" vertical={false} />
                      <XAxis dataKey="bin_label" tick={{ fontSize: 9, fill: '#4E4B66' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#4E4B66' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                      <Bar dataKey="count" name="Frequency" fill="#7956E8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#4E4B66] pt-1">
              <strong>Observation:</strong> All 150 test instances sit precisely on the reference line (residual e = 0.00 c.c.). There is zero heteroscedasticity or pattern in the residuals because total donated volume is an exact linear function of frequency.
            </p>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* VIEW 6: PREDICT MONETARY VOLUME                                     */}
      {/* ------------------------------------------------------------------- */}
      {activeView === 'predict' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Controls Form (5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#F1EEFB] pb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#FFD166]" />
                  <h3 className="text-sm font-black text-[#131127]">Monetary Volume Estimator</h3>
                </div>
                <div className="flex items-center space-x-1 bg-[#F8F7FC] p-1 rounded-xl border border-[#ECE8F6]">
                  <button
                    onClick={() => setPredModelType('slr')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      predModelType === 'slr' ? 'bg-[#58B8F5] text-white' : 'text-[#4E4B66]'
                    }`}
                  >
                    SLR
                  </button>
                  <button
                    onClick={() => setPredModelType('mlr')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      predModelType === 'mlr' ? 'bg-[#7956E8] text-white' : 'text-[#4E4B66]'
                    }`}
                  >
                    MLR
                  </button>
                </div>
              </div>

              {/* Frequency Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[#131127]">
                  <span>Donation Frequency (times):</span>
                  <span className="text-[#7956E8] font-black">{predFreq} donations</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={predFreq}
                  onChange={(e) => setPredFreq(parseInt(e.target.value))}
                  className="w-full accent-[#7956E8] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-[#8C87A8]">
                  <span>1 donation (250 c.c.)</span>
                  <span>50 donations (12,500 c.c.)</span>
                </div>
              </div>

              {/* MLR Exclusive Inputs */}
              {predModelType === 'mlr' && (
                <>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-[#131127]">
                      <span>Recency (months since last donation):</span>
                      <span className="text-[#58B8F5] font-black">{predRecency} months</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="74"
                      step="1"
                      value={predRecency}
                      onChange={(e) => {
                        const newR = parseInt(e.target.value);
                        setPredRecency(newR);
                        if (predTime < newR) setPredTime(newR);
                      }}
                      className="w-full accent-[#58B8F5] cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-[#8C87A8]">
                      <span>0 months (Immediate)</span>
                      <span>74 months (Dormant)</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-[#131127]">
                      <span>Time / Tenure (months since first donation):</span>
                      <span className="text-[#56C9A5] font-black">{predTime} months</span>
                    </div>
                    <input
                      type="range"
                      min={Math.max(2, predRecency)}
                      max="98"
                      step="1"
                      value={predTime}
                      onChange={(e) => setPredTime(parseInt(e.target.value))}
                      className="w-full accent-[#56C9A5] cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-[#8C87A8]">
                      <span>{Math.max(2, predRecency)} months (Tenure ≥ Recency)</span>
                      <span>98 months (Long-Term)</span>
                    </div>
                  </div>
                </>
              )}

              {/* Quick Presets */}
              <div className="space-y-1 pt-1">
                <div className="text-[10px] font-bold text-[#8C87A8] uppercase">Quick Donor Presets:</div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => {
                      setPredFreq(1);
                      setPredRecency(2);
                      setPredTime(2);
                    }}
                    className="p-1.5 rounded-xl text-[10px] font-bold bg-[#F8F7FC] hover:bg-[#FEF9E7] border border-[#ECE8F6] text-[#131127] cursor-pointer"
                  >
                    1st Time (1x)
                  </button>
                  <button
                    onClick={() => {
                      setPredFreq(6);
                      setPredRecency(4);
                      setPredTime(24);
                    }}
                    className="p-1.5 rounded-xl text-[10px] font-bold bg-[#F8F7FC] hover:bg-[#FEF9E7] border border-[#ECE8F6] text-[#131127] cursor-pointer"
                  >
                    Regular (6x)
                  </button>
                  <button
                    onClick={() => {
                      setPredFreq(24);
                      setPredRecency(2);
                      setPredTime(60);
                    }}
                    className="p-1.5 rounded-xl text-[10px] font-bold bg-[#F8F7FC] hover:bg-[#FEF9E7] border border-[#ECE8F6] text-[#131127] cursor-pointer"
                  >
                    Super (24x)
                  </button>
                </div>
              </div>
            </div>

            {/* Prediction Result Display (7 cols) */}
            <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#F1EEFB] pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#059669] bg-[#EDF9F5] px-2 py-0.5 rounded">
                      Model Estimation
                    </span>
                    <h3 className="text-base font-black text-[#131127]">
                      Predicted Total Blood Donated
                    </h3>
                  </div>
                  {predLoading && <RefreshCw className="w-4 h-4 animate-spin text-[#56C9A5]" />}
                </div>

                <div className="my-5 p-6 rounded-3xl bg-[#FEF9E7] border border-[#FDE68A] text-center space-y-2">
                  <div className="text-xs font-bold text-[#92400E] uppercase tracking-wider">
                    Expected Monetary Volume
                  </div>
                  <div className="text-4xl sm:text-5xl font-black text-[#131127]">
                    {predResult?.predicted_monetary_cc?.toLocaleString()} c.c.
                  </div>
                  <p className="text-xs font-semibold text-[#B45309]">
                    Equivalent to <strong>{predFreq} blood bags</strong> (250 c.c. standard capacity per event)
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#ECE8F6] text-xs space-y-1.5">
                  <div className="font-bold text-[#131127]">Equation Calculation Breakdown:</div>
                  <div className="p-2 rounded-xl bg-white border border-[#ECE8F6] font-mono text-[11px] text-[#7956E8] break-all">
                    {predResult?.equation_breakdown} = {predResult?.predicted_monetary_cc} c.c.
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#FEF9E7] border border-[#FDE68A] text-[11px] text-[#92400E] space-y-1">
                  <div className="font-bold flex items-center space-x-1">
                    <Info className="w-3.5 h-3.5 text-[#B45309]" />
                    <span>Deterministic Invariant Finding:</span>
                  </div>
                  <p>
                    {predResult?.deterministic_notice ||
                      'Because each donation is precisely 250 c.c., this prediction applies the exact historical constant.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
