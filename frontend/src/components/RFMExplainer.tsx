import React from 'react';
import { Calendar, Repeat, Droplets, Clock, HelpCircle } from 'lucide-react';
import type { RFMAttribute } from '../types';

export const RFMExplainer: React.FC = () => {
  const attributes: RFMAttribute[] = [
    {
      code: 'R',
      name: 'Recency',
      unit: 'months',
      description: 'Number of months since the donor last donated blood.',
      role: 'Measures recent engagement. Donors with low recency have higher return probability.',
    },
    {
      code: 'F',
      name: 'Frequency',
      unit: 'times',
      description: 'Total cumulative number of blood donations made by the donor.',
      role: 'Captures donor loyalty and habitual donation history.',
    },
    {
      code: 'M',
      name: 'Monetary',
      unit: 'c.c. blood',
      description: 'Total volume of blood donated in cubic centimeters (cc = Frequency × 250).',
      role: 'Direct volume indicator; perfectly collinear with Frequency in the UCI dataset.',
    },
    {
      code: 'T',
      name: 'Time',
      unit: 'months',
      description: 'Number of months since the donor’s very first recorded donation.',
      role: 'Measures donor lifespan and loyalty maturity.',
    },
  ];

  const getIcon = (code: string) => {
    switch (code) {
      case 'R':
        return <Clock className="w-5 h-5 text-rose-600" />;
      case 'F':
        return <Repeat className="w-5 h-5 text-rose-600" />;
      case 'M':
        return <Droplets className="w-5 h-5 text-rose-600" />;
      case 'T':
        return <Calendar className="w-5 h-5 text-rose-600" />;
      default:
        return <HelpCircle className="w-5 h-5 text-rose-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>RFMTC Data Mining Feature Schema</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Core attributes adapted from the classical RFM Marketing Model for blood transfusion service centers
          </p>
        </div>
        <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full">
          4 Features + 1 Target
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {attributes.map((attr) => (
          <div
            key={attr.code}
            className="p-4 rounded-xl border border-rose-50 bg-gradient-to-b from-white to-rose-50/30 hover:border-rose-200 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100/70 flex items-center justify-center">
                {getIcon(attr.code)}
              </div>
              <span className="text-xs font-extrabold text-rose-700 bg-rose-100/60 px-2 py-0.5 rounded">
                [{attr.code}]
              </span>
            </div>

            <h4 className="font-bold text-slate-900 text-sm">{attr.name}</h4>
            <span className="text-[11px] text-slate-400 font-mono">({attr.unit})</span>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">{attr.description}</p>

            <div className="mt-3 pt-2.5 border-t border-rose-100/70 text-[11px] text-slate-500">
              <span className="font-semibold text-rose-900">Insight: </span>
              {attr.role}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
