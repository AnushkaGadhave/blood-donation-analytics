# Blood Donation Analytics & Prediction System

A Data Warehousing and Mining (DWM) mini-project for analyzing the **UCI Blood Transfusion Service Center Dataset** using modern full-stack analytics, interactive visualizations, supervised classification, unsupervised clustering, and Apriori association rule mining.

---

## 🎯 Project Objectives
1. **Data Preprocessing & Transformation**: Cleansing, standardization, and discretization of donor RFMTC attributes.
2. **Exploratory Data Analysis (EDA)**: Univariate distributions, bivariate correlations, and interactive charts built with Recharts.
3. **Supervised Classification**: Training and evaluating predictive models (Logistic Regression, Decision Trees, Random Forest) to forecast future donation likelihood.
4. **Unsupervised Clustering**: Segmenting donors into distinct behavioral personas using K-Means and Hierarchical clustering.
5. **Association Rule Mining**: Discovering high-confidence donor pattern rules using the Apriori algorithm via `mlxtend`.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/) | High-performance interactive web application |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Healthcare-tailored design system (rose/burgundy theme) |
| **Charts** | [Recharts](https://recharts.org/) | Responsive data mining charts and distributions |
| **Icons** | [Lucide React](https://lucide.dev/) | Modern UI icon library |
| **Backend API** | [Python 3.10+](https://www.python.org/), [FastAPI](https://fastapi.tiangolo.com/), [Uvicorn](https://www.uvicorn.org/) | Async REST API & OpenAPI docs |
| **Data Processing** | [Pandas](https://pandas.pydata.org/), [NumPy](https://numpy.org/) | Ingestion, filtering, and numerical processing |
| **Machine Learning**| [scikit-learn](https://scikit-learn.org/) | Model training, cross-validation, and metrics |
| **Association Rules**| [mlxtend](http://rasbt.github.io/mlxtend/) | Apriori frequent itemset and association rule generation |

---

## 📂 Project Structure

```
blood-donation-analytics/
├── frontend/                     # React + TypeScript + Vite frontend
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── components/           # Reusable UI cards, explainer, navbar
│   │   ├── services/             # API client services
│   │   ├── types/                # TypeScript interface definitions
│   │   ├── App.tsx               # Main analytics dashboard & tabs
│   │   ├── index.css             # Tailwind CSS entrypoint
│   │   └── main.tsx              # React mounting root
│   ├── package.json              # Frontend dependencies
│   ├── tsconfig.json             # TypeScript configuration
│   └── vite.config.ts            # Vite configuration with Tailwind CSS
│
├── backend/                      # FastAPI backend application
│   ├── data/
│   │   └── README.md             # Dataset placement instructions (transfusion.data)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py               # FastAPI entrypoint and CORS setup
│   │   ├── routes/               # Modular API endpoint routers
│   │   │   ├── __init__.py
│   │   │   ├── health.py         # Health check & dataset detector
│   │   │   ├── eda.py            # Dataset overview & summary statistics
│   │   │   ├── classification.py # Model prediction endpoints
│   │   │   ├── clustering.py     # Donor clustering endpoints
│   │   │   └── association.py    # Apriori association rule endpoints
│   │   ├── services/             # Analytics business logic
│   │   │   ├── __init__.py
│   │   │   ├── data_service.py   # Dataset ingestion & validation
│   │   │   ├── ml_service.py     # Model training & inference logic
│   │   │   ├── clustering_service.py # K-Means & clustering logic
│   │   │   └── association_service.py # Apriori mining logic
│   │   ├── models/               # Pydantic schemas & data contracts
│   │   │   ├── __init__.py
│   │   │   └── schemas.py
│   │   └── utils/                # Config and helper utilities
│   │       ├── __init__.py
│   │       └── config.py
│   ├── requirements.txt          # Python dependencies
│   └── .env.example              # Backend environment template
│
├── docs/                         # Project & academic documentation
│   ├── project-overview.md       # High-level architecture & RFMTC overview
│   └── methodology.md            # Step-by-step DWM mining methodology
│
├── .gitignore                    # Git ignore rules
├── .env.example                  # Root environment template
└── README.md                     # Root project documentation
```

---

## 📊 Dataset Setup (UCI Repository)

The project utilizes the **Blood Transfusion Service Center Dataset** from the UCI Machine Learning Repository.

1. Download `transfusion.data` and `transfusion.names` from [UCI Machine Learning Repository](https://archive.ics.uci.edu/dataset/176/blood+transfusion+service+center).
2. Place both files in the [backend/data/](backend/data/) directory:
   ```
   backend/data/transfusion.data
   backend/data/transfusion.names
   ```

### Attributes:
- **R (Recency)**: Months since last donation
- **F (Frequency)**: Total number of donations
- **M (Monetary)**: Total blood donated in c.c. ($250 \times \text{Frequency}$)
- **T (Time)**: Months since first donation
- **Class (Target)**: Whether donated blood in March 2007 (1 = Yes, 0 = No)

---

## 🚀 Getting Started

The frontend and backend can be run completely independently.

### 1. Backend Setup & Run

```bash
# Navigate to backend directory
cd backend

# Create a Python virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Windows (Command Prompt):
.\venv\Scripts\activate.bat
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```

- **API Root**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

### 2. Frontend Setup & Run

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

- **Frontend App**: [http://localhost:5173](http://localhost:5173)

---

## 🔒 Security & Git Hygiene
- The repository `.gitignore` automatically prevents committing virtual environments (`venv/`), `node_modules/`, build outputs (`dist/`), `.env` secrets, and raw dataset files (`*.data`, `*.csv`).
- Placeholder `.env.example` files are provided for configuration.
