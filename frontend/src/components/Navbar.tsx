import React from 'react';
import { Activity, Database, Server, Sparkles } from 'lucide-react';
import type { HealthStatus } from '../types';

interface NavbarProps {
  health: HealthStatus | null;
  isLoadingHealth: boolean;
  onRefreshHealth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ health, isLoadingHealth, onRefreshHealth }) => {
  const isOnline = Boolean(health);
  const datasetPresent = Boolean(health?.dataset_present);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-rose-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-700 via-rose-600 to-red-500 flex items-center justify-center text-white shadow-md shadow-rose-200">
              <Activity className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                  Hema<span className="text-rose-700">Predict</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
                  DWM Mini-Project
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Blood Donation Analytics & Prediction System
              </p>
            </div>
          </div>

          {/* System Status Indicators */}
          <div className="flex items-center space-x-3">
            {/* Backend status badge */}
            <button
              onClick={onRefreshHealth}
              disabled={isLoadingHealth}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer"
              title="Click to recheck backend connection"
            >
              <Server className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-600">Backend:</span>
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className={isOnline ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                  {isLoadingHealth ? 'Checking...' : isOnline ? 'Online (FastAPI)' : 'Offline / Standalone'}
                </span>
              </span>
            </button>

            {/* Dataset status badge */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-rose-100 bg-rose-50/50 text-xs font-medium">
              <Database className="w-3.5 h-3.5 text-rose-600" />
              <span className="text-slate-600">Dataset:</span>
              <span className={datasetPresent ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                {datasetPresent ? 'Loaded' : 'Pending (transfusion.data)'}
              </span>
            </div>

            {/* UCI Tag */}
            <div className="hidden md:flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>UCI ML Benchmark</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
