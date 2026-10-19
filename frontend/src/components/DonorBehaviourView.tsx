import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend
} from 'recharts';
import { api } from '../services/api';
import type { BehaviourAnalyticsSummary } from '../types';

export const DonorBehaviourView: React.FC = () => {
  const [summary, setSummary] = useState<BehaviourAnalyticsSummary | null>(null);
  const [activeFeatureTab, setActiveFeatureTab] = useState<string>('recency_months');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const data = await api.getAnalyticsSummary();
        setSummary(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load donor behaviour analytics.');
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <div className="w-10 h-10 border-4 border-[#E9E4FC] border-t-[#7956E8] rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-[#4E4B66]">Calculating Donor Behaviour Analytics...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-6 bg-[#FFF5F4] border border-[#FF786B]/30 rounded-2xl text-[#131127] space-y-3 shadow-sm">
        <div className="flex items-center space-x-2 font-bold text-[#FF786B]">
          <AlertCircle className="w-5 h-5" />
          <span>Error Loading Donor Behaviour Analytics</span>
        </div>
        <p className="text-sm text-[#4E4B66]">{error || 'Could not calculate analytical summary.'}</p>
      </div>
    );
  }

  const activeDist = summary.univariate_distributions[activeFeatureTab];

  // Format scatter points for Recharts (separate donors vs non-donors)
  const donorsScatter = summary.scatter_relations.filter((p) => p.donated === 1);
  const nonDonorsScatter = summary.scatter_relations.filter((p) => p.donated === 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-3">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-[#EDF9F5] text-[#56C9A5] rounded-2xl shadow-xs">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131127] tracking-tight">
              Donor Behaviour &amp; Empirical Analysis
            </h1>
            <p className="text-xs sm:text-sm text-[#7E7A9B] font-medium">
              Quantitative distributions, bivariate cross-class comparisons, and correlation structures across the 748 donor cohort.
            </p>
          </div>
        </div>
      </div>

      {/* Key Behavioural Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {summary.key_insights.map((insight, idx) => (
          <div key={idx} className="p-5 bg-white rounded-3xl border border-[#ECE8F6] shadow-xs space-y-2 card-hover">
            <div className="flex items-center space-x-2.5 font-extrabold text-[#131127] text-sm">
              <div className="p-1.5 bg-[#F5F3FF] rounded-lg text-[#7956E8]">
                <Sparkles className="w-4 h-4 shrink-0" />
              </div>
              <span>{insight.title}</span>
            </div>
            <p className="text-xs text-[#4E4B66] leading-relaxed pl-8">{insight.detail}</p>
          </div>
        ))}
      </div>

      {/* Section 1: Univariate Feature Distributions */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1EEFB] pb-4">
          <div>
            <h2 className="text-base font-extrabold text-[#131127]">Univariate Feature Distributions</h2>
            <p className="text-xs text-[#7E7A9B]">Select an attribute to inspect histogram bin frequencies and skewness metrics</p>
          </div>

          {/* Feature Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-[#F8F7FC] p-1.5 rounded-2xl border border-[#ECE8F6]">
            {[
              { id: 'recency_months', label: 'Recency (R)' },
              { id: 'frequency_times', label: 'Frequency (F)' },
              { id: 'monetary_cc', label: 'Monetary (M)' },
              { id: 'time_months', label: 'Time (T)' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFeatureTab(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
                  activeFeatureTab === tab.id
                    ? 'bg-[#7956E8] text-white shadow-xs'
                    : 'text-[#4E4B66] hover:text-[#131127] hover:bg-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Feature Histogram & Stats */}
        {activeDist && (
          <div className="space-y-5">
            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
              <div className="p-3 bg-[#F8F7FC] rounded-2xl border border-[#ECE8F6]">
                <span className="text-[#7E7A9B] block font-medium">Mean</span>
                <span className="font-extrabold text-[#131127] text-sm">
                  {activeDist.mean} {activeDist.unit}
                </span>
              </div>
              <div className="p-3 bg-[#F8F7FC] rounded-2xl border border-[#ECE8F6]">
                <span className="text-[#7E7A9B] block font-medium">Median</span>
                <span className="font-extrabold text-[#131127] text-sm">
                  {activeDist.median} {activeDist.unit}
                </span>
              </div>
              <div className="p-3 bg-[#F8F7FC] rounded-2xl border border-[#ECE8F6]">
                <span className="text-[#7E7A9B] block font-medium">Std Deviation</span>
                <span className="font-extrabold text-[#131127] text-sm">
                  {activeDist.std}
                </span>
              </div>
              <div className="p-3 bg-[#F8F7FC] rounded-2xl border border-[#ECE8F6]">
                <span className="text-[#7E7A9B] block font-medium">Min – Max</span>
                <span className="font-extrabold text-[#131127] text-sm">
                  {activeDist.min} – {activeDist.max}
                </span>
              </div>
              <div className="p-3 bg-[#FEF9E7] rounded-2xl border border-[#FDEFC2]">
                <span className="text-[#B45309] block font-bold">Skewness</span>
                <span className="font-extrabold text-[#78350F] text-sm">
                  +{activeDist.skewness} (Right-skewed)
                </span>
              </div>
            </div>

            {/* Histogram Chart */}
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeDist.bins} margin={{ top: 15, right: 20, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECE8F6" />
                  <XAxis
                    dataKey="bin_range"
                    angle={-20}
                    textAnchor="end"
                    tick={{ fill: '#7E7A9B', fontSize: 11 }}
                    axisLine={{ stroke: '#ECE8F6' }}
                    interval={0}
                  />
                  <YAxis tick={{ fill: '#7E7A9B', fontSize: 11 }} axisLine={{ stroke: '#ECE8F6' }} />
                  <Tooltip
                    formatter={(val: any) => [`${val} donors (${((Number(val) / 748) * 100).toFixed(1)}%)`, 'Frequency']}
                    contentStyle={{ backgroundColor: '#131127', borderRadius: '12px', color: '#fff', fontSize: '12px', border: '1px solid #7956E8' }}
                  />
                  <Bar dataKey="count" name="Donor Count" fill="#7956E8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Cross-Class Comparison (Y=0 vs Y=1) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-4">
        <div className="border-b border-[#F1EEFB] pb-3.5">
          <h2 className="text-base font-extrabold text-[#131127]">Bivariate Class Comparisons (Donors vs Non-Donors)</h2>
          <p className="text-xs text-[#7E7A9B]">
            Comparing behavioral statistics between March 2007 return donors (Y=1) and non-donors (Y=0)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.class_comparisons.features_comparison.map((fc) => (
            <div key={fc.feature} className="p-5 bg-[#F8F7FC] rounded-2xl border border-[#ECE8F6] space-y-3 card-hover">
              <div className="font-extrabold text-[#131127] text-sm border-b border-[#ECE8F6] pb-2">
                {fc.label}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center bg-[#FFF5F4] p-2.5 rounded-xl border border-[#FFE4E1]">
                  <span className="font-bold text-[#FF786B]">Class 1 (Donated):</span>
                  <span className="font-extrabold text-[#131127] font-mono">Mean: {fc.donors_y1.mean}</span>
                </div>
                <div className="flex justify-between items-center bg-[#F0F8FE] p-2.5 rounded-xl border border-[#BAE6FD]/40">
                  <span className="font-bold text-[#58B8F5]">Class 0 (Did Not):</span>
                  <span className="font-semibold text-[#131127] font-mono">Mean: {fc.non_donors_y0.mean}</span>
                </div>
                <div className="flex justify-between items-center pt-1 text-[#7E7A9B] font-medium">
                  <span>Relative Delta:</span>
                  <span
                    className={`font-extrabold font-mono ${
                      fc.relative_change_pct < 0 ? 'text-[#56C9A5]' : 'text-[#7956E8]'
                    }`}
                  >
                    {fc.relative_change_pct > 0 ? `+${fc.relative_change_pct}%` : `${fc.relative_change_pct}%`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Bivariate Scatter Relations & Correlation Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scatter: Recency vs Frequency */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-4">
          <div className="border-b border-[#F1EEFB] pb-3.5">
            <h2 className="text-base font-extrabold text-[#131127]">Bivariate Scatter: Recency vs Frequency</h2>
            <p className="text-xs text-[#7E7A9B]">Distribution of all 748 donor instances colored by March 2007 outcome</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECE8F6" />
                <XAxis
                  type="number"
                  dataKey="recency"
                  name="Recency (months)"
                  unit="m"
                  tick={{ fill: '#7E7A9B', fontSize: 11 }}
                  axisLine={{ stroke: '#ECE8F6' }}
                />
                <YAxis
                  type="number"
                  dataKey="frequency"
                  name="Frequency"
                  tick={{ fill: '#7E7A9B', fontSize: 11 }}
                  axisLine={{ stroke: '#ECE8F6' }}
                />
                <ZAxis range={[24, 36]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#131127', borderRadius: '12px', color: '#fff', fontSize: '12px', border: '1px solid #7956E8' }}
                />
                <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '12px' }} />
                <Scatter name="Did Not Donate (Class 0)" data={nonDonorsScatter} fill="#58B8F5" fillOpacity={0.65} />
                <Scatter name="Donated March 2007 (Class 1)" data={donorsScatter} fill="#FF786B" fillOpacity={0.9} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-[#4E4B66] bg-[#F8F7FC] p-3 rounded-2xl border border-[#ECE8F6]">
            <strong className="text-[#131127]">Observation:</strong> Return donors (coral dots) are overwhelmingly concentrated in the low recency (&lt; 10m) and medium-to-high frequency (&gt; 4) zone.
          </p>
        </div>

        {/* Correlation Heatmap Table */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-4">
          <div className="border-b border-[#F1EEFB] pb-3.5">
            <h2 className="text-base font-extrabold text-[#131127]">Pearson Correlation Matrix</h2>
            <p className="text-xs text-[#7E7A9B]">Linear feature dependencies and target associations</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs font-mono">
              <thead className="bg-[#F8F7FC] text-[#7E7A9B] font-sans font-bold">
                <tr>
                  <th className="py-2.5 px-2 text-left">Feature</th>
                  <th className="py-2.5 px-1">R</th>
                  <th className="py-2.5 px-1">F</th>
                  <th className="py-2.5 px-1">M</th>
                  <th className="py-2.5 px-1">T</th>
                  <th className="py-2.5 px-1 text-[#7956E8] font-extrabold">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EEFB]">
                {summary.correlation_matrix.pearson_matrix.map((row) => (
                  <tr key={String(row.feature)}>
                    <td className="py-2.5 px-2 text-left font-sans font-bold text-[#131127] text-xs">
                      {String(row.label)}
                    </td>
                    {['recency_months', 'frequency_times', 'monetary_cc', 'time_months', 'donated_march_2007'].map((c) => {
                      const val = Number(row[c]);
                      const isTarget = c === 'donated_march_2007';
                      const isCollinear = (row.feature === 'frequency_times' && c === 'monetary_cc') || (row.feature === 'monetary_cc' && c === 'frequency_times');
                      return (
                        <td
                          key={c}
                          className={`py-2 px-1 font-bold rounded-lg ${
                            isCollinear
                              ? 'bg-[#FEF9E7] text-[#B45309]'
                              : isTarget && val < 0
                              ? 'bg-[#FFF5F4] text-[#FF786B]'
                              : isTarget && val > 0 && val < 1
                              ? 'bg-[#EDF9F5] text-[#0D9488]'
                              : val === 1
                              ? 'text-[#8C87A8] font-normal'
                              : 'text-[#131127]'
                          }`}
                        >
                          {val.toFixed(3)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[#FEF9E7] rounded-2xl border border-[#FDEFC2] text-xs text-[#78350F] space-y-1">
            <div className="font-bold flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-[#B45309]" />
              <span>Collinearity Note</span>
            </div>
            <p className="text-[11px] leading-relaxed">{summary.correlation_matrix.collinearity_note}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
