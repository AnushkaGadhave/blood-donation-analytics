import React from 'react';
import {
  Info,
  ExternalLink,
  BookOpen,
  ShieldCheck,
  Cpu,
  HeartHandshake
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-3">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-[#F0F8FE] text-[#58B8F5] rounded-2xl shadow-xs">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131127] tracking-tight">About the Project</h1>
            <p className="text-xs sm:text-sm text-[#7E7A9B] font-medium">
              Data Warehousing &amp; Data Mining Mini-Project: Blood Donation Analytics &amp; Donor Return Prediction
            </p>
          </div>
        </div>
      </div>

      {/* Problem Statement & Background */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-4 text-xs sm:text-sm text-[#4E4B66] leading-relaxed card-hover">
        <div className="border-b border-[#F1EEFB] pb-3">
          <h2 className="text-base font-extrabold text-[#131127] flex items-center space-x-2.5">
            <div className="p-1.5 bg-[#FFF5F4] text-[#FF786B] rounded-lg">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <span>Problem Statement &amp; Clinical Motivation</span>
          </h2>
        </div>
        <p>
          Blood transfusion services constitute a vital pillar of modern healthcare infrastructure. Maintaining adequate, safe, and continuous supplies of red blood cells and components requires proactive recruitment of voluntary blood donors. Because whole blood has a limited shelf life (typically 35–42 days), transfusion services must operate regular mobile collection drives.
        </p>
        <p>
          A central operational challenge is predicting which past donors are likely to donate again during upcoming mobile collection visits. Unfocused mass communication generates low return yields and incurs unnecessary contact costs, whereas targeted, data-driven candidate prioritization significantly optimizes outreach campaigns.
        </p>
      </div>

      {/* Dataset Provenance & Citation */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-4 text-xs sm:text-sm text-[#4E4B66] leading-relaxed card-hover">
        <div className="border-b border-[#F1EEFB] pb-3">
          <h2 className="text-base font-extrabold text-[#131127] flex items-center space-x-2.5">
            <div className="p-1.5 bg-[#F5F3FF] text-[#7956E8] rounded-lg">
              <BookOpen className="w-4 h-4" />
            </div>
            <span>Dataset Citation &amp; Study Methodology</span>
          </h2>
        </div>
        <p>
          This project exclusively utilizes the <strong>Blood Transfusion Service Center Dataset</strong> from the <strong>UCI Machine Learning Repository</strong>, originally contributed by Prof. I-Cheng Yeh (Chung-Hua University, Taiwan).
        </p>

        <div className="p-4 bg-[#F8F7FC] rounded-2xl border border-[#ECE8F6] font-mono text-xs text-[#131127] space-y-1">
          <p className="font-bold text-[#7956E8] font-sans">Official Primary Reference:</p>
          <p>
            Yeh, I-Cheng, Yang, King-Jang, and Ting, Tao-Ming, &quot;Knowledge discovery on RFM model using Bernoulli sequence,&quot; <em>Expert Systems with Applications</em>, Vol. 36, No. 4, pp. 7715–7723, 2008.
          </p>
          <p className="text-[#8C87A8] text-[11px] pt-1">
            DOI: 10.1016/j.eswa.2008.07.018 • UCI Dataset ID: 176
          </p>
        </div>

        <a
          href="https://archive.ics.uci.edu/dataset/176/blood+transfusion+service+center"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#7956E8] hover:text-[#6844D8] transition"
        >
          <span>Visit Official UCI Dataset Page</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* RFMTC Mathematical Formulation */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-4 text-xs sm:text-sm text-[#4E4B66] leading-relaxed card-hover">
        <div className="border-b border-[#F1EEFB] pb-3">
          <h2 className="text-base font-extrabold text-[#131127] flex items-center space-x-2.5">
            <div className="p-1.5 bg-[#EDF9F5] text-[#56C9A5] rounded-lg">
              <Cpu className="w-4 h-4" />
            </div>
            <span>The RFMTC Marketing Model Formulation</span>
          </h2>
        </div>
        <p>
          The classical RFM marketing model (Recency, Frequency, Monetary) is modified for non-profit blood donation by adding <strong>Time (T)</strong> (donor lifecycle tenure) and the binary ground-truth target:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
          <div className="p-4 bg-[#F5F3FF] rounded-2xl border border-[#E0D7FA] space-y-1">
            <strong className="text-[#7956E8] block font-mono text-sm font-bold">R (Recency):</strong>
            <span className="text-[#131127]">Months elapsed since the donor&apos;s last donation event.</span>
          </div>
          <div className="p-4 bg-[#FFF5F4] rounded-2xl border border-[#FECDD3] space-y-1">
            <strong className="text-[#FF786B] block font-mono text-sm font-bold">F (Frequency):</strong>
            <span className="text-[#131127]">Total cumulative number of lifetime donations.</span>
          </div>
          <div className="p-4 bg-[#FEF9E7] rounded-2xl border border-[#FDE68A] space-y-1">
            <strong className="text-[#B45309] block font-mono text-sm font-bold">M (Monetary):</strong>
            <span className="text-[#131127]">Total blood donated in c.c. ($M = 250 \times F$).</span>
          </div>
          <div className="p-4 bg-[#EDF9F5] rounded-2xl border border-[#A7F3D0] space-y-1">
            <strong className="text-[#059669] block font-mono text-sm font-bold">T (Time / Tenure):</strong>
            <span className="text-[#131127]">Months elapsed since the donor&apos;s first recorded donation.</span>
          </div>
        </div>
      </div>

      {/* Ethical & Operational Limitations Disclaimer */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-3 text-xs text-[#7E7A9B] leading-relaxed card-hover">
        <div className="border-b border-[#F1EEFB] pb-3">
          <h2 className="text-base font-extrabold text-[#131127] flex items-center space-x-2.5">
            <div className="p-1.5 bg-[#EDF9F5] text-[#56C9A5] rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span>Ethical Guidelines &amp; System Limitations</span>
          </h2>
        </div>
        <ul className="list-disc list-inside space-y-2 pl-1 text-[#4E4B66]">
          <li>
            <strong className="text-[#131127]">Empirical Historical Model:</strong> Predictions represent historical statistical associations from the 2007 Hsin-Chu study and do NOT constitute guaranteed future outcomes or individual clinical diagnoses.
          </li>
          <li>
            <strong className="text-[#131127]">Privacy &amp; Integrity:</strong> The dataset is fully anonymized and contains zero personally identifiable information (no names, medical records, or addresses).
          </li>
          <li>
            <strong className="text-[#131127]">Academic Scope:</strong> Designed for university Data Warehousing and Data Mining (DWDM) laboratory demonstration and educational evaluation.
          </li>
        </ul>
      </div>
    </div>
  );
};
