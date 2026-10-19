import React, { useState } from 'react';
import {
  Sparkles,
  UserCheck,
  UserX,
  AlertTriangle,
  Activity,
  CheckCircle2,
  Clock,
  Droplet,
  Send,
  RefreshCw,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import type { PredictionPayload, PredictionResponse } from '../types';

interface PresetProfile {
  name: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  recency: number;
  frequency: number;
  monetary: number;
  time: number;
  description: string;
}

const PRESET_PROFILES: PresetProfile[] = [
  {
    name: 'Active Core Donor',
    badge: 'High Propensity',
    badgeBg: '#EDF9F5',
    badgeColor: '#0D9488',
    recency: 2,
    frequency: 10,
    monetary: 2500,
    time: 28,
    description: 'Donated 2 months ago, 10 lifetime donations over 28 months tenure.'
  },
  {
    name: 'Recent First-Timer',
    badge: 'Emerging Potential',
    badgeBg: '#F0F8FE',
    badgeColor: '#58B8F5',
    recency: 2,
    frequency: 1,
    monetary: 250,
    time: 2,
    description: 'First-time donor who participated in the most recent university drive.'
  },
  {
    name: 'Dormant Veteran',
    badge: 'Re-activation Needed',
    badgeBg: '#FEF9E7',
    badgeColor: '#B45309',
    recency: 26,
    frequency: 12,
    monetary: 3000,
    time: 72,
    description: '12 past donations, but has not participated in over 2 years.'
  },
  {
    name: 'Lapsed One-Time Donor',
    badge: 'Low Propensity',
    badgeBg: '#FFF5F4',
    badgeColor: '#FF786B',
    recency: 21,
    frequency: 1,
    monetary: 250,
    time: 21,
    description: 'Single donation nearly two years ago with zero follow-up.'
  }
];

export const DonorPredictionView: React.FC = () => {
  const [recency, setRecency] = useState<number>(2);
  const [frequency, setFrequency] = useState<number>(5);
  const [monetary, setMonetary] = useState<number>(1250);
  const [time, setTime] = useState<number>(24);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [clientErrors, setClientErrors] = useState<string[]>([]);

  // Automatically keep monetary aligned with frequency (250 c.c. / donation)
  const handleFrequencyChange = (val: number) => {
    setFrequency(val);
    setMonetary(val * 250);
  };

  const applyPreset = (p: PresetProfile) => {
    setRecency(p.recency);
    setFrequency(p.frequency);
    setMonetary(p.monetary);
    setTime(p.time);
    setResult(null);
    setClientErrors([]);
  };

  const validateInputs = (): boolean => {
    const errs: string[] = [];
    if (recency < 0 || recency > 120) errs.push('Recency must be between 0 and 120 months.');
    if (frequency < 1 || frequency > 100) errs.push('Frequency must be at least 1 donation.');
    if (monetary < 250 || monetary > 25000) errs.push('Monetary blood volume must be between 250 and 25,000 c.c.');
    if (time < recency) errs.push(`Time since first donation (${time}m) cannot be less than Recency (${recency}m).`);

    setClientErrors(errs);
    return errs.length === 0;
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    try {
      setLoading(true);
      const payload: PredictionPayload = {
        recency_months: Number(recency),
        frequency_times: Number(frequency),
        monetary_cc: Number(monetary),
        time_months: Number(time)
      };
      const response = await api.predictDonor(payload);
      setResult(response);
    } catch (err: any) {
      setClientErrors([err.message || 'Prediction failed.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-3">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-[#FDF2F8] text-[#EC79B9] rounded-2xl shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131127] tracking-tight">
              Interactive Donor Return Predictor
            </h1>
            <p className="text-xs sm:text-sm text-[#7E7A9B] font-medium">
              Input historical donor parameters to calculate calibrated return probability and CRM outreach guidance using the trained ML model.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Archetypes Bar */}
      <div className="bg-white p-6 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#131127] uppercase tracking-wider">
          <Clock className="w-4 h-4 text-[#7956E8]" />
          <span>Quick-Load Donor Archetypes (from Real Cohort Data)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_PROFILES.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p)}
              className="p-4 bg-[#F8F7FC] hover:bg-[#F5F3FF] border border-[#ECE8F6] hover:border-[#7956E8]/40 rounded-2xl text-left transition space-y-1.5 group card-hover"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#131127] text-xs group-hover:text-[#7956E8] transition">{p.name}</span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: p.badgeBg, color: p.badgeColor }}
                >
                  {p.badge}
                </span>
              </div>
              <p className="text-[11px] text-[#7E7A9B] leading-tight">{p.description}</p>
              <div className="text-[10px] font-mono text-[#7956E8] pt-1 font-semibold">
                R:{p.recency}m • F:{p.frequency} • M:{p.monetary}cc • T:{p.time}m
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form Column */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-6">
          <div className="border-b border-[#F1EEFB] pb-3.5">
            <h2 className="text-base font-extrabold text-[#131127]">Donor Historical Parameters</h2>
            <p className="text-xs text-[#7E7A9B]">Provide verified RFMT values for classification inference</p>
          </div>

          <form onSubmit={handlePredict} className="space-y-5">
            {/* Recency */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-[#131127] flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#7956E8]" />
                  <span>Recency (Months Since Last Donation)</span>
                </label>
                <span className="font-mono font-bold text-[#7956E8] bg-[#F5F3FF] px-2.5 py-0.5 rounded-lg border border-[#E9E4FC]">
                  {recency} months
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={60}
                value={recency}
                onChange={(e) => setRecency(Number(e.target.value))}
                className="w-full accent-[#7956E8]"
              />
              <div className="flex justify-between text-[10px] text-[#8C87A8]">
                <span>0m (Immediate)</span>
                <span>30m</span>
                <span>60m+ (Dormant)</span>
              </div>
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-[#131127] flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#FF786B]" />
                  <span>Frequency (Total Lifetime Donations)</span>
                </label>
                <span className="font-mono font-bold text-[#FF786B] bg-[#FFF5F4] px-2.5 py-0.5 rounded-lg border border-[#FFE4E1]">
                  {frequency} donations
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={40}
                value={frequency}
                onChange={(e) => handleFrequencyChange(Number(e.target.value))}
                className="w-full accent-[#FF786B]"
              />
              <div className="flex justify-between text-[10px] text-[#8C87A8]">
                <span>1 (First-Time)</span>
                <span>20</span>
                <span>40+ (Super Donor)</span>
              </div>
            </div>

            {/* Monetary (Blood Volume) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-[#131127] flex items-center space-x-1.5">
                  <Droplet className="w-3.5 h-3.5 text-[#58B8F5]" />
                  <span>Monetary (Total Blood Donated in c.c.)</span>
                </label>
                <span className="font-mono font-bold text-[#58B8F5] bg-[#F0F8FE] px-2.5 py-0.5 rounded-lg border border-[#BAE6FD]/40">
                  {monetary.toLocaleString()} c.c.
                </span>
              </div>
              <input
                type="number"
                min={250}
                max={25000}
                step={250}
                value={monetary}
                onChange={(e) => setMonetary(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs bg-[#F8F7FC] border border-[#ECE8F6] rounded-xl focus:ring-2 focus:ring-[#7956E8]/20 focus:border-[#7956E8] text-[#131127] font-medium"
              />
              <p className="text-[11px] text-[#8C87A8]">
                Auto-calculated as <strong>{frequency} × 250 c.c.</strong> (standard donation volume).
              </p>
            </div>

            {/* Time (Months Since First Donation) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-[#131127] flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#56C9A5]" />
                  <span>Time (Months Since First Donation / Donor Tenure)</span>
                </label>
                <span className="font-mono font-bold text-[#0D9488] bg-[#EDF9F5] px-2.5 py-0.5 rounded-lg border border-[#D1F5EA]">
                  {time} months
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={98}
                value={time}
                onChange={(e) => setTime(Number(e.target.value))}
                className="w-full accent-[#56C9A5]"
              />
              <div className="flex justify-between text-[10px] text-[#8C87A8]">
                <span>1m (New)</span>
                <span>48m (4 Years)</span>
                <span>98m (8+ Years)</span>
              </div>
            </div>

            {/* Client Validation Errors */}
            {clientErrors.length > 0 && (
              <div className="p-3 bg-[#FFF5F4] border border-[#FF786B]/30 rounded-2xl text-[#FF786B] text-xs space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#FF786B]" />
                  <span>Validation Notice</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 pl-1">
                  {clientErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#7956E8] hover:bg-[#6844D8] disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-[#7956E8]/25 transition flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Features...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Generate Donor Prediction</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results Column */}
        <div className="lg:col-span-6 space-y-6">
          {result && result.prediction ? (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-[#F1EEFB] pb-3.5">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#7E7A9B] uppercase tracking-wider">Model Inference Output</span>
                  <h3 className="font-extrabold text-[#131127] text-lg">{result.prediction.donor_category}</h3>
                </div>
                <span
                  className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold ${
                    result.prediction.class_code === 1
                      ? 'bg-[#FFF5F4] text-[#FF786B] border border-[#FFE4E1]'
                      : 'bg-[#F0F8FE] text-[#58B8F5] border border-[#BAE6FD]/40'
                  }`}
                >
                  {result.prediction.class_code === 1 ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                  <span>{result.prediction.class_label}</span>
                </span>
              </div>

              {/* Probability Meter */}
              <div className="space-y-2.5 p-5 bg-[#F8F7FC] rounded-2xl border border-[#ECE8F6]">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#131127]">Estimated Return Probability</span>
                  <span className="font-extrabold text-[#7956E8] text-base font-mono">
                    {result.prediction.probability_percentage}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3.5 bg-[#E9E4FC] rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      result.prediction.probability_percentage >= 50
                        ? 'bg-gradient-to-r from-[#7956E8] to-[#EC79B9]'
                        : 'bg-[#8C87A8]'
                    }`}
                    style={{ width: `${result.prediction.probability_percentage}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-[11px] text-[#7E7A9B] pt-1">
                  <span>Confidence: <strong className="text-[#131127]">{result.prediction.confidence_tier}</strong></span>
                  <span>Non-Return: {result.prediction.non_donation_probability}%</span>
                </div>
              </div>

              {/* CRM Outreach Advice */}
              <div className="p-5 bg-[#EDF9F5] border border-[#D1F5EA] rounded-2xl space-y-1.5 text-xs">
                <span className="font-bold text-[#0D9488] block flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#56C9A5]" />
                  <span>Clinical Outreach Recommendation</span>
                </span>
                <p className="text-[#131127] leading-relaxed pl-5.5">
                  {result.prediction.operational_recommendation}
                </p>
              </div>

              {/* Model Provenance */}
              <div className="text-[11px] text-[#7E7A9B] space-y-1">
                <p>
                  <strong className="text-[#131127]">Pipeline Model:</strong> {result.prediction.model_used} (Trained on 598 samples, evaluated on 150 test samples).
                </p>
                {result.monetary_consistency_note && (
                  <p className="text-[#78350F] bg-[#FEF9E7] p-2.5 rounded-xl border border-[#FDEFC2]">
                    {result.monetary_consistency_note}
                  </p>
                )}
              </div>

              {/* Limitations Disclaimer */}
              <div className="p-4 bg-[#F8F7FC] rounded-2xl text-[#7E7A9B] text-[11px] space-y-1 border border-[#ECE8F6]">
                <div className="font-bold text-[#131127] flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#7956E8]" />
                  <span>Academic &amp; Ethical Disclaimer</span>
                </div>
                <p className="leading-relaxed">
                  {result.disclaimer}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-dashed border-[#ECE8F6] text-center text-[#7E7A9B] space-y-3 min-h-[350px] flex flex-col items-center justify-center shadow-xs">
              <div className="p-4 bg-[#F5F3FF] rounded-2xl text-[#7956E8]">
                <Activity className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="font-extrabold text-[#131127] text-sm">Ready to Predict</h3>
                <p className="text-xs text-[#7E7A9B]">
                  Select a pre-loaded donor profile above or adjust the sliders, then click &quot;Generate Donor Prediction&quot;.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
