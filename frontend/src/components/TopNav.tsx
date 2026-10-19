import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  RefreshCw,
  Search,
  Database,
  Activity,
  Award,
  BookOpen
} from 'lucide-react';
import type { HealthStatus, ActiveView } from '../types';

interface TopNavProps {
  currentView: ActiveView;
  health: HealthStatus | null;
  isLoadingHealth: boolean;
  onRefreshHealth: () => void;
  onNavigate: (view: ActiveView) => void;
}

const VIEW_TITLES: Record<ActiveView, { title: string; subtitle: string; icon: any }> = {
  dashboard: { title: 'Dashboard Overview', subtitle: 'Empirical Indicators & Executive Summary', icon: Activity },
  dataset: { title: 'UCI Dataset & Records', subtitle: 'Schema Specification, Data Dictionary & Records', icon: Database },
  behaviour: { title: 'Donor Behaviour Analytics', subtitle: 'Feature Distributions, Correlations & Bivariate Patterns', icon: Activity },
  models: { title: 'Classification Benchmark', subtitle: '4-Model Evaluation, Confusion Matrices & ROC Curves', icon: Award },
  predict: { title: 'Live Donor Predictor', subtitle: 'Real-Time Inference, Return Probability & Clinical Advice', icon: Sparkles },
  labs: { title: 'DWDM Academic Labs (1–9)', subtitle: 'Data Warehouse Star Schema, OLAP, Clustering & Apriori Rules', icon: Layers },
  about: { title: 'About the Project', subtitle: 'Citation, Mathematical Formulation & Ethical Limitations', icon: BookOpen }
};

export const TopNav: React.FC<TopNavProps> = ({
  currentView,
  health,
  isLoadingHealth,
  onRefreshHealth,
  onNavigate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const isOnline = Boolean(health);
  const viewInfo = VIEW_TITLES[currentView] || VIEW_TITLES.dashboard;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchTerm.toLowerCase().trim();
    if (!term) return;
    if (term.includes('lab') || term.includes('apriori') || term.includes('olap') || term.includes('cluster') || term.includes('schema')) {
      onNavigate('labs');
    } else if (term.includes('predict') || term.includes('donor') || term.includes('inference')) {
      onNavigate('predict');
    } else if (term.includes('model') || term.includes('classifier') || term.includes('matrix') || term.includes('roc')) {
      onNavigate('models');
    } else if (term.includes('behaviour') || term.includes('dist') || term.includes('scatter') || term.includes('correlation')) {
      onNavigate('behaviour');
    } else if (term.includes('data') || term.includes('record') || term.includes('uci') || term.includes('transfusion')) {
      onNavigate('dataset');
    } else {
      onNavigate('dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-[#ECE8F6] px-6 py-3 flex items-center justify-between transition shadow-xs">
      {/* Left: Breadcrumbs and Page Context */}
      <div className="flex items-center space-x-6 min-w-0">
        <div className="space-y-0.5 shrink-0">
          <div className="flex items-center space-x-1.5 text-[11px] text-[#7E7A9B] font-medium">
            <span>Blood Transfusion Service Center</span>
            <span>/</span>
            <span className="text-[#7956E8] font-bold">{viewInfo.title}</span>
          </div>
          <h1 className="text-lg font-extrabold text-[#131127] tracking-tight truncate">{viewInfo.title}</h1>
        </div>

        {/* Spacious Search Field */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:flex items-center w-72 lg:w-96">
          <Search className="w-4 h-4 absolute left-3.5 text-[#8C87A8] pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search donors, features, models, labs..."
            className="w-full pl-10 pr-4 py-2 bg-[#F8F7FC] hover:bg-[#F3F0FF]/60 focus:bg-white border border-[#ECE8F6] focus:border-[#7956E8] rounded-2xl text-xs text-[#131127] placeholder:text-[#8C87A8] focus:outline-none focus:ring-2 focus:ring-[#7956E8]/20 transition"
          />
        </form>
      </div>

      {/* Right: Actions, Live Status & Researcher Profile */}
      <div className="flex items-center space-x-3 shrink-0">
        {/* Quick Nav Shortcuts */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-[#F8F7FC] p-1 rounded-2xl border border-[#ECE8F6]">
          <button
            onClick={() => onNavigate('predict')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              currentView === 'predict'
                ? 'bg-[#7956E8] text-white shadow-xs'
                : 'text-[#4E4B66] hover:text-[#131127] hover:bg-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: currentView === 'predict' ? '#FFFFFF' : '#EC79B9' }} />
            <span>Predictor</span>
          </button>
          <button
            onClick={() => onNavigate('labs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              currentView === 'labs'
                ? 'bg-[#7956E8] text-white shadow-xs'
                : 'text-[#4E4B66] hover:text-[#131127] hover:bg-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" style={{ color: currentView === 'labs' ? '#FFFFFF' : '#FFD166' }} />
            <span>Labs (1–9)</span>
          </button>
        </div>

        {/* Backend Server Status Badge */}
        <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-white border border-[#ECE8F6] rounded-2xl text-xs shadow-xs">
          <span className="relative flex h-2.5 w-2.5">
            {isOnline ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#56C9A5] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#56C9A5]"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF786B]"></span>
            )}
          </span>
          <span className="font-extrabold text-[#131127] hidden sm:inline text-xs">
            {isOnline ? 'API Online' : 'Connecting...'}
          </span>
          <button
            onClick={onRefreshHealth}
            disabled={isLoadingHealth}
            className="text-[#8C87A8] hover:text-[#7956E8] transition p-0.5 rounded-md hover:bg-[#F3F0FF]"
            title="Refresh API Status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHealth ? 'animate-spin text-[#7956E8]' : ''}`} />
          </button>
        </div>

        {/* Academic Cohort Pill Avatar */}
        <div className="hidden sm:flex items-center space-x-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7956E8] to-[#EC79B9] text-white flex items-center justify-center text-xs font-extrabold shadow-sm shadow-[#7956E8]/20">
            AG
          </div>
        </div>
      </div>
    </header>
  );
};
