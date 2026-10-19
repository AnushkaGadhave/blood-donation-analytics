"""
Generates high-resolution editorial charts for the Blood Donation Analytics presentation.
Matches palette: Warm Cream (#FFF8F0), Coral (#F15B5A), Berry (#9F263D), Blush (#F8D9D8), Mint (#D8E9D9), Charcoal (#303030).
"""
import os
import json
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

os.makedirs('presentation_assets', exist_ok=True)

# Global styles
plt.rcParams['font.sans-serif'] = ['Segoe UI', 'DejaVu Sans', 'Arial', 'sans-serif']
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['text.color'] = '#303030'
plt.rcParams['axes.labelcolor'] = '#303030'
plt.rcParams['xtick.color'] = '#303030'
plt.rcParams['ytick.color'] = '#303030'

# 1. Target Class Balance Donut Chart (Square 5x5 ratio so it stays circular)
fig, ax = plt.subplots(figsize=(5, 5), facecolor='#FFF8F0')
ax.set_facecolor('#FFF8F0')
sizes = [570, 178]
labels = ['Did Not Return (0)\n570 (76.2%)', 'Donated March 2007 (1)\n178 (23.8%)']
colors = ['#F8D9D8', '#F15B5A']
explode = (0, 0.08)
wedges, texts, autotexts = ax.pie(
    sizes, explode=explode, labels=labels, autopct='%1.1f%%',
    startangle=140, colors=colors, textprops=dict(color='#303030', fontsize=10.5, fontweight='medium'),
    wedgeprops=dict(width=0.45, edgecolor='#FFF8F0', linewidth=3)
)
for at in autotexts:
    at.set_color('#303030')
    at.set_fontweight('bold')
ax.set_title('Target Class Distribution (N=748)\n3.2 : 1 Imbalance Ratio', fontsize=12, fontweight='bold', color='#9F263D', pad=12)
plt.tight_layout()
plt.savefig('presentation_assets/chart_class_balance.png', dpi=300, facecolor='#FFF8F0')
plt.close()

# 2. Model Leaderboard Bar Chart
with open('backend/models/model_comparison.json', 'r') as f:
    data = json.load(f)

models = [m['model_name'] for m in data['models_comparison']]
f1_scores = [m['metrics']['f1_score'] * 100 for m in data['models_comparison']]
recalls = [m['metrics']['recall'] * 100 for m in data['models_comparison']]
accuracies = [m['metrics']['accuracy'] * 100 for m in data['models_comparison']]
bal_accs = [m['metrics']['balanced_accuracy'] * 100 for m in data['models_comparison']]

x = np.arange(len(models))
width = 0.2

fig, ax = plt.subplots(figsize=(8.5, 4.5), facecolor='#FFF8F0')
ax.set_facecolor('#FFF8F0')
ax.grid(axis='y', linestyle='--', alpha=0.4, color='#56C9A5')

r1 = ax.bar(x - 1.5*width, f1_scores, width, label='F1-Score (Primary)', color='#9F263D')
r2 = ax.bar(x - 0.5*width, recalls, width, label='Recall (Sensitivity)', color='#F15B5A')
r3 = ax.bar(x + 0.5*width, bal_accs, width, label='Balanced Accuracy', color='#56C9A5')
r4 = ax.bar(x + 1.5*width, accuracies, width, label='Raw Accuracy', color='#F8D9D8', edgecolor='#9F263D', linewidth=0.8)

ax.set_ylabel('Score (%)', fontsize=11, fontweight='bold')
ax.set_title('Classifier Benchmark Under Class Imbalance (N_test=150)', fontsize=13, fontweight='bold', color='#9F263D', pad=12)
ax.set_xticks(x)
ax.set_xticklabels(models, fontsize=10, fontweight='bold')
ax.legend(frameon=True, facecolor='#FFF8F0', edgecolor='#F8D9D8', fontsize=9, loc='upper right')
ax.set_ylim(0, 105)

for spine in ['top', 'right', 'left', 'bottom']:
    ax.spines[spine].set_color('#D8D8D8')

plt.tight_layout()
plt.savefig('presentation_assets/chart_model_benchmarks.png', dpi=300, facecolor='#FFF8F0')
plt.close()

# 3. ROC Curves Chart
fig, ax = plt.subplots(figsize=(6.5, 4.5), facecolor='#FFF8F0')
ax.set_facecolor('#FFF8F0')
ax.plot([0, 1], [0, 1], 'k--', alpha=0.3, label='Random Guess (AUC = 0.50)')

palette = ['#9F263D', '#F15B5A', '#7956E8', '#56C9A5']
for idx, m in enumerate(data['models_comparison']):
    fpr = [p['fpr'] for p in m['roc_curve']]
    tpr = [p['tpr'] for p in m['roc_curve']]
    auc = m['metrics']['roc_auc']
    label_text = f"{m['model_name']} (AUC = {auc:.4f})"
    ax.plot(fpr, tpr, color=palette[idx % len(palette)], linewidth=2.4, label=label_text)

ax.set_xlabel('False Positive Rate (1 - Specificity)', fontsize=10, fontweight='bold')
ax.set_ylabel('True Positive Rate (Recall)', fontsize=10, fontweight='bold')
ax.set_title('Stratified Test ROC Curves (Holdout N=150)', fontsize=12, fontweight='bold', color='#9F263D', pad=12)
ax.legend(loc='lower right', frameon=True, facecolor='#FFF8F0', edgecolor='#F8D9D8', fontsize=9)
ax.grid(True, linestyle='--', alpha=0.4, color='#D8E9D9')
for spine in ['top', 'right', 'left', 'bottom']:
    ax.spines[spine].set_color('#D8D8D8')

plt.tight_layout()
plt.savefig('presentation_assets/chart_roc_curves.png', dpi=300, facecolor='#FFF8F0')
plt.close()

# 4. Feature Importance Horizontal Bar
fig, ax = plt.subplots(figsize=(6.2, 3.2), facecolor='#FFF8F0')
ax.set_facecolor('#FFF8F0')
features = [f['feature'].replace('_', ' ').title() for f in reversed(data['feature_importance'])]
pcts = [f['percentage'] for f in reversed(data['feature_importance'])]
bars = ax.barh(features, pcts, color=['#56C9A5', '#FFD166', '#F8D9D8', '#F15B5A'], height=0.55, edgecolor='#303030', linewidth=0.5)

for bar in bars:
    w = bar.get_width()
    ax.text(w + 1, bar.get_y() + bar.get_height()/2, f'{w:.1f}%', va='center', ha='left', fontsize=10, fontweight='bold', color='#303030')

ax.set_xlim(0, 42)
ax.set_xlabel('Relative Predictor Weight (%)', fontsize=10, fontweight='bold')
ax.set_title('RFMT Attribute Predictive Weight', fontsize=12, fontweight='bold', color='#9F263D', pad=10)
ax.grid(axis='x', linestyle='--', alpha=0.3, color='#D8E9D9')
for spine in ['top', 'right', 'bottom']:
    ax.spines[spine].set_visible(False)

plt.tight_layout()
plt.savefig('presentation_assets/chart_feature_importance.png', dpi=300, facecolor='#FFF8F0')
plt.close()

# 5. RFMT Empirical Distribution Skewness Chart
df = pd.read_csv('data/raw/transfusion.data')
df.columns = ['recency', 'frequency', 'monetary', 'time', 'donated']

fig, axes = plt.subplots(1, 3, figsize=(10, 3.2), facecolor='#FFF8F0')
plt.subplots_adjust(top=0.82, bottom=0.18, wspace=0.25)
cols_to_plot = [
    ('recency', 'Recency (Months)', '#F15B5A', 7, 9.5),
    ('frequency', 'Frequency (Times)', '#9F263D', 4, 5.5),
    ('time', 'Tenure / Time (Months)', '#56C9A5', 28, 34.3)
]

for idx, (col, title, col_color, med, mean) in enumerate(cols_to_plot):
    ax = axes[idx]
    ax.set_facecolor('#FFF8F0')
    ax.hist(df[col], bins=15, color=col_color, alpha=0.75, edgecolor='#FFF8F0')
    ax.axvline(med, color='#303030', linestyle='--', linewidth=1.5, label=f'Med: {med}')
    ax.axvline(mean, color='#9F263D', linestyle='-', linewidth=1.5, label=f'Mean: {mean}')
    ax.set_title(title, fontsize=10, fontweight='bold', color='#303030')
    ax.legend(fontsize=8, facecolor='#FFF8F0', framealpha=0.8)
    ax.grid(axis='y', linestyle=':', alpha=0.3)
    for sp in ['top', 'right']:
        ax.spines[sp].set_visible(False)

fig.suptitle('Empirical Skewness & Long-Tail Distributions (N=748)', fontsize=11.5, fontweight='bold', color='#9F263D', y=0.96)
plt.savefig('presentation_assets/chart_rfmt_distributions.png', dpi=300, facecolor='#FFF8F0')
plt.close()

print('Generated 5 high-resolution editorial charts successfully!')
