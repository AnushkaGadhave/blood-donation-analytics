import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  badge?: string;
  accent?: 'rose' | 'amber' | 'emerald' | 'blue' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  accent = 'rose',
}) => {
  const accentClasses = {
    rose: {
      bg: 'bg-rose-50 text-rose-700 border-rose-100',
      iconBg: 'bg-rose-100 text-rose-700',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-700 border-amber-100',
      iconBg: 'bg-amber-100 text-amber-700',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      iconBg: 'bg-emerald-100 text-emerald-700',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    blue: {
      bg: 'bg-blue-50 text-blue-700 border-blue-100',
      iconBg: 'bg-blue-100 text-blue-700',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-700 border-purple-100',
      iconBg: 'bg-purple-100 text-purple-700',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  }[accent];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${accentClasses.iconBg} group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>{subtitle}</span>
        {badge && (
          <span className={`px-2 py-0.5 rounded-full font-medium border text-[11px] ${accentClasses.badge}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};
