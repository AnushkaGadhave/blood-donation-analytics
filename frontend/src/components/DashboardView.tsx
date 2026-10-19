import React, { useEffect, useState } from 'react';
import {
  Users,
  Activity,
  Award,
  Clock,
  ArrowUpRight,
  Database,
  Sparkles,
  Layers,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { api } from '../services/api';
import type { DatasetOverview, ModelComparisonResponse, ActiveView } from '../types';

interface DashboardViewProps {
  onNavigate: (view: ActiveView) => void;
}

// Global Palette Colors: Sky Blue for Class 0, Coral Pop for Class 1
const CLASS_COLORS = ['#58B8F5', '#FF786B'];

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [overview, setOverview] = useState<DatasetOverview | null>(null);
  const [models, setModels] = useState<ModelComparisonResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetricView, setSelectedMetricView] = useState<'all' | 'recency' | 'frequency' | 'time'>('all');

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [overviewData, modelData] = await Promise.all([
          api.getDatasetOverview(),
          api.getModelComparison()
        ]);
        if (isMounted) {
          setOverview(overviewData);
          setModels(modelData);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load dashboard data.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <div className="w-10 h-10 border-4 border-[#E9E4FC] border-t-[#7956E8] rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-[#4E4B66]">Loading Blood Transfusion Analytics Dashboard...</p>
      </div>
    );
  }

  if (error || !overview || !models) {
    return (
      <div className="p-6 bg-[#FFF5F4] border border-[#FF786B]/30 rounded-3xl text-[#131127] space-y-3 shadow-sm">
        <div className="flex items-center space-x-2 font-bold text-[#FF786B]">
          <AlertCircle className="w-5 h-5" />
          <span>Error Loading Dashboard</span>
        </div>
        <p className="text-sm text-[#4E4B66]">{error || 'Could not retrieve dataset or model benchmarks.'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#7956E8] hover:bg-[#6844D8] text-white text-xs font-bold rounded-xl shadow-md transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const pieData = [
    { name: 'Did Not Donate (Class 0)', value: overview.class_distribution.negative_donors_count },
    { name: 'Donated March 2007 (Class 1)', value: overview.class_distribution.positive_donors_count }
  ];

  const rfmtAverages = [
    { name: 'Recency (m)', mean: overview.descriptive_statistics.recency_months.mean, median: overview.descriptive_statistics.recency_months.median },
    { name: 'Frequency (qty)', mean: overview.descriptive_statistics.frequency_times.mean, median: overview.descriptive_statistics.frequency_times.median },
    { name: 'Tenure (m/4)', mean: +(overview.descriptive_statistics.time_months.mean / 4).toFixed(1), median: +(overview.descriptive_statistics.time_months.median / 4).toFixed(1) }
  ];

  const topModel = models.models_comparison[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ========================================================================= */}
      {/* ROW 1: OVERVIEW PANELS (Side by side horizontal layout) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Larger Dataset Summary / Cohort Overview Panel (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-[#ECE8F6] shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#F5F3FF] border border-[#E9E4FC] rounded-full text-[#7956E8] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#7956E8]" />
                <span>UCI Transfusion Benchmark Cohort</span>
              </span>
              <span className="text-xs text-[#7E7A9B] hidden sm:inline">• Hsin-Chu City, Taiwan</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#131127] tracking-tight">
              Blood Donation Behaviour &amp; Return Prediction
            </h2>
            <p className="text-xs sm:text-sm text-[#7E7A9B] leading-relaxed">
              Empirical data mining, star schema warehousing, and calibrated machine learning classification on the 748-donor cohort (Yeh et al., 2008).
            </p>
          </div>

          {/* 4 Compact Summary Metric Cards in Horizontal Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {/* Total Donors */}
            <div className="p-3.5 bg-[#F5F3FF] rounded-2xl border border-[#E9E4FC] space-y-1.5 card-hover">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-[#7956E8] uppercase">Total Donors</span>
                <Users className="w-3.5 h-3.5 text-[#7956E8]" />
              </div>
              <p className="text-xl font-extrabold text-[#131127]">{overview.total_instances}</p>
              <p className="text-[10px] text-[#7E7A9B] truncate">100% Complete</p>
            </div>

            {/* Return Donor Rate */}
            <div className="p-3.5 bg-[#FFF5F4] rounded-2xl border border-[#FFE4E1] space-y-1.5 card-hover">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-[#FF786B] uppercase">Return Rate</span>
                <Activity className="w-3.5 h-3.5 text-[#FF786B]" />
              </div>
              <p className="text-xl font-extrabold text-[#FF786B]">{overview.class_distribution.positive_donors_pct}%</p>
              <p className="text-[10px] text-[#7E7A9B] truncate">{overview.class_distribution.positive_donors_count} donors</p>
            </div>

            {/* Median Recency */}
            <div className="p-3.5 bg-[#FEF9E7] rounded-2xl border border-[#FDEFC2] space-y-1.5 card-hover">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-[#B45309] uppercase">Med. Recency</span>
                <Clock className="w-3.5 h-3.5 text-[#B45309]" />
              </div>
              <p className="text-xl font-extrabold text-[#131127]">{overview.descriptive_statistics.recency_months.median}m</p>
              <p className="text-[10px] text-[#7E7A9B] truncate">Mean: {overview.descriptive_statistics.recency_months.mean}m</p>
            </div>

            {/* Top Classifier */}
            <div className="p-3.5 bg-[#EDF9F5] rounded-2xl border border-[#D1F5EA] space-y-1.5 card-hover">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-[#0D9488] uppercase">Top Model</span>
                <Award className="w-3.5 h-3.5 text-[#0D9488]" />
              </div>
              <p className="text-sm font-extrabold text-[#131127] truncate">Log. Regression</p>
              <p className="text-[10px] text-[#0D9488] font-bold truncate">F1: {topModel.metrics.f1_score.toFixed(3)}</p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              onClick={() => onNavigate('predict')}
              className="px-4 py-2 bg-[#7956E8] hover:bg-[#6844D8] text-white text-xs font-bold rounded-xl shadow-md shadow-[#7956E8]/20 transition flex items-center space-x-1.5"
            >
              <span>Test Live Inference</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('dataset')}
              className="px-4 py-2 bg-[#F8F7FC] hover:bg-[#F1EEFB] text-[#7956E8] border border-[#ECE8F6] text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Explore 748 Records</span>
            </button>
          </div>
        </div>

        {/* Right Panel: Donor Distribution & Class Balance (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#F1EEFB] pb-3">
            <div>
              <h3 className="text-base font-extrabold text-[#131127]">Target Class Balance</h3>
              <p className="text-xs text-[#7E7A9B]">March 2007 mobile campaign (3.2 : 1 Imbalance)</p>
            </div>
            <button
              onClick={() => onNavigate('behaviour')}
              className="text-xs font-bold text-[#7956E8] hover:text-[#6844D8] flex items-center space-x-1 transition"
            >
              <span>Details</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CLASS_COLORS[index % CLASS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} donors (${((Number(value) / 748) * 100).toFixed(1)}%)`, 'Count']}
                  contentStyle={{ backgroundColor: '#131127', borderRadius: '12px', color: '#fff', fontSize: '12px', border: '1px solid #7956E8' }}
                />
                <Legend verticalAlign="bottom" height={32} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1 text-center text-xs">
            <div className="p-2.5 bg-[#F0F8FE] rounded-2xl border border-[#BAE6FD]/40">
              <span className="text-[#58B8F5] font-bold block text-[10px] uppercase">Class 0 (Non-Donors)</span>
              <span className="font-extrabold text-[#131127] text-sm">{overview.class_distribution.negative_donors_count} (76.2%)</span>
            </div>
            <div className="p-2.5 bg-[#FFF5F4] rounded-2xl border border-[#FFE4E1]">
              <span className="text-[#FF786B] font-bold block text-[10px] uppercase">Class 1 (Return Donors)</span>
              <span className="font-extrabold text-[#131127] text-sm">{overview.class_distribution.positive_donors_count} (23.8%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 2: WIDE ANALYTICS PANEL (Full Width Multi-Metric Visualization) */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1EEFB] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[#7956E8]" />
              <h3 className="text-base font-extrabold text-[#131127]">RFMTC Empirical Attribute Distributions &amp; Central Tendency</h3>
            </div>
            <p className="text-xs text-[#7E7A9B]">Comparison of Mean vs Median highlighting positive right-skewness and super-donor clusters</p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center space-x-1.5 bg-[#F8F7FC] p-1 rounded-2xl border border-[#ECE8F6]">
            {[
              { id: 'all', label: 'All Attributes' },
              { id: 'recency', label: 'Recency (R)' },
              { id: 'frequency', label: 'Frequency (F)' },
              { id: 'time', label: 'Tenure (T)' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedMetricView(tab.id as any)}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition ${
                  selectedMetricView === tab.id
                    ? 'bg-[#7956E8] text-white shadow-xs'
                    : 'text-[#4E4B66] hover:text-[#131127]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Full-width Responsive Dual Chart */}
        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rfmtAverages} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECE8F6" />
              <XAxis dataKey="name" tick={{ fill: '#7E7A9B', fontSize: 12 }} axisLine={{ stroke: '#ECE8F6' }} />
              <YAxis tick={{ fill: '#7E7A9B', fontSize: 12 }} axisLine={{ stroke: '#ECE8F6' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#131127', borderRadius: '12px', color: '#fff', fontSize: '12px', border: '1px solid #7956E8' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="mean" name="Cohort Mean" fill="#7956E8" radius={[6, 6, 0, 0]} />
              <Bar dataKey="median" name="Cohort Median" fill="#FFD166" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-3.5 bg-[#F8F7FC] rounded-2xl border border-[#ECE8F6] text-xs text-[#4E4B66] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="leading-relaxed">
            <strong className="text-[#131127]">Empirical Takeaway:</strong> Across Recency, Frequency, and Tenure, the parametric mean significantly exceeds the median, proving right-skewness caused by a veteran core of repeat super-donors.
          </span>
          <button
            onClick={() => onNavigate('behaviour')}
            className="text-xs font-bold text-[#7956E8] hover:text-[#6844D8] shrink-0 underline"
          >
            Explore Bivariate Scatter &rarr;
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 3: DETAILED PANELS (Model Comparison + Behaviour Insights & Actions) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: 4 ML Models Leaderboard Table (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F1EEFB] pb-3">
            <div>
              <h3 className="text-base font-extrabold text-[#131127]">Classification Benchmark Leaderboard</h3>
              <p className="text-xs text-[#7E7A9B]">Stratified 20% holdout test evaluation (150 donors) with balanced weights</p>
            </div>
            <button
              onClick={() => onNavigate('models')}
              className="text-xs font-bold text-[#7956E8] hover:text-[#6844D8] flex items-center space-x-1 transition"
            >
              <span>Full Benchmark</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F8F7FC] text-[#7E7A9B] text-xs font-bold uppercase tracking-wider border-b border-[#ECE8F6]">
                <tr>
                  <th className="py-2.5 px-3">Classifier</th>
                  <th className="py-2.5 px-2 text-center">Accuracy</th>
                  <th className="py-2.5 px-2 text-center">Recall (Sens.)</th>
                  <th className="py-2.5 px-2 text-center">F1-Score</th>
                  <th className="py-2.5 px-2 text-center">ROC-AUC</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EEFB]">
                {models.models_comparison.map((m, idx) => {
                  const isBest = m.model_name === models.best_model_name;
                  return (
                    <tr key={m.model_name} className={isBest ? 'bg-[#F5F3FF]/70' : 'hover:bg-[#F8F7FC] transition'}>
                      <td className="py-3 px-3 font-bold text-[#131127] flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-[#ECE8F6] text-[#7956E8] text-[10px] font-extrabold inline-flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="truncate">{m.model_name}</span>
                      </td>
                      <td className="py-3 px-2 text-center text-[#4E4B66]">{(m.metrics.accuracy * 100).toFixed(1)}%</td>
                      <td className="py-3 px-2 text-center font-bold text-[#56C9A5]">{(m.metrics.recall * 100).toFixed(1)}%</td>
                      <td className="py-3 px-2 text-center font-extrabold text-[#131127]">{m.metrics.f1_score.toFixed(3)}</td>
                      <td className="py-3 px-2 text-center font-extrabold text-[#7956E8]">{m.metrics.roc_auc.toFixed(3)}</td>
                      <td className="py-3 px-3 text-right">
                        {isBest ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#7956E8] text-white shadow-xs">
                            Best Model
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-[#7956E8] bg-[#F1EEFB]">
                            Evaluated
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel: Behaviour Insights & Quick Project Modules (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-4 flex flex-col justify-between">
          <div className="border-b border-[#F1EEFB] pb-3">
            <h3 className="text-base font-extrabold text-[#131127]">Key Behaviour Insights &amp; Modules</h3>
            <p className="text-xs text-[#7E7A9B]">Core findings from EDA, clustering &amp; data mining</p>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 bg-[#FFF5F4] rounded-2xl border border-[#FFE4E1] flex items-start space-x-2.5 text-xs">
              <div className="p-1.5 bg-[#FF786B] text-white rounded-lg shrink-0 mt-0.5">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong className="text-[#FF786B] block">Recency Sensitivity</strong>
                <span className="text-[#131127] text-[11px]">Donors with Recency &lt; 4 months exhibit 68%+ return probability compared to &lt; 10% for dormant donors.</span>
              </div>
            </div>

            <div className="p-3 bg-[#EDF9F5] rounded-2xl border border-[#D1F5EA] flex items-start space-x-2.5 text-xs">
              <div className="p-1.5 bg-[#56C9A5] text-white rounded-lg shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong className="text-[#0D9488] block">Collinear Volume Invariant</strong>
                <span className="text-[#131127] text-[11px]">Monetary cc strictly equals Frequency * 250 c.c. (Pearson r = 1.0000). Every donation is 250 c.c.</span>
              </div>
            </div>
          </div>

          {/* Quick Module Navigation Links */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div
              onClick={() => onNavigate('labs')}
              className="p-3 bg-[#F5F3FF] hover:bg-[#EAE4FC] border border-[#E9E4FC] rounded-2xl text-left transition cursor-pointer space-y-1 group"
            >
              <div className="flex items-center justify-between text-[#7956E8]">
                <Layers className="w-4 h-4" />
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-0.5" />
              </div>
              <span className="font-extrabold text-[#131127] text-xs block">DWDM Labs (1–9)</span>
              <p className="text-[10px] text-[#7E7A9B]">All 9 academic experiments</p>
            </div>

            <div
              onClick={() => onNavigate('predict')}
              className="p-3 bg-[#FDF2F8] hover:bg-[#FCE7F3] border border-[#FBCFE8] rounded-2xl text-left transition cursor-pointer space-y-1 group"
            >
              <div className="flex items-center justify-between text-[#EC79B9]">
                <Sparkles className="w-4 h-4" />
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-0.5" />
              </div>
              <span className="font-extrabold text-[#131127] text-xs block">Live Predictor</span>
              <p className="text-[10px] text-[#7E7A9B]">Calibrated ML probabilities</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
