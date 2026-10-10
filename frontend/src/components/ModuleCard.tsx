import React from 'react';
import { ArrowRight, CheckCircle2, type LucideIcon } from 'lucide-react';

interface ModuleCardProps {
  id: string;
  title: string;
  category: string;
  description: string;
  features: string[];
  icon: LucideIcon;
  status: 'Ready for Implementation' | 'Configured' | 'In Progress';
  onClick?: () => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  category,
  description,
  features,
  icon: Icon,
  status,
  onClick,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-lg hover:border-rose-200 transition-all duration-300 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-full">
            {category}
          </span>
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700 group-hover:bg-rose-700 group-hover:text-white transition-colors duration-200">
            <Icon className="w-5 h-5" />
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          {description}
        </p>

        <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Planned Capabilities</p>
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center text-xs text-slate-600 gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/60">
          {status}
        </span>
        <button
          onClick={onClick}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 group-hover:translate-x-0.5 transition-all cursor-pointer"
        >
          <span>Explore Architecture</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
