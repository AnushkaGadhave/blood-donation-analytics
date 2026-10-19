# Blood Bank Management DWDM Data Integration Report

**Execution Timestamp**: `2026-10-10T22:27:43.322289`  
**Architecture Model**: `Fact Constellation Schema (Galaxy Schema)`  
**Integration Status**: `COMPLETE, AUDITED & VALIDATED`

---

## 1. Executive Summary

This data integration pipeline establishes a unified, clean, and warehouse-ready data layer for the **Blood Bank Management Data Warehousing & Data Mining (DWDM)** project. 

Three distinct real-world datasets were inspected, cleaned, standardized, and integrated through a **Fact Constellation Schema**. Legitimate source boundaries and population identities were strictly preserved:
- **No artificial cross-dataset joins** were performed between India, Malaysia, and Taiwan.
- **No synthetic records or false identifiers** were invented.
- **Conformed dimensions** (`dim_geography`, `dim_blood_group`, `dim_time`) with integer surrogate primary and foreign keys enable multi-dimensional OLAP analysis without corrupting source semantics.

---

## 2. Dataset Verification & Transformation Summary

### Dataset 1: Indian Blood Bank Directory
- **Source File**: `blood-banks.csv` (`latin-1` encoded)
- **Raw Dimensions**: `2,823` rows $\times$ `27` columns
- **Cleaned Dimensions**: `2,823` rows $\times$ `31` columns
- **Duplicate Rows**: `0`
- **Coverage**: `36` States & Union Territories across India
- **Facility Categories**: {"Government": 1055, "Private": 999, "Charity": 690, "Not Specified": 79}
- **Component Availability**: {"NO": 1254, "YES": 1151, "NOT SPECIFIED": 418}
- **Geographic Coordinates**: `2,439` blood banks have valid GPS coordinates (bounded inside India). Missing or `0.0, 0.0` coordinates were preserved transparently with `is_valid_coordinates = False` flag without fabricating coordinates.
- **Foreign Key Integration**: Linked to `dim_geography` via surrogate foreign key `geography_id`.
- **Cleaned Output**: [`backend/data/processed/indian_blood_bank_directory_clean.csv`](file:///c:/Users/Anushka/blood-donation-analytics/backend/data/processed/indian_blood_bank_directory_clean.csv)

### Dataset 2: Malaysian State Blood Donations
- **Source File**: `blood_donations_state.csv` (UTF-8 encoded)
- **Raw Dimensions**: `493,155` rows $\times$ `4` columns
- **Cleaned Dimensions**: `493,155` rows $\times$ `6` columns
- **Date Range**: `2006-01-01` to `2026-10-09` (over 20 years of daily continuous records)
- **State Coverage**: `13` Malaysian States (`Johor, Kedah, Kelantan, Melaka, Negeri Sembilan, Pahang, Perak, Pulau Pinang, Sabah, Sarawak, Selangor, Terengganu, W.P. Kuala Lumpur`)
- **Blood Types Recorded**: 5 categories (`a`, `b`, `ab`, `o`, `all`) with `98,631` records each
- **Double-Counting Prevention**: Flag `is_aggregate_total` explicitly tags `blood_type == 'all'` rows to prevent aggregate totals from being double-counted against individual ABO blood group sums.
- **Surrogate Keys**: Fact table includes `time_id`, `geography_id`, `blood_group_id` alongside natural business keys.
- **Total Donations Recorded**: `9,893,967` units
- **Cleaned Output**: [`backend/data/processed/malaysia_blood_donations_clean.csv`](file:///c:/Users/Anushka/blood-donation-analytics/backend/data/processed/malaysia_blood_donations_clean.csv)

### Dataset 3: UCI Blood Transfusion Service Center (Taiwan)
- **Source File**: `transfusion.data`
- **Raw Dimensions**: `748` rows $\times$ `5` columns
- **Cleaned Dimensions**: `748` rows $\times$ `8` columns
- **Duplicate Tuples**: `215` duplicate observation tuples preserved (valid identical RFMTC measurements in integer bins).
- **Target Distribution (`donated_blood_march_2007`)**:
  - Class 0 (Did Not Donate): `570` (**76.20%**)
  - Class 1 (Donated Blood): `178` (**23.80%**)
- **Descriptive Statistics**:
  - Recency ($R$): Mean `9.51 months`
  - Frequency ($F$): Mean `5.51 donations`
  - Monetary ($M$): Mean `1378.68 c.c.`
  - Time ($T$): Mean `34.28 months`
- **Cleaned Output**: [`backend/data/processed/uci_donor_behaviour_clean.csv`](file:///c:/Users/Anushka/blood-donation-analytics/backend/data/processed/uci_donor_behaviour_clean.csv)

---

## 3. Data Integration & Relationship Architecture

### Fact Constellation (Galaxy) Schema

```
                           +------------------------+
                           |     dim_geography      |
                           |------------------------|
                           | geography_id (PK)      |
                           | country                |
                           | state_name             |
                           | district_name          |
                           | city_name              |
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

### Justification of Relationships & Rejected Joins

1. **Rejected: Direct Concatenation of Datasets**
   - *Reason*: The datasets describe completely different grains and entities (Facilities vs Daily State Totals vs Donor Behavioral Cohort). Direct concatenation would produce a severely sparse, false relation with 95%+ null cells.
2. **Rejected: Joining Indian Blood Banks with Malaysian Donations on State Names**
   - *Reason*: Indian states (e.g., Maharashtra, Karnataka) and Malaysian states (e.g., Selangor, Johor) belong to disjoint sovereign jurisdictions. Joining them on substring matches would be invalid.
3. **Rejected: Assigning UCI Donor Records to Indian/Malaysian Facilities**
   - *Reason*: UCI data represents a specific academic donor cohort from Chung-Hua University in Hsin-Chu City, Taiwan (2007). Fabricating foreign facility IDs would corrupt data provenance.
4. **Accepted: Conformed Dimensional Integration**
   - *Reason*: Enables unified OLAP slicing and dicing across geography levels, standardized blood group categorization, and calendar date time series while keeping facts isolated in dedicated tables.

---

## 4. Prepared Outputs for Future DWDM Experiments

| Output File | Location | Prepared DWDM Capabilities |
| :--- | :--- | :--- |
| `dim_geography.csv` | `backend/data/integrated/` | Multi-level spatial drill-down & roll-up OLAP |
| `dim_blood_group.csv` | `backend/data/integrated/` | ABO group slicing, demand vs supply analysis |
| `dim_time.csv` | `backend/data/integrated/` | Time-series decomposition, seasonal trend mining, linear regression |
| `fact_malaysia_daily_donations.csv` | `backend/data/integrated/` | Time-series forecasting, state clustering, regression |
| `fact_uci_transfusion_events.csv` | `backend/data/integrated/` | Classification (Decision Tree, Naive Bayes, Logistic Regression), Clustering (K-Means), Apriori association mining |
| `dim_indian_blood_banks.csv` | `backend/data/integrated/` | Spatial clustering, facility infrastructure analytics, classification by category |
| `dataset_metadata.json` | `backend/data/integrated/` | Automated warehouse metadata catalog & schema definitions |

---

## 5. Idempotency & Quality Assurance
- **Preservation of Raw Data**: Original files in `backend/data/raw/` remain untouched.
- **Zero Record Deletion without Cause**: All valid records from India (2,823), Malaysia (493,155), and UCI (748) are fully preserved.
- **Rerun Safety**: The pipeline can be executed repeatedly with identical deterministic results without duplicating records.
