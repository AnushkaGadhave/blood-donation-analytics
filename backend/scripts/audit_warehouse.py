import os
import json
import pandas as pd
import numpy as np

def run_audit():
    integrated_dir = "backend/data/integrated"
    processed_dir = "backend/data/processed"
    raw_dir = "backend/data/raw"

    print("=" * 70)
    print("DWDM WAREHOUSE & DATASET AUDIT")
    print("=" * 70)

    # 1. Raw vs Processed vs Integrated Row Counts
    print("\n>>> 1. ROW COUNT RECONCILIATION")
    tables = {
        "India Blood Banks": {
            "raw": os.path.join(raw_dir, "blood-banks.csv"),
            "processed": os.path.join(processed_dir, "indian_blood_bank_directory_clean.csv"),
            "integrated": os.path.join(integrated_dir, "dim_indian_blood_banks.csv")
        },
        "Malaysia Donations": {
            "raw": os.path.join(raw_dir, "blood_donations_state.csv"),
            "processed": os.path.join(processed_dir, "malaysia_blood_donations_clean.csv"),
            "integrated": os.path.join(integrated_dir, "fact_malaysia_daily_donations.csv")
        },
        "UCI Transfusion": {
            "raw": os.path.join(raw_dir, "transfusion.data"),
            "processed": os.path.join(processed_dir, "uci_donor_behaviour_clean.csv"),
            "integrated": os.path.join(integrated_dir, "fact_uci_transfusion_events.csv")
        }
    }

    for name, paths in tables.items():
        try:
            # Handle encoding for raw india
            if "blood-banks.csv" in paths["raw"]:
                r_len = len(pd.read_csv(paths["raw"], encoding="latin-1"))
            else:
                r_len = len(pd.read_csv(paths["raw"]))
        except Exception as e:
            r_len = f"Error: {e}"
        p_len = len(pd.read_csv(paths["processed"])) if os.path.exists(paths["processed"]) else "N/A"
        i_len = len(pd.read_csv(paths["integrated"])) if os.path.exists(paths["integrated"]) else "N/A"
        print(f"{name:20s} | Raw: {r_len} | Processed: {p_len} | Integrated: {i_len} | Match: {r_len == p_len == i_len}")

    # 2. Audit Dimensions & Fact Tables
    print("\n>>> 2. DIMENSION & FACT TABLES AUDIT")
    dim_geo = pd.read_csv(os.path.join(integrated_dir, "dim_geography.csv"))
    dim_blood = pd.read_csv(os.path.join(integrated_dir, "dim_blood_group.csv"))
    dim_time = pd.read_csv(os.path.join(integrated_dir, "dim_time.csv"))
    dim_india = pd.read_csv(os.path.join(integrated_dir, "dim_indian_blood_banks.csv"))
    fact_my = pd.read_csv(os.path.join(integrated_dir, "fact_malaysia_daily_donations.csv"))
    fact_uci = pd.read_csv(os.path.join(integrated_dir, "fact_uci_transfusion_events.csv"))

    # Dimension checks
    print(f"dim_geography: {len(dim_geo)} rows, PK geography_id unique: {dim_geo['geography_id'].is_unique}")
    print(f"  Countries: {dim_geo['country'].value_counts().to_dict()}")
    print(f"dim_blood_group: {len(dim_blood)} rows, PK blood_group_id unique: {dim_blood['blood_group_id'].is_unique}")
    print(f"  Blood groups: {dim_blood['blood_group_code'].tolist()}")
    print(f"dim_time: {len(dim_time)} rows, PK time_id unique: {dim_time['time_id'].is_unique}, Date unique: {dim_time['date'].is_unique}")
    print(f"  Date range: {dim_time['date'].min()} to {dim_time['date'].max()}")
    print(f"dim_indian_blood_banks: {len(dim_india)} rows, PK sr_no unique: {dim_india['sr_no'].is_unique}")

    # Fact checks
    print(f"\nfact_malaysia_daily_donations: {len(fact_my)} rows")
    print(f"  Columns: {list(fact_my.columns)}")
    # Foreign key checks
    dates_in_time = fact_my["date"].isin(dim_time["date"]).all()
    states_in_geo = fact_my["state"].isin(dim_geo[dim_geo["country"] == "Malaysia"]["state_name"]).all()
    bloods_in_dim = fact_my["blood_type"].isin(dim_blood["blood_group_code"]).all()
    print(f"  FK Integrity: date in dim_time: {dates_in_time}, state in dim_geo: {states_in_geo}, blood_type in dim_blood: {bloods_in_dim}")

    print(f"\nfact_uci_transfusion_events: {len(fact_uci)} rows")
    print(f"  Columns: {list(fact_uci.columns)}")
    print(f"  PK donor_cohort_id unique: {fact_uci['donor_cohort_id'].is_unique}")
    print(f"  Target distribution: {fact_uci['donated_blood_march_2007'].value_counts().to_dict()}")

    # 3. Check for surrogate foreign keys
    print("\n>>> 3. SURROGATE KEYS & WAREHOUSE REFINEMENTS")
    print("Checking if surrogate foreign keys (time_id, geography_id, blood_group_id) are present in fact tables:")
    print("fact_malaysia_daily_donations has time_id:", "time_id" in fact_my.columns)
    print("fact_malaysia_daily_donations has geography_id:", "geography_id" in fact_my.columns)
    print("fact_malaysia_daily_donations has blood_group_id:", "blood_group_id" in fact_my.columns)
    print("dim_indian_blood_banks has geography_id:", "geography_id" in dim_india.columns)

if __name__ == "__main__":
    run_audit()
