import React from 'react';
import { FileSpreadsheet, Sliders, LineChart, BrainCircuit, Network, Sparkles } from 'lucide-react';

export const PipelineFlow: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Data Ingestion',
      desc: 'transfusion.data loading & verification',
      icon: FileSpreadsheet,
    },
    {
      step: '02',
      title: 'Preprocessing',
      desc: 'Outlier detection, scaling & discretization',
      icon: Sliders,
    },
    {
      step: '03',
      title: 'Exploratory EDA',
      desc: 'Correlations, distributions & Recharts',
      icon: LineChart,
    },
    {
      step: '04',
      title: 'Classification',
      desc: 'Logistic Reg, Random Forest, Decision Tree',
      icon: BrainCircuit,
    },
    {
      step: '05',
      title: 'Clustering',
      desc: 'K-Means & Hierarchical donor personas',
      icon: Network,
    },
    {
      step: '06',
      title: 'Apriori Rules',
      desc: 'Support, confidence & lift association rules',
      icon: Sparkles,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900">DWM End-to-End Data Pipeline Flow</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Step-by-step mining lifecycle configured in the modular backend services and frontend tabs
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {steps.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="relative p-3.5 rounded-xl border border-slate-100 bg-gradient-to-b from-white to-rose-50/20 hover:border-rose-200 hover:shadow-xs transition-all text-center flex flex-col items-center"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center mb-2 font-mono text-xs font-bold">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Step {item.step}</span>
              <h4 className="font-bold text-slate-900 text-xs mt-1">{item.title}</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-tight">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
