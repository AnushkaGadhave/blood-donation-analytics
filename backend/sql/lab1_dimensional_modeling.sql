-- ============================================================================
-- Blood Bank Management DWDM System — Lab 1: Dimensional Data Modeling
-- PostgreSQL Compatible DDL & Analytical DML Script
-- ============================================================================
-- Architecture: Fact Constellation Schema with Conformed Dimensions
-- Datasets Integrated:
--   1. Indian Blood Bank Directory (dim_indian_blood_banks)
--   2. Malaysian State Blood Donations (fact_malaysia_daily_donations)
--   3. UCI Blood Transfusion Service Center (fact_uci_transfusion_events)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CONFORMED DIMENSION TABLES
-- ----------------------------------------------------------------------------

-- 1.1 Conformed Geography Dimension
DROP TABLE IF EXISTS fact_malaysia_daily_donations CASCADE;
DROP TABLE IF EXISTS dim_indian_blood_banks CASCADE;
DROP TABLE IF EXISTS dim_geography CASCADE;

CREATE TABLE dim_geography (
    geography_id     INTEGER PRIMARY KEY,
    country          VARCHAR(50) NOT NULL,
    state_name       VARCHAR(100) NOT NULL,
    district_name    VARCHAR(100) DEFAULT 'Unknown',
    city_name        VARCHAR(100) DEFAULT 'Unknown',
    region_scope     VARCHAR(100) NOT NULL
);

CREATE INDEX idx_dim_geography_country_state ON dim_geography(country, state_name);

-- 1.2 Conformed Blood Group Dimension
DROP TABLE IF EXISTS dim_blood_group CASCADE;

CREATE TABLE dim_blood_group (
    blood_group_id   INTEGER PRIMARY KEY,
    blood_group_code VARCHAR(10) NOT NULL UNIQUE,  -- 'a', 'b', 'ab', 'o', 'all'
    abo_type         VARCHAR(10) NOT NULL,        -- 'A', 'B', 'AB', 'O', 'All'
    is_aggregate     BOOLEAN NOT NULL,            -- TRUE if 'all' aggregate total
    description      VARCHAR(100) NOT NULL
);

-- 1.3 Conformed Time Dimension
DROP TABLE IF EXISTS dim_time CASCADE;

CREATE TABLE dim_time (
    time_id          INTEGER PRIMARY KEY,
    date             DATE NOT NULL UNIQUE,
    year             INTEGER NOT NULL,
    month            INTEGER NOT NULL,
    month_name       VARCHAR(20) NOT NULL,
    quarter          INTEGER NOT NULL,
    day              INTEGER NOT NULL,
    day_of_week      INTEGER NOT NULL,            -- 1 = Monday, 7 = Sunday
    day_name         VARCHAR(20) NOT NULL,
    is_weekend       BOOLEAN NOT NULL,
    is_month_end     BOOLEAN NOT NULL
);

CREATE INDEX idx_dim_time_year_month ON dim_time(year, month);
CREATE INDEX idx_dim_time_date ON dim_time(date);

-- ----------------------------------------------------------------------------
-- 2. ENTITY DIMENSION: Indian Blood Bank Facility Directory
-- ----------------------------------------------------------------------------
CREATE TABLE dim_indian_blood_banks (
    sr_no                       INTEGER PRIMARY KEY,
    geography_id                INTEGER REFERENCES dim_geography(geography_id),
    blood_bank_name             VARCHAR(255) NOT NULL,
    state                       VARCHAR(100) NOT NULL,
    district                    VARCHAR(100),
    city                        VARCHAR(100),
    address                     TEXT,
    pincode                     VARCHAR(20),
    contact_no                  VARCHAR(100),
    mobile                      VARCHAR(50),
    helpline                    VARCHAR(50),
    fax                         VARCHAR(50),
    email                       VARCHAR(150),
    website                     VARCHAR(200),
    nodal_officer               VARCHAR(150),
    contact_nodal_officer       VARCHAR(100),
    mobile_nodal_officer        VARCHAR(50),
    email_nodal_officer         VARCHAR(150),
    qualification_nodal_officer VARCHAR(100),
    category                    VARCHAR(50) DEFAULT 'Not Specified', -- Government, Private, Charity
    blood_component_available   VARCHAR(20) DEFAULT 'Not Specified', -- YES, NO
    apheresis                   VARCHAR(20) DEFAULT 'Not Specified', -- YES, NO
    service_time                VARCHAR(100),
    service_time_raw            VARCHAR(100),
    is_24x7                     BOOLEAN DEFAULT FALSE,
    license_no                  VARCHAR(100),
    date_license_obtained       VARCHAR(50),
    date_of_renewal             VARCHAR(50),
    latitude                    NUMERIC(10, 6),
    longitude                   NUMERIC(10, 6),
    is_valid_coordinates        BOOLEAN DEFAULT FALSE,
    country                     VARCHAR(50) DEFAULT 'India'
);

CREATE INDEX idx_indian_banks_category ON dim_indian_blood_banks(category);
CREATE INDEX idx_indian_banks_state ON dim_indian_blood_banks(state);
CREATE INDEX idx_indian_banks_component ON dim_indian_blood_banks(blood_component_available);

-- ----------------------------------------------------------------------------
-- 3. FACT TABLE 1: Malaysian Daily State Blood Donations
-- ----------------------------------------------------------------------------
-- Grain: One record per Date x State x Blood Group
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

CREATE INDEX idx_fact_my_date ON fact_malaysia_daily_donations(date);
CREATE INDEX idx_fact_my_state ON fact_malaysia_daily_donations(state);
CREATE INDEX idx_fact_my_blood_type ON fact_malaysia_daily_donations(blood_type);
CREATE INDEX idx_fact_my_aggregate ON fact_malaysia_daily_donations(is_aggregate_total);

-- ----------------------------------------------------------------------------
-- 4. FACT TABLE 2: UCI Blood Transfusion Service Center Cohort
-- ----------------------------------------------------------------------------
-- Grain: One record per surveyed donor observation in Hsin-Chu City, Taiwan
DROP TABLE IF EXISTS fact_uci_transfusion_events CASCADE;

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

CREATE INDEX idx_uci_target ON fact_uci_transfusion_events(donated_blood_march_2007);

-- ============================================================================
-- 5. SAMPLE ANALYTICAL QUERIES DEMONSTRATING LAB 1 SCHEMAS
-- ============================================================================

-- Query 1: Star Schema Rollup — Total Donations by Year and ABO Blood Group (Malaysia)
-- Note: is_aggregate_total = FALSE is filtered to prevent double-counting
SELECT 
    t.year,
    b.abo_type,
    SUM(f.donations) AS total_donated_units,
    COUNT(DISTINCT f.date) AS active_days
FROM fact_malaysia_daily_donations f
JOIN dim_time t ON f.time_id = t.time_id
JOIN dim_blood_group b ON f.blood_group_id = b.blood_group_id
WHERE f.is_aggregate_total = FALSE
GROUP BY t.year, b.abo_type
ORDER BY t.year DESC, total_donated_units DESC
LIMIT 15;

-- Query 2: Star Schema State Ranking — Top 5 Donating States in Recent 5 Years
SELECT 
    g.state_name,
    SUM(f.donations) AS total_donations,
    ROUND(AVG(f.donations), 2) AS avg_daily_donations
FROM fact_malaysia_daily_donations f
JOIN dim_geography g ON f.geography_id = g.geography_id
JOIN dim_time t ON f.time_id = t.time_id
WHERE f.is_aggregate_total = FALSE 
  AND t.year >= 2021
GROUP BY g.state_name
ORDER BY total_donations DESC
LIMIT 5;

-- Query 3: Entity Dimension Analysis — Indian Blood Bank 24x7 and Component Breakdown
SELECT 
    category,
    COUNT(*) AS total_blood_banks,
    SUM(CASE WHEN is_24x7 = TRUE THEN 1 ELSE 0 END) AS count_24x7,
    ROUND(SUM(CASE WHEN is_24x7 = TRUE THEN 1.0 ELSE 0.0 END) / COUNT(*) * 100, 1) AS pct_24x7,
    SUM(CASE WHEN blood_component_available = 'YES' THEN 1 ELSE 0 END) AS count_component_available
FROM dim_indian_blood_banks
GROUP BY category
ORDER BY total_blood_banks DESC;

-- Query 4: Fact Constellation Donor Cohort Summary (UCI Transfusion Study)
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

-- Query 5: Monthly Seasonality Analysis (Quarterly Peak Discovery)
SELECT 
    t.quarter,
    t.month_name,
    SUM(f.donations) AS total_quarterly_donations
FROM fact_malaysia_daily_donations f
JOIN dim_time t ON f.time_id = t.time_id
WHERE f.is_aggregate_total = FALSE
GROUP BY t.quarter, t.month, t.month_name
ORDER BY t.quarter, t.month;
