import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { DashboardView } from './components/DashboardView';
import { DatasetOverviewView } from './components/DatasetOverviewView';
import { DonorBehaviourView } from './components/DonorBehaviourView';
import { ModelComparisonView } from './components/ModelComparisonView';
import { DonorPredictionView } from './components/DonorPredictionView';
import { LabsSuiteView } from './components/LabsSuiteView';
import { AboutView } from './components/AboutView';
import { api } from './services/api';
import type { HealthStatus, ActiveView } from './types';

export function App() {
  const [currentView, setCurrentView] = useState<ActiveView>('dashboard');
  const [selectedLabId, setSelectedLabId] = useState<number>(1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState<boolean>(true);

  const fetchHealth = async () => {
    setIsLoadingHealth(true);
    try {
      const data = await api.getHealth();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleSelectLab = (labId: number) => {
    setSelectedLabId(labId);
    setCurrentView('labs');
  };

  const handleNavigate = (view: ActiveView) => {
    setCurrentView(view);
    if (view === 'labs' && !selectedLabId) {
      setSelectedLabId(1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] text-[#131127] flex font-sans antialiased selection:bg-[#7956E8] selection:text-white">
      {/* Collapsible Left Sidebar with Nested DWDM Labs */}
      <Sidebar
        currentView={currentView}
        onSelectView={handleNavigate}
        selectedLabId={selectedLabId}
        onSelectLab={handleSelectLab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Viewport */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Sticky Top Navigation */}
        <TopNav
          currentView={currentView}
          health={health}
          isLoadingHealth={isLoadingHealth}
          onRefreshHealth={fetchHealth}
          onNavigate={handleNavigate}
        />

        {/* Dynamic Section View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {currentView === 'dashboard' && <DashboardView onNavigate={handleNavigate} />}
          {currentView === 'dataset' && <DatasetOverviewView />}
          {currentView === 'behaviour' && <DonorBehaviourView />}
          {currentView === 'models' && <ModelComparisonView />}
          {currentView === 'predict' && <DonorPredictionView />}
          {currentView === 'labs' && (
            <LabsSuiteView
              selectedLabId={selectedLabId}
              onSelectLab={handleSelectLab}
            />
          )}
          {currentView === 'about' && <AboutView />}
        </main>
      </div>
    </div>
  );
}

export default App;
