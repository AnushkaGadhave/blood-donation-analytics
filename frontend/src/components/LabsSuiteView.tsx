import React, { useState, useEffect } from 'react';
import {
  Layers,
  Database,
  BarChart2,
  TrendingUp,
  GitBranch,
  Award,
  CircleDot,
  Network,
  Cpu,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { api } from '../services/api';
import type { LabDetailResponse } from '../types';
import { Lab01MultidimensionalModeling } from './Lab01MultidimensionalModeling';
import { Lab02OlapOperations } from './Lab02OlapOperations';
import { Lab03EdaVisualization } from './Lab03EdaVisualization';
import { Lab04RegressionWorkspace } from './Lab04RegressionWorkspace';
import { Lab05DecisionTree } from './Lab05DecisionTree';
import { Lab06NaiveBayes } from './Lab06NaiveBayes';
import { Lab07KMeansClustering } from './Lab07KMeansClustering';
import { Lab08HierarchicalClustering } from './Lab08HierarchicalClustering';
import { Lab09AprioriRules } from './Lab09AprioriRules';

interface LabsSuiteViewProps {
  selectedLabId: number;
  onSelectLab: (id: number) => void;
}

interface LabTheme {
  color: string;
  lightBg: string;
  borderColor: string;
  textDark: string;
  badgeBg: string;
  name: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

// SOURCE OF TRUTH: Experiment Color & Icon Mapping
const LAB_THEMES: Record<number, LabTheme> = {
  1: {
    color: '#7956E8', // 01 — Dimensional Modeling: Electric Violet
    lightBg: '#F5F3FF',
    borderColor: '#E0D7FA',
    textDark: '#5534C4',
    badgeBg: '#ECE7FD',
    name: 'Electric Violet',
    icon: Database
  },
  2: {
    color: '#58B8F5', // 02 — OLAP Operations: Sky Blue
    lightBg: '#F0F8FE',
    borderColor: '#BAE6FD',
    textDark: '#0284C7',
    badgeBg: '#E0F2FE',
    name: 'Sky Blue',
    icon: Layers
  },
  3: {
    color: '#56C9A5', // 03 — EDA & Visualization: Mint Fresh
    lightBg: '#EDF9F5',
    borderColor: '#A7F3D0',
    textDark: '#059669',
    badgeBg: '#D1FAE5',
    name: 'Mint Fresh',
    icon: BarChart2
  },
  4: {
    color: '#FFD166', // 04 — Linear Regression: Sunny Yellow
    lightBg: '#FEF9E7',
    borderColor: '#FDE68A',
    textDark: '#B45309',
    badgeBg: '#FEF3C7',
    name: 'Sunny Yellow',
    icon: TrendingUp
  },
  5: {
    color: '#FF786B', // 05 — Decision Tree: Coral Pop
    lightBg: '#FFF5F4',
    borderColor: '#FECDD3',
    textDark: '#E11D48',
    badgeBg: '#FFE4E6',
    name: 'Coral Pop',
    icon: GitBranch
  },
  6: {
    color: '#EC79B9', // 06 — Naive Bayes: Berry Pink
    lightBg: '#FDF2F8',
    borderColor: '#FBCFE8',
    textDark: '#DB2777',
    badgeBg: '#FCE7F3',
    name: 'Berry Pink',
    icon: Award
  },
  7: {
    color: '#7956E8', // 07 — K-Means Clustering: Purple / Electric Violet
    lightBg: '#F5F3FF',
    borderColor: '#DDD6FE',
    textDark: '#6D28D9',
    badgeBg: '#EDE9FE',
    name: 'Purple / Electric Violet',
    icon: CircleDot
  },
  8: {
    color: '#36B9B5', // 08 — Hierarchical Clustering: Turquoise
    lightBg: '#E6FAF8',
    borderColor: '#99F6E4',
    textDark: '#0F766E',
    badgeBg: '#CCFBF1',
    name: 'Turquoise',
    icon: Network
  },
  9: {
    color: '#84CC16', // 09 — Apriori Association Rules: Lime Green
    lightBg: '#F4FCE3',
    borderColor: '#D9F99D',
    textDark: '#4D7C0F',
    badgeBg: '#ECFCCB',
    name: 'Lime Green',
    icon: Cpu
  }
};

const LAB_TITLES: Record<number, string> = {
  1: 'Dimensional Modeling',
  2: 'OLAP Operations',
  3: 'EDA & Visualization',
  4: 'Linear Regression',
  5: 'Decision Tree',
  6: 'Naive Bayes',
  7: 'K-Means Clustering',
  8: 'Hierarchical Clustering',
  9: 'Apriori Association Rules'
};

export const LabsSuiteView: React.FC<LabsSuiteViewProps> = ({
  selectedLabId,
  onSelectLab
}) => {
  const [labDetail, setLabDetail] = useState<LabDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDetail() {
      try {
        setLoadingDetail(true);
        const res = await api.getLabDetails(selectedLabId);
        setLabDetail(res);
        setError(null);
      } catch (err: any) {
        setError(err.message || `Failed to load details for Lab 0${selectedLabId}`);
      } finally {
        setLoadingDetail(false);
      }
    }
    loadDetail();
  }, [selectedLabId]);

  const currentTheme = LAB_THEMES[selectedLabId] || LAB_THEMES[1];
  const LabIcon = currentTheme.icon;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Banner for the Active Lab */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#ECE8F6] shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div
              className="p-3 rounded-2xl shadow-xs transition-transform hover:scale-105"
              style={{ backgroundColor: currentTheme.lightBg, color: currentTheme.textDark }}
            >
              <LabIcon className="w-6 h-6" style={{ color: currentTheme.color }} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-lg"
                  style={{ backgroundColor: currentTheme.lightBg, color: currentTheme.textDark }}
                >
                  Lab 0{selectedLabId}
                </span>
                <span className="text-[11px] font-bold text-[#8C87A8]">
                  • DWDM Curriculum
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131127] tracking-tight pt-1">
                Lab 0{selectedLabId} — {LAB_TITLES[selectedLabId] || 'Experiment'}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <span
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-extrabold border shadow-xs"
              style={{
                backgroundColor: currentTheme.lightBg,
                borderColor: currentTheme.borderColor,
                color: currentTheme.textDark
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentTheme.color }}></span>
              <span>Theme: {currentTheme.name}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Single-Column Content Area */}
      {loadingDetail ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3 bg-white rounded-3xl border border-[#ECE8F6] p-8 shadow-sm">
          <RefreshCw className="w-8 h-8 animate-spin" style={{ color: currentTheme.color }} />
          <p className="text-xs font-semibold text-[#4E4B66]">
            Executing Lab 0{selectedLabId} Algorithms &amp; Computing Metrics...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 bg-[#FFF5F4] border border-[#FF786B]/30 rounded-3xl text-[#131127] space-y-3 shadow-sm">
          <div className="flex items-center space-x-2 font-bold text-[#FF786B]">
            <AlertCircle className="w-5 h-5" />
            <span>Error Loading Lab Details</span>
          </div>
          <p className="text-sm text-[#4E4B66]">{error}</p>
        </div>
      ) : labDetail ? (
        <div className="space-y-6">
          {selectedLabId === 1 ? (
            <Lab01MultidimensionalModeling labDetail={labDetail} />
          ) : selectedLabId === 2 ? (
            <Lab02OlapOperations labDetail={labDetail} />
          ) : selectedLabId === 3 ? (
            <Lab03EdaVisualization labDetail={labDetail} />
          ) : selectedLabId === 4 ? (
            <Lab04RegressionWorkspace labDetail={labDetail} />
          ) : selectedLabId === 5 ? (
            <Lab05DecisionTree labDetail={labDetail} />
          ) : selectedLabId === 6 ? (
            <Lab06NaiveBayes labDetail={labDetail} />
          ) : selectedLabId === 7 ? (
            <Lab07KMeansClustering labDetail={labDetail} />
          ) : selectedLabId === 8 ? (
            <Lab08HierarchicalClustering labDetail={labDetail} />
          ) : selectedLabId === 9 ? (
            <Lab09AprioriRules labDetail={labDetail} />
          ) : null}

          {/* Bottom Prev / Next Lab Navigation Bar */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#ECE8F6] shadow-xs">
            {selectedLabId > 1 ? (
              <button
                onClick={() => onSelectLab(selectedLabId - 1)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#4E4B66] hover:text-[#131127] hover:bg-[#F8F7FC] border border-[#ECE8F6] transition flex items-center space-x-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous: Lab 0{selectedLabId - 1}</span>
              </button>
            ) : (
              <div />
            )}

            <span className="text-xs font-bold text-[#8C87A8]">
              DWDM Experiment {selectedLabId} of 9
            </span>

            {selectedLabId < 9 ? (
              <button
                onClick={() => onSelectLab(selectedLabId + 1)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#7956E8] hover:bg-[#6842DC] shadow-xs transition flex items-center space-x-2"
              >
                <span>Next: Lab 0{selectedLabId + 1}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
