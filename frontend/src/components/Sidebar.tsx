import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Database,
  BarChart3,
  Award,
  Sparkles,
  Layers,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Droplet,
  BarChart2,
  TrendingUp,
  GitBranch,
  CircleDot,
  Network,
  Cpu
} from 'lucide-react';
import type { ActiveView } from '../types';

export interface LabItemDefinition {
  id: number;
  number: string;
  name: string;
  topic: string;
  color: string;
  lightBg: string;
  borderColor: string;
  textDark: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

export const LAB_DEFINITIONS: LabItemDefinition[] = [
  {
    id: 1,
    number: '01',
    name: 'Dimensional Modeling',
    topic: 'Star, Snowflake & Constellation',
    color: '#7956E8', // Electric Violet
    lightBg: '#F5F3FF',
    borderColor: '#E0D7FA',
    textDark: '#5534C4',
    icon: Database
  },
  {
    id: 2,
    number: '02',
    name: 'OLAP Operations',
    topic: 'Slice, Dice, Roll-up, Pivot',
    color: '#58B8F5', // Sky Blue
    lightBg: '#F0F8FE',
    borderColor: '#BAE6FD',
    textDark: '#0284C7',
    icon: Layers
  },
  {
    id: 3,
    number: '03',
    name: 'EDA & Visualization',
    topic: 'Profiling & Outlier Audits',
    color: '#56C9A5', // Mint Fresh
    lightBg: '#EDF9F5',
    borderColor: '#A7F3D0',
    textDark: '#059669',
    icon: BarChart2
  },
  {
    id: 4,
    number: '04',
    name: 'Linear Regression',
    topic: 'Simple & Multiple SLR/MLR',
    color: '#FFD166', // Sunny Yellow
    lightBg: '#FEF9E7',
    borderColor: '#FDE68A',
    textDark: '#B45309',
    icon: TrendingUp
  },
  {
    id: 5,
    number: '05',
    name: 'Decision Tree',
    topic: 'Attribute Relevance & Tree Nodes',
    color: '#FF786B', // Coral Pop
    lightBg: '#FFF5F4',
    borderColor: '#FECDD3',
    textDark: '#E11D48',
    icon: GitBranch
  },
  {
    id: 6,
    number: '06',
    name: 'Naive Bayes',
    topic: 'Gaussian Naïve Bayes Classifier',
    color: '#EC79B9', // Berry Pink
    lightBg: '#FDF2F8',
    borderColor: '#FBCFE8',
    textDark: '#DB2777',
    icon: Award
  },
  {
    id: 7,
    number: '07',
    name: 'K-Means Clustering',
    topic: 'Elbow, Silhouette & Segments',
    color: '#7956E8', // Purple / Electric Violet
    lightBg: '#F5F3FF',
    borderColor: '#DDD6FE',
    textDark: '#6D28D9',
    icon: CircleDot
  },
  {
    id: 8,
    number: '08',
    name: 'Hierarchical Clustering',
    topic: 'Dendrograms & 4 Linkages',
    color: '#36B9B5', // Turquoise
    lightBg: '#E6FAF8',
    borderColor: '#99F6E4',
    textDark: '#0F766E',
    icon: Network
  },
  {
    id: 9,
    number: '09',
    name: 'Apriori Association Rules',
    topic: 'Frequent Itemsets & Rule Network',
    color: '#84CC16', // Lime Green
    lightBg: '#F4FCE3',
    borderColor: '#D9F99D',
    textDark: '#4D7C0F',
    icon: Cpu
  }
];

interface SidebarProps {
  currentView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  selectedLabId: number;
  onSelectLab: (labId: number) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  id: ActiveView;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  iconColor: string;
  badge?: string;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupName: 'MAIN',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, iconColor: '#7956E8' }
    ]
  },
  {
    groupName: 'DATA & EXPLORATION',
    items: [
      { id: 'dataset', label: 'Dataset Overview', icon: Database, iconColor: '#58B8F5', badge: '748' },
      { id: 'behaviour', label: 'Donor Behaviour', icon: BarChart3, iconColor: '#56C9A5' }
    ]
  },
  {
    groupName: 'PREDICTIVE INTELLIGENCE',
    items: [
      { id: 'models', label: 'Model Comparison', icon: Award, iconColor: '#FF786B', badge: '4 ML' },
      { id: 'predict', label: 'Donor Prediction', icon: Sparkles, iconColor: '#EC79B9' }
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  selectedLabId,
  onSelectLab,
  collapsed,
  onToggleCollapse
}) => {
  const [labsExpanded, setLabsExpanded] = useState<boolean>(true);

  // Keep labs expanded when navigating into labs
  useEffect(() => {
    if (currentView === 'labs') {
      setLabsExpanded(true);
    }
  }, [currentView]);

  const handleToggleLabs = () => {
    if (currentView !== 'labs') {
      onSelectView('labs');
      onSelectLab(selectedLabId || 1);
      setLabsExpanded(true);
    } else {
      setLabsExpanded((prev) => !prev);
    }
  };

  const handleLabClick = (labId: number) => {
    onSelectLab(labId);
    if (currentView !== 'labs') {
      onSelectView('labs');
    }
    setLabsExpanded(true);
  };

  const isLabsActive = currentView === 'labs';

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen bg-white text-[#131127] flex flex-col justify-between border-r border-[#ECE8F6] transition-all duration-300 select-none shadow-[2px_0_16px_-4px_rgba(121,86,232,0.06)] ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-[#ECE8F6] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7956E8] via-[#9B7BF7] to-[#EC79B9] flex items-center justify-center text-white shadow-md shadow-[#7956E8]/25 shrink-0 transition-transform hover:scale-105">
              <Droplet className="w-5 h-5 fill-current" />
            </div>
            {!collapsed && (
              <div className="space-y-0.5 truncate">
                <h1 className="font-extrabold text-[#131127] text-sm tracking-tight truncate">
                  Blood Donation
                </h1>
                <p className="text-[11px] font-bold text-[#7956E8] truncate">
                  DWDM Analytics &amp; ML
                </p>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-xl text-[#7E7A9B] hover:text-[#131127] hover:bg-[#F3F0FF] transition shrink-0 hidden lg:flex"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Navigation Menu with Vertically Scrollable Container */}
      <div className="flex-1 py-4 px-3 space-y-4 overflow-y-auto custom-scrollbar">
        {/* Core App Navigation Groups */}
        {NAV_GROUPS.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!collapsed && (
              <div className="px-3.5 py-1 text-[10px] font-extrabold text-[#8C87A8] uppercase tracking-wider">
                {group.groupName}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all group ${
                    isActive
                      ? 'bg-[#7956E8] text-white shadow-md shadow-[#7956E8]/25'
                      : 'text-[#4E4B66] hover:text-[#131127] hover:bg-[#F3F0FF]'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#F8F7FC]'
                      }`}
                    >
                      <Icon
                        className="w-4 h-4 shrink-0 transition"
                        style={{ color: isActive ? '#FFFFFF' : item.iconColor }}
                      />
                    </div>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!collapsed && item.badge && (
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full transition ${
                        isActive ? 'bg-white/25 text-white' : 'bg-[#F1EEFB] text-[#7956E8]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {/* ACADEMIC DWDM GROUP WITH EXPANDABLE SUBMENU */}
        <div className="space-y-1">
          {!collapsed && (
            <div className="px-3.5 py-1 text-[10px] font-extrabold text-[#8C87A8] uppercase tracking-wider">
              ACADEMIC DWDM
            </div>
          )}

          {/* DWDM Labs Parent Item */}
          <div className="space-y-1">
            <button
              onClick={handleToggleLabs}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all group ${
                isLabsActive
                  ? 'bg-[#7956E8] text-white shadow-md shadow-[#7956E8]/25'
                  : 'text-[#4E4B66] hover:text-[#131127] hover:bg-[#F3F0FF]'
              }`}
              title={collapsed ? 'DWDM Labs (1–9)' : undefined}
            >
              <div className="flex items-center space-x-3 truncate">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    isLabsActive ? 'bg-white/20 text-white' : 'bg-[#F8F7FC]'
                  }`}
                >
                  <Layers
                    className="w-4 h-4 shrink-0 transition"
                    style={{ color: isLabsActive ? '#FFFFFF' : '#FFD166' }}
                  />
                </div>
                {!collapsed && (
                  <span className="truncate">DWDM Labs (1–9)</span>
                )}
              </div>

              {!collapsed && (
                <div className="flex items-center space-x-1.5 shrink-0">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full transition ${
                      isLabsActive ? 'bg-white/25 text-white' : 'bg-[#F1EEFB] text-[#7956E8]'
                    }`}
                  >
                    9 Labs
                  </span>
                  <div className="p-0.5">
                    {labsExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-current opacity-80" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-current opacity-80" />
                    )}
                  </div>
                </div>
              )}
            </button>

            {/* Nested Vertical Submenu for Labs 01–09 */}
            {!collapsed && labsExpanded && (
              <div className="pl-3 pr-1 pt-1 pb-1 space-y-1 border-l-2 border-[#ECE8F6] ml-4 transition-all animate-fadeIn">
                {LAB_DEFINITIONS.map((lab) => {
                  const isLabActive = isLabsActive && selectedLabId === lab.id;
                  const Icon = lab.icon;

                  return (
                    <button
                      key={lab.id}
                      onClick={() => handleLabClick(lab.id)}
                      style={
                        isLabActive
                          ? {
                              backgroundColor: lab.lightBg,
                              borderColor: lab.borderColor,
                            }
                          : {}
                      }
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all border group ${
                        isLabActive
                          ? 'border shadow-xs'
                          : 'bg-white hover:bg-[#F8F7FC] border-transparent text-[#4E4B66] hover:text-[#131127]'
                      }`}
                      title={`Lab ${lab.number} — ${lab.name}`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        {/* Number Badge */}
                        <div
                          style={{
                            backgroundColor: isLabActive ? lab.color : '#F1EEFB',
                            color: isLabActive
                              ? lab.id === 4
                                ? '#78350F'
                                : '#FFFFFF'
                              : lab.color
                          }}
                          className="w-5 h-5 rounded-lg flex items-center justify-center font-mono text-[10px] font-extrabold shrink-0 transition-transform group-hover:scale-105"
                        >
                          {lab.number}
                        </div>

                        {/* Title */}
                        <div className="truncate">
                          <span
                            className={`text-[11px] block truncate ${
                              isLabActive
                                ? 'font-extrabold text-[#131127]'
                                : 'font-medium text-[#4E4B66] group-hover:text-[#131127]'
                            }`}
                          >
                            Lab {lab.number} — {lab.name}
                          </span>
                        </div>
                      </div>

                      {/* Active Indicator Icon */}
                      <div className="shrink-0 pl-1">
                        <Icon
                          className="w-3.5 h-3.5 shrink-0 transition"
                          style={{
                            color: isLabActive ? lab.color : '#A8A4C4',
                            opacity: isLabActive ? 1 : 0.6
                          }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* DOCUMENTATION GROUP */}
        <div className="space-y-1">
          {!collapsed && (
            <div className="px-3.5 py-1 text-[10px] font-extrabold text-[#8C87A8] uppercase tracking-wider">
              DOCUMENTATION
            </div>
          )}
          <button
            onClick={() => onSelectView('about')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all group ${
              currentView === 'about'
                ? 'bg-[#7956E8] text-white shadow-md shadow-[#7956E8]/25'
                : 'text-[#4E4B66] hover:text-[#131127] hover:bg-[#F3F0FF]'
            }`}
            title={collapsed ? 'About the Project' : undefined}
          >
            <div className="flex items-center space-x-3 truncate">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                  currentView === 'about' ? 'bg-white/20 text-white' : 'bg-[#F8F7FC]'
                }`}
              >
                <Info
                  className="w-4 h-4 shrink-0 transition"
                  style={{ color: currentView === 'about' ? '#FFFFFF' : '#58B8F5' }}
                />
              </div>
              {!collapsed && <span className="truncate">About the Project</span>}
            </div>
          </button>
        </div>
      </div>

      {/* Footer / Dataset Citation Indicator */}
      <div className="p-4 border-t border-[#ECE8F6] shrink-0">
        {!collapsed ? (
          <div className="p-3 bg-[#F8F7FC] rounded-2xl border border-[#ECE8F6] text-xs space-y-1">
            <div className="flex items-center space-x-1.5 text-[11px] font-bold text-[#131127]">
              <span className="w-2 h-2 rounded-full bg-[#56C9A5] inline-block animate-pulse"></span>
              <span>UCI Transfusion Dataset</span>
            </div>
            <p className="text-[10px] text-[#7E7A9B]">748 Records • Yeh et al. 2008</p>
          </div>
        ) : (
          <div className="flex justify-center text-[#7956E8]" title="UCI Dataset (748 instances)">
            <Droplet className="w-5 h-5 fill-current" />
          </div>
        )}
      </div>
    </aside>
  );
};
