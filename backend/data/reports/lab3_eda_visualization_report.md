# DWDM Lab 3: Exploratory Data Analysis (EDA) & Data Visualization

**Course:** Data Warehousing and Data Mining (DWDM)  
**Experiment Name:** Lab 3 — Exploratory Data Analysis & Interactive Statistical Visualizations  
**Scope:** Profiling and Visualizing Three Real Blood Bank Datasets  
**Datasets Analyzed:**
1. `dim_indian_blood_banks` (4,411 Blood Bank Facilities)
2. `fact_malaysia_daily_donations` (493,155 Daily State-wise Donation Records)
3. `fact_uci_transfusion_events` (748 Donor Behavioral Cohort Records)  
**Execution Environment:** Python 3.13 / FastAPI / Pandas / NumPy / Recharts  
**Status:** Validated & Functionally Complete

---

## 1. Objective and Theoretical Foundations

### 1.1 Objective
To systematically explore, profile, clean, and visualize the three heterogeneous datasets integrated into the Blood Bank Management Data Warehouse. The experiment establishes:
- Data quality audits (missingness, duplicate counts, coordinate validities).
- Descriptive parametric and non-parametric summary statistics (mean, median, standard deviation, interquartile range, skewness).
- Univariate, bivariate, and multivariate visual analytics using 8 mandatory chart paradigms.
- Feature collinearity identification (e.g. deterministic relationship between Frequency and Monetary volume in UCI dataset).
- Strict separation of data grains, contexts, and observational units across distinct national healthcare systems.

---

## 2. Dataset Profiles & Statistical Quality Audits

### 2.1 Dataset 1: Indian Blood Bank Directory
- **Observational Unit:** Facility / Blood Bank Registry Record (Static Facility Inventory)
- **Total Records:** 4,411 rows | **Total Attributes:** 18 columns
- **Data Provenance:** National Health Portal of India (data.gov.in)
- **Primary Dimensions:** State, District, Category (Govt / Red Cross / Private / Trust / Charitable)

#### Data Quality & Completeness Audit:
- **Duplicate Rows:** 0 (using composite key `h_name` + `state` + `district`)
- **Missing Value Profile:**
  - `state` / `district`: 0 missing (100% complete)
  - `blood_bank_name`: 0 missing (100% complete)
  - `category`: 0 missing (100% complete)
  - `contact_number`: 87 missing (1.97%)
  - `nodal_officer`: 1,824 missing (41.35%)
  - `latitude` / `longitude`: 412 records with 0.0 or unresolvable coordinates (9.34%)
- **Distribution by Facility Ownership:**
  - Government: ~45.2%
  - Private / Trust / Charitable: ~42.6%
  - Red Cross: ~12.2%

---

### 2.2 Dataset 2: Malaysia State-wise Blood Donations
- **Observational Unit:** Daily Aggregated Blood Collection Event by State & Blood Group
- **Total Records:** 493,155 rows | **Total Attributes:** 10 columns
- **Temporal Span:** 2006 to 2024 (18+ Years continuous daily time-series)
- **Primary Dimensions:** Date (Daily/Monthly/Yearly), State (16 States/Territories), Blood Group (A, B, O, AB, All)

#### Data Quality & Double-Counting Invariant:
- **Composite Key:** `full_date` + `state_name` + `blood_group_name`
- **Duplicate Rows:** 0
- **Partitioning:**
  - Individual ABO Types (`is_aggregate_total = 0`): 394,524 records
  - Pre-aggregated State Totals (`is_aggregate_total = 1`): 98,631 records
- **Descriptive Statistics (Daily Donations per State-Blood Group cell):**
  - Count: 394,524
  - Mean: 11.24 units / day
  - Std Dev: 14.81 units
  - Min: 0 | Q1 (25%): 2 | Median (50%): 6 | Q3 (75%): 15 | Max: 218 units

---

### 2.3 Dataset 3: UCI Blood Transfusion Service Center (Hsin-Chu City, Taiwan)
- **Observational Unit:** Individual Blood Donor Longitudinal Behavioral Profile (RFMTC Model)
- **Total Records:** 748 donors | **Total Attributes:** 5 columns
- **Domain Context:** Donor database of Blood Transfusion Service Center in Hsin-Chu City, Taiwan
- **Target Variable:** `donated_in_march_2007` (Binary: 1 = Donated blood in target period, 0 = Did not donate)

#### Five-Number Summary & Distribution Metrics:

| Feature | Attribute Meaning | Mean | Std Dev | Min | Q1 (25%) | Median (50%) | Q3 (75%) | Max | Skewness |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Recency ($R$)** | Months since last donation | 9.50 | 8.10 | 0.0 | 2.75 | 7.00 | 14.00 | 74.0 | +1.93 (Right-skewed) |
| **Frequency ($F$)** | Total number of donations | 5.51 | 5.84 | 1.0 | 2.00 | 4.00 | 7.00 | 50.0 | +2.78 (Right-skewed) |
| **Monetary ($M$)** | Total blood donated (cc) | 1378.5 | 1459.8 | 250.0 | 500.0 | 1000.0 | 1750.0 | 12500.0 | +2.78 (Collinear) |
| **Time ($T$)** | Months since first donation | 34.28 | 24.38 | 2.0 | 16.00 | 28.00 | 50.00 | 98.0 | +0.57 (Mildly right) |
| **Donated ($Y$)** | Binary Class Target | 0.238 | 0.426 | 0.0 | 0.00 | 0.00 | 0.00 | 1.0 | Class Imbalance (23.8% : 76.2%) |

#### Critical Mathematical Discovery: Feature Collinearity
$$M = 250 \times F \quad (\text{Pearson Correlation } r = 1.000)$$
Every single unit donation is recorded as exactly $250\text{ c.c.}$ of blood. Thus, $M$ contains 0 additional information over $F$. In predictive modeling (Labs 4–6), one of these features should be dropped to prevent collinearity distortion.

---

## 3. Visual Analytics Catalog: Eight Mandatory Chart Paradigms

| Chart Paradigm | Target Dataset | Dimensions / Measures Plotted | Key Analytical Finding |
| :--- | :--- | :--- | :--- |
| **1. Bar Chart** | Indian Blood Banks | State vs. Facility Count | Top states (Maharashtra, UP, TN) account for >40% of all registered blood bank infrastructure. |
| **2. Donut / Pie Chart** | Indian Blood Banks | Facility Category Distribution | Government facilities comprise 45.2%, followed by Trust/Private at 42.6% and Red Cross at 12.2%. |
| **3. Line Chart** | Malaysia Donations | Monthly Aggregate Time-Series | Strong seasonal cyclicality with pronounced drops during Ramadan and holiday seasons. |
| **4. Grouped / Stacked Bar** | Malaysia Donations | Top States x ABO Group | Blood Group O constitutes ~43% of all donations, followed by B (~28%), A (~23%), and AB (~6%). |
| **5. Histogram** | UCI Transfusion | Frequency & Recency bins | Strong exponential decay; over 65% of donors have donated $\le 4$ times. |
| **6. Box Plot** | UCI Transfusion | Five-number summary + Outliers | Clear upper outliers in Frequency ($F > 15$) and Recency ($R > 30$), indicating a small cohort of super-donors. |
| **7. Scatter Plot** | UCI Transfusion | Time ($X$) vs. Frequency ($Y$) by Target | Donors with high donation density ($\frac{\text{Frequency}}{\text{Time}}$) have significantly higher probability of donating in March 2007 ($Y=1$). |
| **8. Correlation Heatmap** | UCI Transfusion | Pearson Correlation Matrix | $r(F, M) = 1.000$ (perfect collinearity); $r(R, Y) = -0.280$ (negative recency correlation: recent donors donate again). |

---

## 4. Correlation Matrix of UCI RFMTC Features

$$\begin{pmatrix}
 & \text{Recency} & \text{Frequency} & \text{Monetary} & \text{Time} & \text{Donated} \\
\text{Recency} & 1.000 & -0.183 & -0.183 & -0.161 & -0.280 \\
\text{Frequency} & -0.183 & 1.000 & 1.000 & 0.634 & +0.219 \\
\text{Monetary} & -0.183 & 1.000 & 1.000 & 0.634 & +0.219 \\
\text{Time} & -0.161 & 0.634 & 0.634 & 1.000 & -0.036 \\
\text{Donated} & -0.280 & +0.219 & +0.219 & -0.036 & 1.000
\end{pmatrix}$$

---

## 5. Summary & Academic Conclusions
Lab 3 successfully delivers end-to-end Exploratory Data Analysis and statistical visualizations across three distinct blood banking datasets.
1. **Provenance Integrity:** Heterogeneous datasets with different observation grains (facility registry, daily aggregate time series, single-donor longitudinal study) are analyzed under strictly isolated contexts.
2. **Quality Audit:** Zero missing keys in dimensional attributes; collinearities identified and documented.
3. **Interactive Visualizations:** All 8 required charting types are implemented and driven directly by real-time server-side calculations.
