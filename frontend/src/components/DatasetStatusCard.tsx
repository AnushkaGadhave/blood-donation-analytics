import React from 'react';
import { Database, AlertCircle, CheckCircle2, FileCode, ExternalLink, RefreshCw } from 'lucide-react';
import type { HealthStatus } from '../types';

interface DatasetStatusCardProps {
  health: HealthStatus | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const DatasetStatusCard: React.FC<DatasetStatusCardProps> = ({
  health,
  isLoading,
  onRefresh,
}) => {
  const isPresent = Boolean(health?.dataset_present);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isPresent
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-rose-50 text-rose-600 border border-rose-200'
            }`}
          >
            <Database className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">UCI Dataset Ingestion Status</h3>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isPresent
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {isPresent ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Dataset Detected
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    File Required: transfusion.data
                  </>
                )}
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Target location: <code className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-mono">backend/data/transfusion.data</code>.
              Once placed, the backend automated pipeline will compute exploratory statistics, model benchmarks, clusters, and Apriori association rules.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Checking...' : 'Check Status'}</span>
          </button>

          <a
            href="https://archive.ics.uci.edu/dataset/176/blood+transfusion+service+center"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 shadow-sm transition-colors"
          >
            <span>UCI Repository</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Guide checklist */}
      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <FileCode className="w-4 h-4 text-rose-500" />
          <span>748 donor observation records</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <FileCode className="w-4 h-4 text-rose-500" />
          <span>5 attributes (R, F, M, T, Class)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <FileCode className="w-4 h-4 text-rose-500" />
          <span>Binary target (Donated in March 2007)</span>
        </div>
      </div>
    </div>
  );
};
