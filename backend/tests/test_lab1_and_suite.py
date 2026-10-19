"""
Test Suite for DWDM Lab 01 (Multidimensional Data Modeling) and Labs 02-09
Validates Star Schema, Snowflake Schema, Fact Constellation, Table Outputs,
Referential Integrity, Invariants, and Labs Suite stability.
"""
import os
import sys
# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.lab1_service import Lab1Service
from app.services.warehouse_service import WarehouseService
from app.services.labs_service import LabsService
from app.services.data_service import DataService


def test_source_dataset_integrity():
    df = DataService.load_dataset()
    assert len(df) == 748, f"Expected 748 rows, found {len(df)}"
    assert list(df.columns) == [
        "recency_months",
        "frequency_times",
        "monetary_cc",
        "time_months",
        "donated_march_2007"
    ]
    # Check exact collinearity invariant
    assert (df["monetary_cc"] == df["frequency_times"] * 250).all()
    # Check no missing values
    assert df.isnull().sum().sum() == 0


def test_lab1_execution_and_schemas():
    res = Lab1Service.execute_and_export_lab1(force_refresh=True)
    assert res["lab_id"] == 1
    assert "schemas" in res
    assert "star" in res["schemas"]
    assert "snowflake" in res["schemas"]
    assert "constellation" in res["schemas"]

    # Test Star Schema
    star = res["schemas"]["star"]
    assert len(star["tables"]) == 5
    table_names = [t["table_name"] for t in star["tables"]]
    assert "fact_transfusion_events" in table_names
    assert "dim_recency" in table_names
    assert "dim_frequency" in table_names
    assert "dim_tenure" in table_names
    assert "dim_donation_status" in table_names

    # Test Snowflake Schema
    snow = res["schemas"]["snowflake"]
    assert len(snow["tables"]) == 8
    snow_names = [t["table_name"] for t in snow["tables"]]
    assert "fact_transfusion_events" in snow_names
    assert "dim_recency" in snow_names
    assert "dim_recency_category" in snow_names
    assert "dim_frequency" in snow_names
    assert "dim_frequency_category" in snow_names
    assert "dim_tenure" in snow_names
    assert "dim_tenure_category" in snow_names
    assert "dim_donation_status" in snow_names

    # Test Constellation Schema
    const = res["schemas"]["constellation"]
    assert len(const["tables"]) == 6
    const_names = [t["table_name"] for t in const["tables"]]
    assert "fact_donor_history" in const_names
    assert "fact_donation_response" in const_names
    assert "dim_recency" in const_names
    assert "dim_frequency" in const_names
    assert "dim_tenure" in const_names
    assert "dim_donation_status" in const_names


def test_warehouse_service_sql_queries():
    tables = WarehouseService.list_tables()
    assert len(tables) >= 10
    for t in tables:
        assert t["row_count"] > 0, f"Table {t['name']} should have rows"

    sample_queries = WarehouseService.get_sample_queries()
    assert len(sample_queries) >= 4
    for sq in sample_queries:
        res = WarehouseService.execute_safe_sql(sq["sql"])
        assert res["success"] is True, f"Query '{sq['title']}' failed: {res.get('error')}"
        assert res["row_count"] > 0, f"Query '{sq['title']}' returned 0 rows"


from app.services.olap_service import OLAPService


def test_lab2_olap_operations():
    # 1. Metadata & Filter Options
    opts = OLAPService.get_filter_options()
    assert opts["total_records"] == 748
    assert opts["total_returning_donors"] == 178
    assert opts["overall_return_rate_pct"] == 23.8

    # 2. Roll-Up
    for dim in ["recency", "frequency", "tenure"]:
        ru = OLAPService.execute_rollup(dim, "tier")
        assert ru["operation"] == "ROLL_UP"
        assert ru["after_count"] == 4
        assert sum(r["donor_count"] for r in ru["after_data"]) == 748
        assert sum(r["returning_donors"] for r in ru["after_data"]) == 178

    # 3. Drill-Down
    dd = OLAPService.execute_drilldown("recency", "Immediate (0–3m)")
    assert dd["operation"] == "DRILL_DOWN"
    assert dd["level0_summary"]["total_records"] == 748
    assert len(dd["level1_tiers"]) == 4
    assert len(dd["level2_discrete_details"]) > 0
    assert sum(d["donor_count"] for d in dd["level2_discrete_details"]) == dd["drilled_donor_count"]

    # 4. Slice
    sl = OLAPService.execute_slice("recency", "Immediate (0–3m)")
    assert sl["operation"] == "SLICE"
    assert sl["filtered_records"] > 0
    assert sl["slice_kpis"]["returning_donors"] <= sl["filtered_records"]
    assert "cross_sectional_breakdowns" in sl

    # 5. Dice
    dc = OLAPService.execute_dice(["Immediate (0–3m)"], ["Regular (5–10)", "Super Donor (11+)"], None, "all")
    assert dc["operation"] == "DICE"
    assert dc["diced_records_count"] > 0
    assert dc["diced_kpis"]["returning_donors"] <= dc["diced_records_count"]

    # 6. Pivot
    pv = OLAPService.execute_pivot("recency", "status", "donor_count")
    assert pv["operation"] == "PIVOT"
    assert len(pv["matrix_data"]) == 4
    total_pivot_count = sum(r["Total"] for r in pv["matrix_data"])
    assert total_pivot_count == 748

    # 7. 3D OLAP Cube
    cube = OLAPService.get_cube_data("all", "donor_count")
    assert cube["operation"] == "OLAP_CUBE"
    assert len(cube["cells"]) == 16
    assert sum(c["donor_count"] for c in cube["cells"]) == 748


from app.services.eda_service import EDAService


def test_lab3_eda_service():
    eda = EDAService.get_eda_overview()
    assert eda["lab_id"] == 3
    assert "overview_kpis" in eda
    kpis = eda["overview_kpis"]
    assert kpis["total_records"] == 748
    assert kpis["total_returning"] == 178
    assert kpis["total_non_returning"] == 570
    assert kpis["overall_return_rate_pct"] == 23.8
    assert kpis["avg_recency"] == 9.51
    assert kpis["avg_frequency"] == 5.51

    # Target distribution
    target_dist = eda["target_distribution"]
    assert len(target_dist) == 2
    assert sum(t["count"] for t in target_dist) == 748

    # Univariate distributions
    uni = eda["univariate_distributions"]
    for k in ["recency", "frequency", "monetary", "tenure"]:
        assert k in uni
        assert len(uni[k]) > 0
        assert sum(b["donor_count"] for b in uni[k]) == 748

    # Correlation Matrix
    corr = eda["correlation_matrix"]
    assert len(corr["columns"]) == 5
    assert len(corr["cells"]) == 25
    # Monetary vs Frequency collinearity
    mf_cell = next(c for c in corr["cells"] if c["row_key"] == "monetary_cc" and c["col_key"] == "frequency_times")
    assert mf_cell["correlation"] == 1.0
    assert mf_cell["is_perfect"] is True

    # Outliers (1.5x IQR)
    outliers = eda["outlier_analysis"]
    assert len(outliers) == 4
    freq_out = next(o for o in outliers if o["feature"] == "frequency_times")
    assert freq_out["outlier_count"] == 45  # 45 super donors > 14.5 visits
    assert freq_out["median"] == 4.0

    # Class comparison
    comp = eda["class_comparison"]
    assert len(comp) == 4
    rec_comp = next(c for c in comp if c["feature"] == "recency_months")
    assert rec_comp["donors_mean"] < rec_comp["non_donors_mean"]

    # Interactive filtering
    f_res = EDAService.execute_filtered_exploration(recency_range=[0, 3], target_filter="1")
    assert f_res["filtered_records_count"] == 75
    assert f_res["filtered_kpis"]["returning_donors"] == 75


from app.services.regression_service import RegressionService


def test_lab4_regression_service():
    # 1. UCI dataset loading
    df = RegressionService.load_dataset()
    assert len(df) == 748
    assert "monetary_cc" in df.columns
    assert "frequency_times" in df.columns

    # 2. Regression suite execution
    suite = RegressionService.get_regression_suite(force_refresh=True)
    assert suite["lab_id"] == 4
    assert suite["dataset_info"]["total_records"] == 748
    assert suite["dataset_info"]["train_records"] == 598
    assert suite["dataset_info"]["test_records"] == 150

    # 3. SLR Validation (Frequency -> Monetary)
    slr = suite["slr"]
    assert slr["predictor"] == "Frequency"
    assert slr["slope"] == 250.0
    assert slr["intercept"] == 0.0
    assert slr["metrics"]["r2"] == 1.0000
    assert slr["metrics"]["rmse"] == 0.0
    assert len(slr["fit_line"]) == 50
    assert len(slr["test_predictions"]) == 150

    # 4. MLR Validation (Recency + Frequency + Time -> Monetary)
    mlr = suite["mlr"]
    assert mlr["predictors"] == ["Recency", "Frequency", "Time"]
    assert mlr["coefficients"]["Frequency"] == 250.0
    assert mlr["coefficients"]["Recency"] == 0.0
    assert mlr["coefficients"]["Time"] == 0.0
    assert mlr["metrics"]["r2"] == 1.0000
    assert mlr["metrics"]["rmse"] == 0.0
    assert len(mlr["feature_coefficients"]) == 3
    assert len(mlr["test_predictions"]) == 150

    # 5. Model Comparison
    comp = suite["comparison"]
    assert "best_model" in comp
    assert len(comp["metrics"]) == 4

    # 6. Prediction
    pred_slr = RegressionService.predict_monetary_volume(model_type="slr", frequency=6)
    assert pred_slr["predicted_monetary_cc"] == 1500.0

    pred_mlr = RegressionService.predict_monetary_volume(model_type="mlr", frequency=10, recency=4, time=24)
    assert pred_mlr["predicted_monetary_cc"] == 2500.0
    assert "deterministic_notice" in pred_mlr



from app.services.lab5_service import Lab5Service
from app.services.lab6_service import Lab6Service
from app.services.lab7_service import Lab7Service
from app.services.lab8_service import Lab8Service
from app.services.lab9_service import Lab9Service


def test_lab5_decision_tree_service():
    res = Lab5Service.execute_decision_tree_suite(max_depth=3, min_samples_leaf=5, force_refresh=True)
    assert res["lab_id"] == 5
    assert "mutual_information" in res
    assert len(res["mutual_information"]) == 3
    assert "metrics" in res
    assert res["metrics"]["accuracy"] > 0.65
    assert "tree_structure" in res
    assert res["tree_structure"]["id"] == 0
    assert "samples" in res["tree_structure"]
    assert "confusion_matrix" in res
    assert len(res["confusion_matrix"]["matrix"]) == 2

    # Test single prediction
    pred = Lab5Service.predict_single_record(recency=4, frequency=5, time=20, max_depth=3, min_samples_leaf=5)
    assert "predicted_class" in pred
    assert pred["predicted_class"] in [0, 1]
    assert "probabilities" in pred
    assert "decision_path" in pred


def test_lab6_naive_bayes_service():
    res = Lab6Service.execute_naive_bayes_suite(force_refresh=True)
    assert res["lab_id"] == 6
    assert "class_priors" in res
    assert "non_donor_prior" in res["class_priors"]
    assert len(res["class_priors"]["priors_list"]) == 2
    assert "gaussian_parameters" in res
    assert "metrics" in res
    assert res["metrics"]["accuracy"] > 0.65
    assert "confusion_matrix" in res

    # Test single prediction
    pred = Lab6Service.predict_donor_probability(recency=4, frequency=5, time=20)
    assert "predicted_class" in pred
    assert pred["predicted_class"] in [0, 1]
    assert "probability_bars" in pred
    assert len(pred["probability_bars"]) == 2
    assert abs(sum(p["probability"] for p in pred["probability_bars"]) - 1.0) < 0.01


def test_lab7_kmeans_service():
    res = Lab7Service.execute_kmeans_suite(k=3, use_scaling=True, force_refresh=True)
    assert res["lab_id"] == 7
    assert "elbow_curve" in res
    assert len(res["elbow_curve"]) == 10
    assert "silhouette_curve" in res
    assert len(res["silhouette_curve"]) == 9
    assert "davies_bouldin_curve" in res
    assert len(res["davies_bouldin_curve"]) == 9
    assert len(res["cluster_profiles"]) == 3
    assert len(res["scatter_points"]) == 748
    assert len(res["centroids_2d"]) == 3


def test_lab8_hierarchical_service():
    res = Lab8Service.execute_hierarchical_suite(k=4, linkage_method="ward", force_refresh=True)
    assert res["lab_id"] == 8
    assert "benchmarks" in res
    assert len(res["benchmarks"]) == 4
    assert "dendrogram" in res
    assert len(res["dendrogram"]["lines"]) > 0
    assert len(res["cluster_profiles"]) == 4
    assert len(res["scatter_points"]) == 748


def test_lab9_apriori_service():
    # 1. Donor behavior basket mining
    res_donor = Lab9Service.execute_apriori_suite(dataset_type="donor_profiles", min_support=0.08, min_confidence=0.40)
    assert res_donor["lab_id"] == 9
    assert "top_frequent_itemsets" in res_donor
    assert len(res_donor["top_frequent_itemsets"]) > 0
    assert "association_rules" in res_donor
    assert len(res_donor["association_rules"]) > 0
    assert "network_graph" in res_donor
    assert len(res_donor["network_graph"]["nodes"]) > 0

    # 2. Retail grocery basket mining
    res_retail = Lab9Service.execute_apriori_suite(dataset_type="retail_grocery", min_support=0.10, min_confidence=0.30)
    assert len(res_retail["top_frequent_itemsets"]) > 0
    assert len(res_retail["association_rules"]) > 0

    # 3. Custom CSV transaction upload
    sample_csv = "Milk, Bread, Butter\nBread, Butter, Eggs\nMilk, Cookies, Coffee\nBread, Milk, Butter, Eggs\nMilk, Eggs, Yogurt\nBread, Cheese, Apples"
    upload_res = Lab9Service.load_custom_csv_transactions(sample_csv)
    assert upload_res["success"] is True
    assert upload_res["total_transactions"] == 6


def test_all_labs_suite():
    summary = LabsService.get_all_labs_summary()
    assert len(summary) == 9
    for item in summary:
        lab_id = item["id"]
        details = LabsService.get_lab_details(lab_id)
        assert details is not None
        assert "title" in details
        assert details["lab_id"] == lab_id


if __name__ == "__main__":
    test_source_dataset_integrity()
    print("[PASS] test_source_dataset_integrity passed")
    test_lab1_execution_and_schemas()
    print("[PASS] test_lab1_execution_and_schemas passed")
    test_lab2_olap_operations()
    print("[PASS] test_lab2_olap_operations passed")
    test_lab3_eda_service()
    print("[PASS] test_lab3_eda_service passed")
    test_lab4_regression_service()
    print("[PASS] test_lab4_regression_service passed")
    test_lab5_decision_tree_service()
    print("[PASS] test_lab5_decision_tree_service passed")
    test_lab6_naive_bayes_service()
    print("[PASS] test_lab6_naive_bayes_service passed")
    test_lab7_kmeans_service()
    print("[PASS] test_lab7_kmeans_service passed")
    test_lab8_hierarchical_service()
    print("[PASS] test_lab8_hierarchical_service passed")
    test_lab9_apriori_service()
    print("[PASS] test_lab9_apriori_service passed")
    test_warehouse_service_sql_queries()
    print("[PASS] test_warehouse_service_sql_queries passed")
    test_all_labs_suite()
    print("[PASS] test_all_labs_suite passed")
    print("\nALL 9 DWDM LAB TESTS PASSED SUCCESSFULLY!")
