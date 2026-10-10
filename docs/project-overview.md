# Blood Donation Analytics & Prediction System — Project Overview

## 1. Introduction
The **Blood Donation Analytics & Prediction System** is a Data Warehousing and Mining (DWM) mini-project designed to extract actionable insights from blood donation historical data. Using the well-known **UCI Blood Transfusion Service Center Dataset**, this system explores donor behavior, predicts future donation likelihood, groups donors into behavioral clusters, and discovers interesting association rules among donor attributes.

---

## 2. Key Objectives
- **Data Preprocessing & Cleansing**: Handling RFMTC attributes, checking statistical summaries, addressing class imbalance, and feature scaling.
- **Exploratory Data Analysis (EDA)**: Interactive distribution charts, correlation heatmaps, box plots, and RFM-based donor profiling.
- **Supervised Classification**: Training and comparing machine learning classifiers (Logistic Regression, Decision Trees, Random Forest, etc.) to predict donor return probability.
- **Unsupervised Clustering**: Segmenting donors into distinct behavior groups using K-Means and Hierarchical clustering (with Elbow method and Silhouette score analysis).
- **Association Rule Mining**: Uncovering association rules using the Apriori algorithm with support, confidence, and lift metrics.

---

## 3. Dataset Characteristics (RFMTC Model)
Based on the blood transfusion data collected from the Blood Transfusion Service Center in Hsin-Chu City, Taiwan:

| Attribute | Description | Data Type | Units / Range |
| :--- | :--- | :--- | :--- |
| **R** (Recency) | Months since last donation | Integer | Months |
| **F** (Frequency) | Total number of donations | Integer | Count |
| **M** (Monetary) | Total blood donated | Integer | c.c. ($250 \times \text{Frequency}$) |
| **T** (Time) | Months since first donation | Integer | Months |
| **Class** (Target) | Whether donor donated blood in March 2007 | Binary (0/1) | 1 = Donated, 0 = Did not donate |

---

## 4. Architecture & System Flow

```
+-------------------------------------------------------------+
|               React + TypeScript + Tailwind UI             |
|  (EDA Dashboard | Model Prediction | Clustering | Apriori)  |
+------------------------------+------------------------------+
                               | REST API (JSON)
                               v
+-------------------------------------------------------------+
|                     FastAPI Backend                         |
|  - /api/health           - /api/eda                         |
|  - /api/classification   - /api/clustering                  |
|  - /api/association-rules                                   |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                 Data & ML Processing Core                   |
|  Pandas, NumPy, Scikit-Learn, Mlxtend, Pydantic             |
+-------------------------------------------------------------+
```

---

## 5. Technology Stack
- **Frontend**: React 18 / 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic
- **Data Mining & ML**: Pandas, NumPy, Scikit-Learn, Mlxtend
