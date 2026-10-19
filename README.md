# Blood Donation Prediction & Donor Behaviour Analytics

An academic Data Warehousing and Data Mining (DWDM) application and machine learning prediction platform developed for the **UCI Blood Transfusion Service Center Dataset** (Yeh et al., 2008).

---

## 1. Project Overview & Objectives

This project implements an end-to-end data mining suite for analyzing blood donor participation patterns and predicting donor return propensity during mobile blood collection drives.

### Key Capabilities:
1. **UCI Benchmark Dataset Integration:** Exclusively analyzes the 748 donor cohort with 5 attributes (Recency, Frequency, Monetary, Time, and March 2007 Return Target).
2. **Donor Behaviour Analytics:** Explores univariate distributions, bivariate cross-class comparisons, and correlation structures ($M = 250 \times F$, $r = 1.000$).
3. **Machine Learning Model Comparison:** Benchmarks 4 binary classification algorithms under class imbalance using a stratified 80/20 train/test split:
   - Logistic Regression
   - Decision Tree
   - Random Forest
   - Support Vector Machine (SVM)
4. **Interactive Prediction Service:** Live probability scoring, confidence tiers, and operational CRM recommendations.
5. **Complete DWDM Academic Labs (1–9):** Full implementations of Star Schema modeling, OLAP cubes, EDA, Scaling, Classification, Evaluation, K-Means Clustering ($K=4$), Apriori Rule Mining, and Model Deployment.

---

## 2. Dataset Provenance & Citation

- **Repository:** [UCI Machine Learning Repository — Blood Transfusion Service Center (ID: 176)](https://archive.ics.uci.edu/dataset/176/blood+transfusion+service+center)
- **Primary Reference:**
  > Yeh, I-Cheng, Yang, King-Jang, and Ting, Tao-Ming, *"Knowledge discovery on RFM model using Bernoulli sequence,"* **Expert Systems with Applications**, Vol. 36, No. 4, pp. 7715–7723, 2008. (DOI: [10.1016/j.eswa.2008.07.018](https://doi.org/10.1016/j.eswa.2008.07.018))
- **Cohort Size:** 748 Instances | 0 Missing Values
- **Target Distribution:** 178 Return Donors (23.8%) vs 570 Non-Donors (76.2%)

---

## 3. Machine Learning Benchmark Results

Evaluated on a stratified 20% holdout test set ($N_{\text{test}} = 150$ donors; 36 actual donors, 114 non-donors) with balanced class weighting:

| Algorithm | Accuracy | Balanced Accuracy | Precision | Recall (Sensitivity) | Specificity | F1-Score | ROC-AUC |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression** | **72.0%** | **72.2%** | 44.1% | **69.4%** | 72.8% | **0.5882** | 0.7848 |
| **Random Forest** | 73.3% | 71.9% | 46.2% | 66.7% | 75.4% | 0.5745 | 0.7719 |
| **Support Vector Machine (SVM)** | 70.7% | 72.1% | 42.4% | **69.4%** | 71.1% | 0.5600 | **0.7941** |
| **Decision Tree** | 66.7% | 63.8% | 37.1% | 52.8% | 71.1% | 0.5098 | 0.7427 |

*Recommended Production Model: **Logistic Regression / Random Forest** balancing Recall (69.4%) and F1-Score (0.5882).*

---

## 4. Application Architecture & Sections

The application is structured into 7 core modules:
1. **Dashboard:** High-level KPIs, target class balance donut chart, RFMT summary statistics, and model leaderboard.
2. **Dataset Overview:** Official UCI citation, 5-attribute data dictionary, quality audit (0 nulls), and paginated data explorer with CSV export.
3. **Donor Behaviour Analysis:** Univariate histograms, bivariate cross-class comparison metrics, scatter plots, and Pearson correlation matrix.
4. **Model Comparison:** 4-classifier benchmark table, interactive confusion matrices, ROC curves, PR curves, and feature importance ranking.
5. **Donor Prediction:** Interactive prediction form with real-time numeric validation, pre-loaded real donor archetypes, probability meter, and outreach guidance.
6. **Labs & Experiments (1–9):** Complete DWDM laboratory suite with live execution data, mathematical formulations, observations, and conclusions.
7. **About the Project:** Research problem statement, RFMTC formulation, methodology, and ethical disclaimers.

---

## 5. Quick Start Instructions

### Prerequisites
- Python 3.10+ (with `pandas`, `numpy`, `scikit-learn`, `mlxtend`, `joblib`, `fastapi`, `uvicorn`)
- Node.js 18+ and npm

### 1. Start the FastAPI Backend
```powershell
# From project root
.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000 --app-dir backend
```
*API Swagger Documentation:* `http://localhost:8000/docs`

### 2. Start the React Frontend
```powershell
# From frontend directory
cd frontend
npm run dev
```
*Web Application:* `http://localhost:5173`

---

## 6. Project Structure

```
blood-donation-analytics/
├── data/
│   └── raw/
│       ├── transfusion.data          # 748-row raw UCI dataset
│       └── transfusion.names         # Official documentation and citation
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI application entry point
│   │   ├── routes/
│   │   │   ├── dataset.py            # Overview, records & CSV export
│   │   │   ├── analytics.py          # Distributions, comparisons & correlations
│   │   │   ├── models.py             # 4-model benchmarks & retraining
│   │   │   ├── predict.py            # Live donor prediction endpoint
│   │   │   ├── labs.py               # DWDM Labs 1-9 execution endpoint
│   │   │   └── health.py             # Server health status
│   │   ├── services/
│   │   │   ├── data_service.py       # Dataset loader & data dictionary
│   │   │   ├── donor_analytics_service.py # Empirical distributions & correlations
│   │   │   ├── ml_service.py         # 4 classifiers training & inference
│   │   │   └── labs_service.py       # DWDM Labs 1 through 9 logic
│   │   └── utils/
│   │       ├── config.py             # Environment configuration
│   │       └── ml_algorithms.py      # Resilient pure-NumPy CART & KMeans
│   ├── models/                       # Serialized scaler and best model artifacts
│   └── data/reports/                 # Academic DWDM laboratory reports
└── frontend/
    └── src/
        ├── components/
        │   ├── DashboardView.tsx     # Executive KPI & overview dashboard
        │   ├── DatasetOverviewView.tsx # Data dictionary & paginated table
        │   ├── DonorBehaviourView.tsx# Empirical distributions & scatter
        │   ├── ModelComparisonView.tsx# 4 classifiers benchmark & ROC curves
        │   ├── DonorPredictionView.tsx# Live prediction form & probability gauge
        │   ├── LabsSuiteView.tsx     # Interactive DWDM Labs 1-9 suite
        │   ├── AboutView.tsx         # Citation, problem statement & disclaimers
        │   ├── Sidebar.tsx           # Collapsible clinical analytics navigation
        │   └── TopNav.tsx            # Header, breadcrumbs & status badge
        ├── services/api.ts           # Typed API client
        └── types/index.ts            # TypeScript interfaces
```

---

## 7. Ethical & Academic Disclaimer

This project is developed for educational and academic evaluation in Data Warehousing and Data Mining (DWDM). Predictions represent historical statistical associations derived from the 2007 Hsin-Chu City mobile collection study and do **not** constitute a medical guarantee or individual clinical diagnosis.
