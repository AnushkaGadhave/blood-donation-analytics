import React, { useState, useEffect } from 'react';
import {
  Award,
  BarChart2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Database,
  Sparkles,
  Activity,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { api } from '../services/api';
import type { LabDetailResponse } from '../types';

interface Lab06Props {
  labDetail?: LabDetailResponse;
}

type ViewMode = 'overview' | 'evaluation' | 'distributions' | 'predict';

const WORKFLOW_STEPS = [
  { id: 'data', step: '01', title: 'Blood Dataset', desc: '748 rows, 4 features' },
  { id: 'split', step: '02', title: 'Stratified Split', desc: '70% Train / 30% Test' },
  { id: 'priors', step: '03', title: 'Class Priors', desc: 'P(C₀) vs P(C₁)' },
  { id: 'gnb', step: '04', title: 'Gaussian Likelihood', desc: 'Feature μ & σ²' },
  { id: 'eval', step: '05', title: 'Posterior Evaluation', desc: 'P(C|X) & Metrics' }
];

export const Lab06NaiveBayes: React.FC<Lab06Props> = ({ labDetail }) => {
  const [activeView, setActiveView] = useState<ViewMode>('overview');
  const [data, setData] = useState<any>(labDetail || null);
  const [loading, setLoading] = useState<boolean>(!labDetail);
  const [error, setError] = useState<string | null>(null);

  // Prediction State
  const [predRecency, setPredRecency] = useState<number>(4);
  const [predFrequency, setPredFrequency] = useState<number>(5);
  const [predTime, setPredTime] = useState<number>(20);
  const [predResult, setPredResult] = useState<any>(null);
  const [predLoading, setPredLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadInitial() {
      try {
        setLoading(true);
        const res = await api.getLab6Overview();
        setData(res);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load Lab 06 data');
      } finally {
        setLoading(false);
      }
    }
    if (!data?.class_priors) {
      loadInitial();
    }
  }, []);

  // Compute live prediction
  useEffect(() => {
    async function doPredict() {
      if (!data?.metrics) return;
      try {
        setPredLoading(true);
        const res = await api.predictLab6NaiveBayes({
          recency: predRecency,
          frequency: predFrequency,
          time: Math.max(predTime, predRecency)
        });
        setPredResult(res);
      } catch (err: any) {
        console.error('Prediction failed:', err);
      } finally {
        setPredLoading(false);
      }
    }
    doPredict();
  }, [predRecency, predFrequency, predTime, data]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3 bg-white rounded-3xl border border-[#ECE8F6] p-8 shadow-xs">
        <RefreshCw className="w-8 h-8 animate-spin text-[#EC79B9]" />
        <p className="text-xs font-semibold text-[#4E4B66]">
          Training Gaussian Naïve Bayes &amp; Computing Posterior Probabilities...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-[#FFF5F4] border border-[#FF786B]/30 rounded-3xl text-[#131127] space-y-3 shadow-xs">
        <div className="flex items-center space-x-2 font-bold text-[#FF786B]">
          <AlertTriangle className="w-5 h-5" />
          <span>Error in Lab 06 Suite</span>
        </div>
        <p className="text-sm text-[#4E4B66]">{error || 'No data returned.'}</p>
      </div>
    );
  }

  const priors = data.class_priors || { priors_list: [] };
  const metrics = data.metrics || {};
  const cm = data.confusion_matrix || { matrix: [[0, 0], [0, 0]] };
  const params = data.gaussian_parameters || [];
  const classDist = data.class_distributions || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ------------------------------------------------------------------- */}
      {/* 1. TOP HEADER & METRIC STRIP                                        */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1EEFB] pb-3.5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-[#FDF2F8] text-[#DB2777]">
              <Award className="w-5 h-5 text-[#EC79B9]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FDF2F8] text-[#DB2777]">
                  Lab 06 — Naïve Bayes
                </span>
                <span className="text-[11px] font-medium text-[#8C87A8]">
                  • Gaussian Likelihood &amp; Posterior Calibration
                </span>
              </div>
              <h2 className="text-lg font-black text-[#131127] pt-0.5">
                Gaussian Naïve Bayes Classification
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F8F7FC] text-[#7956E8] border border-[#ECE8F6]">
              <Database className="w-3.5 h-3.5" />
              <span>data/raw/transfusion.data</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FDF2F8] text-[#DB2777] border border-[#FBCFE8]">
              <span>Stratified 70/30 (523 / 225)</span>
            </span>
          </div>
        </div>

        {/* Dynamic Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-[#F8F7FC] p-3 rounded-2xl border border-[#ECE8F6] space-y-0.5">
            <div className="text-[10px] font-bold text-[#8C87A8] uppercase">Test Accuracy</div>
            <div className="text-lg font-black text-[#131127]">{(metrics.accuracy * 100).toFixed(1)}%</div>
            <p className="text-[9px] text-[#4E4B66]">225 Test Records</p>
          </div>
          <div className="bg-[#F8F7FC] p-3 rounded-2xl border border-[#ECE8F6] space-y-0.5">
            <div className="text-[10px] font-bold text-[#8C87A8] uppercase">Precision</div>
            <div className="text-lg font-black text-[#7956E8]">{(metrics.precision * 100).toFixed(1)}%</div>
            <p className="text-[9px] text-[#4E4B66]">Positive Predictive Value</p>
          </div>
          <div className="bg-[#F8F7FC] p-3 rounded-2xl border border-[#ECE8F6] space-y-0.5">
            <div className="text-[10px] font-bold text-[#8C87A8] uppercase">Recall</div>
            <div className="text-lg font-black text-[#EC79B9]">{(metrics.recall * 100).toFixed(1)}%</div>
            <p className="text-[9px] text-[#4E4B66]">Sensitivity</p>
          </div>
          <div className="bg-[#F8F7FC] p-3 rounded-2xl border border-[#ECE8F6] space-y-0.5">
            <div className="text-[10px] font-bold text-[#8C87A8] uppercase">F1-Score</div>
            <div className="text-lg font-black text-[#56C9A5]">{metrics.f1_score}</div>
            <p className="text-[9px] text-[#4E4B66]">Harmonic Mean</p>
          </div>
          <div className="bg-[#F8F7FC] p-3 rounded-2xl border border-[#ECE8F6] space-y-0.5">
            <div className="text-[10px] font-bold text-[#8C87A8] uppercase">Prior P(Donor)</div>
            <div className="text-lg font-black text-[#DB2777]">{(priors.donor_prior * 100).toFixed(1)}%</div>
            <p className="text-[9px] text-[#DB2777] font-bold">Class 1 Base Rate</p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 2. TOP-OF-PAGE NAVIGATION (4 VIEWS)                                 */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white p-4 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#F1EEFB] pb-2">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-[#EC79B9]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-[#131127]">
              Lab 06 Navigation Explorer
            </h3>
          </div>
          <span className="text-[11px] font-bold text-[#DB2777] bg-[#FDF2F8] px-2.5 py-0.5 rounded-lg">
            4 Interactive Views
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { id: 'overview', label: 'Overview', sub: '2×2 Visual Grid & Priors', icon: BarChart2 },
            { id: 'evaluation', label: 'Evaluation & Matrix', sub: 'Confusion Matrix & Distribution', icon: Activity },
            { id: 'distributions', label: 'Gaussian Parameters', sub: 'Feature Means & Variances', icon: Layers },
            { id: 'predict', label: 'Posterior Predictor', sub: 'Live P(C|X) Estimator', icon: Sparkles }
          ].map((item) => {
            const isSelected = activeView === item.id;
            const ItemIcon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as ViewMode)}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                  isSelected
                    ? 'bg-[#FDF2F8] border-[#FBCFE8] shadow-xs ring-2 ring-[#EC79B9]/40'
                    : 'bg-[#F8F7FC] border-[#ECE8F6] hover:bg-white hover:border-[#EC79B9]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="p-1.5 rounded-xl"
                    style={{
                      backgroundColor: isSelected ? '#EC79B9' : '#E5E3EF',
                      color: isSelected ? '#FFFFFF' : '#4E4B66'
                    }}
                  >
                    <ItemIcon className="w-4 h-4" />
                  </div>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#DB2777]" />}
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
            Gaussian Naïve Bayes Workflow
          </h4>
          <span className="text-[10px] text-[#8C87A8]">Bayes Rule: P(C|X) ∝ P(C) ∏ P(X_i|C)</span>
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
      {/* VIEW 1: OVERVIEW DASHBOARD (2×2 GRID)                               */}
      {/* ------------------------------------------------------------------- */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Confusion Matrix Heatmap */}
            <div className="bg-white p-5 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#F1EEFB] pb-2">
                  <h4 className="text-sm font-black text-[#131127]">1. Confusion Matrix (225 Test Donors)</h4>
                  <span className="text-[10px] font-bold text-[#EC79B9] bg-[#FDF2F8] px-2 py-0.5 rounded">Accuracy {(metrics.accuracy * 100).toFixed(1)}%</span>
                </div>
                <p className="text-xs text-[#4E4B66] pt-1">
                  Cross-tabulation of ground truth vs Gaussian Naive Bayes predictions.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 bg-[#F8F7FC] rounded-2xl text-center">
                <div className="p-3 rounded-xl bg-[#EDF9F5] border border-[#A7F3D0]">
                  <div className="text-[10px] font-bold text-[#065F46]">True Negatives (TN)</div>
                  <div className="text-2xl font-black text-[#059669]">{cm.tn}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#FFF5F4] border border-[#FECDD3]">
                  <div className="text-[10px] font-bold text-[#E11D48]">False Positives (FP)</div>
                  <div className="text-2xl font-black text-[#E11D48]">{cm.fp}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#FFF5F4] border border-[#FECDD3]">
                  <div className="text-[10px] font-bold text-[#E11D48]">False Negatives (FN)</div>
                  <div className="text-2xl font-black text-[#E11D48]">{cm.fn}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#EDF9F5] border border-[#A7F3D0]">
                  <div className="text-[10px] font-bold text-[#065F46]">True Positives (TP)</div>
                  <div className="text-2xl font-black text-[#059669]">{cm.tp}</div>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#FDF2F8] text-xs text-[#DB2777] font-medium flex items-center justify-between">
                <span>F1-Score: <strong>{metrics.f1_score}</strong></span>
                <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-lg border border-[#FBCFE8]">Recall = {(metrics.recall * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Chart 2: Class Prior Probabilities */}
            <div className="bg-white p-5 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#F1EEFB] pb-2">
                  <h4 className="text-sm font-black text-[#131127]">2. Class Prior Probabilities P(C)</h4>
                  <span className="text-[10px] font-bold text-[#7956E8] bg-[#F5F3FF] px-2 py-0.5 rounded">Priors</span>
                </div>
                <p className="text-xs text-[#4E4B66] pt-1">
                  Empirical class balance learned from 523 training records.
                </p>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priors.priors_list || []} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1EEFB" vertical={false} />
                    <XAxis dataKey="class" tick={{ fontSize: 10, fill: '#4E4B66' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#4E4B66' }} unit="%" />
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                    <Bar dataKey="percentage" name="Prior Probability %" fill="#EC79B9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#F5F3FF] text-xs text-[#5534C4] font-medium flex items-center justify-between">
                <span>Imbalance Ratio: <strong>3.2 : 1</strong></span>
                <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-lg border border-[#DDD6FE]">P(C₁) = {priors.donor_prior}</span>
              </div>
            </div>

            {/* Chart 3: Actual vs Predicted Class Distribution */}
            <div className="bg-white p-5 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#F1EEFB] pb-2">
                  <h4 className="text-sm font-black text-[#131127]">3. Actual vs. Predicted Class Counts</h4>
                  <span className="text-[10px] font-bold text-[#56C9A5] bg-[#EDF9F5] px-2 py-0.5 rounded">Test Set</span>
                </div>
                <p className="text-xs text-[#4E4B66] pt-1">
                  Comparison of test ground-truth counts with Naive Bayes predictions.
                </p>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classDist} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1EEFB" vertical={false} />
                    <XAxis dataKey="class" tick={{ fontSize: 10, fill: '#4E4B66' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#4E4B66' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                    <Bar dataKey="actual" name="Actual Count" fill="#58B8F5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="predicted" name="Predicted Count" fill="#EC79B9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#EDF9F5] text-xs text-[#065F46] font-medium flex items-center justify-between">
                <span>Total Samples: <strong>225</strong></span>
                <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-lg border border-[#A7F3D0]">Conservative Donor Predictions</span>
              </div>
            </div>

            {/* Chart 4: Gaussian Feature Means by Class */}
            <div className="bg-white p-5 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#F1EEFB] pb-2">
                  <h4 className="text-sm font-black text-[#131127]">4. Feature Means Comparison by Class</h4>
                  <span className="text-[10px] font-bold text-[#FFD166] bg-[#FEF9E7] px-2 py-0.5 rounded text-[#B45309]">Gaussian Means</span>
                </div>
                <p className="text-xs text-[#4E4B66] pt-1">
                  Estimated conditional Gaussian means (mu0 vs mu1) for each candidate attribute.
                </p>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={params.map((p: any) => ({
                      feature: p.short_label,
                      'Non-Donors (C0)': p.class_0_non_donors.mean,
                      'Donors (C1)': p.class_1_donors.mean
                    }))}
                    margin={{ top: 10, right: 10, bottom: 20, left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1EEFB" vertical={false} />
                    <XAxis dataKey="feature" tick={{ fontSize: 10, fill: '#4E4B66' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#4E4B66' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                    <Bar dataKey="Non-Donors (C0)" fill="#8C87A8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Donors (C1)" fill="#EC79B9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#FEF9E7] text-xs text-[#B45309] font-medium flex items-center justify-between">
                <span>Key Discriminator: <strong>Recency ({params[0]?.class_1_donors?.mean}m vs {params[0]?.class_0_non_donors?.mean}m)</strong></span>
                <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-lg border border-[#FDE68A]">Gaussian Naive Bayes</span>
              </div>
            </div>
          </div>

          {/* Dynamic Observation */}
          <div className="p-4 rounded-3xl bg-[#FDF2F8] border border-[#FBCFE8] text-xs text-[#131127] space-y-1">
            <div className="font-black text-[#DB2777] flex items-center space-x-1.5">
              <Award className="w-4 h-4" />
              <span>Analytical Observation:</span>
            </div>
            <p className="text-[#4E4B66]">{data.observation}</p>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* VIEW 2: EVALUATION & CONFUSION MATRIX                               */}
      {/* ------------------------------------------------------------------- */}
      {activeView === 'evaluation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-4">
              <h3 className="text-base font-black text-[#131127] border-b border-[#F1EEFB] pb-2">
                Confusion Matrix Heatmap
              </h3>
              <div className="grid grid-cols-2 gap-3 p-4 bg-[#F8F7FC] rounded-2xl text-center">
                <div className="p-4 rounded-xl bg-[#EDF9F5] border border-[#A7F3D0]">
                  <div className="text-xs font-bold text-[#065F46]">True Negatives (TN)</div>
                  <div className="text-3xl font-black text-[#059669]">{cm.tn}</div>
                </div>
                <div className="p-4 rounded-xl bg-[#FFF5F4] border border-[#FECDD3]">
                  <div className="text-xs font-bold text-[#E11D48]">False Positives (FP)</div>
                  <div className="text-3xl font-black text-[#E11D48]">{cm.fp}</div>
                </div>
                <div className="p-4 rounded-xl bg-[#FFF5F4] border border-[#FECDD3]">
                  <div className="text-xs font-bold text-[#E11D48]">False Negatives (FN)</div>
                  <div className="text-3xl font-black text-[#E11D48]">{cm.fn}</div>
                </div>
                <div className="p-4 rounded-xl bg-[#EDF9F5] border border-[#A7F3D0]">
                  <div className="text-xs font-bold text-[#065F46]">True Positives (TP)</div>
                  <div className="text-3xl font-black text-[#059669]">{cm.tp}</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-4">
              <h3 className="text-base font-black text-[#131127] border-b border-[#F1EEFB] pb-2">
                Naïve Bayes Performance Metrics
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#F8F7FC] rounded-2xl flex justify-between items-center">
                  <span className="font-bold text-[#131127]">Test Accuracy:</span>
                  <span className="font-black text-[#059669]">{(metrics.accuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="p-3 bg-[#F8F7FC] rounded-2xl flex justify-between items-center">
                  <span className="font-bold text-[#131127]">Precision:</span>
                  <span className="font-black text-[#EC79B9]">{(metrics.precision * 100).toFixed(1)}%</span>
                </div>
                <div className="p-3 bg-[#F8F7FC] rounded-2xl flex justify-between items-center">
                  <span className="font-bold text-[#131127]">Recall (Sensitivity):</span>
                  <span className="font-black text-[#EC79B9]">{(metrics.recall * 100).toFixed(1)}%</span>
                </div>
                <div className="p-3 bg-[#F8F7FC] rounded-2xl flex justify-between items-center">
                  <span className="font-bold text-[#131127]">F1-Score:</span>
                  <span className="font-black text-[#56C9A5]">{metrics.f1_score}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* VIEW 3: GAUSSIAN PARAMETERS                                         */}
      {/* ------------------------------------------------------------------- */}
      {activeView === 'distributions' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-4">
            <h3 className="text-base font-black text-[#131127] border-b border-[#F1EEFB] pb-2">
              Gaussian Probability Parameters (Mean &amp; Standard Deviation)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8F7FC] text-[#8C87A8] font-bold">
                    <th className="p-3 rounded-l-xl">Feature</th>
                    <th className="p-3">Class 0 Mean (μ₀)</th>
                    <th className="p-3">Class 0 Std (σ₀)</th>
                    <th className="p-3">Class 1 Mean (μ₁)</th>
                    <th className="p-3 rounded-r-xl">Class 1 Std (σ₁)</th>
                  </tr>
                </thead>
                <tbody>
                  {params.map((row: any) => (
                    <tr key={row.feature} className="border-b border-[#F1EEFB]">
                      <td className="p-3 font-extrabold text-[#131127]">{row.label}</td>
                      <td className="p-3 font-semibold text-[#8C87A8]">{row.class_0_non_donors.mean} {row.unit}</td>
                      <td className="p-3 text-[#4E4B66]">{row.class_0_non_donors.std}</td>
                      <td className="p-3 font-bold text-[#DB2777]">{row.class_1_donors.mean} {row.unit}</td>
                      <td className="p-3 text-[#4E4B66]">{row.class_1_donors.std}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* VIEW 4: LIVE POSTERIOR PROBABILITY PREDICTOR                        */}
      {/* ------------------------------------------------------------------- */}
      {activeView === 'predict' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-4">
              <h3 className="text-sm font-black text-[#131127] border-b border-[#F1EEFB] pb-2">
                Donor Profile Estimator
              </h3>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[#131127]">
                  <span>Recency (months since last donation):</span>
                  <span className="text-[#EC79B9] font-black">{predRecency} months</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="74"
                  value={predRecency}
                  onChange={(e) => setPredRecency(parseInt(e.target.value))}
                  className="w-full accent-[#EC79B9] cursor-pointer"
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

              {/* Presets */}
              <div className="pt-2 space-y-1.5">
                <span className="text-[10px] font-bold text-[#8C87A8] uppercase">Quick Presets:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setPredRecency(2);
                      setPredFrequency(1);
                      setPredTime(2);
                    }}
                    className="p-2 rounded-xl text-xs font-bold bg-[#F8F7FC] hover:bg-[#FDF2F8] border border-[#ECE8F6] cursor-pointer"
                  >
                    1st Time
                  </button>
                  <button
                    onClick={() => {
                      setPredRecency(4);
                      setPredFrequency(6);
                      setPredTime(24);
                    }}
                    className="p-2 rounded-xl text-xs font-bold bg-[#F8F7FC] hover:bg-[#FDF2F8] border border-[#ECE8F6] cursor-pointer"
                  >
                    Regular
                  </button>
                  <button
                    onClick={() => {
                      setPredRecency(2);
                      setPredFrequency(20);
                      setPredTime(60);
                    }}
                    className="p-2 rounded-xl text-xs font-bold bg-[#F8F7FC] hover:bg-[#FDF2F8] border border-[#ECE8F6] cursor-pointer"
                  >
                    Super
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-[#ECE8F6] shadow-xs space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#F1EEFB] pb-3">
                  <h3 className="text-base font-black text-[#131127]">Posterior Probability Outcome P(C|X)</h3>
                  {predLoading && <RefreshCw className="w-4 h-4 animate-spin text-[#EC79B9]" />}
                </div>

                <div className="my-5 p-6 rounded-3xl bg-[#FDF2F8] border border-[#FBCFE8] text-center space-y-2">
                  <div className="text-xs font-bold text-[#DB2777] uppercase tracking-wider">
                    Predicted Outcome
                  </div>
                  <div className="text-3xl font-black text-[#131127]">{predResult?.prediction_label}</div>
                  <p className="text-xs font-bold text-[#EC79B9]">
                    Confidence: {predResult?.confidence_pct}%
                  </p>
                </div>
              </div>

              {/* Horizontal Probability Bars */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#131127]">Class Posterior Probabilities:</div>
                <div className="space-y-2">
                  {predResult?.probability_bars?.map((pb: any) => (
                    <div key={pb.class_name} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-[#4E4B66]">{pb.class_name}</span>
                        <span style={{ color: pb.color }}>{pb.percentage}%</span>
                      </div>
                      <div className="w-full bg-[#F8F7FC] h-3 rounded-full overflow-hidden border border-[#ECE8F6]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pb.percentage}%`, backgroundColor: pb.color }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
