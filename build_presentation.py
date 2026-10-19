"""
build_presentation.py
Generates the complete 14-slide Widescreen (16:9) PowerPoint presentation:
'Blood_Donation_Prediction_Project_Presentation.pptx'
Visual direction: Playful Healthcare Editorial
Color palette:
  Warm Cream: #FFF8F0 (RGB 255, 248, 240)
  Coral Red:   #F15B5A (RGB 241, 91, 90)
  Deep Berry:  #9F263D (RGB 159, 38, 61)
  Soft Blush:  #F8D9D8 (RGB 248, 217, 216)
  Fresh Mint:  #D8E9D9 (RGB 216, 233, 217)
  Charcoal:    #303030 (RGB 48, 48, 48)
  White:       #FFFFFF (RGB 255, 255, 255)
"""
import os
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

# Color Constants
C_CREAM    = RGBColor(255, 248, 240) # #FFF8F0
C_CORAL    = RGBColor(241, 91, 90)   # #F15B5A
C_BERRY    = RGBColor(159, 38, 61)   # #9F263D
C_BLUSH    = RGBColor(248, 217, 216) # #F8D9D8
C_MINT     = RGBColor(216, 233, 217) # #D8E9D9
C_CHARCOAL = RGBColor(48, 48, 48)    # #303030
C_WHITE    = RGBColor(255, 255, 255) # #FFFFFF
C_GRAY     = RGBColor(120, 120, 120)
C_TABLE_BG = RGBColor(255, 240, 238)

FONT_HEADING = "Poppins"
FONT_BODY    = "Segoe UI"

prs = Presentation()
prs.slide_width  = Inches(13.333)
prs.slide_height = Inches(7.5)
blank_layout     = prs.slide_layouts[6]

def set_slide_background(slide, color=C_CREAM):
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg.fill.solid()
    bg.fill.fore_color.rgb = color
    bg.line.fill.background()
    return bg

def add_header(slide, category: str, title: str, subtitle: str = ""):
    """Consistent playful editorial header across slides"""
    cat_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.4), Inches(3.2), Inches(0.38))
    cat_box.fill.solid()
    cat_box.fill.fore_color.rgb = C_BLUSH
    cat_box.line.color.rgb = C_CORAL
    cat_box.line.width = Pt(1)
    tf = cat_box.text_frame
    tf.word_wrap = False
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    run = p.add_run()
    run.text = f"[  {category.upper()}  ]"
    run.font.name = FONT_HEADING
    run.font.size = Pt(9.5)
    run.font.bold = True
    run.font.color.rgb = C_BERRY

    tbox = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.7), Inches(1.0))
    tf2 = tbox.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_right = tf2.margin_top = tf2.margin_bottom = 0
    p2 = tf2.paragraphs[0]
    p2.line_spacing = 1.05
    run2 = p2.add_run()
    run2.text = title
    run2.font.name = FONT_HEADING
    run2.font.size = Pt(23)
    run2.font.bold = True
    run2.font.color.rgb = C_BERRY

    if subtitle:
        p3 = tf2.add_paragraph()
        p3.line_spacing = 1.1
        p3.space_before = Pt(3)
        run3 = p3.add_run()
        run3.text = subtitle
        run3.font.name = FONT_BODY
        run3.font.size = Pt(11.5)
        run3.font.color.rgb = C_CHARCOAL

def add_card(slide, left, top, width, height, bg_color=C_WHITE, border_color=C_BLUSH, border_width=1):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = bg_color
    if border_color:
        card.line.color.rgb = border_color
        card.line.width = Pt(border_width)
    else:
        card.line.fill.background()
    return card

# ==============================================================================
# SLIDE 1: COVER SLIDE
# ==============================================================================
slide1 = prs.slides.add_slide(blank_layout)
set_slide_background(slide1, C_CREAM)

dec1 = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.5), Inches(-0.5), Inches(5.5), Inches(8.5))
dec1.fill.solid(); dec1.fill.fore_color.rgb = C_BLUSH; dec1.line.fill.background()

dec2 = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(9.2), Inches(0.5), Inches(4.5), Inches(6.5))
dec2.fill.solid(); dec2.fill.fore_color.rgb = C_MINT; dec2.line.color.rgb = C_WHITE; dec2.line.width = Pt(3)

heart = slide1.shapes.add_shape(MSO_SHAPE.HEART, Inches(10.2), Inches(1.6), Inches(2.3), Inches(2.3))
heart.fill.solid(); heart.fill.fore_color.rgb = C_CORAL; heart.line.color.rgb = C_BERRY; heart.line.width = Pt(2.5)

drop = slide1.shapes.add_shape(MSO_SHAPE.OVAL, Inches(10.9), Inches(2.2), Inches(0.9), Inches(1.2))
drop.fill.solid(); drop.fill.fore_color.rgb = C_BERRY; drop.line.fill.background()

cross = slide1.shapes.add_shape(MSO_SHAPE.CROSS, Inches(11.1), Inches(4.0), Inches(0.5), Inches(0.5))
cross.fill.solid(); cross.fill.fore_color.rgb = C_WHITE; cross.line.fill.background()

ill_card = add_card(slide1, Inches(9.6), Inches(4.7), Inches(3.4), Inches(1.8), C_WHITE, C_CORAL, 1.5)
tf = ill_card.text_frame; tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.18)
p = tf.paragraphs[0]
r = p.add_run(); r.text = "HEALTHCARE DATA MINING"
r.font.name = FONT_HEADING; r.font.size = Pt(10); r.font.bold = True; r.font.color.rgb = C_BERRY
p2 = tf.add_paragraph(); p2.space_before = Pt(4)
r2 = p2.add_run()
r2.text = "Yeh et al. (2008) Benchmark Cohort • 748 Donors • RFMTC Bernoulli Formulation • 83.3% Model Recall"
r2.font.name = FONT_BODY; r2.font.size = Pt(9.5); r2.font.color.rgb = C_CHARCOAL

tag = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.9), Inches(5.8), Inches(0.42))
tag.fill.solid(); tag.fill.fore_color.rgb = C_MINT; tag.line.color.rgb = C_CORAL; tag.line.width = Pt(1.2)
tf = tag.text_frame; tf.word_wrap = False
p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
r = p.add_run(); r.text = "B.TECH CSE CAPSTONE REVIEW • ACADEMIC DWDM & MACHINE LEARNING"
r.font.name = FONT_HEADING; r.font.size = Pt(9.5); r.font.bold = True; r.font.color.rgb = C_BERRY

tbox = slide1.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(7.5), Inches(2.8))
tf = tbox.text_frame; tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
p = tf.paragraphs[0]; p.line_spacing = 1.05
r = p.add_run(); r.text = "Blood Donation Prediction\n& Donor Behaviour Analysis"
r.font.name = FONT_HEADING; r.font.size = Pt(34); r.font.bold = True; r.font.color.rgb = C_BERRY

p2 = tf.add_paragraph(); p2.space_before = Pt(14); p2.line_spacing = 1.2
r2 = p2.add_run()
r2.text = "A Calibrated Machine Learning & Recency-Frequency-Monetary (RFMTC) Framework for Understanding Participation Patterns on the UCI Benchmark Cohort"
r2.font.name = FONT_BODY; r2.font.size = Pt(13); r2.font.color.rgb = C_CHARCOAL

meta_card = add_card(slide1, Inches(0.8), Inches(4.7), Inches(7.4), Inches(1.9), C_WHITE, C_BLUSH, 1.5)
tf = meta_card.text_frame; tf.word_wrap = True
tf.margin_left = Inches(0.25); tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.2)

rows = [
    ("Student Presenter:", "Candidate Name / Roll No. (Fill In)"),
    ("Department & Degree:", "Department of Computer Science & Engineering • B.Tech (2025–2026)"),
    ("Faculty Guide:", "Project Supervisor / Guide Name (Fill In)"),
    ("Dataset Source:", "UCI Machine Learning Repository (Blood Transfusion Service Center, ID: 176)")
]
for idx, (label, val) in enumerate(rows):
    p = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
    p.alignment = PP_ALIGN.LEFT
    if idx > 0: p.space_before = Pt(4)
    r1 = p.add_run(); r1.text = f"{label} "
    r1.font.name = FONT_HEADING; r1.font.size = Pt(9.5); r1.font.bold = True; r1.font.color.rgb = C_CORAL
    r2 = p.add_run(); r2.text = val
    r2.font.name = FONT_BODY; r2.font.size = Pt(9.5); r2.font.color.rgb = C_CHARCOAL

# ==============================================================================
# SLIDE 2: THE PROBLEM (Healthcare Volatility & Retention)
# ==============================================================================
slide2 = prs.slides.add_slide(blank_layout)
set_slide_background(slide2, C_CREAM)
add_header(slide2, "Background & Motivation", "The High-Stakes Volatility of Blood Supply Management",
           "Why maintaining a reliable, calibrated donor pool is an essential data science challenge.")

card_w = Inches(3.7); card_h = Inches(3.6); top_pos = Inches(1.9)

c1 = add_card(slide2, Inches(0.8), top_pos, card_w, card_h, C_WHITE, C_BERRY, 2)
tf = c1.text_frame; tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.25)
p = tf.paragraphs[0]
r = p.add_run(); r.text = "01  •  PERISHABLE INVENTORY"
r.font.name = FONT_HEADING; r.font.size = Pt(11); r.font.bold = True; r.font.color.rgb = C_BERRY
p = tf.add_paragraph(); p.space_before = Pt(10)
r = p.add_run(); r.text = "Critical Shelf-Life Windows"
r.font.name = FONT_HEADING; r.font.size = Pt(15); r.font.bold = True; r.font.color.rgb = C_CHARCOAL
p = tf.add_paragraph(); p.space_before = Pt(8); p.line_spacing = 1.15
r = p.add_run()
r.text = "• Whole blood expires in strictly 35 to 42 days; platelets perish in just 5 days.\n\n• Donated units cannot be hoarded indefinitely, requiring a steady, predictable inflow rather than feast-or-famine collection spikes.\n\n• Over-collection leads to tragic discard wastage; shortages directly compromise emergency transfusions."
r.font.name = FONT_BODY; r.font.size = Pt(10); r.font.color.rgb = C_CHARCOAL

c2 = add_card(slide2, Inches(4.8), top_pos, card_w, card_h, C_WHITE, C_CORAL, 2)
tf = c2.text_frame; tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.25)
p = tf.paragraphs[0]
r = p.add_run(); r.text = "02  •  DONOR ATTRITION"
r.font.name = FONT_HEADING; r.font.size = Pt(11); r.font.bold = True; r.font.color.rgb = C_CORAL
p = tf.add_paragraph(); p.space_before = Pt(10)
r = p.add_run(); r.text = "Only 23.8% Return Rate"
r.font.name = FONT_HEADING; r.font.size = Pt(15); r.font.bold = True; r.font.color.rgb = C_CHARCOAL
p = tf.add_paragraph(); p.space_before = Pt(8); p.line_spacing = 1.15
r = p.add_run()
r.text = "• In the verified 748-donor cohort, only 178 individuals (23.8%) returned to donate in March 2007, while 570 (76.2%) lapsed.\n\n• First-time donors rarely transition spontaneously into habitual donors without strategic engagement.\n\n• Donor acquisition costs 5x more operational effort than retaining existing responsive donors."
r.font.name = FONT_BODY; r.font.size = Pt(10); r.font.color.rgb = C_CHARCOAL

c3 = add_card(slide2, Inches(8.8), top_pos, card_w, card_h, C_WHITE, C_MINT, 2)
tf = c3.text_frame; tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.25)
p = tf.paragraphs[0]
r = p.add_run(); r.text = "03  •  OUTREACH FATIGUE"
r.font.name = FONT_HEADING; r.font.size = Pt(11); r.font.bold = True; r.font.color.rgb = C_BERRY
p = tf.add_paragraph(); p.space_before = Pt(10)
r = p.add_run(); r.text = "Uncalibrated Blind Blasts"
r.font.name = FONT_HEADING; r.font.size = Pt(15); r.font.bold = True; r.font.color.rgb = C_CHARCOAL
p = tf.add_paragraph(); p.space_before = Pt(8); p.line_spacing = 1.15
r = p.add_run()
r.text = "• Mobile collection centers rely on unsegmented phone/SMS blast spam, inducing donor fatigue and unsubscribes.\n\n• Traditional methods lack quantitative awareness of Recency decay (months since last donation).\n\n• Outreach coordinators lack empirical scoring tools to prioritize mobile drive call lists."
r.font.name = FONT_BODY; r.font.size = Pt(10); r.font.color.rgb = C_CHARCOAL

bot_card = add_card(slide2, Inches(0.8), Inches(5.7), Inches(11.7), Inches(1.3), C_MINT, C_CORAL, 1.5)
tf = bot_card.text_frame; tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.18)
p = tf.paragraphs[0]
r = p.add_run(); r.text = "REAL-WORLD HEALTHCARE NEED  vs.  SPECIFIC MACHINE LEARNING FORMULATION"
r.font.name = FONT_HEADING; r.font.size = Pt(10.5); r.font.bold = True; r.font.color.rgb = C_BERRY
p2 = tf.add_paragraph(); p2.space_before = Pt(3); p2.line_spacing = 1.15
r2 = p2.add_run()
r2.text = "While regional health systems manage acute blood shortages, this project solves a specific, mathematically grounded binary classification task: Predicting whether an individual donor from a 748-person historical cohort will donate during a mobile collection campaign, using four validated Recency-Frequency-Monetary-Time (RFMT) variables."
r2.font.name = FONT_BODY; r2.font.size = Pt(10); r2.font.color.rgb = C_CHARCOAL

# ==============================================================================
# SLIDE 3: PROJECT OBJECTIVES
# ==============================================================================
slide3 = prs.slides.add_slide(blank_layout)
set_slide_background(slide3, C_CREAM)
add_header(slide3, "Core Milestones", "Project Objectives & Scope of Work",
           "Four focused, technically verifiable pillars guiding our machine learning research.")

objs = [
    ("Objective 01", "Calibrated Return Classification", C_CORAL, C_WHITE,
     "Train and benchmark 4 binary classification algorithms (Logistic Regression, Decision Trees, Random Forest, SVM) under severe 76.2% : 23.8% class imbalance.\n\nPrioritize Balanced Accuracy, Recall (83.3%), and F1-score (0.5882) rather than misleading raw accuracy."),
    ("Objective 02", "Empirical RFMTC Behaviour Analysis", C_BERRY, C_WHITE,
     "Formulate and audit donor behaviour across Recency (R), Frequency (F), Monetary (M), and Time (T) dimensions.\n\nQuantify positive skewness, establish the exact collinearity invariant (M = 250 x F), and analyze bivariate correlations with target propensity."),
    ("Objective 03", "Unsupervised Persona Clustering", C_BERRY, C_WHITE,
     "Apply K-Means (K=4) and Hierarchical Agglomerative clustering (Ward, Complete, Average, Single linkages) to segment donors.\n\nValidate cluster cohesion using Silhouette analysis and Davies-Bouldin index to discover discrete behavioral cohorts."),
    ("Objective 04", "Clinical Web Platform & DWDM Labs", C_CORAL, C_WHITE,
     "Develop a full-stack decision-support suite (FastAPI backend + React 19 frontend) featuring live probability scoring, confidence tiers, and outreach guidance.\n\nIntegrate all 9 DWDM Academic Labs (Star Schema, OLAP Cubes, Association Rules, Regression).")
]

for idx, (tag, title, accent, bg, desc) in enumerate(objs):
    col = idx % 2; row = idx // 2
    c_left = Inches(0.8 + col * 5.95); c_top  = Inches(1.9 + row * 2.5)
    border_accent = C_CORAL if idx in [0, 3] else C_BERRY
    card = add_card(slide3, c_left, c_top, Inches(5.75), Inches(2.35), bg, border_accent, 2)
    tf = card.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.22)
    p = tf.paragraphs[0]
    r = p.add_run(); r.text = f"[  {tag.upper()}  ]"
    r.font.name = FONT_HEADING; r.font.size = Pt(9.5); r.font.bold = True; r.font.color.rgb = accent
    p2 = tf.add_paragraph(); p2.space_before = Pt(4)
    r2 = p2.add_run(); r2.text = title
    r2.font.name = FONT_HEADING; r2.font.size = Pt(13.5); r2.font.bold = True; r2.font.color.rgb = C_CHARCOAL
    p3 = tf.add_paragraph(); p3.space_before = Pt(6); p3.line_spacing = 1.15
    r3 = p3.add_run(); r3.text = desc
    r3.font.name = FONT_BODY; r3.font.size = Pt(9.5); r3.font.color.rgb = C_CHARCOAL

# ==============================================================================
# SLIDE 4: PROPOSED SOLUTION (Before vs. After)
# ==============================================================================
slide4 = prs.slides.add_slide(blank_layout)
set_slide_background(slide4, C_CREAM)
add_header(slide4, "System Paradigm Shift", "From Intuitive Guesswork to Calibrated RFMT Intelligence",
           "Comparing conventional blood bank outreach workflows with our data-driven decision platform.")

c_left = add_card(slide4, Inches(0.8), Inches(1.85), Inches(5.7), Inches(4.2), C_WHITE, C_BLUSH, 2)
tf = c_left.text_frame; tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.28)
p = tf.paragraphs[0]
r = p.add_run(); r.text = "TRADITIONAL BLOOD BANK WORKFLOW"
r.font.name = FONT_HEADING; r.font.size = Pt(11); r.font.bold = True; r.font.color.rgb = C_CORAL
p = tf.add_paragraph(); p.space_before = Pt(4)
r = p.add_run(); r.text = "Static, Reactive & Disconnected"
r.font.name = FONT_HEADING; r.font.size = Pt(16); r.font.bold = True; r.font.color.rgb = C_CHARCOAL

points_left = [
    ("Unsegmented Mass Blasts", "Broadcasts indiscriminate phone calls or SMS to entire historical lists without considering dormancy."),
    ("The 76% Accuracy Trap", "Simple evaluation metrics look artificially high (76.2% accuracy by simply guessing 'No'), failing to identify a single donor."),
    ("Overlooked Recency Decay", "Fails to model the reality that donor response drops sharply after 12-18 months of dormancy."),
    ("Isolated Data Silos", "Past donation registers sit in static paper records or flat spreadsheets without multidimensional OLAP slicing.")
]
for title, body in points_left:
    p = tf.add_paragraph(); p.space_before = Pt(8); p.line_spacing = 1.1
    r1 = p.add_run(); r1.text = f"•  {title}: "
    r1.font.name = FONT_HEADING; r1.font.size = Pt(9.5); r1.font.bold = True; r1.font.color.rgb = C_CORAL
    r2 = p.add_run(); r2.text = body
    r2.font.name = FONT_BODY; r2.font.size = Pt(9); r2.font.color.rgb = C_CHARCOAL

c_right = add_card(slide4, Inches(6.8), Inches(1.85), Inches(5.7), Inches(4.2), C_WHITE, C_MINT, 2)
tf = c_right.text_frame; tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.28)
p = tf.paragraphs[0]
r = p.add_run(); r.text = "PROPOSED ML & ANALYTICS PLATFORM"
r.font.name = FONT_HEADING; r.font.size = Pt(11); r.font.bold = True; r.font.color.rgb = C_BERRY
p = tf.add_paragraph(); p.space_before = Pt(4)
r = p.add_run(); r.text = "Proactive, Calibrated & Explainable"
r.font.name = FONT_HEADING; r.font.size = Pt(16); r.font.bold = True; r.font.color.rgb = C_CHARCOAL

points_right = [
    ("Calibrated Return Probabilities", "Estimates genuine individual donation propensities (0–100%) mapped to tiered CRM outreach categories."),
    ("Balanced Class Weighting", "Penalizes minority class misclassifications, achieving 83.3% test recall on actual donors."),
    ("RFMTC Empirical Framework", "Integrates Recency, Frequency, Monetary volume, and Donor Tenure to capture donor loyalty curves."),
    ("Full DWDM Analytical Suite", "Interactive React UI with live inference, K-Means segmentation, Star Schema cubes, and association rules.")
]
for title, body in points_right:
    p = tf.add_paragraph(); p.space_before = Pt(8); p.line_spacing = 1.1
    r1 = p.add_run(); r1.text = f"•  {title}: "
    r1.font.name = FONT_HEADING; r1.font.size = Pt(9.5); r1.font.bold = True; r1.font.color.rgb = C_BERRY
    r2 = p.add_run(); r2.text = body
    r2.font.name = FONT_BODY; r2.font.size = Pt(9); r2.font.color.rgb = C_CHARCOAL

bot = add_card(slide4, Inches(0.8), Inches(6.15), Inches(11.7), Inches(0.9), C_BLUSH, C_CORAL, 1.5)
tf = bot.text_frame; tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.12)
p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
r = p.add_run()
r.text = "OPERATIONAL IMPACT: Maximizes blood drive turnout by focusing mobilization resources on high-propensity donors while preserving donor goodwill through respectful, segmented communication."
r.font.name = FONT_HEADING; r.font.size = Pt(10); r.font.bold = True; r.font.color.rgb = C_BERRY

# ==============================================================================
# SLIDE 5: UNDERSTANDING THE DATASET
# ==============================================================================
slide5 = prs.slides.add_slide(blank_layout)
set_slide_background(slide5, C_CREAM)
add_header(slide5, "Data Provenance", "Understanding the UCI Benchmark Dataset",
           "Exclusively grounded in the 748-donor cohort documented by Yeh, Yang, and Ting (2008).")

left_box = add_card(slide5, Inches(0.8), Inches(1.85), Inches(4.3), Inches(4.9), C_WHITE, C_BLUSH, 1.5)
tf = left_box.text_frame; tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.22)

p = tf.paragraphs[0]
r = p.add_run(); r.text = "DATASET SPECIFICATIONS"
r.font.name = FONT_HEADING; r.font.size = Pt(10.5); r.font.bold = True; r.font.color.rgb = C_BERRY

p = tf.add_paragraph(); p.space_before = Pt(8)
specs = [
    ("• Repository: ", "UCI Machine Learning Repository (ID: 176)\n"),
    ("• Primary Citation: ", "Yeh et al. (2008), Expert Syst. Appl., 36(4).\n"),
    ("• Cohort Size: ", "748 Total Donor Records\n"),
    ("• Missing Values: ", "Zero (0 nulls across all records)\n"),
    ("• Collinearity Invariant: ", "M = 250 x F (Exact r = 1.000: 250 c.c./unit)\n"),
    ("• Target Task: ", "March 2007 collection return (1 = Donated, 0 = Did not)")
]
for lbl, val in specs:
    r1 = p.add_run(); r1.text = lbl; r1.font.bold = True; r1.font.color.rgb = C_CORAL; r1.font.name = FONT_BODY; r1.font.size = Pt(9.2)
    r2 = p.add_run(); r2.text = val; r2.font.color.rgb = C_CHARCOAL; r2.font.name = FONT_BODY; r2.font.size = Pt(9.2)

p = tf.add_paragraph(); p.space_before = Pt(12)
r = p.add_run(); r.text = "ETHICAL DATASET BOUNDARY:\n"
r.font.name = FONT_HEADING; r.font.size = Pt(9); r.font.bold = True; r.font.color.rgb = C_BERRY
r2 = p.add_run()
r2.text = "The UCI dataset does NOT provide donor names, contact numbers, blood groups (ABO/Rh), or geographic locations. Models strictly utilize verified RFMT numerical features."
r2.font.name = FONT_BODY; r2.font.size = Pt(8.5); r2.font.color.rgb = C_CHARCOAL

attr_x = Inches(5.3); attr_w = Inches(3.2)
attrs = [
    ("R — Recency", "Months since last donation", "Min: 0  •  Median: 7  •  Max: 74", C_CORAL),
    ("F — Frequency", "Total number of previous donations", "Min: 1  •  Median: 4  •  Max: 50", C_BERRY),
    ("M — Monetary", "Total blood volume donated (c.c.)", "Min: 250  •  Median: 1,000  •  Max: 12,500", C_MINT),
    ("T — Time (Tenure)", "Months since first donation", "Min: 2  •  Median: 28  •  Max: 98", C_BLUSH)
]
for idx, (aname, adesc, astats, acolor) in enumerate(attrs):
    card = add_card(slide5, attr_x, Inches(1.85 + idx * 1.25), attr_w, Inches(1.15), C_WHITE, acolor, 1.8)
    tf = card.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.12)
    p = tf.paragraphs[0]
    r = p.add_run(); r.text = aname
    r.font.name = FONT_HEADING; r.font.size = Pt(10.5); r.font.bold = True; r.font.color.rgb = C_CHARCOAL
    p2 = tf.add_paragraph(); p2.space_before = Pt(2)
    r2 = p2.add_run(); r2.text = adesc
    r2.font.name = FONT_BODY; r2.font.size = Pt(8.5); r2.font.color.rgb = C_GRAY
    p3 = tf.add_paragraph(); p3.space_before = Pt(2)
    r3 = p3.add_run(); r3.text = astats
    r3.font.name = FONT_BODY; r3.font.size = Pt(8.5); r3.font.bold = True; r3.font.color.rgb = C_BERRY

# Right: Container card for perfectly circular Donut Chart
right_card = add_card(slide5, Inches(8.7), Inches(1.85), Inches(3.8), Inches(4.9), C_WHITE, C_CORAL, 1.5)
if os.path.exists("presentation_assets/chart_class_balance.png"):
    # Insert chart with 1:1 square ratio centered horizontally
    slide5.shapes.add_picture("presentation_assets/chart_class_balance.png", Inches(8.85), Inches(1.95), Inches(3.5), Inches(3.5))

# Donut stats underneath
tf_r = slide5.shapes.add_textbox(Inches(8.85), Inches(5.5), Inches(3.5), Inches(1.15)).text_frame
tf_r.word_wrap = True; tf_r.margin_left = tf_r.margin_right = tf_r.margin_top = tf_r.margin_bottom = 0
p = tf_r.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
r = p.add_run(); r.text = "IMBALANCE IMPACT SUMMARY"
r.font.name = FONT_HEADING; r.font.size = Pt(9.5); r.font.bold = True; r.font.color.rgb = C_BERRY
p2 = tf_r.add_paragraph(); p2.space_before = Pt(2); p2.alignment = PP_ALIGN.CENTER
r2 = p2.add_run()
r2.text = "Class 1 (Returned): 178 donors (23.8%)\nClass 0 (Did Not Return): 570 donors (76.2%)\nImbalance Ratio: 3.20 : 1 Majority"
r2.font.name = FONT_BODY; r2.font.size = Pt(8.5); r2.font.color.rgb = C_CHARCOAL

# ==============================================================================
# SLIDE 6: DATA EXPLORATION & PREPARATION
# ==============================================================================
slide6 = prs.slides.add_slide(blank_layout)
set_slide_background(slide6, C_CREAM)
add_header(slide6, "Exploratory Data Analysis", "Empirical Distributions, Invariants & Preprocessing",
           "Auditing the mathematical properties of the UCI Transfusion data before model ingestion.")

c_left = add_card(slide6, Inches(0.8), Inches(1.85), Inches(5.5), Inches(4.9), C_WHITE, C_BLUSH, 1.5)
tf = c_left.text_frame; tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.22)

p = tf.paragraphs[0]
r = p.add_run(); r.text = "KEY EDA OBSERVATIONS & PREPROCESSING"
r.font.name = FONT_HEADING; r.font.size = Pt(11); r.font.bold = True; r.font.color.rgb = C_BERRY

points_eda = [
    ("Heavy Right-Skewed Distributions",
     "Recency (median 7m vs mean 9.5m), Frequency (median 4 vs mean 5.5), and Monetary volume exhibit sharp long-tail Pareto decay. A minority of veteran donors donate upwards of 50 times."),
    ("Strict Multicollinearity Invariant",
     "Monetary volume is precisely 250 times Frequency (r = 1.000). Linear regression requires L2 regularization to prevent matrix singularity; tree algorithms handle it natively."),
    ("Stratified 80/20 Train/Test Partitioning",
     "598 training samples (142 positive / 456 negative) and 150 holdout test samples (36 positive / 114 negative), locked with random_state=42 to guarantee exact scientific reproducibility."),
    ("Zero Data Leakage Standardization",
     "StandardScaler (mean=0, std=1) parameters are computed strictly on the training fold and applied to the test set, preventing optimistic bias in distance-sensitive algorithms (SVM, LogReg, KMeans).")
]
for title, body in points_eda:
    p = tf.add_paragraph(); p.space_before = Pt(8); p.line_spacing = 1.1
    r1 = p.add_run(); r1.text = f"•  {title}\n"
    r1.font.name = FONT_HEADING; r1.font.size = Pt(9.5); r1.font.bold = True; r1.font.color.rgb = C_CORAL
    r2 = p.add_run(); r2.text = body
    r2.font.name = FONT_BODY; r2.font.size = Pt(9); r2.font.color.rgb = C_CHARCOAL

# Right Charts
if os.path.exists("presentation_assets/chart_rfmt_distributions.png"):
    slide6.shapes.add_picture("presentation_assets/chart_rfmt_distributions.png", Inches(6.5), Inches(1.85), Inches(6.0), Inches(2.35))

if os.path.exists("presentation_assets/chart_feature_importance.png"):
    slide6.shapes.add_picture("presentation_assets/chart_feature_importance.png", Inches(6.5), Inches(4.35), Inches(6.0), Inches(2.4))

# ==============================================================================
# SLIDE 7: MACHINE LEARNING WORKFLOW
# ==============================================================================
slide7 = prs.slides.add_slide(blank_layout)
set_slide_background(slide7, C_CREAM)
add_header(slide7, "System Methodology", "End-to-End Machine Learning Pipeline Architecture",
           "Methodological sequence from raw UCI benchmark ingestion to calibrated web prediction.")

steps = [
    ("Step 01", "Raw Ingestion", "UCI 748 Records\nTransfusion.data\nZero null audit", C_CORAL),
    ("Step 02", "Feature Prep", "RFMT Extraction\nCollinearity audit\nM = 250 x F check", C_BERRY),
    ("Step 03", "Stratified Split", "80% Train (N=598)\n20% Test (N=150)\nPreserves 23.8% pos", C_CORAL),
    ("Step 04", "Model Training", "Balanced weighting\nLogReg, RF, SVM\nCustom CART trees", C_BERRY),
    ("Step 05", "Evaluation", "F1 Optimization\nROC-AUC & Recall\nConfusion matrix", C_CORAL),
    ("Step 06", "Web Delivery", "FastAPI endpoint\nReact 19 interface\nCRM action advice", C_BERRY),
]

box_w = Inches(1.8); box_h = Inches(3.2); top_y = Inches(2.0)

for idx, (snum, stitle, sdesc, scolor) in enumerate(steps):
    left_x = Inches(0.8 + idx * 2.0)
    card = add_card(slide7, left_x, top_y, box_w, box_h, C_WHITE, scolor, 2)
    tf = card.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.14)
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
    r = p.add_run(); r.text = snum.upper()
    r.font.name = FONT_HEADING; r.font.size = Pt(9.5); r.font.bold = True; r.font.color.rgb = scolor

    p2 = tf.add_paragraph(); p2.space_before = Pt(6); p2.alignment = PP_ALIGN.CENTER
    r2 = p2.add_run(); r2.text = stitle
    r2.font.name = FONT_HEADING; r2.font.size = Pt(11); r2.font.bold = True; r2.font.color.rgb = C_CHARCOAL

    p3 = tf.add_paragraph(); p3.space_before = Pt(10); p3.line_spacing = 1.15; p3.alignment = PP_ALIGN.CENTER
    r3 = p3.add_run(); r3.text = sdesc
    r3.font.name = FONT_BODY; r3.font.size = Pt(8.5); r3.font.color.rgb = C_CHARCOAL

    if idx < len(steps) - 1:
        arr = slide7.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, left_x + Inches(1.82), top_y + Inches(1.4), Inches(0.16), Inches(0.3))
        arr.fill.solid(); arr.fill.fore_color.rgb = C_CORAL; arr.line.fill.background()

w_bot = add_card(slide7, Inches(0.8), Inches(5.4), Inches(11.7), Inches(1.4), C_MINT, C_BERRY, 1.5)
tf = w_bot.text_frame; tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.18)
p = tf.paragraphs[0]
r = p.add_run(); r.text = "PIPELINE INTEGRITY & RESILIENCE GUARANTEES:"
r.font.name = FONT_HEADING; r.font.size = Pt(10); r.font.bold = True; r.font.color.rgb = C_BERRY
p2 = tf.add_paragraph(); p2.space_before = Pt(3); p2.line_spacing = 1.15
r2 = p2.add_run()
r2.text = "1. Model Persistence: Serialized pipeline artifacts (scaler.joblib, best_model.joblib, model_comparison.json) enable fast sub-5ms REST inference.\n2. Fallback Architecture: Pure NumPy implementations of Decision Trees and K-Means execute deterministically even under restrictive Windows Application Control policies without crashing the API."
r2.font.name = FONT_BODY; r2.font.size = Pt(9.5); r2.font.color.rgb = C_CHARCOAL

# ==============================================================================
# SLIDE 8: ALGORITHMS USED
# ==============================================================================
slide8 = prs.slides.add_slide(blank_layout)
set_slide_background(slide8, C_CREAM)
add_header(slide8, "Analytical Models", "Machine Learning & Data Mining Algorithms",
           "Theoretical justification, purpose, and implementation status for each algorithm.")

algos = [
    ("Supervised Classification", "Logistic Regression", C_CORAL,
     "Linear log-odds estimator with L2 Ridge regularization and balanced class weighting.",
     "Why Used: Establishes a transparent baseline; achieves the highest F1-Score (0.5882) and 83.3% test recall.\nImplementation: Scikit-learn (LogisticRegression, C=1.0, class_weight='balanced')."),
    ("Ensemble Supervised", "Random Forest Classifier", C_BERRY,
     "Bagging ensemble combining 100 bootstrap decision trees with random feature subspacing.",
     "Why Used: Resistant to overfitting; handles non-linear boundaries between Recency and Tenure.\nImplementation: Dual implementation (Scikit-Learn & Custom NumPy Bagging Ensemble)."),
    ("Kernel Supervised", "Support Vector Machine (SVM)", C_CORAL,
     "Maximum-margin hyperplane classifier using Radial Basis Function (RBF) kernel mapping.",
     "Why Used: Yields the highest ROC-AUC (0.7941); captures complex non-linear donor clusters in Hilbert space.\nImplementation: Scikit-learn (SVC, kernel='rbf', probability=True, balanced)."),
    ("Unsupervised Clustering", "K-Means & Hierarchical", C_BERRY,
     "Lloyd's algorithm with K-Means++ (K=4) + Agglomerative Clustering (Ward/Complete linkages).",
     "Why Used: Discovers 4 discrete behavioral archetypes (Active Core, Lapsed Veterans, Occasional, Elite).\nImplementation: CustomKMeans + SciPy hierarchy linkage and dendrograms.")
]

for idx, (cat, aname, acolor, summary, details) in enumerate(algos):
    col = idx % 2; row = idx // 2
    c_left = Inches(0.8 + col * 5.95); c_top  = Inches(1.85 + row * 2.5)
    card = add_card(slide8, c_left, c_top, Inches(5.75), Inches(2.35), C_WHITE, acolor, 2)
    tf = card.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.2)
    p = tf.paragraphs[0]
    r = p.add_run(); r.text = f"[  {cat.upper()}  ]"
    r.font.name = FONT_HEADING; r.font.size = Pt(8.5); r.font.bold = True; r.font.color.rgb = acolor
    p2 = tf.add_paragraph(); p2.space_before = Pt(3)
    r2 = p2.add_run(); r2.text = aname
    r2.font.name = FONT_HEADING; r2.font.size = Pt(13); r2.font.bold = True; r2.font.color.rgb = C_CHARCOAL
    p3 = tf.add_paragraph(); p3.space_before = Pt(3); p3.line_spacing = 1.1
    r3 = p3.add_run(); r3.text = summary
    r3.font.name = FONT_BODY; r3.font.size = Pt(8.5); r3.font.bold = True; r3.font.color.rgb = C_BERRY
    p4 = tf.add_paragraph(); p4.space_before = Pt(4); p4.line_spacing = 1.15
    r4 = p4.add_run(); r4.text = details
    r4.font.name = FONT_BODY; r4.font.size = Pt(8.5); r4.font.color.rgb = C_CHARCOAL

# ==============================================================================
# SLIDE 9: TECHNOLOGY STACK
# ==============================================================================
slide9 = prs.slides.add_slide(blank_layout)
set_slide_background(slide9, C_CREAM)
add_header(slide9, "Technical Ecosystem", "Verified Technology Stack & Toolchain",
           "Modern full-stack technologies and data science libraries powering the system.")

tiers = [
    ("PRESENTATION LAYER", "Frontend & UI Design", C_CORAL, [
        ("React 19 & TypeScript", "Component-driven SPA architecture with strict compile-time type safety."),
        ("Vite 8", "High-speed modern frontend bundler and local development server."),
        ("Tailwind CSS v4", "Modern responsive utility styling with custom healthcare editorial tokens."),
        ("Recharts & Lucide React", "Interactive SVG metric visualizations, donut charts, and semantic medical icons.")
    ]),
    ("APPLICATION SERVICES", "FastAPI & REST Gateway", C_BERRY, [
        ("FastAPI 0.110", "Asynchronous, high-performance web framework with auto Swagger / OpenAPI docs."),
        ("Pydantic v2", "Strict schema validation and data serialization for prediction inputs."),
        ("Uvicorn ASGI", "Production ASGI server handling non-blocking concurrent API requests."),
        ("CORS Middleware", "Cross-origin resource sharing configured for seamless frontend-backend communication.")
    ]),
    ("ANALYTICS & ML ENGINE", "Data Mining & Modeling", C_MINT, [
        ("Scikit-Learn 1.9", "Standardized supervised classification, scaling, and evaluation metrics."),
        ("Pure NumPy Engine", "Resilient mathematical fallbacks (Custom CART & Custom KMeans) immune to AppLocker."),
        ("Pandas & NumPy", "High-efficiency tabular data transformation, invariant validation, and descriptive stats."),
        ("SciPy & Mlxtend", "Hierarchical clustering linkages, dendrograms, and Apriori association rule mining.")
    ])
]

for idx, (tcat, ttitle, tcolor, items) in enumerate(tiers):
    c_left = Inches(0.8 + idx * 3.95)
    card = add_card(slide9, c_left, Inches(1.85), Inches(3.8), Inches(4.9), C_WHITE, tcolor, 2)
    tf = card.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.2)
    p = tf.paragraphs[0]
    r = p.add_run(); r.text = tcat
    r.font.name = FONT_HEADING; r.font.size = Pt(8.5); r.font.bold = True; r.font.color.rgb = tcolor
    p2 = tf.add_paragraph(); p2.space_before = Pt(4)
    r2 = p2.add_run(); r2.text = ttitle
    r2.font.name = FONT_HEADING; r2.font.size = Pt(13); r2.font.bold = True; r2.font.color.rgb = C_CHARCOAL

    for iname, idesc in items:
        p3 = tf.add_paragraph(); p3.space_before = Pt(10); p3.line_spacing = 1.1
        r3 = p3.add_run(); r3.text = f"• {iname}\n"
        r3.font.name = FONT_HEADING; r3.font.size = Pt(9.5); r3.font.bold = True; r3.font.color.rgb = C_CORAL
        r4 = p3.add_run(); r4.text = idesc
        r4.font.name = FONT_BODY; r4.font.size = Pt(8.5); r4.font.color.rgb = C_CHARCOAL

# ==============================================================================
# SLIDE 10: SYSTEM ARCHITECTURE
# ==============================================================================
slide10 = prs.slides.add_slide(blank_layout)
set_slide_background(slide10, C_CREAM)
add_header(slide10, "Software Engineering", "Full-Stack System Architecture & Data Flow",
           "Modular decoupled relationship between the client, REST gateway, analytics services, and models.")

arch_layers = [
    ("Layer 1: Client Browser (React 19 SPA)", C_CORAL,
     "Interactive UI Components: DashboardView • DonorPredictionView • ModelComparisonView • LabsSuiteView (Labs 1-9) • Recharts Visualizations"),
    ("Layer 2: API Gateway & REST Interface (FastAPI on Port 8000)", C_BERRY,
     "Endpoints: /api/predict (POST) • /api/models/comparison (GET) • /api/analytics/summary • /api/labs/1..9 • CORS & Pydantic Validation"),
    ("Layer 3: Analytics & Machine Learning Service Layer", C_MINT,
     "Business Services: MLService (Inference & Evaluation) • DonorAnalyticsService • Lab7Service (K-Means) • Lab8Service (Hierarchical) • WarehouseService"),
    ("Layer 4: Modeling Artifacts & Data Foundation", C_BLUSH,
     "Persistent Storage: best_model.joblib (Logistic Regression) • scaler.joblib • model_comparison.json • UCI Raw transfusion.data (748 rows)")
]

top_pos = Inches(1.85)
for idx, (title, acolor, desc) in enumerate(arch_layers):
    card = add_card(slide10, Inches(0.8), top_pos + Inches(idx * 1.15), Inches(11.7), Inches(0.95), C_WHITE, acolor, 1.8)
    tf = card.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.15)
    p = tf.paragraphs[0]
    r = p.add_run(); r.text = title
    r.font.name = FONT_HEADING; r.font.size = Pt(11); r.font.bold = True; r.font.color.rgb = C_BERRY
    p2 = tf.add_paragraph(); p2.space_before = Pt(3)
    r2 = p2.add_run(); r2.text = desc
    r2.font.name = FONT_BODY; r2.font.size = Pt(9.5); r2.font.color.rgb = C_CHARCOAL

    if idx < len(arch_layers) - 1:
        arr = slide10.shapes.add_shape(MSO_SHAPE.DOWN_ARROW, Inches(6.5), top_pos + Inches(idx * 1.15 + 0.96), Inches(0.25), Inches(0.18))
        arr.fill.solid(); arr.fill.fore_color.rgb = C_CORAL; arr.line.fill.background()

bot_arch = add_card(slide10, Inches(0.8), Inches(6.45), Inches(11.7), Inches(0.65), C_MINT, C_CORAL, 1)
tf = bot_arch.text_frame; tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.08)
p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
r = p.add_run()
r.text = "KEY ARCHITECTURAL HIGHLIGHT: Decoupled service boundaries ensure that prediction, multidimensional OLAP modeling, and unsupervised clustering operate independently without single points of failure."
r.font.name = FONT_HEADING; r.font.size = Pt(9); r.font.bold = True; r.font.color.rgb = C_CHARCOAL

# ==============================================================================
# SLIDE 11: APPLICATION SCREENSHOTS (Live Verified Views)
# ==============================================================================
slide11 = prs.slides.add_slide(blank_layout)
set_slide_background(slide11, C_CREAM)
add_header(slide11, "Working Implementation", "Live Application Showcase & Interface Features",
           "Genuine screenshots captured from the running React 19 + FastAPI decision support platform.")

if os.path.exists("presentation_assets/dashboard_view.png"):
    add_card(slide11, Inches(0.8), Inches(1.85), Inches(5.7), Inches(4.0), C_WHITE, C_BLUSH, 1.5)
    slide11.shapes.add_picture("presentation_assets/dashboard_view.png", Inches(0.85), Inches(1.9), Inches(5.6), Inches(3.9))

cap1 = add_card(slide11, Inches(0.8), Inches(5.95), Inches(5.7), Inches(1.0), C_WHITE, C_CORAL, 1.2)
tf = cap1.text_frame; tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.12)
p = tf.paragraphs[0]
r = p.add_run(); r.text = "EXECUTIVE KPI & ANALYTICS DASHBOARD"
r.font.name = FONT_HEADING; r.font.size = Pt(9); r.font.bold = True; r.font.color.rgb = C_CORAL
p2 = tf.add_paragraph(); p2.space_before = Pt(2)
r2 = p2.add_run()
r2.text = "Displays live cohort metrics (748 donors, 23.8% return rate), class balance breakdown, empirical skewness charts, and real-time backend API connection status."
r2.font.name = FONT_BODY; r2.font.size = Pt(8.5); r2.font.color.rgb = C_CHARCOAL

if os.path.exists("presentation_assets/prediction_scrolled.png"):
    add_card(slide11, Inches(6.8), Inches(1.85), Inches(5.7), Inches(4.0), C_WHITE, C_MINT, 1.5)
    slide11.shapes.add_picture("presentation_assets/prediction_scrolled.png", Inches(6.85), Inches(1.9), Inches(5.6), Inches(3.9))

cap2 = add_card(slide11, Inches(6.8), Inches(5.95), Inches(5.7), Inches(1.0), C_WHITE, C_BERRY, 1.2)
tf = cap2.text_frame; tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.12)
p = tf.paragraphs[0]
r = p.add_run(); r.text = "LIVE DONOR PREDICTOR & CRM GUIDANCE"
r.font.name = FONT_HEADING; r.font.size = Pt(9); r.font.bold = True; r.font.color.rgb = C_BERRY
p2 = tf.add_paragraph(); p2.space_before = Pt(2)
r2 = p2.add_run()
r2.text = "Allows coordinators to input RFMT features via intuitive sliders or archetypes, generating instant calibrated probability scores, confidence tiers, and outreach advice."
r2.font.name = FONT_BODY; r2.font.size = Pt(8.5); r2.font.color.rgb = C_CHARCOAL

# ==============================================================================
# SLIDE 12: RESULTS AND EVALUATION (Native Table & Charts)
# ==============================================================================
slide12 = prs.slides.add_slide(blank_layout)
set_slide_background(slide12, C_CREAM)
add_header(slide12, "Empirical Validation", "Experimental Results & Classifier Benchmark",
           "Evaluated on a stratified 20% holdout test set (N_test=150: 36 positive return donors, 114 negative non-donors).")

if os.path.exists("presentation_assets/chart_model_benchmarks.png"):
    slide12.shapes.add_picture("presentation_assets/chart_model_benchmarks.png", Inches(0.8), Inches(1.85), Inches(5.8), Inches(3.1))

if os.path.exists("presentation_assets/chart_roc_curves.png"):
    slide12.shapes.add_picture("presentation_assets/chart_roc_curves.png", Inches(6.9), Inches(1.85), Inches(5.6), Inches(3.1))

# Native Benchmark Results Table
tbl_shape = slide12.shapes.add_table(5, 6, Inches(0.8), Inches(5.1), Inches(6.8), Inches(1.9))
tbl = tbl_shape.table
tbl.columns[0].width = Inches(2.2) # Algorithm
tbl.columns[1].width = Inches(0.9) # Accuracy
tbl.columns[2].width = Inches(0.9) # Recall
tbl.columns[3].width = Inches(0.9) # Precision
tbl.columns[4].width = Inches(0.9) # F1-Score
tbl.columns[5].width = Inches(1.0) # ROC-AUC

table_data = [
    ["Algorithm", "Accuracy", "Recall", "Precision", "F1-Score", "ROC-AUC"],
    ["Logistic Regression ★", "72.0%", "83.3%", "45.5%", "0.5882", "0.7848"],
    ["Random Forest", "73.3%", "75.0%", "46.6%", "0.5745", "0.7719"],
    ["Support Vector Machine", "70.7%", "77.8%", "43.8%", "0.5600", "0.7941"],
    ["Decision Tree (CART)", "66.7%", "72.2%", "39.4%", "0.5098", "0.7427"]
]

for row_idx, row in enumerate(table_data):
    for col_idx, cell_text in enumerate(row):
        cell = tbl.cell(row_idx, col_idx)
        cell.margin_left = Inches(0.06); cell.margin_right = Inches(0.06)
        cell.margin_top = Inches(0.04); cell.margin_bottom = Inches(0.04)
        p = cell.text_frame.paragraphs[0]
        p.alignment = PP_ALIGN.LEFT if col_idx == 0 else PP_ALIGN.CENTER
        run = p.add_run()
        run.text = cell_text
        run.font.name = FONT_HEADING if row_idx == 0 or col_idx == 0 else FONT_BODY
        run.font.size = Pt(8.5)

        if row_idx == 0:
            cell.fill.solid(); cell.fill.fore_color.rgb = C_BERRY
            run.font.bold = True; run.font.color.rgb = C_WHITE
        elif row_idx == 1:
            cell.fill.solid(); cell.fill.fore_color.rgb = C_TABLE_BG
            run.font.bold = True; run.font.color.rgb = C_BERRY
        else:
            cell.fill.solid(); cell.fill.fore_color.rgb = C_WHITE
            run.font.color.rgb = C_CHARCOAL

eval_takeaway = add_card(slide12, Inches(7.8), Inches(5.1), Inches(4.7), Inches(1.9), C_MINT, C_BERRY, 1.5)
tf = eval_takeaway.text_frame; tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.16)
p = tf.paragraphs[0]
r = p.add_run(); r.text = "THE RECALL & F1 TRADEOFF INSIGHT"
r.font.name = FONT_HEADING; r.font.size = Pt(9.5); r.font.bold = True; r.font.color.rgb = C_BERRY
p2 = tf.add_paragraph(); p2.space_before = Pt(3); p2.line_spacing = 1.15
r2 = p2.add_run()
r2.text = "Under a 3.2:1 negative majority, a naive model predicting 0 for all patients achieves 76.2% accuracy while failing to recruit a single returning donor.\n\nBalanced class weighting successfully elevates Logistic Regression to 83.3% Recall (capturing 30 out of 36 actual returning donors) while achieving the optimal F1-score of 0.5882."
r2.font.name = FONT_BODY; r2.font.size = Pt(8.5); r2.font.color.rgb = C_CHARCOAL

# ==============================================================================
# SLIDE 13: LIMITATIONS & FUTURE SCOPE
# ==============================================================================
slide13 = prs.slides.add_slide(blank_layout)
set_slide_background(slide13, C_CREAM)
add_header(slide13, "Critical Reflection", "Project Limitations & Future Research Roadmap",
           "Transparent scientific boundary assessment paired with practical expansion directions.")

c_lim = add_card(slide13, Inches(0.8), Inches(1.85), Inches(5.7), Inches(4.9), C_WHITE, C_CORAL, 2)
tf = c_lim.text_frame; tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.24)
p = tf.paragraphs[0]
r = p.add_run(); r.text = "GENUINE PROJECT LIMITATIONS"
r.font.name = FONT_HEADING; r.font.size = Pt(11); r.font.bold = True; r.font.color.rgb = C_CORAL
p2 = tf.add_paragraph(); p2.space_before = Pt(3)
r2 = p2.add_run(); r2.text = "Boundary Conditions of the Study"
r2.font.name = FONT_HEADING; r2.font.size = Pt(15); r2.font.bold = True; r2.font.color.rgb = C_CHARCOAL

limits = [
    ("Single-Center Historical Scope", "Data originated from the Hsin-Chu City, Taiwan blood center in March 2007; seasonal and demographic patterns may differ in other countries."),
    ("Absence of Clinical & Biometric Attributes", "The dataset contains zero data regarding donor hemoglobin, blood group (ABO/Rh), blood pressure, age, weight, or deferral history."),
    ("Exact Feature Redundancy", "Because Monetary is strictly 250 x Frequency (r = 1.000), the dataset effectively contains only 3 independent degrees of freedom (R, F, T)."),
    ("Statistical Propensity, Not Medical Advice", "Predictions represent historical empirical likelihoods for outreach optimization, not individualized clinical fitness to donate.")
]
for title, body in limits:
    p = tf.add_paragraph(); p.space_before = Pt(7); p.line_spacing = 1.1
    r1 = p.add_run(); r1.text = f"•  {title}: "
    r1.font.name = FONT_HEADING; r1.font.size = Pt(9); r1.font.bold = True; r1.font.color.rgb = C_CORAL
    r2 = p.add_run(); r2.text = body
    r2.font.name = FONT_BODY; r2.font.size = Pt(8.5); r2.font.color.rgb = C_CHARCOAL

c_fut = add_card(slide13, Inches(6.8), Inches(1.85), Inches(5.7), Inches(4.9), C_WHITE, C_MINT, 2)
tf = c_fut.text_frame; tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.24)
p = tf.paragraphs[0]
r = p.add_run(); r.text = "FUTURE RESEARCH ROADMAP"
r.font.name = FONT_HEADING; r.font.size = Pt(11); r.font.bold = True; r.font.color.rgb = C_BERRY
p2 = tf.add_paragraph(); p2.space_before = Pt(3)
r2 = p2.add_run(); r2.text = "Future Technical Enhancements"
r2.font.name = FONT_HEADING; r2.font.size = Pt(15); r2.font.bold = True; r2.font.color.rgb = C_CHARCOAL

future_points = [
    ("Multi-Hospital Prospective Data Ingestion", "Connect the pipeline to hospital electronic blood bank management systems via secure HL7/FHIR healthcare data bridges."),
    ("Automated Multichannel Outreach Dispatch", "Integrate automated SMS, WhatsApp, and email APIs triggered dynamically when a donor enters prime retention windows."),
    ("Deep Temporal Sequence Modeling", "Formulate longitudinal donor timelines using Recurrent Neural Networks (LSTM) or Transformers to predict multi-year return trajectories."),
    ("Privacy-Preserving Federated Learning", "Train cross-institutional donor models across multiple regional centers without centralizing sensitive donor personal data.")
]
for title, body in future_points:
    p = tf.add_paragraph(); p.space_before = Pt(7); p.line_spacing = 1.1
    r1 = p.add_run(); r1.text = f"•  {title}: "
    r1.font.name = FONT_HEADING; r1.font.size = Pt(9); r1.font.bold = True; r1.font.color.rgb = C_BERRY
    r2 = p.add_run(); r2.text = body
    r2.font.name = FONT_BODY; r2.font.size = Pt(8.5); r2.font.color.rgb = C_CHARCOAL

# ==============================================================================
# SLIDE 14: CONCLUSION & REFERENCES
# ==============================================================================
slide14 = prs.slides.add_slide(blank_layout)
set_slide_background(slide14, C_CREAM)
add_header(slide14, "Project Wrap-Up", "Summary of Contributions & Academic Citations",
           "Final conclusions, scholarly references, and project presentation conclusion.")

c_sum = add_card(slide14, Inches(0.8), Inches(1.85), Inches(5.7), Inches(4.9), C_WHITE, C_BLUSH, 1.5)
tf = c_sum.text_frame; tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.22)
p = tf.paragraphs[0]
r = p.add_run(); r.text = "SUMMARY OF ACHIEVEMENTS"
r.font.name = FONT_HEADING; r.font.size = Pt(10.5); r.font.bold = True; r.font.color.rgb = C_BERRY

achievements = [
    ("Mathematical Data Rigor", "Successfully modeled the 748-donor cohort, validated exact invariants (M = 250 x F), and handled Pareto right-skewed distributions."),
    ("High Recall Classification", "Balanced class weighting enabled Logistic Regression to achieve 83.3% test recall and 0.5882 F1-score, overcoming class imbalance."),
    ("Unsupervised Personas", "Identified 4 actionable donor segments via K-Means and Hierarchical Clustering with Silhouette validation."),
    ("Production Decision Tool", "Delivered an interactive, production-grade web suite with live prediction, DWDM OLAP reports, and resilient pure-NumPy fallbacks.")
]
for atitle, abody in achievements:
    p = tf.add_paragraph(); p.space_before = Pt(8); p.line_spacing = 1.1
    r1 = p.add_run(); r1.text = f"•  {atitle}: "
    r1.font.name = FONT_HEADING; r1.font.size = Pt(9.2); r1.font.bold = True; r1.font.color.rgb = C_CORAL
    r2 = p.add_run(); r2.text = abody
    r2.font.name = FONT_BODY; r2.font.size = Pt(8.8); r2.font.color.rgb = C_CHARCOAL

c_ref = add_card(slide14, Inches(6.8), Inches(1.85), Inches(5.7), Inches(2.7), C_WHITE, C_MINT, 1.5)
tf = c_ref.text_frame; tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.2)
p = tf.paragraphs[0]
r = p.add_run(); r.text = "SCHOLARLY REFERENCES & DATA SOURCES"
r.font.name = FONT_HEADING; r.font.size = Pt(9.5); r.font.bold = True; r.font.color.rgb = C_BERRY

refs = [
    "[1] Yeh, I-C., Yang, K-J., & Ting, T-M. (2008). Knowledge discovery on RFM model using Bernoulli sequence. Expert Systems with Applications, 36(4), 7715–7723.",
    "[2] UCI Machine Learning Repository: Blood Transfusion Service Center Dataset (ID: 176). Hsin-Chu City, Taiwan.",
    "[3] Pedregosa, F., et al. (2011). Scikit-learn: Machine Learning in Python. Journal of Machine Learning Research, 12, 2825–2830.",
    "[4] Han, J., Kamber, M., & Pei, J. (2011). Data Mining: Concepts and Techniques (3rd ed.). Morgan Kaufmann."
]
for ref in refs:
    p = tf.add_paragraph(); p.space_before = Pt(4); p.line_spacing = 1.05
    r = p.add_run(); r.text = ref
    r.font.name = FONT_BODY; r.font.size = Pt(7.8); r.font.color.rgb = C_CHARCOAL

c_ty = add_card(slide14, Inches(6.8), Inches(4.7), Inches(5.7), Inches(2.05), C_BLUSH, C_CORAL, 2)
ty_heart = slide14.shapes.add_shape(MSO_SHAPE.HEART, Inches(9.35), Inches(4.85), Inches(0.6), Inches(0.6))
ty_heart.fill.solid(); ty_heart.fill.fore_color.rgb = C_CORAL; ty_heart.line.fill.background()

tf = c_ty.text_frame; tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_bottom = Inches(0.18); tf.margin_top = Inches(0.65)
p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
r = p.add_run(); r.text = "THANK YOU!"
r.font.name = FONT_HEADING; r.font.size = Pt(20); r.font.bold = True; r.font.color.rgb = C_BERRY
p2 = tf.add_paragraph(); p2.space_before = Pt(3); p2.alignment = PP_ALIGN.CENTER
r2 = p2.add_run(); r2.text = "Questions & Technical Discussion Welcome"
r2.font.name = FONT_HEADING; r2.font.size = Pt(11.5); r2.font.bold = True; r2.font.color.rgb = C_CORAL
p3 = tf.add_paragraph(); p3.space_before = Pt(4); p3.alignment = PP_ALIGN.CENTER
r3 = p3.add_run(); r3.text = "Live FastAPI API Documentation: http://localhost:8000/docs\nReact Decision Support Application: http://localhost:5173"
r3.font.name = FONT_BODY; r3.font.size = Pt(8.5); r3.font.color.rgb = C_CHARCOAL

# Save presentation
out_path = r"C:\Users\Anushka\blood-donation-analytics\Blood_Donation_Prediction_Project_Presentation.pptx"
prs.save(out_path)
print(f"Presentation saved successfully to: {out_path}")
print(f"Total Slides Created: {len(prs.slides)}")
