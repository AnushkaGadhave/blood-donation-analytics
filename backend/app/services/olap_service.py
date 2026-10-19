"""
OLAP Service for UCI Blood Transfusion Service Center Dataset & Data Warehouse
Implements true multidimensional analytical operations:
1. Roll-Up (Hierarchical Aggregation)
2. Drill-Down (Progressive Decomposition into Discrete Granularity)
3. Slice (1-Dimension Hyperplane Extraction)
4. Dice (Multi-Dimensional Sub-Cube Filtering)
5. Pivot (Cross-Tabulation & Perspective Transposition)
6. 3D OLAP Cube (Multidimensional Lattice Model)
"""
import logging
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from app.services.data_service import DataService

logger = logging.getLogger("OLAPService")


class OLAPService:
    _cached_enriched_df: Optional[pd.DataFrame] = None

    @classmethod
    def get_enriched_dataframe(cls) -> pd.DataFrame:
        """
        Loads the raw UCI dataset and annotates every record with standardized
        discretized dimension tier identifiers, names, and labels.
        """
        if cls._cached_enriched_df is not None:
            return cls._cached_enriched_df.copy()

        df = DataService.load_dataset()
        df["donor_id"] = np.arange(1, len(df) + 1)

        # 1. Recency Tiers (0-3m, 4-9m, 10-18m, 19m+)
        recency_bins = [-1, 3, 9, 18, 200]
        recency_codes = ["R1_IMMEDIATE", "R2_RECENT", "R3_MODERATE", "R4_DORMANT"]
        recency_names = ["Immediate (0–3m)", "Recent (4–9m)", "Moderate (10–18m)", "Dormant (19m+)"]

        df["recency_tier_code"] = pd.cut(df["recency_months"], bins=recency_bins, labels=recency_codes).astype(str)
        df["recency_tier_name"] = pd.cut(df["recency_months"], bins=recency_bins, labels=recency_names).astype(str)
        df["recency_category"] = df["recency_tier_code"].map({
            "R1_IMMEDIATE": "Active Tier",
            "R2_RECENT": "Active Tier",
            "R3_MODERATE": "Lapsed Tier",
            "R4_DORMANT": "Lapsed Tier"
        })

        # 2. Frequency Tiers (1, 2-4, 5-10, 11+)
        freq_bins = [0, 1, 4, 10, 200]
        freq_codes = ["F1_FIRST_TIME", "F2_OCCASIONAL", "F3_REGULAR", "F4_SUPER_DONOR"]
        freq_names = ["First-Time (1)", "Occasional (2–4)", "Regular (5–10)", "Super Donor (11+)"]

        df["frequency_tier_code"] = pd.cut(df["frequency_times"], bins=freq_bins, labels=freq_codes).astype(str)
        df["frequency_tier_name"] = pd.cut(df["frequency_times"], bins=freq_bins, labels=freq_names).astype(str)
        df["frequency_category"] = df["frequency_tier_code"].map({
            "F1_FIRST_TIME": "Casual Tier",
            "F2_OCCASIONAL": "Casual Tier",
            "F3_REGULAR": "Committed Tier",
            "F4_SUPER_DONOR": "Committed Tier"
        })

        # 3. Tenure Tiers (0-12m, 13-36m, 37-60m, 61m+)
        tenure_bins = [-1, 12, 36, 60, 300]
        tenure_codes = ["T1_NEW", "T2_ESTABLISHED", "T3_VETERAN", "T4_LONG_TERM"]
        tenure_names = ["New (<1yr)", "Established (1–3yr)", "Veteran (3–5yr)", "Long-Term (5yr+)"]

        df["tenure_tier_code"] = pd.cut(df["time_months"], bins=tenure_bins, labels=tenure_codes).astype(str)
        df["tenure_tier_name"] = pd.cut(df["time_months"], bins=tenure_bins, labels=tenure_names).astype(str)
        df["tenure_category"] = df["tenure_tier_code"].map({
            "T1_NEW": "Acquisition Cohort",
            "T2_ESTABLISHED": "Acquisition Cohort",
            "T3_VETERAN": "Mature Cohort",
            "T4_LONG_TERM": "Mature Cohort"
        })

        # 4. Status Labels
        df["status_label"] = df["donated_march_2007"].map({
            0: "Did Not Donate (0)",
            1: "Donated (1)"
        })
        df["status_code"] = df["donated_march_2007"].map({
            0: "NON_DONOR",
            1: "DONOR"
        })

        # Cast category objects to strings for clean serialization
        for c in ["recency_tier_code", "recency_tier_name", "recency_category",
                  "frequency_tier_code", "frequency_tier_name", "frequency_category",
                  "tenure_tier_code", "tenure_tier_name", "tenure_category"]:
            df[c] = df[c].astype(str)

        cls._cached_enriched_df = df
        return df.copy()

    # =========================================================================
    # METADATA & FILTER OPTIONS
    # =========================================================================
    @classmethod
    def get_filter_options(cls) -> Dict[str, Any]:
        df = cls.get_enriched_dataframe()
        total_records = len(df)
        total_donors = int(df["donated_march_2007"].sum())
        total_volume = int(df["monetary_cc"].sum())

        return {
            "total_records": total_records,
            "total_returning_donors": total_donors,
            "overall_return_rate_pct": round(total_donors / total_records * 100, 2),
            "total_volume_cc": total_volume,
            "dimensions": {
                "recency": {
                    "label": "Recency (Months Since Last Donation)",
                    "column": "recency_tier_name",
                    "values": [
                        {"code": "R1_IMMEDIATE", "name": "Immediate (0–3m)", "count": int((df['recency_tier_code'] == 'R1_IMMEDIATE').sum())},
                        {"code": "R2_RECENT", "name": "Recent (4–9m)", "count": int((df['recency_tier_code'] == 'R2_RECENT').sum())},
                        {"code": "R3_MODERATE", "name": "Moderate (10–18m)", "count": int((df['recency_tier_code'] == 'R3_MODERATE').sum())},
                        {"code": "R4_DORMANT", "name": "Dormant (19m+)", "count": int((df['recency_tier_code'] == 'R4_DORMANT').sum())},
                    ]
                },
                "frequency": {
                    "label": "Frequency (Total Donations)",
                    "column": "frequency_tier_name",
                    "values": [
                        {"code": "F1_FIRST_TIME", "name": "First-Time (1)", "count": int((df['frequency_tier_code'] == 'F1_FIRST_TIME').sum())},
                        {"code": "F2_OCCASIONAL", "name": "Occasional (2–4)", "count": int((df['frequency_tier_code'] == 'F2_OCCASIONAL').sum())},
                        {"code": "F3_REGULAR", "name": "Regular (5–10)", "count": int((df['frequency_tier_code'] == 'F3_REGULAR').sum())},
                        {"code": "F4_SUPER_DONOR", "name": "Super Donor (11+)", "count": int((df['frequency_tier_code'] == 'F4_SUPER_DONOR').sum())},
                    ]
                },
                "tenure": {
                    "label": "Tenure (Months Since First Donation)",
                    "column": "tenure_tier_name",
                    "values": [
                        {"code": "T1_NEW", "name": "New (<1yr)", "count": int((df['tenure_tier_code'] == 'T1_NEW').sum())},
                        {"code": "T2_ESTABLISHED", "name": "Established (1–3yr)", "count": int((df['tenure_tier_code'] == 'T2_ESTABLISHED').sum())},
                        {"code": "T3_VETERAN", "name": "Veteran (3–5yr)", "count": int((df['tenure_tier_code'] == 'T3_VETERAN').sum())},
                        {"code": "T4_LONG_TERM", "name": "Long-Term (5yr+)", "count": int((df['tenure_tier_code'] == 'T4_LONG_TERM').sum())},
                    ]
                },
                "donation_status": {
                    "label": "March 2007 Response Status",
                    "column": "status_label",
                    "values": [
                        {"code": "NON_DONOR", "name": "Did Not Donate (0)", "count": int((df['donated_march_2007'] == 0).sum())},
                        {"code": "DONOR", "name": "Donated (1)", "count": int((df['donated_march_2007'] == 1).sum())},
                    ]
                }
            },
            "hierarchies": {
                "recency": ["Continuous Recency Months", "Recency Tiers (4)", "Macro Engagement Tier (2)", "All Donors (1)"],
                "frequency": ["Continuous Frequency Count", "Loyalty Tiers (4)", "Macro Loyalty Tier (2)", "All Donors (1)"],
                "tenure": ["Continuous Tenure Months", "Tenure Tiers (4)", "Lifecycle Cohorts (2)", "All Donors (1)"]
            },
            "measures": [
                {"id": "donor_count", "label": "Donor Count", "unit": "Donors"},
                {"id": "monetary_volume_cc", "label": "Total Blood Donated", "unit": "c.c."},
                {"id": "return_rate_pct", "label": "March 2007 Return Rate", "unit": "%"},
                {"id": "avg_frequency", "label": "Average Donation Frequency", "unit": "Donations"},
                {"id": "avg_recency", "label": "Average Recency", "unit": "Months"}
            ]
        }

    # =========================================================================
    # 1. ROLL-UP OPERATION
    # =========================================================================
    @classmethod
    def execute_rollup(
        cls,
        dimension: str = "recency",
        target_level: str = "tier"
    ) -> Dict[str, Any]:
        """
        Roll-Up: Aggregates detailed records up a dimensional hierarchy.
        dimension: 'recency', 'frequency', or 'tenure'
        target_level: 'tier' (4 tiers) or 'category' (2 3NF macro categories) or 'all' (1 summary)
        """
        df = cls.get_enriched_dataframe()
        dim_key = dimension.lower()

        if dim_key == "recency":
            raw_col = "recency_months"
            tier_col = "recency_tier_name"
            cat_col = "recency_category"
            unit_label = "months"
        elif dim_key == "frequency":
            raw_col = "frequency_times"
            tier_col = "frequency_tier_name"
            cat_col = "frequency_category"
            unit_label = "donations"
        else:
            raw_col = "time_months"
            tier_col = "tenure_tier_name"
            cat_col = "tenure_category"
            unit_label = "months"

        # Before Roll-up (Granular discrete points)
        before_grouped = df.groupby(raw_col).agg(
            donor_count=("donor_id", "count"),
            returning_donors=("donated_march_2007", "sum"),
            total_volume_cc=("monetary_cc", "sum")
        ).reset_index()

        before_grouped["return_rate_pct"] = (
            before_grouped["returning_donors"] / before_grouped["donor_count"] * 100
        ).round(2)

        before_data = before_grouped.to_dict(orient="records")

        # After Roll-up
        if target_level == "category":
            group_col = cat_col
            hierarchy_step = f"{raw_col} → {tier_col} → {cat_col} (2 Macro Categories)"
        elif target_level == "all":
            df["all_donors"] = "All 748 Donors"
            group_col = "all_donors"
            hierarchy_step = f"{raw_col} → {group_col} (Dataset Aggregate)"
        else:
            group_col = tier_col
            hierarchy_step = f"{raw_col} (Discrete) → {tier_col} (4 Standard Tiers)"

        after_grouped = df.groupby(group_col).agg(
            donor_count=("donor_id", "count"),
            returning_donors=("donated_march_2007", "sum"),
            non_returning_donors=("donated_march_2007", lambda x: int((x == 0).sum())),
            total_volume_cc=("monetary_cc", "sum"),
            avg_recency=("recency_months", "mean"),
            avg_frequency=("frequency_times", "mean"),
            avg_tenure=("time_months", "mean")
        ).reset_index()

        after_grouped["return_rate_pct"] = (
            after_grouped["returning_donors"] / after_grouped["donor_count"] * 100
        ).round(2)
        after_grouped["volume_pct"] = (
            after_grouped["total_volume_cc"] / df["monetary_cc"].sum() * 100
        ).round(2)

        for num_c in ["avg_recency", "avg_frequency", "avg_tenure"]:
            after_grouped[num_c] = after_grouped[num_c].round(2)

        after_data = after_grouped.to_dict(orient="records")

        # Dynamic Observation
        highest_rate_group = after_grouped.sort_values(by="return_rate_pct", ascending=False).iloc[0]
        lowest_rate_group = after_grouped.sort_values(by="return_rate_pct", ascending=True).iloc[0]

        observation = (
            f"Rolling up detailed {dimension} records along the hierarchy ({hierarchy_step}) reveals strong "
            f"analytical contrast: '{highest_rate_group[group_col]}' achieves a return rate of "
            f"{highest_rate_group['return_rate_pct']}% ({highest_rate_group['returning_donors']} donors), "
            f"compared to '{lowest_rate_group[group_col]}' with {lowest_rate_group['return_rate_pct']}% "
            f"({lowest_rate_group['returning_donors']} donors)."
        )

        return {
            "operation": "ROLL_UP",
            "dimension": dimension,
            "target_level": target_level,
            "hierarchy_step": hierarchy_step,
            "before_count": len(before_data),
            "after_count": len(after_data),
            "group_column": group_col,
            "before_data": before_data[:20],  # Sample first 20 discrete points
            "after_data": after_data,
            "observation": observation
        }

    # =========================================================================
    # 2. DRILL-DOWN OPERATION
    # =========================================================================
    @classmethod
    def execute_drilldown(
        cls,
        dimension: str = "recency",
        selected_tier: Optional[str] = "Immediate (0–3m)"
    ) -> Dict[str, Any]:
        """
        Drill-Down: Navigates from higher-level summary down to granular discrete values.
        """
        df = cls.get_enriched_dataframe()
        dim_key = dimension.lower()

        if dim_key == "recency":
            raw_col = "recency_months"
            tier_col = "recency_tier_name"
            unit_name = "Months"
        elif dim_key == "frequency":
            raw_col = "frequency_times"
            tier_col = "frequency_tier_name"
            unit_name = "Donations"
        else:
            raw_col = "time_months"
            tier_col = "tenure_tier_name"
            unit_name = "Months"

        # Level 0 (Overall Summary)
        level0_summary = {
            "level_name": "Level 0: Total Dataset",
            "total_records": len(df),
            "total_returning": int(df["donated_march_2007"].sum()),
            "overall_return_rate_pct": round(df["donated_march_2007"].mean() * 100, 2),
            "total_volume_cc": int(df["monetary_cc"].sum())
        }

        # Level 1 (Tiers overview)
        l1_grouped = df.groupby(tier_col).agg(
            donor_count=("donor_id", "count"),
            returning_donors=("donated_march_2007", "sum"),
            total_volume_cc=("monetary_cc", "sum")
        ).reset_index()
        l1_grouped["return_rate_pct"] = (
            l1_grouped["returning_donors"] / l1_grouped["donor_count"] * 100
        ).round(2)
        level1_data = l1_grouped.to_dict(orient="records")

        # Level 2 (Drilled into selected tier)
        if selected_tier and selected_tier in df[tier_col].unique():
            tier_filter = selected_tier
        else:
            tier_filter = df[tier_col].unique()[0]

        drilled_sub = df[df[tier_col] == tier_filter]
        l2_grouped = drilled_sub.groupby(raw_col).agg(
            donor_count=("donor_id", "count"),
            returning_donors=("donated_march_2007", "sum"),
            total_volume_cc=("monetary_cc", "sum")
        ).reset_index()
        l2_grouped["return_rate_pct"] = (
            l2_grouped["returning_donors"] / l2_grouped["donor_count"] * 100
        ).round(2)
        level2_data = l2_grouped.to_dict(orient="records")

        # Dynamic Observation
        observation = (
            f"Drilling down into '{tier_filter}' ({len(drilled_sub)} donors, {round(drilled_sub['donated_march_2007'].mean() * 100, 2)}% return rate) "
            f"reveals {len(level2_data)} discrete {unit_name.lower()} values. The peak return rate within this subgroup occurs at "
            f"{raw_col} = {l2_grouped.sort_values(by='return_rate_pct', ascending=False).iloc[0][raw_col]} {unit_name.lower()}."
        )

        return {
            "operation": "DRILL_DOWN",
            "dimension": dimension,
            "selected_tier": tier_filter,
            "raw_column": raw_col,
            "unit_name": unit_name,
            "level0_summary": level0_summary,
            "level1_tiers": level1_data,
            "level2_discrete_details": level2_data,
            "drilled_donor_count": len(drilled_sub),
            "observation": observation
        }

    # =========================================================================
    # 3. SLICE OPERATION
    # =========================================================================
    @classmethod
    def execute_slice(
        cls,
        dimension: str = "recency",
        value: str = "Immediate (0–3m)"
    ) -> Dict[str, Any]:
        """
        Slice: Fixes one dimension to a single value, extracting a 2D/3D hyperplane.
        """
        df = cls.get_enriched_dataframe()
        dim_map = {
            "recency": "recency_tier_name",
            "frequency": "frequency_tier_name",
            "tenure": "tenure_tier_name",
            "donation_status": "status_label"
        }
        filter_col = dim_map.get(dimension.lower(), "recency_tier_name")

        # Validate value
        available_values = df[filter_col].unique().tolist()
        if value not in available_values:
            value = available_values[0]

        sliced_df = df[df[filter_col] == value]
        sliced_count = len(sliced_df)
        sliced_donors = int(sliced_df["donated_march_2007"].sum())
        sliced_return_rate = round(sliced_donors / sliced_count * 100, 2) if sliced_count > 0 else 0
        overall_return_rate = round(df["donated_march_2007"].mean() * 100, 2)

        # Cross-sectional breakdown by other dimensions
        breakdowns = {}
        for d_name, col_name in dim_map.items():
            if col_name == filter_col:
                continue
            grp = sliced_df.groupby(col_name).agg(
                count=("donor_id", "count"),
                donated=("donated_march_2007", "sum")
            ).reset_index()
            grp["return_rate_pct"] = (grp["donated"] / grp["count"] * 100).round(2)
            breakdowns[d_name] = grp.to_dict(orient="records")

        delta_rate = round(sliced_return_rate - overall_return_rate, 2)
        direction = "higher" if delta_rate >= 0 else "lower"

        observation = (
            f"Slicing the cube on [{dimension.upper()} = '{value}'] isolates {sliced_count} donor records "
            f"({round(sliced_count / len(df) * 100, 1)}% of warehouse). This slice exhibits a {sliced_return_rate}% "
            f"March 2007 return rate, which is {abs(delta_rate)}% {direction} than the overall dataset benchmark ({overall_return_rate}%)."
        )

        return {
            "operation": "SLICE",
            "sliced_dimension": dimension,
            "sliced_value": value,
            "filtered_records": sliced_count,
            "total_warehouse_records": len(df),
            "percentage_of_total": round(sliced_count / len(df) * 100, 2),
            "slice_kpis": {
                "total_donors": sliced_count,
                "returning_donors": sliced_donors,
                "return_rate_pct": sliced_return_rate,
                "total_volume_cc": int(sliced_df["monetary_cc"].sum()),
                "avg_recency_months": round(float(sliced_df["recency_months"].mean()), 2),
                "avg_frequency_count": round(float(sliced_df["frequency_times"].mean()), 2),
                "avg_tenure_months": round(float(sliced_df["time_months"].mean()), 2),
            },
            "benchmark_comparison": {
                "slice_return_rate": sliced_return_rate,
                "overall_return_rate": overall_return_rate,
                "delta_pct": delta_rate
            },
            "cross_sectional_breakdowns": breakdowns,
            "sample_records": sliced_df[["donor_id", "recency_months", "frequency_times", "monetary_cc", "time_months", "donated_march_2007"]].head(15).to_dict(orient="records"),
            "observation": observation
        }

    # =========================================================================
    # 4. DICE OPERATION
    # =========================================================================
    @classmethod
    def execute_dice(
        cls,
        recency_tiers: Optional[List[str]] = None,
        frequency_tiers: Optional[List[str]] = None,
        tenure_tiers: Optional[List[str]] = None,
        status_filter: Optional[str] = "all"
    ) -> Dict[str, Any]:
        """
        Dice: Applies multiple dimensional bounding constraints to extract a sub-cube.
        """
        df = cls.get_enriched_dataframe()
        mask = pd.Series(True, index=df.index)

        if recency_tiers and len(recency_tiers) > 0:
            mask = mask & (df["recency_tier_name"].isin(recency_tiers))

        if frequency_tiers and len(frequency_tiers) > 0:
            mask = mask & (df["frequency_tier_name"].isin(frequency_tiers))

        if tenure_tiers and len(tenure_tiers) > 0:
            mask = mask & (df["tenure_tier_name"].isin(tenure_tiers))

        if status_filter in ["0", 0, "NON_DONOR", "Did Not Donate (0)"]:
            mask = mask & (df["donated_march_2007"] == 0)
        elif status_filter in ["1", 1, "DONOR", "Donated (1)"]:
            mask = mask & (df["donated_march_2007"] == 1)

        diced_df = df[mask]
        diced_count = len(diced_df)
        diced_donors = int(diced_df["donated_march_2007"].sum())
        diced_return_rate = round(diced_donors / diced_count * 100, 2) if diced_count > 0 else 0

        # Sub-cube Recency vs Frequency joint distribution
        if diced_count > 0:
            pivot_dist = pd.crosstab(
                diced_df["recency_tier_name"],
                diced_df["frequency_tier_name"],
                margins=True,
                margins_name="Total"
            ).to_dict()
        else:
            pivot_dist = {}

        active_filters = []
        if recency_tiers:
            active_filters.append(f"Recency in ({', '.join(recency_tiers)})")
        if frequency_tiers:
            active_filters.append(f"Frequency in ({', '.join(frequency_tiers)})")
        if tenure_tiers:
            active_filters.append(f"Tenure in ({', '.join(tenure_tiers)})")
        if status_filter != "all":
            active_filters.append(f"Response Status = {status_filter}")

        filter_desc = " AND ".join(active_filters) if active_filters else "No Dimension Filters (Full Cube)"

        observation = (
            f"Dicing with constraints [{filter_desc}] extracted a sub-cube of {diced_count} records "
            f"({round(diced_count / len(df) * 100, 1)}% of warehouse). "
            f"Sub-cube aggregate volume: {int(diced_df['monetary_cc'].sum()):,} c.c. blood, with an observed "
            f"return rate of {diced_return_rate}%."
        )

        return {
            "operation": "DICE",
            "active_filters": active_filters,
            "filter_description": filter_desc,
            "diced_records_count": diced_count,
            "total_warehouse_records": len(df),
            "percentage_of_total": round(diced_count / len(df) * 100, 2),
            "diced_kpis": {
                "donor_count": diced_count,
                "returning_donors": diced_donors,
                "return_rate_pct": diced_return_rate,
                "total_volume_cc": int(diced_df["monetary_cc"].sum()) if diced_count > 0 else 0,
                "avg_frequency": round(float(diced_df["frequency_times"].mean()), 2) if diced_count > 0 else 0,
                "avg_recency": round(float(diced_df["recency_months"].mean()), 2) if diced_count > 0 else 0,
                "avg_tenure": round(float(diced_df["time_months"].mean()), 2) if diced_count > 0 else 0
            },
            "sub_cube_distribution": pivot_dist,
            "records": diced_df[["donor_id", "recency_months", "frequency_times", "monetary_cc", "time_months", "donated_march_2007"]].head(25).to_dict(orient="records"),
            "observation": observation
        }

    # =========================================================================
    # 5. PIVOT OPERATION
    # =========================================================================
    @classmethod
    def execute_pivot(
        cls,
        row_dim: str = "recency",
        col_dim: str = "status",
        measure: str = "donor_count"
    ) -> Dict[str, Any]:
        """
        Pivot: Transposes row and column dimensions in a 2D contingency matrix.
        measure: 'donor_count', 'total_volume_cc', 'return_rate_pct', 'avg_frequency'
        """
        df = cls.get_enriched_dataframe()

        dim_map = {
            "recency": "recency_tier_name",
            "frequency": "frequency_tier_name",
            "tenure": "tenure_tier_name",
            "status": "status_label",
            "donation_status": "status_label",
            "recency_category": "recency_category",
            "frequency_category": "frequency_category"
        }

        row_col = dim_map.get(row_dim.lower(), "recency_tier_name")
        col_col = dim_map.get(col_dim.lower(), "status_label")

        # Avoid same row and col
        if row_col == col_col:
            col_col = "status_label" if row_col != "status_label" else "frequency_tier_name"

        # Compute contingency aggregation
        if measure == "return_rate_pct":
            pt = pd.pivot_table(
                df,
                index=row_col,
                columns=col_col,
                values="donated_march_2007",
                aggfunc=lambda x: round(x.mean() * 100, 2),
                fill_value=0
            )
        elif measure == "total_volume_cc":
            pt = pd.pivot_table(
                df,
                index=row_col,
                columns=col_col,
                values="monetary_cc",
                aggfunc="sum",
                fill_value=0
            )
        elif measure == "avg_frequency":
            pt = pd.pivot_table(
                df,
                index=row_col,
                columns=col_col,
                values="frequency_times",
                aggfunc=lambda x: round(x.mean(), 2),
                fill_value=0
            )
        else:  # donor_count
            pt = pd.pivot_table(
                df,
                index=row_col,
                columns=col_col,
                values="donor_id",
                aggfunc="count",
                fill_value=0
            )

        # Format rows and columns for table rendering
        rows_list = []
        col_headers = [str(c) for c in pt.columns]

        for idx, row in pt.iterrows():
            row_dict = {"row_label": str(idx)}
            row_sum = 0
            for c in col_headers:
                val = float(row[c]) if isinstance(row[c], (int, float, np.number)) else 0
                row_dict[c] = round(val, 2)
                row_sum += val
            row_dict["Total"] = round(row_sum, 2)
            rows_list.append(row_dict)

        # Formatted chart series for grouped bar chart
        chart_data = []
        for r in rows_list:
            item = {"name": r["row_label"]}
            for c in col_headers:
                item[c] = r[c]
            chart_data.append(item)

        observation = (
            f"Pivoting with [{row_dim.upper()}] on rows and [{col_dim.upper()}] on columns displays the 2D "
            f"distribution across {len(rows_list)} row categories and {len(col_headers)} column categories. "
            f"The matrix preserves total warehouse volume while rotating the analytical perspective."
        )

        return {
            "operation": "PIVOT",
            "row_dimension": row_dim,
            "col_dimension": col_dim,
            "row_column_name": row_col,
            "col_column_name": col_col,
            "measure": measure,
            "column_headers": col_headers,
            "matrix_data": rows_list,
            "chart_data": chart_data,
            "observation": observation
        }

    # =========================================================================
    # 6. INTERACTIVE 3D OLAP CUBE
    # =========================================================================
    @classmethod
    def get_cube_data(
        cls,
        z_filter: Optional[str] = "all",
        measure: str = "donor_count"
    ) -> Dict[str, Any]:
        """
        Interactive 3D OLAP Cube:
        X Axis: Recency Tiers (4)
        Y Axis: Frequency Tiers (4)
        Z Axis: Tenure Tiers (4) or Sliced Plane
        """
        df = cls.get_enriched_dataframe()

        if z_filter and z_filter != "all" and z_filter in df["tenure_tier_name"].unique():
            cube_df = df[df["tenure_tier_name"] == z_filter]
            z_label = f"Tenure = {z_filter}"
        else:
            cube_df = df
            z_label = "All Tenure Tiers (Full 3D Cube)"

        recency_order = ["Immediate (0–3m)", "Recent (4–9m)", "Moderate (10–18m)", "Dormant (19m+)"]
        freq_order = ["First-Time (1)", "Occasional (2–4)", "Regular (5–10)", "Super Donor (11+)"]

        cells = []
        for r_tier in recency_order:
            for f_tier in freq_order:
                cell_sub = cube_df[(cube_df["recency_tier_name"] == r_tier) & (cube_df["frequency_tier_name"] == f_tier)]
                cell_count = len(cell_sub)
                cell_donors = int(cell_sub["donated_march_2007"].sum())
                cell_rate = round(cell_donors / cell_count * 100, 2) if cell_count > 0 else 0
                cell_volume = int(cell_sub["monetary_cc"].sum())

                if measure == "return_rate_pct":
                    display_val = cell_rate
                elif measure == "total_volume_cc":
                    display_val = cell_volume
                else:
                    display_val = cell_count

                cells.append({
                    "recency_tier": r_tier,
                    "frequency_tier": f_tier,
                    "donor_count": cell_count,
                    "returning_donors": cell_donors,
                    "return_rate_pct": cell_rate,
                    "total_volume_cc": cell_volume,
                    "display_value": display_val,
                    "sample_donors": cell_sub["donor_id"].head(5).tolist()
                })

        return {
            "operation": "OLAP_CUBE",
            "axis_x": "Recency Tiers (4)",
            "axis_y": "Frequency Tiers (4)",
            "axis_z": "Tenure Tiers (4)",
            "active_z_plane": z_label,
            "measure": measure,
            "total_cube_records": len(cube_df),
            "cells": cells,
            "x_categories": recency_order,
            "y_categories": freq_order,
            "z_categories": ["All", "New (<1yr)", "Established (1–3yr)", "Veteran (3–5yr)", "Long-Term (5yr+)"]
        }
