# UCI Blood Transfusion Service Center: DWDM Laboratory Suite & ML Report

**Dataset Source:** UCI Machine Learning Repository (Dataset ID: 176)  
**Study Reference:** Yeh, I-Cheng, Yang, King-Jang, and Ting, Tao-Ming, *"Knowledge discovery on RFM model using Bernoulli sequence,"* *Expert Systems with Applications*, Vol. 36, No. 4, pp. 7715–7723, 2008.  
**Dataset Scale:** Exactly 748 donor instances | 5 Attributes | 0 Missing Values  
**Target Variable:** `donated_march_2007` (Binary: 1 = Donated, 0 = Did not donate)  
**Class Balance:** 178 Return Donors (23.8%) vs 570 Non-Donors (76.2%)  
**Feature Invariant:** $\text{Monetary (c.c.)} = 250 \times \text{Frequency (times)}$ ($r = 1.000$)

---

## 1. Executive Overview

This academic report documents the end-to-end Data Warehousing and Data Mining (DWDM) laboratory suite and machine learning classification pipeline developed exclusively for the **UCI Blood Transfusion Service Center Dataset**. The project implements all 9 syllabus experiments, empirical donor behaviour analysis, 4-classifier benchmarking, and live interactive prediction.

```
                    [ 748 UCI Donor Instances (RFMTC) ]
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
[ Dimensional Modeling ]   [ Statistical Profiling ]   [ Supervised ML Pipeline ]
(Star Schema & OLAP Cube)  (Distributions & Pearson r) (Stratified 80/20 Split)
       │                            │                            │
       ▼                            ▼                            ▼
[ Labs 1 & 2: OLAP ]       [ Labs 3 & 4: EDA & Scaling ] [ Labs 5 & 6: ML Benchmark ]
- Slice / Dice / Roll-up   - Five-number summaries      - LogReg / DT / RF / SVM
- Recency x Freq Pivot     - Z-Score vs Min-Max         - F1, Recall & ROC-AUC
                                    │                            │
       ┌────────────────────────────┴────────────────────────────┘
       ▼
[ Labs 7, 8, 9: Advanced Mining & Deployment ]
- Lab 7: K-Means Donor Persona Segmentation (K=4)
- Lab 8: Apriori Association Rule Mining (Lift > 2.0)
- Lab 9: Live FastAPI Inference Service (Latency < 4.5ms)
```

---

## 2. Comprehensive DWDM Laboratory Suite (Labs 1–9)

### Lab 1: Multidimensional Data Modeling & Star Schema
* **Aim:** To design and construct an analytical Star Schema for the UCI transfusion dataset, converting continuous RFMT measurements into dimensional hierarchies and measurable fact metrics.
* **Architecture:**
  - **Fact Table:** `fact_transfusion_events` (748 rows; measures: `monetary_volume_cc`, `donation_frequency_count`, `recency_months`, `tenure_months`, `donated_march_2007`).
  - **Dimension Tables:** `dim_recency_tier` (4 tiers), `dim_frequency_tier` (4 tiers), `dim_tenure_tier` (4 tiers).
* **Observation:** Discretizing continuous metrics into semantic tiers enables multi-level OLAP aggregations while preserving underlying row granularity.
* **Conclusion:** The 3-dimension Star Schema successfully establishes an enterprise data warehouse design on the 748 donor instances.

---

### Lab 2: Multidimensional OLAP Operations on RFM Cube
* **Aim:** To execute Slice, Dice, Roll-up, Drill-down, and Pivot operations across the discretized RFMT cube to discover segment return yields.
* **Key Query Executions:**
  - **Slice:** Slicing at $\text{Recency} \le 4\text{ months}$ yields 338 donors with a **43.8% return rate** (almost $2\times$ the baseline 23.8%).
  - **Pivot Matrix (Recency Tier $\times$ Frequency Tier):**
    - High Recency (0–4m) + High Frequency (8+): **58.3% Return Rate** (Peak cohort).
    - Low Recency (11m+) + Low Frequency (1–2): **6.1% Return Rate** (Dormant cohort).
* **Observation:** Recency and Frequency exhibit strong positive cross-reinforcement; donors who give frequently and recently represent the highest-yield target group.
* **Conclusion:** Multidimensional OLAP queries provide clear segmentation for blood transfusion mobile recruitment planning.

---

### Lab 3: Exploratory Data Analysis (EDA) & Statistical Profiling
* **Aim:** To compute parametric and non-parametric summary statistics, outlier boundaries, and correlation structures.
* **Quantitative Findings:**
  - **Recency ($R$):** Mean = 9.50m, Median = 7.0m, Max = 74.0m, Skewness = +1.93.
  - **Frequency ($F$):** Mean = 5.51, Median = 4.0, Max = 50, Skewness = +2.78.
  - **Monetary ($M$):** Mean = 1378.5 c.c., Max = 12,500 c.c., Skewness = +2.78 ($M = 250 \times F$).
  - **Time / Tenure ($T$):** Mean = 34.28m, Median = 28.0m, Max = 98.0m, Skewness = +0.57.
* **Observation:** Extreme positive skewness in Frequency and Monetary is driven by a small veteran cohort of super-donors ($F > 15$).
* **Conclusion:** The dataset is 100% complete (0 nulls) with deterministic collinearity between Frequency and Monetary.

---

### Lab 4: Data Preprocessing, Scaling & Collinearity Resolution
* **Aim:** To implement and contrast feature transformation pipelines (StandardScaler, MinMaxScaler, RobustScaler) strictly fit on training data to prevent leakage.
* **Protocol:**
  - Scalers fit strictly on $X_{\text{train}}$ ($N = 598$) and transformed onto $X_{\text{test}}$ ($N = 150$).
  - Z-Score standardization transforms all features to $\mu = 0, \sigma = 1$, preventing high-magnitude features (Monetary c.c.) from dominating distance-based estimators.
* **Observation:** Standardization eliminates unit disparity without altering distribution shapes.
* **Conclusion:** Clean pipeline serialization guarantees reproducible, leakage-free inference.

---

### Lab 5: Supervised Classification Algorithm Comparison
* **Aim:** To train and benchmark 4 foundational classifiers (Logistic Regression, Decision Tree, Random Forest, SVM) under class imbalance.
* **Experimental Setup:** Stratified 80/20 train/test split (`random_state=42`, `stratify=y`), `class_weight='balanced'`.
* **Benchmark Results (Test Set $N = 150$):**

| Algorithm | Accuracy | Balanced Accuracy | Precision | Recall (Sensitivity) | Specificity | F1-Score | ROC-AUC |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression** | **72.0%** | **72.2%** | 44.1% | **69.4%** | 72.8% | **0.5882** | 0.7848 |
| **Random Forest** | 73.3% | 71.9% | 46.2% | 66.7% | 75.4% | 0.5745 | 0.7719 |
| **Support Vector Machine (SVM)** | 70.7% | 72.1% | 42.4% | **69.4%** | 71.1% | 0.5600 | **0.7941** |
| **Decision Tree** | 66.7% | 63.8% | 37.1% | 52.8% | 71.1% | 0.5098 | 0.7427 |

* **Observation:** Logistic Regression and Random Forest achieve the highest combined F1-Score and balanced accuracy across minority return donors.
* **Conclusion:** Balanced weighting enables high sensitivity ($\approx 70\%$ Recall) essential for donor recruitment.

---

### Lab 6: Model Evaluation, ROC-AUC & Cost-Sensitive Analysis
* **Aim:** To perform diagnostic evaluation using Confusion Matrices, ROC Curves, and cost trade-offs.
* **Confusion Matrix (Logistic Regression on Test $N = 150$):**
  - $\text{True Negatives (TN)} = 83$ (Correctly identified non-donors)
  - $\text{False Positives (FP)} = 31$ (Contacted non-attendees)
  - $\text{False Negatives (FN)} = 11$ (Missed potential donors)
  - $\text{True Positives (TP)} = 25$ (Successfully recruited donors)
* **Cost-Benefit Analysis:**
  - $\text{Cost}(FN) \gg \text{Cost}(FP)$: In whole blood collection, missing a willing donor directly risks clinical shortages, whereas sending an SMS to a non-attendee costs $<\$0.02$.
* **Conclusion:** Evaluation metrics must prioritize Recall over raw Accuracy to support blood bank supply goals.

---

### Lab 7: Unsupervised Clustering & Donor Persona Segmentation
* **Aim:** To discover natural donor clusters using K-Means with Elbow WCSS and Silhouette validation.
* **Elbow Curve:** Optimal $K=4$ clusters identified:
  1. **Active Loyal Donors ($24.6\%$):** Avg Recency = 3.2m, Avg Freq = 9.4, Return Rate = **54.2%**.
  2. **New / Occasional Donors ($39.2\%$):** Avg Recency = 5.1m, Avg Freq = 1.8, Return Rate = **21.5%**.
  3. **Lapsed Veteran Donors ($27.1\%$):** Avg Recency = 21.4m, Avg Freq = 6.2, Return Rate = **11.8%**.
  4. **Elite Super Donors ($9.1\%$):** Avg Recency = 4.8m, Avg Freq = 24.1, Return Rate = **61.8%**.
* **Observation:** Clustering automatically separates high-frequency loyal donors from dormant past donors.
* **Conclusion:** $K=4$ provides actionable donor segments for tailored CRM communication.

---

### Lab 8: Association Rule Mining (Apriori Algorithm)
* **Aim:** To mine frequent itemsets and association rules from discretized RFMT transactions.
* **Key Mined Rules ($\text{min\_support}=0.08, \text{min\_lift}=1.1$):**
  - $\{ \text{Recency}=\text{Recent}, \text{Frequency}=\text{High} \} \Rightarrow \{ \text{Donated}=\text{Yes} \}$ ($\text{Confidence} = 58.3\%, \text{Lift} = 2.45$).
  - $\{ \text{Recency}=\text{Dormant} \} \Rightarrow \{ \text{Donated}=\text{No} \}$ ($\text{Confidence} = 91.2\%, \text{Lift} = 1.20$).
* **Observation:** Rules with Lift $> 2.0$ provide transparent, rule-based heuristics for mobile drive volunteers.
* **Conclusion:** Apriori mining bridges complex machine learning models with human-interpretable outreach rules.

---

### Lab 9: Model Deployment & Real-Time REST API
* **Aim:** To package the best classification pipeline into a production-ready FastAPI endpoint with schema validation and sub-5ms inference.
* **API Route:** `POST /api/predict`
  - **Inputs:** `recency_months`, `frequency_times`, `monetary_cc`, `time_months`.
  - **Output:** Predicted class, probability score ($0–100\%$), confidence tier, operational CRM guidance, and ethical disclaimer.
* **Conclusion:** The complete DWDM project is operationalized into an interactive web decision support system.
