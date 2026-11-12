"""Generate every chart and diagram used in the VELO pitch deck.

Usage:
    python make_charts.py                 # all charts
    python make_charts.py s10_value_waterfall s11_risk_matrix
    python make_charts.py --list

Output: out/<name>.png (300 dpi) and out/<name>.svg
Data:   data/assumptions.json, data/interviews.csv, data/risks.csv
"""
from __future__ import annotations

import csv
import json
import sys
from collections import Counter, defaultdict

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.lines import Line2D
from matplotlib.patches import Rectangle

from velo_style import (
    BLUE, CREAM, DATA, INK, MUTED, PAPER, RED, TRACK, WHITE, YELLOW,
    arrow, box, canvas, chip, display, mono, save, watermark, wrap,
)

CHARTS: dict = {}


def chart(fn):
    CHARTS[fn.__name__] = fn
    return fn


def load_assumptions() -> dict:
    with open(DATA / "assumptions.json", encoding="utf-8") as f:
        return json.load(f)


def value_model(a: dict, **override) -> dict:
    """Monthly value for one warehouse, VND. Same formula as slide 10."""
    a = {**a, **override}
    parts = {
        "Labour time saved": a["deliveries_per_month"] * a["minutes_saved_per_delivery"] * a["loaded_labour_cost_per_minute"],
        "Discrepancies recovered": a["inbound_goods_value_per_month"] * a["unrecovered_discrepancy_rate_today"] * a["share_of_discrepancies_velo_recovers"],
        "Expiry & damage avoided": a["expiry_damage_writeoff_per_month"] * a["expiry_damage_reduction"],
        "Oversell margin protected": a["oversold_orders_per_month"] * a["margin_per_oversold_order"] * a["oversell_reduction"],
        "VELO subscription": -a["velo_subscription_per_month"],
    }
    parts["Net value / month"] = sum(parts.values())
    return parts


# --------------------------------------------------------------------------- 02
@chart
def s02_receiving_today():
    """Slide 02 — today's receiving process, failure points in red."""
    steps = [
        ("Truck arrives", "Paper delivery note in hand", None),
        ("Check under pressure", "Driver waiting, many SKUs on one truck", None),
        ("Visual check", "Often without the purchase order", "UNVERIFIED"),
        ("Tick the checklist", "Damage noted by hand — or not at all", "NO EVIDENCE"),
        ("Re-type into Excel", "Hours or days later", "LATE"),
        ("\u201cIn stock\u201d", "Whether it is or not", "ASSUMED"),
    ]
    W, H = 16, 4.0
    fig, ax = canvas(W, H, CREAM)
    bw, gap, bh, y = 2.35, 0.33, 2.7, 0.65
    x0 = (W - (6 * bw + 5 * gap)) / 2
    for i, (title, desc, flag) in enumerate(steps):
        x = x0 + i * (bw + gap)
        bad = flag is not None
        box(ax, x, y, bw, bh, fc=PAPER, ec=RED if bad else INK, lw=3.5 if bad else 2.5, shadow=RED if bad else None)
        display(ax, x + 0.18, y + bh - 0.15, f"{i + 1:02d}", 22, color=RED if bad else INK, va="top")
        ax.text(x + 0.18, y + bh - 0.75, wrap(title, 18), fontsize=13, fontweight="bold", va="top", zorder=5)
        ax.text(x + 0.18, y + bh - 1.3, wrap(desc, 24), fontsize=10.5, va="top", color=MUTED, zorder=5)
        if bad:
            chip(ax, x + 0.18, y + 0.22, flag, fc=RED, tc=WHITE, ec=RED, size=9.5, va="bottom")
        if i < 5:
            arrow(ax, x + bw + 0.04, y + bh / 2, x + bw + gap - 0.04, y + bh / 2, lw=2.2, scale=16, z=3)
    mono(ax, x0, 0.18, "RED = WHERE THE PROCESS BREAKS", 9.5, color=RED)
    save(fig, "s02_receiving_today")


# --------------------------------------------------------------------------- 04
@chart
def s04_ripple_effect():
    """Slide 04 — one unverified delivery spreads into three business costs."""
    W, H = 11, 6.2
    fig, ax = canvas(W, H, CREAM)
    bh = 1.5
    box(ax, 0.3, 2.35, 2.6, bh, fc=RED, ec=INK, lw=2.5)
    display(ax, 0.48, 2.35 + bh - 0.2, "UNVERIFIED\nDELIVERY", 15, color=WHITE, va="top", linespacing=1.1)
    ax.text(0.48, 2.55, "ticked, not confirmed", fontsize=11, color=WHITE, zorder=5)
    box(ax, 3.55, 2.35, 2.6, bh, fc=PAPER, ec=RED, lw=3)
    display(ax, 3.73, 2.35 + bh - 0.2, "WRONG STOCK", 15, color=INK, va="top")
    ax.text(3.73, 2.55, wrap("in the system from day one", 30), fontsize=11, zorder=5)
    arrow(ax, 2.92, 3.1, 3.53, 3.1)
    branches = [
        ("SALES", "Promises stock that isn't there \u2192 cancelled orders, lost trust"),
        ("PURCHASING", "Reorders on false numbers \u2192 cash locked in the wrong stock"),
        ("FINANCE", "Supplier disputes without evidence \u2192 pays for goods never received"),
    ]
    for (title, text), by in zip(branches, (4.55, 2.42, 0.29)):
        box(ax, 6.8, by, 3.9, 1.36, fc=PAPER, ec=INK, lw=2.5)
        mono(ax, 6.98, by + 1.16, title, 11, color=RED, va="top")
        ax.text(6.98, by + 0.82, wrap(text, 38), fontsize=11, va="top", zorder=5)
        arrow(ax, 6.17, 3.1, 6.78, by + 0.68)
    save(fig, "s04_ripple_effect")


PAIN_LABELS = {
    "no_po_check": "Checked without the purchase order",
    "short_delivery": "Short or over deliveries missed",
    "damage_unrecorded": "Damage not recorded with evidence",
    "late_entry": "Stock entered late into Excel / system",
    "expiry_missed": "Batch / expiry not captured",
    "supplier_dispute": "Supplier disputes without evidence",
    "oversell": "Sold stock that was not there",
    "exhausting": "Receiving is exhausting / rigid",
}


@chart
def s04_interview_pains():
    """Slide 04 — problems mentioned by interviewees (data/interviews.csv)."""
    with open(DATA / "interviews.csv", encoding="utf-8", newline="") as f:
        rows = [r for r in csv.DictReader(f) if r.get("id")]
    n = len(rows)
    if n == 0:
        fig, ax = canvas(8, 5.2, CREAM)
        display(ax, 4, 2.6, "NO INTERVIEW DATA YET", 20, ha="center", va="center")
        ax.text(4, 2.0, "Fill data/interviews.csv — see evidence/interview-guide.md", ha="center", fontsize=11)
        save(fig, "s04_interview_pains")
        return
    has_sample = any(r.get("is_sample", "0").strip() == "1" for r in rows)
    counts = Counter()
    for r in rows:
        for code in {c.strip() for c in r.get("pains", "").split(";") if c.strip()}:
            if code not in PAIN_LABELS:
                raise SystemExit(f"interviews.csv row {r['id']}: unknown pain code '{code}'. Use one of {sorted(PAIN_LABELS)}")
            counts[code] += 1
    items = sorted(counts.items(), key=lambda kv: kv[1])
    labels = [PAIN_LABELS[k] for k, _ in items]
    values = [v for _, v in items]

    fig, ax = plt.subplots(figsize=(8, 5.2))
    fig.patch.set_facecolor(CREAM)
    ax.set_facecolor(CREAM)
    colors = [RED if v == max(values) else BLUE for v in values]
    ax.barh(labels, values, color=colors, edgecolor=INK, linewidth=1.6, height=0.62)
    for i, v in enumerate(values):
        ax.text(v + n * 0.02, i, f"{v} of {n}", va="center", fontsize=11, fontweight="bold")
    ax.set_xlim(0, n * 1.18)
    ax.xaxis.set_major_locator(plt.MaxNLocator(integer=True))
    ax.set_xlabel(f"Interviewees mentioning the problem (n = {n})", fontsize=11)
    ax.tick_params(axis="y", labelsize=11, length=0)
    for side in ("top", "right"):
        ax.spines[side].set_visible(False)
    fig.suptitle("What goes wrong at receiving", x=0.02, ha="left", fontsize=16, fontweight="bold")
    fig.tight_layout(rect=(0, 0, 1, 0.95))
    if has_sample:
        watermark(fig)
        print("  ! interviews.csv still contains sample rows (is_sample=1) — DO NOT put this chart in the deck")
    save(fig, "s04_interview_pains")


# --------------------------------------------------------------------------- 05
@chart
def s05_three_way_match():
    """Slide 05 — Ordered + Claimed + Received = Verified stock (transparent, for Blue slide)."""
    W, H = 16, 4.4
    fig, ax = canvas(W, H)
    sw, rw, op, bh, y = 3.0, 3.4, 0.75, 3.0, 0.7
    x = (W - (3 * sw + rw + 3 * op)) / 2
    sources = [
        ("1 \u00b7 ORDERED", "Purchase order", "What we asked for", CREAM, INK, 2.5),
        ("2 \u00b7 CLAIMED", "Supplier delivery note", "What they say arrived\n(read by AI)", YELLOW, INK, 2.5),
        ("3 \u00b7 RECEIVED", "Scanned & counted", "What is actually here", PAPER, BLUE, 5),
    ]
    for i, (title, sub, desc, fc, ec, lw) in enumerate(sources):
        box(ax, x, y, sw, bh, fc=fc, ec=ec, lw=lw)
        display(ax, x + 0.2, y + bh - 0.22, title, 17, va="top")
        ax.text(x + 0.2, y + bh - 1.0, sub, fontsize=13.5, fontweight="bold", va="top", zorder=5)
        ax.text(x + 0.2, y + bh - 1.5, desc, fontsize=12, va="top", zorder=5)
        x += sw
        display(ax, x + op / 2, y + bh / 2, "+" if i < 2 else "=", 40, color=PAPER, ha="center", va="center")
        x += op
    box(ax, x, y, rw, bh, fc=INK, ec=INK, shadow=RED, shadow_offset=0.12)
    display(ax, x + 0.22, y + bh - 0.22, "VERIFIED\nSTOCK", 21, color=YELLOW, va="top", linespacing=1.05)
    ax.text(x + 0.22, y + bh - 1.55, "Digital goods receipt\n+ inventory + audit trail", fontsize=12.5, color=PAPER, va="top", zorder=5)
    save(fig, "s05_three_way_match", transparent=True)


# --------------------------------------------------------------------------- 07
TAG_STYLE = {"AI": (YELLOW, INK), "RULE": (BLUE, WHITE), "HUMAN": (INK, PAPER)}


@chart
def s07_workflow():
    """Slide 07 — 8-step receiving flow, each step tagged AI / RULE / HUMAN."""
    steps = [
        ("Expected delivery", "From PO or CSV import; no-PO mode when none exists", ["RULE"]),
        ("Scan delivery note", "AI OCR extracts supplier, lines, quantities; receiver confirms", ["AI"]),
        ("Scan & count", "Barcode / QR. No barcode \u2192 search, photo, print a QR label", ["HUMAN"]),
        ("Live three-way match", "Every line turns blue, yellow or red as counting proceeds", ["RULE"]),
        ("Confirm or flag", "Reason + photo for exceptions; driver co-confirms on the phone", ["HUMAN"]),
        ("Manager approves", "Accept, partial accept, reject, or open a supplier claim", ["HUMAN"]),
        ("Digital goods receipt", "Phi\u1ebfu nh\u1eadp kho generated with names, times and evidence", ["RULE"]),
        ("Live stock & alerts", "Batch, expiry (FEFO), low stock, supplier accuracy", ["RULE", "AI"]),
    ]
    W, H = 16, 7.2
    fig, ax = canvas(W, H, CREAM)
    bw, bh, gx = 3.35, 2.45, 0.55
    x0 = (W - (4 * bw + 3 * gx)) / 2
    rows_y = (4.2, 1.0)
    pos = []
    for i in range(8):
        row, col = divmod(i, 4)
        if row == 1:
            col = 3 - col  # snake: step 05 sits under step 04
        pos.append((x0 + col * (bw + gx), rows_y[row]))
    for i, ((title, desc, tags), (x, y)) in enumerate(zip(steps, pos)):
        main = tags[0]
        ec = {"AI": YELLOW, "RULE": BLUE, "HUMAN": INK}[main]
        box(ax, x, y, bw, bh, fc=PAPER, ec=ec, lw=4 if main != "HUMAN" else 2.8)
        display(ax, x + 0.18, y + bh - 0.15, f"{i + 1:02d}", 22, va="top")
        cx = x + bw - 0.15
        for tag in reversed(tags):
            fc, tc = TAG_STYLE[tag]
            t = chip(ax, cx, y + bh - 0.2, tag, fc=fc, tc=tc, size=9, ha="right", va="top")
            cx -= 0.2 + 0.11 * len(tag) + 0.15
        ax.text(x + 0.18, y + bh - 0.85, title, fontsize=13.5, fontweight="bold", va="top", zorder=5)
        ax.text(x + 0.18, y + bh - 1.32, wrap(desc, 34), fontsize=10.5, va="top", color=MUTED, zorder=5)
    for i in range(7):
        (x1, y1), (x2, y2) = pos[i], pos[i + 1]
        if y1 == y2 and x2 > x1:
            arrow(ax, x1 + bw + 0.05, y1 + bh / 2, x2 - 0.05, y2 + bh / 2)
        elif y1 == y2:
            arrow(ax, x1 - 0.05, y1 + bh / 2, x2 + bw + 0.05, y2 + bh / 2)
        else:
            arrow(ax, x1 + bw / 2, y1 - 0.05, x2 + bw / 2, y2 + bh + 0.05)
    lx = x0
    for tag, label in (("AI", "AI \u2014 perception"), ("RULE", "RULE \u2014 control"), ("HUMAN", "HUMAN \u2014 decision")):
        fc, tc = TAG_STYLE[tag]
        chip(ax, lx, 0.35, label, fc=fc, tc=tc, size=10, va="center")
        lx += 3.0
    save(fig, "s07_workflow")


# --------------------------------------------------------------------------- 09
@chart
def s09_architecture():
    """Slide 09 — deliberately simple MVP architecture."""
    W, H = 12, 7.4
    fig, ax = canvas(W, H, PAPER)

    def node(x, y, w, h, title, desc, fc=PAPER, ec=INK, ls="-"):
        box(ax, x, y, w, h, fc=fc, ec=ec, lw=2.6, ls=ls)
        mono(ax, x + 0.18, y + h - 0.2, title, 12, va="top")
        ax.text(x + 0.18, y + h - 0.6, desc, fontsize=10.5, va="top", zorder=5, linespacing=1.35)
        return x, y, w, h

    phone = node(0.3, 4.3, 3.1, 1.75, "RECEIVER PHONE", "Mobile web app\nCamera barcode / QR scan\nPhotos, counts, confirmations")
    dash = node(0.3, 1.15, 3.1, 1.75, "MANAGER DASHBOARD", "Approval queue\nLive stock & expiry alerts\nSupplier accuracy")
    back = node(4.45, 2.55, 3.1, 2.1, "VELO BACKEND", "Three-way match rules\nReceipts (phi\u1ebfu nh\u1eadp kho)\nAudit log, roles")
    ai = node(4.45, 5.5, 3.1, 1.55, "AI SERVICE", "OCR on delivery notes\nSupplier name \u2192 SKU\nAnomaly hints", fc=YELLOW)
    db = node(8.6, 2.55, 3.1, 2.1, "DATABASE", "Catalogue & units\nDeliveries & sessions\nStock, batches, audit")
    csvn = node(8.6, 0.3, 3.1, 1.45, "CSV IN / OUT", "\u2194 Excel / accounting\nNo ERP project needed", ls="--")
    both = "<|-|>"
    arrow(ax, phone[0] + phone[2] + 0.05, phone[1] + 0.6, back[0] - 0.05, back[1] + back[3] - 0.35, style=both)
    arrow(ax, dash[0] + dash[2] + 0.05, dash[1] + 1.1, back[0] - 0.05, back[1] + 0.35, style=both)
    arrow(ax, back[0] + back[2] / 2, back[1] + back[3] + 0.05, ai[0] + ai[2] / 2, ai[1] - 0.05, style=both)
    arrow(ax, back[0] + back[2] + 0.05, back[1] + back[3] / 2, db[0] - 0.05, db[1] + db[3] / 2, style=both)
    arrow(ax, back[0] + back[2] - 0.4, back[1] - 0.05, csvn[0] - 0.05, csvn[1] + csvn[3] / 2, style=both)
    mono(ax, 0.3, 0.4, "0 NEW HARDWARE \u00b7 EMPLOYEES' OWN PHONES", 10, color=RED)
    save(fig, "s09_architecture")


# --------------------------------------------------------------------------- 10
@chart
def s10_value_waterfall():
    """Slide 10 — illustrative monthly value waterfall from data/assumptions.json."""
    parts = value_model(load_assumptions())
    names = list(parts)
    vals = [parts[k] / 1e6 for k in names]
    fig, ax = plt.subplots(figsize=(9.5, 5.6))
    fig.patch.set_facecolor(CREAM)
    ax.set_facecolor(CREAM)
    running = 0.0
    for i, (name, v) in enumerate(zip(names, vals)):
        last = i == len(names) - 1
        if last:
            bottom, height, color = 0, v, INK
        else:
            bottom, height = (running, v) if v >= 0 else (running + v, -v)
            color = BLUE if v >= 0 else RED
        ax.bar(i, height, bottom=bottom, color=color, edgecolor=INK, linewidth=1.6, width=0.62, zorder=3)
        label = f"{v:,.1f}M" if last else f"{v:+,.1f}M"
        ax.text(i, bottom + height + 0.15, label, ha="center", va="bottom", fontsize=11.5, fontweight="bold")
        if not last:
            new = running + v
            ax.plot([i + 0.31, i + 0.69], [new, new], color=MUTED, lw=1.2, ls="--", zorder=2)
            running = new
    ax.set_xticks(range(len(names)), [wrap(n, 13) for n in names], fontsize=10)
    ax.set_ylabel("Million VND per month", fontsize=11)
    ax.set_ylim(0, max(max(vals), running) * 1.25)
    ax.grid(axis="y", color=TRACK, lw=1, zorder=0)
    for side in ("top", "right"):
        ax.spines[side].set_visible(False)
    ax.tick_params(axis="x", length=0)
    fig.suptitle("Illustrative monthly value \u2014 one warehouse", x=0.02, ha="left", fontsize=15, fontweight="bold")
    fig.text(0.98, 0.955, "ILLUSTRATIVE \u2014 TEAM ASSUMPTIONS, SEE APPENDIX", ha="right", va="center",
             fontfamily=plt.rcParams["font.family"], fontsize=8.5, fontweight="bold", color=INK,
             bbox={"boxstyle": "square,pad=0.35", "fc": YELLOW, "ec": INK, "ls": "--"})
    fig.tight_layout(rect=(0, 0, 1, 0.93))
    print("  value model (VND/month): " + ", ".join(f"{k}={v:,.0f}" for k, v in parts.items()))
    save(fig, "s10_value_waterfall")


# --------------------------------------------------------------------------- 11
STATUS_STYLE = {
    "mvp": (BLUE, "Mitigated in MVP"),
    "partial": (YELLOW, "Partly mitigated"),
    "roadmap": (RED, "Roadmap"),
}


@chart
def s11_risk_matrix():
    """Slide 11 — likelihood x impact matrix from data/risks.csv (team assessment)."""
    with open(DATA / "risks.csv", encoding="utf-8", newline="") as f:
        risks = [r for r in csv.DictReader(f) if r.get("id")]
    fig, ax = plt.subplots(figsize=(8.4, 7.0))
    fig.patch.set_facecolor(PAPER)
    ax.set_facecolor(PAPER)
    for lx in range(1, 6):
        for iy in range(1, 6):
            score = lx * iy
            fc, alpha = (RED, 0.22) if score >= 15 else (YELLOW, 0.35) if score >= 8 else (CREAM, 1.0)
            ax.add_patch(Rectangle((lx - 0.5, iy - 0.5), 1, 1, fc=fc, alpha=alpha, ec=PAPER, lw=2, zorder=0))
    groups = defaultdict(list)
    for r in risks:
        groups[(int(r["likelihood"]), int(r["impact"]))].append(r)
    for (lx, iy), items in groups.items():
        offsets = np.linspace(-0.22, 0.22, len(items)) if len(items) > 1 else [0.0]
        for r, dy in zip(items, offsets):
            status = r["status"].strip()
            if status not in STATUS_STYLE:
                raise SystemExit(f"risks.csv {r['id']}: status must be one of {sorted(STATUS_STYLE)}")
            color = STATUS_STYLE[status][0]
            y = iy + dy
            ax.scatter(lx, y, s=620, color=color, edgecolor=INK, linewidth=1.8, zorder=3)
            ax.text(lx, y, r["id"], ha="center", va="center", fontsize=9, fontweight="bold",
                    color=INK if color == YELLOW else WHITE, zorder=4)
            if lx < 5:
                tx, ty, ha, va = lx + 0.2, y, "left", "center"
            else:  # right edge: label under the dot so it cannot cover a neighbour
                tx, ty, ha, va = lx, y - 0.3, "center", "top"
            ax.text(tx, ty, r["short_label"], ha=ha, va=va, fontsize=10, zorder=4,
                    bbox={"boxstyle": "square,pad=0.15", "fc": PAPER, "ec": "none", "alpha": 0.85})
    ax.set_xlim(0.5, 5.5)
    ax.set_ylim(0.5, 5.5)
    ax.set_xticks(range(1, 6), ["Rare", "", "Possible", "", "Likely"], fontsize=10)
    ax.set_yticks(range(1, 6), ["Minor", "", "Moderate", "", "Severe"], fontsize=10)
    ax.set_xlabel("Likelihood", fontsize=12, fontweight="bold")
    ax.set_ylabel("Impact", fontsize=12, fontweight="bold")
    handles = [Line2D([], [], marker="o", ls="", markersize=12, markerfacecolor=c, markeredgecolor=INK, label=l)
               for c, l in STATUS_STYLE.values()]
    ax.legend(handles=handles, loc="upper center", bbox_to_anchor=(0.5, -0.11), ncol=3, frameon=False, fontsize=10)
    fig.suptitle("Where VELO can fail", x=0.02, ha="left", fontsize=15, fontweight="bold")
    fig.text(0.98, 0.955, "TEAM ASSESSMENT", ha="right", va="center", fontsize=8.5, fontweight="bold",
             bbox={"boxstyle": "square,pad=0.35", "fc": YELLOW, "ec": INK, "ls": "--"})
    fig.tight_layout(rect=(0, 0, 1, 0.94))
    save(fig, "s11_risk_matrix")


# --------------------------------------------------------------------------- 12
@chart
def s12_positioning():
    """Slide 12 — positioning: cost & setup effort vs verification depth at the dock."""
    fig, ax = plt.subplots(figsize=(7.6, 6.6))
    fig.patch.set_facecolor(CREAM)
    ax.set_facecolor(CREAM)
    ax.add_patch(Rectangle((0, 3.1), 2.7, 1.9, fc=YELLOW, alpha=0.45, ec=INK, ls="--", lw=1.4, zorder=0))
    ax.text(0.12, 4.86, "TARGET: DEEP VERIFICATION,\nLOW COST & FAST SETUP", fontsize=8.5, fontweight="bold", va="top")
    players = [
        ("Paper + Excel", 0.7, 0.8, MUTED),
        ("SME sales &\ninventory apps", 1.9, 1.9, BLUE),
        ("Enterprise\nWMS / ERP", 4.3, 4.2, INK),
    ]
    for label, x, y, c in players:
        ax.scatter(x, y, s=520, marker="s", color=c, edgecolor=INK, linewidth=1.8, zorder=3)
        left = x > 3.5
        ax.text(x + (-0.22 if left else 0.22), y, label, va="center", ha="right" if left else "left",
                fontsize=11, zorder=4)
    ax.scatter(1.45 + 0.05, 4.05 - 0.05, s=1100, marker="s", color=RED, zorder=2)
    ax.scatter(1.45, 4.05, s=1100, marker="s", color=YELLOW, edgecolor=INK, linewidth=2.2, zorder=3)
    ax.text(1.45, 4.05, "V", ha="center", va="center", fontsize=14, fontweight="bold", zorder=4)
    ax.text(1.8, 4.05, "VELO", va="center", fontsize=15, fontweight="bold", zorder=4)
    ax.set_xlim(0, 5)
    ax.set_ylim(0, 5)
    ax.set_xticks([0.3, 4.7], ["Low", "High"], fontsize=10)
    ax.set_yticks([0.3, 4.7], ["Low", "High"], fontsize=10)
    ax.tick_params(length=0)
    ax.set_xlabel("Cost & setup effort \u2192", fontsize=12, fontweight="bold")
    ax.set_ylabel("Verification depth at the dock \u2192", fontsize=12, fontweight="bold")
    fig.text(0.98, 0.965, "TEAM ASSESSMENT \u2014 VERIFY COMPETITOR FEATURES", ha="right", va="center", fontsize=8,
             fontweight="bold", bbox={"boxstyle": "square,pad=0.35", "fc": YELLOW, "ec": INK, "ls": "--"})
    fig.tight_layout(rect=(0, 0, 1, 0.95))
    save(fig, "s12_positioning")


# --------------------------------------------------------------------------- 13
@chart
def s13_pilot_gantt():
    """Slide 13 — 8-week single-warehouse pilot with gates."""
    phases = [
        ("Prepare", 1, 2, INK, "Gate: manager agrees SKUs & units"),
        ("Shadow run", 3, 4, BLUE, "Gate: \u2265 95% documented, no delivery blocked"),
        ("Live run", 5, 8, RED, "Gate: pilot targets measured vs baseline"),
    ]
    fig, ax = plt.subplots(figsize=(11, 4.6))
    fig.patch.set_facecolor(YELLOW)
    ax.set_facecolor(PAPER)
    n = len(phases) + 1
    for i, (name, start, end, color, gate) in enumerate(phases):
        y = n - 1 - i
        ax.barh(y, end - start + 1, left=start - 1, height=0.46, color=color, edgecolor=INK, linewidth=1.6, zorder=3)
        ax.text(start - 1 + 0.12, y, name.upper(), va="center", color=WHITE, fontsize=11, fontweight="bold", zorder=4)
        ax.scatter(end, y, marker="D", s=140, color=YELLOW, edgecolor=INK, linewidth=1.6, zorder=5)
        ax.text(start - 1 + 0.05, y - 0.38, gate, va="center", fontsize=9.5, color=MUTED)
    ax.scatter(8, 0, marker="D", s=260, color=INK, zorder=5)
    ax.text(7.75, 0, "DECIDE: owner signs expansion \u2014 or we learn why not", ha="right", va="center",
            fontsize=10.5, fontweight="bold")
    ax.set_xlim(0, 8.3)
    ax.set_ylim(-0.6, n - 0.4)
    ax.set_xticks([w - 0.5 for w in range(1, 9)], [f"W{w}" for w in range(1, 9)], fontsize=10)
    ax.set_yticks([])
    for w in range(1, 8):
        ax.axvline(w, color=TRACK, lw=1, zorder=1)
    for side in ("top", "right", "left"):
        ax.spines[side].set_visible(False)
    fig.suptitle("8-week pilot \u2014 one warehouse", x=0.02, ha="left", fontsize=15, fontweight="bold")
    fig.tight_layout(rect=(0, 0, 1, 0.93))
    save(fig, "s13_pilot_gantt")


# --------------------------------------------------------------------------- A
@chart
def sA_sensitivity():
    """Appendix — net monthly value vs today's unrecovered discrepancy rate."""
    a = load_assumptions()
    rates = np.linspace(0, 0.01, 101)
    fig, ax = plt.subplots(figsize=(8.6, 5.6))
    fig.patch.set_facecolor(PAPER)
    ax.set_facecolor(PAPER)
    styles = [(MUTED, ":"), (BLUE, "-"), (INK, "--")]
    for (color, ls), inbound in zip(styles, a["sensitivity_inbound_values"]):
        net = [value_model(a, inbound_goods_value_per_month=inbound, unrecovered_discrepancy_rate_today=r)["Net value / month"] / 1e6 for r in rates]
        ax.plot(rates * 100, net, color=color, ls=ls, lw=2.6, label=f"Inbound goods {inbound / 1e9:g} bn VND / month")
    base = value_model(a)["Net value / month"] / 1e6
    ax.scatter(a["unrecovered_discrepancy_rate_today"] * 100, base, s=110, color=YELLOW, edgecolor=INK, linewidth=1.8, zorder=5)
    ax.annotate("Current assumption", (a["unrecovered_discrepancy_rate_today"] * 100, base), xytext=(12, -22),
                textcoords="offset points", fontsize=10, fontweight="bold")
    ax.axhline(0, color=RED, lw=1.8, ls="--")
    ax.text(0.02, 0.15, "break-even", color=RED, fontsize=9.5, fontweight="bold")
    ax.set_xlabel("Unrecovered discrepancies today (% of inbound value)", fontsize=11)
    ax.set_ylabel("Net value, million VND / month", fontsize=11)
    ax.grid(color=TRACK, lw=1)
    for side in ("top", "right"):
        ax.spines[side].set_visible(False)
    ax.legend(frameon=False, fontsize=10, loc="upper left")
    fig.suptitle("Value depends most on discrepancy recovery", x=0.02, ha="left", fontsize=14, fontweight="bold")
    fig.text(0.98, 0.955, "ILLUSTRATIVE \u2014 TEAM ASSUMPTIONS", ha="right", va="center", fontsize=8.5,
             fontweight="bold", bbox={"boxstyle": "square,pad=0.35", "fc": YELLOW, "ec": INK, "ls": "--"})
    fig.tight_layout(rect=(0, 0, 1, 0.93))
    save(fig, "sA_sensitivity")


# ---------------------------------------------------------------------------
def main(argv: list[str]) -> None:
    if "--list" in argv:
        for name, fn in CHARTS.items():
            print(f"{name:24s} {(fn.__doc__ or '').strip()}")
        return
    names = argv or list(CHARTS)
    unknown = [n for n in names if n not in CHARTS]
    if unknown:
        raise SystemExit(f"Unknown chart(s): {', '.join(unknown)}. Run with --list.")
    for name in names:
        print(name)
        CHARTS[name]()


if __name__ == "__main__":
    main(sys.argv[1:])
