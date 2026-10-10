import { useState, useEffect } from 'react';
import {
  Sliders,
  LineChart,
  BrainCircuit,
  Network,
  Sparkles,
  Database,
  Layers,
  Cpu,
  BarChart3,
  BookOpen,
  Terminal,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { StatCard } from './components/StatCard';
import { ModuleCard } from './components/ModuleCard';
import { RFMExplainer } from './components/RFMExplainer';
import { DatasetStatusCard } from './components/DatasetStatusCard';
import { PipelineFlow } from './components/PipelineFlow';
import { checkBackendHealth } from './services/api';
import type { HealthStatus, ActiveTab } from './types';

export function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  const fetchHealth = async () => {
    setIsLoadingHealth(true);
    try {
      const data = await checkBackendHealth();
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

  const modules = [
    {
      id: 'preprocessing',
      title: 'Data Preprocessing & Cleansing',
      category: 'Pipeline Step 1',
      description: 'Cleans, standardizes, and discretizes the UCI Blood Transfusion Service Center dataset for modeling.',
      icon: Sliders,
      features: [
        'RFMTC feature normalization (StandardScaler & MinMaxScaler)',
        'Discretization and continuous-to-categorical binning for Apriori',
        'Outlier analysis and IQR validation',
        'Class imbalance assessment (23.8% positive rate)',
      ],
      status: 'Ready for Implementation' as const,
    },
    {
      id: 'eda',
      title: 'Exploratory Data Analysis (EDA)',
      category: 'Pipeline Step 2',
      description: 'Interactive Recharts visualizations and statistical metrics uncovering donor return patterns.',
      icon: LineChart,
      features: [
        'RFM univariate distributions & kernel density estimations',
        'Feature correlation heatmaps & collinearity checks (F vs. M)',
        'Active vs. Inactive donor box plots and comparative metrics',
        'Time-decay and donation recency retention analysis',
      ],
      status: 'Ready for Implementation' as const,
    },
    {
      id: 'classification',
      title: 'Supervised Classification & Prediction',
      category: 'Pipeline Step 3',
      description: 'Trains and evaluates ML models to predict whether a donor will return to donate blood.',
      icon: BrainCircuit,
      features: [
        'Logistic Regression baseline classifier',
        'Random Forest & Decision Tree rule classifiers',
        'Confusion matrix, ROC-AUC curves & classification report',
        'Interactive real-time donor donation predictor form',
      ],
      status: 'Ready for Implementation' as const,
    },
    {
      id: 'clustering',
      title: 'Unsupervised Donor Clustering',
      category: 'Pipeline Step 4',
      description: 'Segments blood donors into distinct behavioral personas without requiring class labels.',
      icon: Network,
      features: [
        'K-Means clustering with multidimensional scaling',
        'Elbow method curve for optimal WCSS cluster k-selection',
        'Silhouette score analysis for cluster cohesion & separation',
        'Donor persona profiling (Loyal, Lapsed, First-time, Occasional)',
      ],
      status: 'Ready for Implementation' as const,
    },
    {
      id: 'association',
      title: 'Apriori Association Rule Mining',
      category: 'Pipeline Step 5',
      description: 'Discovers high-confidence association rules between donor attributes using mlxtend.',
      icon: Sparkles,
      features: [
        'Discretized transaction itemset generation',
        'Frequent itemset discovery with configurable min_support',
        'Association rule generation with confidence and Lift metrics',
        'Interactive rule filter table & scatter plot (Support vs Confidence)',
      ],
      status: 'Ready for Implementation' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        health={health}
        isLoadingHealth={isLoadingHealth}
        onRefreshHealth={fetchHealth}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950 via-rose-900 to-red-900 text-white p-8 sm:p-10 shadow-xl border border-rose-800">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-800/80 border border-rose-700/80 text-rose-200 text-xs font-semibold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              Data Warehousing & Mining (DWM) Project Skeleton
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Blood Donation Analytics &amp; Prediction System
            </h1>

            <p className="mt-4 text-sm sm:text-base text-rose-100/90 leading-relaxed max-w-2xl font-normal">
              A comprehensive data mining platform evaluating the <strong className="text-white font-semibold">UCI Blood Transfusion Service Center</strong> dataset.
              Architected with modular full-stack capabilities for exploratory analytics, supervised classification, unsupervised clustering, and Apriori rule mining.
            </p>

            {/* Quick Badges */}
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 text-white font-medium flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-rose-300" /> UCI Transfusion Dataset
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 text-white font-medium flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-rose-300" /> FastAPI + Scikit-Learn + Mlxtend
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 text-white font-medium flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-rose-300" /> React 19 + TypeScript + Vite + Tailwind
              </span>
            </div>
          </div>
        </section>

        {/* Quick KPI Overview */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Benchmark Dataset"
            value="748 Records"
            subtitle="UCI Transfusion Repository"
            icon={Database}
            badge="RFMTC Model"
            accent="rose"
          />
          <StatCard
            title="Analytical Pillars"
            value="5 Modules"
            subtitle="Preprocess, EDA, ML, Cluster, Apriori"
            icon={BarChart3}
            badge="Modular"
            accent="emerald"
          />
          <StatCard
            title="Classification Models"
            value="3+ Algorithms"
            subtitle="Logistic Reg, Random Forest, Decision Tree"
            icon={BrainCircuit}
            badge="Supervised"
            accent="blue"
          />
          <StatCard
            title="Mining Engines"
            value="K-Means & Apriori"
            subtitle="Clustering & Association Rules"
            icon={Sparkles}
            badge="mlxtend & sklearn"
            accent="purple"
          />
        </section>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-px" aria-label="Tabs">
            {[
              { id: 'overview', label: 'System Overview', icon: Layers },
              { id: 'preprocessing', label: 'Preprocessing', icon: Sliders },
              { id: 'eda', label: 'Exploratory EDA', icon: LineChart },
              { id: 'classification', label: 'Classification', icon: BrainCircuit },
              { id: 'clustering', label: 'Clustering', icon: Network },
              { id: 'association', label: 'Association Rules', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`flex items-center gap-2 py-3 px-4 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'border-rose-700 text-rose-700 bg-rose-50/50 rounded-t-lg'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rose-700' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab 1: System Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Dataset Status Banner */}
            <DatasetStatusCard
              health={health}
              isLoading={isLoadingHealth}
              onRefresh={fetchHealth}
            />

            {/* Pipeline Stage Flow */}
            <PipelineFlow />

            {/* Core Modules Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Project Modules & Architecture</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Modular components designed for independent development and testing
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((mod) => (
                  <ModuleCard
                    key={mod.id}
                    id={mod.id}
                    title={mod.title}
                    category={mod.category}
                    description={mod.description}
                    features={mod.features}
                    icon={mod.icon}
                    status={mod.status}
                    onClick={() => setActiveTab(mod.id as ActiveTab)}
                  />
                ))}
              </div>
            </div>

            {/* RFM Attribute Explainer */}
            <RFMExplainer />
          </div>
        )}

        {/* Tab 2: Preprocessing Placeholder */}
        {activeTab === 'preprocessing' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Data Preprocessing & Transformation Module</h2>
                <p className="text-xs text-slate-500">FastAPI backend route: <code className="text-rose-700 font-mono">/api/eda/summary</code></p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 space-y-3">
              <h4 className="font-semibold text-slate-900">Configured Preprocessing Pipeline:</h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                <li>Reading <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">transfusion.data</code> into pandas DataFrame.</li>
                <li>Standardizing column headers: <code className="font-mono text-rose-700">recency, frequency, monetary, time, donated</code>.</li>
                <li>Checking missing value counts and datatype integrity.</li>
                <li>Feature scaling with scikit-learn <code className="font-mono">StandardScaler</code> for clustering.</li>
                <li>Attribute binning/discretization for Apriori transactions.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 3: EDA Placeholder */}
        {activeTab === 'eda' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">
                <LineChart className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Exploratory Data Analysis & Visualizations</h2>
                <p className="text-xs text-slate-500">Interactive charts built with Recharts & Tailwind CSS</p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 space-y-3">
              <h4 className="font-semibold text-slate-900">Visualizations & Analytical Charts:</h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                <li>Univariate distribution histogram of donation recency (months).</li>
                <li>Donation frequency vs monetary scatter and collinearity breakdown.</li>
                <li>Target variable distribution bar chart (Class: Donated vs Did not donate).</li>
                <li>Correlation matrix heatmap across RFMTC variables.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 4: Classification Placeholder */}
        {activeTab === 'classification' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Supervised Classification & Prediction</h2>
                <p className="text-xs text-slate-500">FastAPI backend route: <code className="text-rose-700 font-mono">/api/classification/predict</code></p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 space-y-3">
              <h4 className="font-semibold text-slate-900">Supervised Models & Metrics:</h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                <li>Logistic Regression, Decision Trees, and Random Forest models.</li>
                <li>Evaluation metrics: Accuracy, Precision, Recall, F1-Score, and ROC-AUC.</li>
                <li>Interactive prediction form for real-time donor evaluation.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 5: Clustering Placeholder */}
        {activeTab === 'clustering' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">
                <Network className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Unsupervised Donor Clustering</h2>
                <p className="text-xs text-slate-500">FastAPI backend route: <code className="text-rose-700 font-mono">/api/clustering/clusters</code></p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 space-y-3">
              <h4 className="font-semibold text-slate-900">Clustering Pipeline:</h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                <li>K-Means & Hierarchical Clustering implementations.</li>
                <li>Elbow Method chart (WCSS vs k) and Silhouette score analysis.</li>
                <li>Donor persona segmentation and behavioral cluster profiling.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 6: Association Rules Placeholder */}
        {activeTab === 'association' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Apriori Association Rule Mining</h2>
                <p className="text-xs text-slate-500">FastAPI backend route: <code className="text-rose-700 font-mono">/api/association-rules/rules</code></p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 space-y-3">
              <h4 className="font-semibold text-slate-900">Association Rule Mining Pipeline:</h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                <li>Transaction discretization via mlxtend.</li>
                <li>Apriori frequent itemset generation with adjustable support threshold.</li>
                <li>Association rule filtering by confidence and lift metrics.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Developer Quickstart Card */}
        <section className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-md border border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Independent Local Execution Commands</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <p className="text-slate-400 font-semibold mb-2 font-sans flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Frontend (Vite + React)
              </p>
              <p className="text-slate-500"># In project root</p>
              <p className="text-emerald-300">cd frontend</p>
              <p className="text-emerald-300">npm install</p>
              <p className="text-emerald-300">npm run dev</p>
              <p className="text-slate-400 mt-2">→ Access: http://localhost:5173</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <p className="text-slate-400 font-semibold mb-2 font-sans flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" /> Backend (FastAPI + Uvicorn)
              </p>
              <p className="text-slate-500"># In project root</p>
              <p className="text-rose-300">cd backend</p>
              <p className="text-rose-300">python -m venv venv</p>
              <p className="text-rose-300">.\venv\Scripts\activate  # Windows</p>
              <p className="text-rose-300">pip install -r requirements.txt</p>
              <p className="text-rose-300">uvicorn app.main:app --reload --port 8000</p>
              <p className="text-slate-400 mt-2">→ Docs: http://127.0.0.1:8000/docs</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Blood Donation Analytics & Prediction System</span>
            <span>•</span>
            <span>Data Warehousing & Mining</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="file:///c:/Users/Anushka/blood-donation-analytics/docs/project-overview.md"
              className="hover:text-rose-700 transition-colors flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" /> Project Docs
            </a>
            <a
              href="file:///c:/Users/Anushka/blood-donation-analytics/docs/methodology.md"
              className="hover:text-rose-700 transition-colors flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5" /> Methodology
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
