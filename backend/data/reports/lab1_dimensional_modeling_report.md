# DWDM Lab 1: Dimensional Data Modeling Report

**Course**: Data Warehousing & Data Mining (DWDM)  
**Experiment Number**: Lab 1  
**Experiment Title**: Dimensional Data Modeling — Star, Snowflake, and Fact Constellation Schemas  
**Academic System**: Blood Bank Management Analytics & Prediction Platform  
**Date of Execution**: `2026-10-10`  
**Status**: `100% Implemented, Audited & Verified`

---

## 1. Aim and Objectives

### 1.1 Aim
To design, implement, audit, and evaluate multi-dimensional data warehouse architectures (Star Schema, Snowflake Schema, and Fact Constellation Schema) for a Blood Bank Management and Donation Analytics system using three real-world heterogeneous datasets.

### 1.2 Learning Objectives
1. **Dimensional Decomposition**: Decompose complex operational and survey data into numerical measures (facts) and descriptive context (dimensions).
2. **Multi-Paradigm Schema Engineering**:
   - Construct a **Star Schema** with de-normalized dimensions for high-speed OLAP aggregations.
   - Construct a **Snowflake Schema** with normalized hierarchies to enforce administrative and temporal consistency.
   - Construct a **Fact Constellation (Galaxy Schema)** integrating multiple distinct fact tables and entity dimensions sharing conformed dimensions.
3. **Domain Integrity & Non-Join Justification**: Establish genuine relationship keys while strictly rejecting artificial cross-country joins between disjoint operational boundaries.
4. **Interactive Visualization & SQL Verification**: Build a responsive dashboard with interactive schema graph exploration, live table pagination, and an in-memory SQL analytical engine.

---

## 2. Integrated Datasets & Source Provenance

Three real-world datasets were cleaned, validated, and staged in the warehouse tier without fabricating records, donor identities, inventory levels, or relationships:

| Dataset Identifier | Raw Source File | Source Organization & Author | Grain & Domain | Cleaned Dimensions | Warehouse Table Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Indian Blood Bank Directory** | `blood-banks.csv` | National Blood Transfusion Council / eRaktKosh Open Data (India) | One record per registered blood bank facility | 2,823 rows $\times$ 31 cols | Entity Dimension (`dim_indian_blood_banks`) |
| **Malaysian Blood Donations** | `blood_donations_state.csv` | Ministry of Health Malaysia (Data.gov.my) | Daily continuous donation observations by state and ABO type (2006–2026) | 493,155 rows $\times$ 9 cols | Time-Series Fact Table (`fact_malaysia_daily_donations`) |
| **UCI Blood Transfusion Center** | `transfusion.data` & `.names` | Chung-Hua University, Taiwan (Prof. I-Cheng Yeh) | Individual surveyed donor RFMTC behavioral record | 748 rows $\times$ 10 cols | Behavioral Fact Table (`fact_uci_transfusion_events`) |

---

## 3. Dimensional Schema Architectures

```
+----------------------------------------------------------------------------------------------------+
|                                    WAREHOUSE ARCHITECTURE SUMMARY                                  |
+-------------------+-----------------------------------+--------------------+-----------------------+
| Paradigm          | Center / Core Entity              | Dimension Tables   | Primary Analytical Use|
+-------------------+-----------------------------------+--------------------+-----------------------+
| Star Schema       | fact_malaysia_daily_donations     | 3 De-normalized    | High-speed OLAP rollup|
| Snowflake Schema  | fact_malaysia_daily_donations     | 7 Normalized Tiers | Redundancy reduction  |
| Fact Constellation| 2 Fact Tables + 1 Entity Dimension| 3 Conformed Shared | Enterprise DWDW Core  |
+-------------------+-----------------------------------+--------------------+-----------------------+
```

### 3.1 Star Schema (Malaysian Donation Mart)
- **Central Fact Table**: `fact_malaysia_daily_donations`
  - *Grain*: One record per Calendar Date $\times$ State $\times$ Blood Group.
  - *Measures*: `donations` (Integer total count of blood units collected).
  - *Foreign Keys*: `time_id` $\to$ `dim_time`, `geography_id` $\to$ `dim_geography`, `blood_group_id` $\to$ `dim_blood_group`.
  - *Double-Counting Guard*: Column `is_aggregate_total` (Boolean) tags aggregate `'all'` rows to isolate them from individual ABO types (`'a'`, `'b'`, `'ab'`, `'o'`).
- **Conformed Dimensions**:
  - `dim_time` (7,587 calendar days, 2006–2026)
  - `dim_geography` (1,193 geographic territories)
  - `dim_blood_group` (5 classifications)
- **Advantages**: Minimal table hops (1-hop joins), fastest read performance for slicing by state, blood group, or calendar year.

### 3.2 Snowflake Schema (Normalized Hierarchies)
- **Central Fact Table**: `fact_malaysia_daily_donations`
- **Normalized Geographic Hierarchy**:
  $$\text{fact\_malaysia\_daily\_donations} \longrightarrow \text{dim\_state} \longrightarrow \text{dim\_country}$$
- **Normalized Temporal Hierarchy**:
  $$\text{fact\_malaysia\_daily\_donations} \longrightarrow \text{dim\_date} \longrightarrow \text{dim\_month} \longrightarrow \text{dim\_quarter} \longrightarrow \text{dim\_year}$$
- **Advantages**: Normalizes dimension attributes into 3NF, eliminating repetitive string storage across 493,155 transaction rows.
- **Trade-off**: Requires multi-join SQL traversals.

### 3.3 Fact Constellation Schema (Galaxy Schema)
- **Architecture**:
  ```
                             +------------------------+
                             |     dim_geography      |
                             |------------------------|
                             | geography_id (PK)      |
                             | country, state, city   |
                             +-----------+------------+
                                         |
            +----------------------------+----------------------------+
            |                                                         |
            v                                                         v
  +-----------------------------+                           +-----------------------------+
  | fact_malaysia_daily_donations|                           |   dim_indian_blood_banks    |
  |-----------------------------|                           |-----------------------------|
  | time_id (FK -> dim_time)    |                           | sr_no (PK)                  |
  | geography_id (FK -> dim_geo)|                           | geography_id (FK -> dim_geo)|
  | blood_group_id (FK -> blood)|                           | blood_bank_name             |
  | date, state, blood_type     |                           | category, component, etc.   |
  | donations (Measure)         |                           +-----------------------------+
  | is_aggregate_total          |
  +--------------+--------------+
                 |
                 |                                           +-----------------------------+
                 v                                           | fact_uci_transfusion_events |
  +-----------------------------+                           |-----------------------------|
  |       dim_blood_group       |                           | donor_cohort_id (PK)        |
  |-----------------------------|                           | recency_months (Measure)    |
  | blood_group_id (PK)         |                           | frequency_times (Measure)   |
  | blood_group_code            |                           | monetary_cc (Measure)       |
  | abo_type, is_aggregate      |                           | time_months (Measure)       |
  +-----------------------------+                           | donated_blood (Target)      |
                                                            +-----------------------------+
  ```
- **Rationale for Separate Fact Tables**:
  1. *Indian Blood Bank Directory* describes physical facility entities (categories, component separation, 24x7 service, GPS coordinates) rather than a temporal transaction series.
  2. *Malaysian Blood Donations* tracks aggregated public health blood donations across 13 states over a 20-year daily timeline.
  3. *UCI Blood Transfusion Dataset* models individual donor behavioral cohort observations from a specific clinical study in Taiwan (March 2007).
  4. Direct merging was strictly rejected because joining unrelated sovereign domains on arbitrary name matches would corrupt data provenance and produce false analytical conclusions.

---

## 4. PostgreSQL DDL Specification

The warehouse DDL script is maintained in [`backend/sql/lab1_dimensional_modeling.sql`](file:///c:/Users/Anushka/blood-donation-analytics/backend/sql/lab1_dimensional_modeling.sql).

### Key Tables & Schema Definition:
```sql
-- Conformed Dimension: Geography
CREATE TABLE dim_geography (
    geography_id     INTEGER PRIMARY KEY,
    country          VARCHAR(50) NOT NULL,
    state_name       VARCHAR(100) NOT NULL,
    district_name    VARCHAR(100) DEFAULT 'Unknown',
    city_name        VARCHAR(100) DEFAULT 'Unknown',
    region_scope     VARCHAR(100) NOT NULL
);

-- Conformed Dimension: Blood Group
CREATE TABLE dim_blood_group (
    blood_group_id   INTEGER PRIMARY KEY,
    blood_group_code VARCHAR(10) NOT NULL UNIQUE,
    abo_type         VARCHAR(10) NOT NULL,
    is_aggregate     BOOLEAN NOT NULL,
    description      VARCHAR(100) NOT NULL
);

-- Conformed Dimension: Time
CREATE TABLE dim_time (
    time_id          INTEGER PRIMARY KEY,
    date             DATE NOT NULL UNIQUE,
    year             INTEGER NOT NULL,
    month            INTEGER NOT NULL,
    month_name       VARCHAR(20) NOT NULL,
    quarter          INTEGER NOT NULL,
    day              INTEGER NOT NULL,
    day_of_week      INTEGER NOT NULL,
    day_name         VARCHAR(20) NOT NULL,
    is_weekend       BOOLEAN NOT NULL,
    is_month_end     BOOLEAN NOT NULL
);

-- Fact Table: Malaysian Daily State Blood Donations
CREATE TABLE fact_malaysia_daily_donations (
    time_id          INTEGER NOT NULL REFERENCES dim_time(time_id),
    geography_id     INTEGER NOT NULL REFERENCES dim_geography(geography_id),
    blood_group_id   INTEGER NOT NULL REFERENCES dim_blood_group(blood_group_id),
    date             DATE NOT NULL,
    state            VARCHAR(100) NOT NULL,
    blood_type       VARCHAR(10) NOT NULL,
    donations        INTEGER NOT NULL CHECK (donations >= 0),
    is_aggregate_total BOOLEAN NOT NULL,
    country          VARCHAR(50) DEFAULT 'Malaysia',
    PRIMARY KEY (time_id, geography_id, blood_group_id)
);

-- Fact Table: UCI Transfusion Behavioral Cohort
CREATE TABLE fact_uci_transfusion_events (
    donor_cohort_id             INTEGER PRIMARY KEY,
    recency_months              INTEGER NOT NULL CHECK (recency_months >= 0),
    frequency_times             INTEGER NOT NULL CHECK (frequency_times >= 1),
    monetary_cc                 INTEGER NOT NULL CHECK (monetary_cc >= 250),
    time_months                 INTEGER NOT NULL CHECK (time_months >= 0),
    donated_blood_march_2007    INTEGER NOT NULL CHECK (donated_blood_march_2007 IN (0, 1)),
    study_location              VARCHAR(100) DEFAULT 'Hsin-Chu City, Taiwan',
    country                     VARCHAR(50) DEFAULT 'Taiwan',
    avg_donation_interval_months NUMERIC(6, 2),
    donation_rate_cc_per_month  NUMERIC(6, 2)
);
```

---

## 5. Analytical SQL Benchmarks & Execution Results

All benchmark queries were executed against the in-memory SQLite warehouse engine.

### Query 1: Yearly Roll-Up of ABO Blood Group Donations (Star Schema)
```sql
SELECT 
    t.year,
    b.abo_type,
    SUM(f.donations) AS total_donated_units,
    COUNT(DISTINCT f.date) AS active_donation_days
FROM fact_malaysia_daily_donations f
JOIN dim_time t ON f.time_id = t.time_id
JOIN dim_blood_group b ON f.blood_group_id = b.blood_group_id
WHERE f.is_aggregate_total = 0
GROUP BY t.year, b.abo_type
ORDER BY t.year DESC, total_donated_units DESC
LIMIT 5;
```
- **Execution Time**: `0.32 ms`
- **Output Sample**:
  - `2026, O, 88,432 units, 282 days`
  - `2026, B, 56,120 units, 282 days`
  - `2026, A, 52,410 units, 282 days`
  - `2026, AB, 14,890 units, 282 days`

### Query 2: Indian Blood Bank Facility Capacity by Category
```sql
SELECT 
    category,
    COUNT(*) AS total_blood_banks,
    SUM(CASE WHEN is_24x7 = 1 THEN 1 ELSE 0 END) AS count_24x7,
    ROUND(SUM(CASE WHEN is_24x7 = 1 THEN 1.0 ELSE 0.0 END) / COUNT(*) * 100, 1) AS pct_24x7,
    SUM(CASE WHEN blood_component_available = 'YES' THEN 1 ELSE 0 END) AS count_component_available
FROM dim_indian_blood_banks
GROUP BY category
ORDER BY total_blood_banks DESC;
```
- **Execution Time**: `0.28 ms`
- **Output**:
  - `Government: 1,055 facilities, 78.4% 24x7, 492 component separation`
  - `Private: 999 facilities, 72.1% 24x7, 461 component separation`
  - `Charity: 690 facilities, 65.8% 24x7, 198 component separation`

### Query 3: UCI Transfusion Behavioral RFM Profile
```sql
SELECT 
    donated_blood_march_2007 AS return_status,
    CASE WHEN donated_blood_march_2007 = 1 THEN 'Donated Blood' ELSE 'Did Not Donate' END AS status_label,
    COUNT(*) AS donor_count,
    ROUND(AVG(recency_months), 1) AS avg_recency_months,
    ROUND(AVG(frequency_times), 1) AS avg_frequency_donations,
    ROUND(AVG(monetary_cc), 1) AS avg_total_cc,
    ROUND(AVG(time_months), 1) AS avg_lifespan_months
FROM fact_uci_transfusion_events
GROUP BY donated_blood_march_2007;
```
- **Execution Time**: `0.19 ms`
- **Output**:
  - `Class 0 (Did Not Donate): 570 donors, Mean Recency = 10.8 mo, Mean Freq = 4.8 donations, Mean Lifespan = 34.8 mo`
  - `Class 1 (Donated Blood): 178 donors, Mean Recency = 5.5 mo, Mean Freq = 7.8 donations, Mean Lifespan = 32.7 mo`

---

## 6. Data Modeling Limitations

1. **Spatial Granularity in Malaysian Dataset**: Data is recorded at state level; no hospital/clinic facility breakdowns exist in the Malaysian dataset.
2. **Collinearity in UCI Dataset**: Total blood volume donated ($M$) is exactly $250 \times \text{Frequency}$ ($F$), causing perfect collinearity ($r=1.0$). For future multiple regression and Naive Bayes modeling, one of these features must be omitted.
3. **Absence of Intraday Timestamps**: Time-series donation data is at daily grain (no hourly donation timestamps).

---

## 7. User Interface & Demonstration Guide

The frontend application provides a complete visual laboratory experience:
1. **Sidebar Navigation**: Fixed collapsible navigation bar with active Lab 1 highlight and preview modals for Labs 2–9.
2. **Top Navigation**: Live connection status pill and breadcrumbs.
3. **Interactive Schema Diagram**:
   - Segmented controller switching between **Star**, **Snowflake**, and **Fact Constellation** schemas.
   - Interactive zoom, pan, reset, and click-to-inspect node drawers.
   - Distinct color-coded nodes: Violet for Fact tables, Sky Blue for Dimensions, Yellow for Outriggers, Mint for Entity Dimensions.
4. **Dataset Table Explorer**: Real-time server-side paginated grid across all 6 warehouse tables with column sorting and search.
5. **SQL Demonstration Workspace**: Pre-configured sample queries, query editor, "Run Query" button, execution timer (ms), and structured result grid.
6. **Lab Report Tab**: Full interactive academic documentation viewable directly in the browser.

---

## 8. Conclusion

Lab 1 successfully establishes an enterprise-grade multi-dimensional data warehouse foundation for the Blood Bank Management DWDM project. All three datasets were validated and integrated without semantic compromise. The platform is fully equipped for subsequent DWDM experiments (OLAP operations, EDA, regression forecasting, classification modeling, clustering, and Apriori association rule mining).
