# Data Warehousing & Mining (DWM) Methodology

This document outlines the step-by-step data mining methodology applied to the Blood Transfusion Service Center dataset.

---

## 1. Data Preprocessing & Transformation
1. **Data Ingestion**:
   - Loading `transfusion.data` into Pandas DataFrames.
   - Renaming raw columns (`Recency (months)`, `Frequency (times)`, `Monetary (c.c. blood)`, `Time (months)`, `whether he/she donated blood in March 2007`) to standard identifiers (`recency`, `frequency`, `monetary`, `time`, `donated`).
2. **Data Cleaning & Verification**:
   - Checking for missing values, duplicates, and extreme outliers.
   - Computing descriptive statistics (mean, median, std, quartiles, skewness).
3. **Feature Engineering & Transformation**:
   - Discretization / Binning for association rule mining (e.g., categorizing Recency into `Low`, `Medium`, `High`).
   - Normalization / Standardization (StandardScaler, MinMaxScaler) for distance-based clustering algorithms.

---

## 2. Exploratory Data Analysis (EDA)
- **Univariate Analysis**: Histograms and Kernel Density Estimations (KDE) for donation recency, frequency, monetary, and time.
- **Bivariate & Multivariate Analysis**:
  - Correlation Matrix & Heatmap.
  - Pairwise scatter plots colored by donor class.
  - Box plots to compare feature distributions between active vs. inactive donors.
- **Donor Retention Insights**: Calculating retention rate, repeat donation rate, and time decay analysis.

---

## 3. Supervised Classification Modeling
1. **Problem Formulation**:
   - Binary Classification task: Predict whether target $Y = 1$ (donated) or $Y = 0$ (not donated).
2. **Algorithms**:
   - **Logistic Regression**: Baseline linear probabilistic classifier.
   - **Decision Tree Classifier**: Interpretable rule-based tree model.
   - **Random Forest Classifier**: Ensemble learning to evaluate feature importances and reduce variance.
   - **Support Vector Machine (SVM) / k-NN**: Non-linear boundary evaluations.
3. **Evaluation Metrics**:
   - Accuracy, Precision, Recall, F1-Score, ROC-AUC score, and Confusion Matrix analysis.

---

## 4. Unsupervised Clustering Analysis
1. **Algorithms**:
   - **K-Means Clustering**: Partitioning donors into $k$ distinct behavioral cohorts.
   - **Hierarchical / Agglomerative Clustering**: Dendrogram-based grouping.
2. **Optimal Cluster Selection**:
   - **Elbow Method**: Evaluating Within-Cluster Sum of Squares (WCSS) across $k=2 \dots 10$.
   - **Silhouette Score**: Measuring cohesion and separation between clusters.
3. **Cluster Persona Profiling**:
   - Segmenting donors into profiles such as *Lapsed Donors*, *New First-Time Donors*, *Frequent Loyal Donors*, and *Occasional Donors*.

---

## 5. Association Rule Mining (Apriori)
1. **Transaction Conversion**:
   - Discretizing continuous RFMTC numeric variables into categorical intervals (e.g., `Recency_Recent`, `Frequency_High`, `Time_Long`).
   - One-hot encoding categorical intervals into binary transactional matrices.
2. **Rule Generation via `mlxtend`**:
   - Generating frequent itemsets using the Apriori algorithm given a minimum support threshold ($\text{min\_support}$).
   - Deriving association rules satisfying minimum confidence ($\text{min\_confidence}$) and filtering by Lift ($\text{Lift} > 1$).
3. **Rule Interpretation**:
   - Analyzing rules to discover conditions strongly linked to donor return behavior.
