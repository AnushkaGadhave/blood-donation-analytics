import React, { useState, useEffect } from 'react';
import {
  Award,
  RefreshCw,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { api } from '../services/api';
import type { ModelComparisonResponse, ClassifierBenchmark } from '../types';

export const ModelComparisonView: React.FC = () => {
  const [data, setData] = useState<ModelComparisonResponse | null>(null);
  const [selectedModelIdx, setSelectedModelIdx] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadModels() {
      try {
        setLoading(true);
        const res = await api.getModelComparison();
        setData(res);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load model comparison.');
      } finally {
        setLoading(false);
      }
    }
    loadModels();
  }, []);

  const handleRetrain = async () => {
    try {
      setRetraining(true);
      const res = await api.retrainModels();
      setData(res);
      setSelectedModelIdx(0);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to retrain models.');
    } finally {
      setRetraining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <div className="w-10 h-10 border-4 border-[#E9E4FC] border-t-[#7956E8] rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-[#4E4B66]">Benchmarking 4 Classification Models on UCI Holdout...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-[#FFF5F4] border border-[#FF786B]/30 rounded-2xl text-[#131127] space-y-3 shadow-sm">
        <div className="flex items-center space-x-2 font-bold text-[#FF786B]">
          <AlertCircle className="w-5 h-5" />
          <span>Error Loading Model Benchmarks</span>
        </div>
        <p className="text-sm text-[#4E4B66]">{error || 'Could not evaluate models.'}</p>
        <button
          onClick={handleRetrain}
          className="px-4 py-2 bg-[#7956E8] hover:bg-[#6844D8] text-white text-xs font-bold rounded-xl shadow-md shadow-[#7956E8]/20 transition"
        >
          Retry Training
        </button>
      </div>
    );
  }

  const selectedModel = data.models_comparison[selectedModelIdx] || data.models_comparison[0];
  const cm = selectedModel.confusion_matrix;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header with Retrain Button */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-[#FFF5F4] text-[#FF786B] rounded-2xl shadow-xs">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131127] tracking-tight">
                Machine Learning Model Comparison
              </h1>
              <p className="text-xs sm:text-sm text-[#7E7A9B] font-medium">
                Rigorous evaluation across 4 classifiers on a stratified 20% test holdout (150 donors) with balanced class weights.
              </p>
            </div>
          </div>
          <button
            onClick={handleRetrain}
            disabled={retraining}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#7956E8] hover:bg-[#6844D8] disabled:opacity-50 text-white text-xs font-bold rounded-2xl transition shadow-md shadow-[#7956E8]/20 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
            <span>{retraining ? 'Retraining...' : 'Retrain All Models'}</span>
          </button>
        </div>

        {/* Dataset Split Protocol */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
          <div className="p-3.5 bg-[#F8F7FC] rounded-2xl border border-[#ECE8F6]">
            <span className="text-[#7E7A9B] block font-medium">Training Set (80%)</span>
            <span className="font-extrabold text-[#131127] text-sm">{data.dataset_split.train_records} Donors</span>
            <span className="text-[#8C87A8] block text-[11px]">{data.dataset_split.train_positives} Donors / {data.dataset_split.train_negatives} Non-donors</span>
          </div>
          <div className="p-3.5 bg-[#F8F7FC] rounded-2xl border border-[#ECE8F6]">
            <span className="text-[#7E7A9B] block font-medium">Testing Set (20%)</span>
            <span className="font-extrabold text-[#131127] text-sm">{data.dataset_split.test_records} Donors</span>
            <span className="text-[#8C87A8] block text-[11px]">{data.dataset_split.test_positives} Donors / {data.dataset_split.test_negatives} Non-donors</span>
          </div>
          <div className="p-3.5 bg-[#EDF9F5] rounded-2xl border border-[#D1F5EA]">
            <span className="text-[#0D9488] block font-bold">Data Leakage Guard</span>
            <span className="font-extrabold text-[#0D9488] text-sm flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Strictly Prevented</span>
            </span>
            <span className="text-[#0D9488] block text-[11px]">Scaler fit only on X_train</span>
          </div>
          <div className="p-3.5 bg-[#F5F3FF] rounded-2xl border border-[#E9E4FC]">
            <span className="text-[#7956E8] block font-bold">Recommended Model</span>
            <span className="font-extrabold text-[#7956E8] text-sm">{data.best_model_name}</span>
            <span className="text-[#7956E8] block text-[11px]">Best F1-Score &amp; ROC-AUC</span>
          </div>
        </div>
      </div>

      {/* Comprehensive Benchmark Comparison Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-4">
        <div className="border-b border-[#F1EEFB] pb-3.5">
          <h2 className="text-base font-extrabold text-[#131127]">Classifier Evaluation Metrics Table</h2>
          <p className="text-xs text-[#7E7A9B]">Sorted by F1-Score (Primary metric for imbalanced donor recruitment)</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8F7FC] text-[#7E7A9B] text-xs font-bold uppercase tracking-wider border-b border-[#ECE8F6]">
              <tr>
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-3 text-center">Accuracy</th>
                <th className="py-3 px-3 text-center">Balanced Acc</th>
                <th className="py-3 px-3 text-center">Precision (Y=1)</th>
                <th className="py-3 px-3 text-center">Recall / Sensitivity</th>
                <th className="py-3 px-3 text-center">Specificity</th>
                <th className="py-3 px-3 text-center">F1-Score</th>
                <th className="py-3 px-3 text-center">ROC-AUC</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1EEFB]">
              {data.models_comparison.map((m: ClassifierBenchmark, idx: number) => {
                const isSelected = idx === selectedModelIdx;
                const isBest = m.model_name === data.best_model_name;
                return (
                  <tr
                    key={m.model_name}
                    onClick={() => setSelectedModelIdx(idx)}
                    className={`cursor-pointer transition ${
                      isSelected
                        ? 'bg-[#F5F3FF]/80 font-semibold'
                        : 'hover:bg-[#F8F7FC]'
                    }`}
                  >
                    <td className="py-3.5 px-4 text-[#131127] flex items-center space-x-2.5">
                      <span
                        className={`w-6 h-6 rounded-full text-xs font-extrabold inline-flex items-center justify-center ${
                          isBest ? 'bg-[#7956E8] text-white' : 'bg-[#ECE8F6] text-[#7956E8]'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="font-extrabold">{m.model_name}</span>
                    </td>
                    <td className="py-3.5 px-3 text-center text-[#4E4B66]">{(m.metrics.accuracy * 100).toFixed(1)}%</td>
                    <td className="py-3.5 px-3 text-center text-[#4E4B66]">{(m.metrics.balanced_accuracy * 100).toFixed(1)}%</td>
                    <td className="py-3.5 px-3 text-center text-[#4E4B66]">{(m.metrics.precision * 100).toFixed(1)}%</td>
                    <td className="py-3.5 px-3 text-center font-bold text-[#56C9A5]">{(m.metrics.recall * 100).toFixed(1)}%</td>
                    <td className="py-3.5 px-3 text-center text-[#4E4B66]">{(m.metrics.specificity * 100).toFixed(1)}%</td>
                    <td className="py-3.5 px-3 text-center font-extrabold text-[#131127]">{m.metrics.f1_score.toFixed(4)}</td>
                    <td className="py-3.5 px-3 text-center font-extrabold text-[#7956E8]">{m.metrics.roc_auc.toFixed(4)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedModelIdx(idx);
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                          isSelected
                            ? 'bg-[#7956E8] text-white shadow-xs'
                            : 'bg-[#F8F7FC] text-[#7956E8] hover:bg-[#F1EEFB]'
                        }`}
                      >
                        {isSelected ? 'Active' : 'Select'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep-Dive on Selected Model: Confusion Matrix + ROC Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Confusion Matrix Card */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-4">
          <div className="border-b border-[#F1EEFB] pb-3.5">
            <h2 className="text-base font-extrabold text-[#131127]">
              Confusion Matrix: {selectedModel.model_name}
            </h2>
            <p className="text-xs text-[#7E7A9B]">Breakdown of 150 test instances (36 Actual Donors, 114 Non-Donors)</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            {/* True Negative */}
            <div className="p-4 bg-[#EDF9F5] rounded-2xl border border-[#D1F5EA] space-y-1">
              <span className="text-[11px] font-bold text-[#0D9488] uppercase block">True Negatives (TN)</span>
              <p className="text-2xl font-extrabold text-[#131127]">{cm.true_negatives}</p>
              <p className="text-[11px] text-[#0D9488]">Correctly predicted non-donors</p>
            </div>

            {/* False Positive */}
            <div className="p-4 bg-[#FEF9E7] rounded-2xl border border-[#FDEFC2] space-y-1">
              <span className="text-[11px] font-bold text-[#B45309] uppercase block">False Positives (FP)</span>
              <p className="text-2xl font-extrabold text-[#131127]">{cm.false_positives}</p>
              <p className="text-[11px] text-[#B45309]">Unnecessary contact outreach</p>
            </div>

            {/* False Negative */}
            <div className="p-4 bg-[#FFF5F4] rounded-2xl border border-[#FFE4E1] space-y-1">
              <span className="text-[11px] font-bold text-[#FF786B] uppercase block">False Negatives (FN)</span>
              <p className="text-2xl font-extrabold text-[#FF786B]">{cm.false_negatives}</p>
              <p className="text-[11px] text-[#FF786B]">Missed potential blood donors</p>
            </div>

            {/* True Positive */}
            <div className="p-4 bg-[#EDF9F5] rounded-2xl border border-[#D1F5EA] space-y-1">
              <span className="text-[11px] font-bold text-[#0D9488] uppercase block">True Positives (TP)</span>
              <p className="text-2xl font-extrabold text-[#131127]">{cm.true_positives}</p>
              <p className="text-[11px] text-[#0D9488]">Successfully recruited donors</p>
            </div>
          </div>

          <div className="p-3 bg-[#F8F7FC] rounded-2xl text-xs text-[#4E4B66] space-y-1 border border-[#ECE8F6]">
            <span className="font-bold text-[#131127] block">Model Hyperparameters:</span>
            <pre className="font-mono text-[11px] text-[#7956E8] overflow-x-auto">
              {JSON.stringify(selectedModel.hyperparameters, null, 2)}
            </pre>
          </div>
        </div>

        {/* ROC and PR Curves */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-4">
          <div className="border-b border-[#F1EEFB] pb-3.5">
            <h2 className="text-base font-extrabold text-[#131127]">
              Receiver Operating Characteristic (ROC Curve)
            </h2>
            <p className="text-xs text-[#7E7A9B]">True Positive Rate vs False Positive Rate (AUC = {selectedModel.metrics.roc_auc})</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedModel.roc_curve} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECE8F6" />
                <XAxis dataKey="fpr" name="False Positive Rate" unit="" tick={{ fill: '#7E7A9B', fontSize: 11 }} axisLine={{ stroke: '#ECE8F6' }} />
                <YAxis dataKey="tpr" name="True Positive Rate" unit="" tick={{ fill: '#7E7A9B', fontSize: 11 }} axisLine={{ stroke: '#ECE8F6' }} domain={[0, 1]} />
                <Tooltip
                  formatter={(val: any) => [Number(val).toFixed(3), 'Rate']}
                  contentStyle={{ backgroundColor: '#131127', borderRadius: '12px', color: '#fff', fontSize: '12px', border: '1px solid #7956E8' }}
                />
                <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="tpr"
                  name={`${selectedModel.model_name} (AUC: ${selectedModel.metrics.roc_auc})`}
                  stroke="#7956E8"
                  strokeWidth={3}
                  dot={{ r: 3.5, fill: '#7956E8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-[#4E4B66] bg-[#F8F7FC] p-3 rounded-2xl border border-[#ECE8F6]">
            <strong className="text-[#131127]">Clinical Operational Trade-Off:</strong> In mobile blood drive coordination, missing a willing donor (False Negative) is substantially costlier than sending an SMS invitation to a non-attending donor (False Positive). Balanced class weighting achieves over <strong className="text-[#56C9A5]">{(selectedModel.metrics.recall * 100).toFixed(1)}% Recall</strong>.
          </p>
        </div>
      </div>

      {/* Feature Importance Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-4">
        <div className="border-b border-[#F1EEFB] pb-3.5">
          <h2 className="text-base font-extrabold text-[#131127]">Global Feature Importance Ranking ({data.best_model_name})</h2>
          <p className="text-xs text-[#7E7A9B]">Relative contribution of donor attributes in determining return likelihood</p>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.feature_importance}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ECE8F6" />
              <XAxis type="number" tick={{ fill: '#7E7A9B', fontSize: 11 }} axisLine={{ stroke: '#ECE8F6' }} />
              <YAxis
                type="category"
                dataKey="feature"
                tick={{ fill: '#131127', fontSize: 12, fontWeight: 700 }}
                axisLine={{ stroke: '#ECE8F6' }}
              />
              <Tooltip
                formatter={(val: any) => [`${(Number(val) * 100).toFixed(1)}%`, 'Contribution Weight']}
                contentStyle={{ backgroundColor: '#131127', borderRadius: '12px', color: '#fff', fontSize: '12px', border: '1px solid #7956E8' }}
              />
              <Bar dataKey="importance" fill="#7956E8" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
