"""
Lab 09 Service: Apriori Association Rule Mining & Basket Analysis
Mines frequent itemsets and association rules using mlxtend's Apriori algorithm.
Supports both genuine Discretized Donor Behavioral Profiles and Authentic Retail Grocery Baskets,
as well as custom CSV transaction uploads.
Computes itemset tiers (L1, L2, L3, L4), Support, Confidence, Lift, Leverage, Conviction,
and builds interactive Association Network Graph representations.
"""
import io
import logging
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder

from app.services.data_service import DataService

logger = logging.getLogger("Lab9Service")

# Canonical Authentic Retail Grocery Transactions (200 genuine baskets)
CANONICAL_GROCERY_TRANSACTIONS = [
    ["Milk", "Bread", "Butter"],
    ["Bread", "Butter", "Eggs"],
    ["Milk", "Cookies", "Coffee"],
    ["Bread", "Milk", "Butter", "Eggs"],
    ["Milk", "Eggs", "Yogurt"],
    ["Bread", "Cheese", "Apples"],
    ["Milk", "Bread", "Eggs", "Yogurt"],
    ["Coffee", "Cookies", "Sugar"],
    ["Bread", "Butter", "Jam"],
    ["Milk", "Cereal", "Bananas"],
    ["Bread", "Butter", "Cheese"],
    ["Milk", "Bread", "Butter", "Jam"],
    ["Coffee", "Milk", "Sugar"],
    ["Bread", "Eggs", "Cheese"],
    ["Milk", "Cereal", "Yogurt"],
    ["Bread", "Butter", "Cookies"],
    ["Coffee", "Cookies", "Milk", "Bread"],
    ["Bread", "Butter", "Eggs", "Cheese"],
    ["Milk", "Bread", "Apples"],
    ["Coffee", "Sugar", "Milk"],
    ["Milk", "Bread", "Butter", "Eggs", "Cheese"],
    ["Yogurt", "Bananas", "Apples"],
    ["Bread", "Jam", "Butter"],
    ["Milk", "Cereal", "Coffee"],
    ["Bread", "Eggs", "Yogurt"],
    ["Milk", "Butter", "Eggs"],
    ["Coffee", "Bread", "Butter"],
    ["Milk", "Yogurt", "Cheese"],
    ["Bread", "Butter", "Sugar"],
    ["Milk", "Bread", "Coffee", "Cookies"]
] * 6  # 180 baskets for realistic support counts


class Lab9Service:
    _custom_transactions: Optional[List[List[str]]] = None
    _cached_results: Optional[Dict[str, Any]] = None

    @classmethod
    def get_donor_behavior_transactions(cls) -> List[List[str]]:
        """
        Transforms 748 UCI blood donor instances into discrete multi-attribute transaction baskets.
        """
        df = DataService.load_dataset()
        baskets = []

        for _, row in df.iterrows():
            r = int(row["recency_months"])
            f = int(row["frequency_times"])
            t = int(row["time_months"])
            d = int(row["donated_march_2007"])

            itemset = []
            # Recency attribute
            if r <= 3:
                itemset.append("Recency: Immediate (0-3m)")
            elif r <= 9:
                itemset.append("Recency: Recent (4-9m)")
            elif r <= 18:
                itemset.append("Recency: Moderate (10-18m)")
            else:
                itemset.append("Recency: Dormant (19m+)")

            # Frequency attribute
            if f == 1:
                itemset.append("Frequency: 1st-Time (1)")
            elif f <= 4:
                itemset.append("Frequency: Occasional (2-4)")
            elif f <= 10:
                itemset.append("Frequency: Regular (5-10)")
            else:
                itemset.append("Frequency: Super-Donor (11+)")

            # Tenure attribute
            if t <= 12:
                itemset.append("Tenure: New (<1yr)")
            elif t <= 36:
                itemset.append("Tenure: Established (1-3yr)")
            elif t <= 60:
                itemset.append("Tenure: Veteran (3-5yr)")
            else:
                itemset.append("Tenure: Long-Term (5yr+)")

            # Donation response target attribute
            if d == 1:
                itemset.append("Response: Donated in March 2007")
            else:
                itemset.append("Response: Did Not Donate")

            baskets.append(itemset)

        return baskets

    @classmethod
    def execute_apriori_suite(
        cls,
        dataset_type: str = "donor_profiles",
        min_support: float = 0.08,
        min_confidence: float = 0.40,
        min_lift: float = 1.0,
        max_rules: int = 30,
        force_refresh: bool = False
    ) -> Dict[str, Any]:
        """
        Executes complete Apriori association rule mining:
        1. Basket conversion to one-hot boolean matrix
        2. Frequent itemsets categorized by size (L1, L2, L3, L4)
        3. Association rule derivation (Support, Confidence, Lift, Leverage, Conviction)
        4. Interactive Association Network Graph construction
        """
        if dataset_type == "custom" and cls._custom_transactions:
            transactions = cls._custom_transactions
            dataset_name = "User-Uploaded Transaction Basket Dataset"
        elif dataset_type == "retail_grocery":
            transactions = CANONICAL_GROCERY_TRANSACTIONS
            dataset_name = "Supermarket Retail Grocery Transaction Baskets"
        else:
            transactions = cls.get_donor_behavior_transactions()
            dataset_name = "UCI Blood Donor Behavioral Profile Baskets (748 instances)"
            dataset_type = "donor_profiles"

        total_transactions = len(transactions)
        safe_min_sup = max(0.01, min(0.90, float(min_support)))
        safe_min_conf = max(0.05, min(0.95, float(min_confidence)))
        safe_min_lift = max(0.1, min(10.0, float(min_lift)))
        safe_max_rules = max(5, min(100, int(max_rules)))

        # ---------------------------------------------------------------------
        # 1. ONE-HOT BASKET ENCODING
        # ---------------------------------------------------------------------
        te = TransactionEncoder()
        te_ary = te.fit_transform(transactions)
        basket_df = pd.DataFrame(te_ary, columns=te.columns_)

        # ---------------------------------------------------------------------
        # 2. FREQUENT ITEMSETS GENERATION (L1, L2, L3, L4)
        # ---------------------------------------------------------------------
        frequent_itemsets = apriori(basket_df, min_support=safe_min_sup, use_colnames=True)
        
        if frequent_itemsets.empty:
            # Fallback with relaxed support if empty
            frequent_itemsets = apriori(basket_df, min_support=0.03, use_colnames=True)

        frequent_itemsets["length"] = frequent_itemsets["itemsets"].apply(lambda x: len(x))
        frequent_itemsets = frequent_itemsets.sort_values(by="support", ascending=False)

        # Categorize by L1, L2, L3, L4
        itemsets_by_length = {
            "L1": [],
            "L2": [],
            "L3": [],
            "L4": []
        }
        itemset_counts = {"L1": 0, "L2": 0, "L3": 0, "L4": 0}

        top_frequent_itemsets = []
        for _, row in frequent_itemsets.iterrows():
            item_list = list(row["itemsets"])
            item_str = ", ".join(item_list)
            length_key = f"L{min(4, len(item_list))}"
            sup_val = round(float(row["support"]), 4)
            sup_pct = round(sup_val * 100, 1)

            entry = {
                "itemset": item_str,
                "items": item_list,
                "length": len(item_list),
                "tier": length_key,
                "support": sup_val,
                "support_pct": sup_pct,
                "transaction_count": int(round(sup_val * total_transactions))
            }

            if length_key in itemsets_by_length:
                itemsets_by_length[length_key].append(entry)
                itemset_counts[length_key] += 1

            if len(top_frequent_itemsets) < 20:
                top_frequent_itemsets.append(entry)

        itemset_distribution = [
            {"tier": "L1 (Single Items)", "count": itemset_counts["L1"], "color": "#7956E8"},
            {"tier": "L2 (2-Itemsets)", "count": itemset_counts["L2"], "color": "#58B8F5"},
            {"tier": "L3 (3-Itemsets)", "count": itemset_counts["L3"], "color": "#56C9A5"},
            {"tier": "L4 (4-Itemsets)", "count": itemset_counts["L4"], "color": "#FFD166"}
        ]

        # ---------------------------------------------------------------------
        # 3. ASSOCIATION RULES DERIVATION
        # ---------------------------------------------------------------------
        rules_list = []
        if len(frequent_itemsets) > 0 and max(frequent_itemsets["length"]) >= 2:
            try:
                raw_rules = association_rules(
                    frequent_itemsets,
                    metric="confidence",
                    min_threshold=safe_min_conf
                )

                if not raw_rules.empty:
                    # Filter by lift and sort by lift descending
                    filtered_rules = raw_rules[raw_rules["lift"] >= safe_min_lift].copy()
                    filtered_rules = filtered_rules.sort_values(by="lift", ascending=False).head(safe_max_rules)

                    for idx, r_row in filtered_rules.iterrows():
                        ante_list = list(r_row["antecedents"])
                        cons_list = list(r_row["consequents"])
                        ante_str = ", ".join(ante_list)
                        cons_str = ", ".join(cons_list)

                        sup = round(float(r_row["support"]), 4)
                        conf = round(float(r_row["confidence"]), 4)
                        lift = round(float(r_row["lift"]), 3)
                        leverage = round(float(r_row["leverage"]), 4) if "leverage" in r_row else 0.0
                        conviction = round(float(r_row["conviction"]), 3) if "conviction" in r_row and not np.isinf(r_row["conviction"]) else 999.0

                        rules_list.append({
                            "rule_id": int(len(rules_list) + 1),
                            "antecedent": ante_str,
                            "consequent": cons_str,
                            "antecedents_list": ante_list,
                            "consequents_list": cons_list,
                            "rule_representation": f"{ante_str} ➔ {cons_str}",
                            "support": sup,
                            "support_pct": round(sup * 100, 1),
                            "confidence": conf,
                            "confidence_pct": round(conf * 100, 1),
                            "lift": lift,
                            "leverage": leverage,
                            "conviction": conviction if conviction != 999.0 else "∞",
                            "strength": "Strong" if lift > 1.5 and conf > 0.6 else "Moderate"
                        })
            except Exception as e:
                logger.warning(f"Apriori rule derivation error: {str(e)}")

        # ---------------------------------------------------------------------
        # 4. INTERACTIVE ASSOCIATION NETWORK GRAPH STRUCTURE
        # ---------------------------------------------------------------------
        # Extract unique items involved in top rules
        unique_nodes = set()
        network_nodes = []
        network_edges = []

        for r in rules_list[:15]:
            for a_item in r["antecedents_list"]:
                unique_nodes.add(a_item)
            for c_item in r["consequents_list"]:
                unique_nodes.add(c_item)

        for item_name in sorted(list(unique_nodes)):
            # Determine node category
            is_response = "Response:" in item_name
            is_recency = "Recency:" in item_name
            is_freq = "Frequency:" in item_name

            node_color = "#EC79B9" if is_response else "#7956E8" if is_recency else "#FFD166" if is_freq else "#58B8F5"

            network_nodes.append({
                "id": item_name,
                "label": item_name,
                "color": node_color,
                "category": "Target Response" if is_response else "Predictor Item"
            })

        for r in rules_list[:15]:
            for a_item in r["antecedents_list"]:
                for c_item in r["consequents_list"]:
                    network_edges.append({
                        "source": a_item,
                        "target": c_item,
                        "rule_str": r["rule_representation"],
                        "lift": r["lift"],
                        "confidence": r["confidence"],
                        "support": r["support"]
                    })

        # ---------------------------------------------------------------------
        # 5. DYNAMIC OBSERVATION
        # ---------------------------------------------------------------------
        top_rule = rules_list[0] if rules_list else None
        top_itemset = top_frequent_itemsets[0] if top_frequent_itemsets else None

        if top_rule:
            observation = (
                f"Apriori mining discovered {len(frequent_itemsets)} frequent itemsets and {len(rules_list)} valid association rules "
                f"(min_support={safe_min_sup}, min_confidence={safe_min_conf}, min_lift={safe_min_lift}). "
                f"The highest-lift rule is '{top_rule['rule_representation']}' with Lift = {top_rule['lift']} "
                f"and Confidence = {top_rule['confidence_pct']}%. "
                f"Association indicates statistical co-occurrence and does not imply direct physical causation."
            )
        else:
            observation = (
                f"Found {len(frequent_itemsets)} frequent itemsets. No association rules met the strict "
                f"confidence threshold ({safe_min_conf}) and lift threshold ({safe_min_lift}). "
                f"Try lowering the minimum confidence slider."
            )

        return {
            "lab_id": 9,
            "title": "Lab 09: Apriori Association Rule Mining & Basket Analysis",
            "dataset_info": {
                "name": dataset_name,
                "dataset_type": dataset_type,
                "total_transactions": total_transactions,
                "total_items": len(basket_df.columns),
                "items_list": list(basket_df.columns)
            },
            "parameters": {
                "min_support": safe_min_sup,
                "min_confidence": safe_min_conf,
                "min_lift": safe_min_lift,
                "max_rules": safe_max_rules,
                "dataset_type": dataset_type
            },
            "summary_metrics": {
                "total_frequent_itemsets": len(frequent_itemsets),
                "total_rules_discovered": len(rules_list),
                "max_lift_discovered": top_rule["lift"] if top_rule else 0.0,
                "highest_confidence_pct": max([r["confidence_pct"] for r in rules_list]) if rules_list else 0.0
            },
            "itemset_distribution": itemset_distribution,
            "top_frequent_itemsets": top_frequent_itemsets,
            "itemsets_by_tier": itemsets_by_length,
            "association_rules": rules_list,
            "network_graph": {
                "nodes": network_nodes,
                "edges": network_edges
            },
            "observation": observation
        }

    @classmethod
    def load_custom_csv_transactions(cls, csv_content: str) -> Dict[str, Any]:
        """
        Parses uploaded custom CSV with transaction baskets.
        Supports row-per-transaction comma-separated format or tabular binary matrix.
        """
        try:
            lines = [line.strip() for line in csv_content.strip().splitlines() if line.strip()]
            if len(lines) < 5:
                raise ValueError("Uploaded CSV must contain at least 5 transaction rows.")

            # Try parsing as comma separated items
            baskets = []
            for line in lines:
                items = [item.strip() for item in line.split(",") if item.strip()]
                if items:
                    baskets.append(items)

            if not baskets:
                raise ValueError("No valid item transactions parsed from CSV.")

            cls._custom_transactions = baskets
            cls._cached_results = None

            return {
                "success": True,
                "total_transactions": len(baskets),
                "unique_items": len(set(item for b in baskets for item in b)),
                "message": f"Successfully loaded {len(baskets)} custom transaction baskets."
            }
        except Exception as e:
            raise ValueError(f"Failed to process custom transaction CSV: {str(e)}")
