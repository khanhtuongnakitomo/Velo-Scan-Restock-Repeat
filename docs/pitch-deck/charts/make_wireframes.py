"""Render a layout wireframe for every slide on the real 1920x1080 canvas.

Usage:
    python make_wireframes.py            # all slides + contact sheet
    python make_wireframes.py 05 10      # selected slides

Output: out/wireframes/<id>-<slug>.png and out/wireframes/_contact-sheet.png
Grid: 12 columns, 96 px side margins, 24 px gutters (see design-system.md).
"""
from __future__ import annotations

import sys

import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

from velo_style import BLUE, CREAM, INK, MUTED, OUT, PAPER, RED, TRACK, YELLOW, MONO, wrap

W, H = 1920, 1080
MARGIN, COL, GUT = 96, 122, 24
WF = OUT / "wireframes"


def cx(col: float) -> float:
    return MARGIN + col * (COL + GUT)


def cw(span: float) -> float:
    return span * COL + (span - 1) * GUT


def Z(col, span, y, h, kind, label):
    return (cx(col), y, cw(span), h, kind, label)


def header(label="Kicker + headline"):
    return Z(0, 12, 72, 168, "header", label)


def footer(label="Footer: source / label  \u00b7  page no. + VELO \u00b7 DNKTV"):
    return Z(0, 12, 990, 50, "footer", label)


# Two-by-two persona grid inside columns 5..11 for slide 03.
_px, _pw = cx(5), cw(7)
_half = (_pw - GUT) / 2

SLIDES = {
    "01": ("title", "Title", YELLOW, [
        Z(0, 7, 72, 40, "text", "Kicker: AI FOR BUSINESS INNOVATION 2026 \u00b7 TEAM DNKTV"),
        Z(0, 7, 130, 300, "text", "VELO wordmark (Archivo Black ~260 px)"),
        Z(0, 7, 450, 90, "text", "Tagline: Receive. Verify. Record. (Record = red)"),
        Z(0, 7, 560, 130, "text", "One-sentence definition, 28 px"),
        Z(8, 4, 110, 640, "hero", "Phone mockup \u2014 demo scene 2 (match / attention / mismatch)"),
        (0, 840, W, 200, "band", "Team DNKTV + member names & schools (full-bleed ink band)"),
    ]),
    "02": ("business-problem", "Business problem", CREAM, [
        header("Kicker + headline: A TICK IS NOT A CONFIRMATION. + sub-headline"),
        Z(0, 12, 264, 320, "chart", "s02_receiving_today.png \u2014 6 steps, 4 failure points"),
        Z(0, 7, 608, 360, "card", "A tick does not prove\u2026 (5 bullets)"),
        Z(7, 5, 608, 360, "image", "Real delivery note / paper checklist photo (anonymised)"),
        footer(),
    ]),
    "03": ("target-users", "Target business & users", CREAM, [
        header("Kicker + headline: BUILT FOR VIETNAM'S BUILDING-MATERIALS DISTRIBUTORS FIRST."),
        Z(0, 5, 264, 620, "hero", "Beachhead customer + why start here"),
        (_px, 264, _half, 300, "card", "RECEIVER: pain (red) / VELO gives (blue)"),
        (_px + _half + GUT, 264, _half, 300, "card", "WAREHOUSE MANAGER: pain / gives"),
        (_px, 584, _half, 300, "card", "OWNER / FINANCE: pain / gives"),
        (_px + _half + GUT, 584, _half, 300, "card", "DRIVER (participant): pain / gives"),
        Z(0, 12, 904, 60, "text", "Next segments: any SME distribution warehouse"),
    ]),
    "04": ("business-insight", "Business insight", CREAM, [
        header("Kicker + headline: RECEIVING IS WHERE INVENTORY TRUTH IS CREATED \u2014 OR LOST."),
        Z(0, 7, 264, 420, "chart", "s04_ripple_effect.png"),
        Z(7, 5, 264, 420, "chart", "s04_interview_pains.png + 2 quotes (or observation card)"),
        Z(0, 12, 708, 250, "band", "ROOT CAUSE: three sources nobody compares systematically"),
        footer("Footer: Source: DNKTV interviews, n=?, Nov 2026"),
    ]),
    "05": ("proposed-solution", "Proposed solution", BLUE, [
        header("Kicker + headline: STOCK ONLY EXISTS WHEN THREE SOURCES AGREE."),
        Z(0, 12, 264, 380, "chart", "s05_three_way_match.png (transparent)"),
        Z(0, 4, 668, 190, "card", "\u25cf MATCH \u2014 receiver confirms"),
        Z(4, 4, 668, 190, "card", "\u25cf ATTENTION \u2014 reason required"),
        Z(8, 4, 668, 190, "card", "\u25cf MISMATCH \u2014 photo + approval"),
        Z(0, 12, 884, 76, "text", "VELO turns receiving from paperwork into a control point."),
    ]),
    "06": ("how-ai-helps", "How AI helps", CREAM, [
        header("Kicker + headline: AI READS. RULES CHECK. PEOPLE DECIDE."),
        Z(0, 4, 264, 420, "card", "AI \u2014 perception (yellow chip): OCR, SKU matching, anomaly flags"),
        Z(4, 4, 264, 420, "card", "RULES \u2014 control (blue chip): match maths, thresholds, routing"),
        Z(8, 4, 264, 420, "card", "HUMAN \u2014 judgement (ink chip): count, confirm, approve"),
        Z(0, 7, 708, 180, "band", "AI example: 'Keo Sika 11FC 600ml' \u2192 SKF-11FC-600 \u00b7 confirmed"),
        Z(7, 5, 708, 180, "card", "Next: demand forecasting on verified data"),
        Z(0, 12, 908, 56, "text", "AI suggests. It never changes stock on its own."),
    ]),
    "07": ("how-it-works", "How it works", CREAM, [
        header("Kicker + headline: ONE DELIVERY. EIGHT STEPS. ONE PHONE."),
        Z(0, 12, 264, 580, "chart", "s07_workflow.png \u2014 8 steps, snake layout, AI/RULE/HUMAN tags"),
        Z(0, 12, 868, 80, "text", "Documentation is the by-product of checking."),
    ]),
    "08": ("mockup-demo", "Mockup / demo", INK, [
        header("Kicker + headline: 96 ENTERED STOCK. 4 ENTERED A CLAIM. ZERO BY ASSUMPTION."),
        Z(9, 3, 72, 44, "chip", "PROTOTYPE MOCKUP"),
        Z(0, 12, 252, 40, "text", "Scenario: 100 tubes sealant + 20 bags cement, Supplier A"),
        Z(0, 3, 312, 540, "image", "01 Scan note (scene-1.png)"),
        Z(3, 3, 312, 540, "image", "02 96 good / 4 crushed (scene-2.png)"),
        Z(6, 3, 312, 540, "image", "03 Manager approves (scene-3.png)"),
        Z(9, 3, 312, 540, "image", "04 Receipt issued (scene-4.png)"),
        Z(0, 3, 864, 100, "text", "Caption 1"), Z(3, 3, 864, 100, "text", "Caption 2"),
        Z(6, 3, 864, 100, "text", "Caption 3"), Z(9, 3, 864, 100, "text", "Caption 4"),
    ]),
    "09": ("mvp-scope", "MVP scope", PAPER, [
        header("Kicker + headline + MVP goal sentence"),
        Z(0, 4, 264, 440, "card", "IN MVP (yellow chip): 8 capabilities"),
        Z(0, 4, 720, 146, "card", "LATER (red chip, muted text)"),
        Z(4, 8, 264, 602, "chart", "s09_architecture.png"),
        Z(0, 4, 884, 76, "card", "0 new hardware"),
        Z(4, 4, 884, 76, "card", "CSV in/out beside Excel"),
        Z(8, 4, 884, 76, "card", "[X] days setup / warehouse"),
    ]),
    "10": ("business-value", "Business value", CREAM, [
        header("Kicker + headline: VALUE WE CAN MEASURE, NOT JUST PROMISE."),
        Z(0, 7, 264, 520, "chart", "s10_value_waterfall.png (ILLUSTRATIVE label)"),
        Z(0, 7, 800, 90, "text", "Insight: most value comes from discrepancies caught before payment"),
        Z(7, 5, 264, 44, "chip", "PILOT TARGETS \u2014 TO BE MEASURED"),
        Z(7, 5, 324, 566, "table", "Pilot indicator table (5 rows)"),
        footer("Footer: assumptions in Appendix A"),
    ]),
    "11": ("risks-mitigation", "Risks & mitigation", PAPER, [
        header("Kicker + headline: WE KNOW WHERE VELO CAN FAIL \u2014 AND HOW WE CONTAIN IT."),
        Z(0, 6, 264, 696, "chart", "s11_risk_matrix.png"),
        Z(6, 6, 264, 330, "table", "Top 4 risks \u2192 mitigation"),
        Z(6, 6, 612, 348, "band", "RESPONSIBLE AI: human confirmation, roles, never blocks a delivery"),
    ]),
    "12": ("competitive-advantage", "Competitive advantage", CREAM, [
        header("Kicker + headline: DEEPER THAN A CHECKLIST. LIGHTER THAN A WMS."),
        Z(0, 5, 264, 520, "chart", "s12_positioning.png"),
        Z(5, 7, 264, 520, "table", "Comparison table \u2014 VELO column yellow; [VERIFY] cells"),
        Z(0, 4, 804, 156, "card", "01 Verification, not just recording"),
        Z(4, 4, 804, 156, "card", "02 Built for messy Vietnamese reality"),
        Z(8, 4, 804, 156, "card", "03 Phone-first, days to deploy"),
    ]),
    "13": ("pilot-roadmap-closing", "Pilot, roadmap & closing", YELLOW, [
        header("Kicker + headline: PROVE IT IN ONE WAREHOUSE IN 8 WEEKS."),
        Z(0, 8, 264, 400, "chart", "s13_pilot_gantt.png"),
        Z(8, 4, 264, 400, "hero", "OUR ASK: one pilot warehouse, 8 weeks"),
        Z(0, 3, 688, 120, "card", "NOW: verify inbound (red)"),
        Z(3, 3, 688, 120, "card", "NEXT: trust inventory"),
        Z(6, 3, 688, 120, "card", "THEN: optimise movement"),
        Z(9, 3, 688, 120, "card", "LATER: predict demand"),
        (0, 830, W, 150, "band", "RECEIVE. VERIFY. RECORD. \u2014 ZERO STOCK BY ASSUMPTION."),
        footer("Footer: Team DNKTV \u00b7 contact"),
    ]),
    "A": ("appendix", "Appendix", PAPER, [
        header("Kicker APPENDIX + headline"),
        Z(0, 6, 264, 600, "table", "Assumptions table (from assumptions.json)"),
        Z(6, 6, 264, 600, "chart", "sA_sensitivity.png"),
        Z(0, 12, 884, 76, "text", "Method: interviews n=?, artefacts, OCR test accuracy"),
    ]),
}

KIND = {
    #  kind      fill    edge   lw   ls    tag
    "header": (None, MUTED, 2, "--", "HEADER"),
    "text": (None, MUTED, 1.6, "--", "TEXT"),
    "footer": (None, MUTED, 1.4, ":", "FOOTER"),
    "chart": (PAPER, BLUE, 4, "-", "CHART"),
    "card": (PAPER, INK, 3, "-", "CARD"),
    "hero": (PAPER, INK, 3, "-", "HERO CARD"),
    "band": (INK, INK, 3, "-", "BAND"),
    "image": (TRACK, INK, 3, "-", "IMAGE"),
    "table": (PAPER, INK, 3, "-", "TABLE"),
    "chip": (YELLOW, INK, 2, "--", "CHIP"),
}


def render(slide_id: str) -> str:
    slug, title, bg, zones = SLIDES[slide_id]
    dark = bg in (INK, BLUE)
    fig = plt.figure(figsize=(W / 100, H / 100), dpi=100)
    ax = fig.add_axes((0, 0, 1, 1))
    ax.set_xlim(0, W)
    ax.set_ylim(H, 0)
    ax.axis("off")
    ax.add_patch(Rectangle((0, 0), W, H, fc=bg, ec="none", zorder=0))
    for c in range(12):
        ax.add_patch(Rectangle((cx(c), 0), COL, H, fc=PAPER if dark else INK, alpha=0.05, ec="none", zorder=0.5))
    for x, y, w, h, kind, label in zones:
        fc, ec, lw, ls, tag = KIND[kind]
        if kind in ("header", "text", "footer") and dark:
            ec = PAPER
        if kind == "band" and bg == INK:
            fc, ec = PAPER, PAPER
        if kind == "hero":
            ax.add_patch(Rectangle((x + 10, y + 10), w, h, fc=RED, ec="none", zorder=1))
        ax.add_patch(Rectangle((x, y), w, h, fc=fc or "none", ec=ec, lw=lw, ls=ls, zorder=2,
                               hatch="//" if kind == "image" else None))
        if kind == "table":
            for k in range(1, 5):
                ax.plot([x, x + w], [y + h * k / 5] * 2, color=TRACK, lw=1.5, zorder=3)
        text_color = PAPER if (kind == "band" and bg != INK) or (dark and fc is None) else INK
        ax.text(x + 12, y + 10, f"{tag}  {int(w)}\u00d7{int(h)}", fontfamily=MONO, fontsize=9, fontweight="bold",
                color=text_color, va="top", zorder=4, alpha=0.75)
        chars = max(12, int(w / 12))
        ax.text(x + w / 2, y + h / 2 + (6 if h > 60 else 4), wrap(label, chars), ha="center", va="center",
                fontsize=15 if h > 60 else 11, fontweight="bold", color=text_color, zorder=4,
                bbox={"boxstyle": "square,pad=0.3", "fc": "none", "ec": "none"})
    ax.text(W - 20, H - 12, f"WIREFRAME \u00b7 SLIDE {slide_id} \u00b7 {title.upper()} \u00b7 1920\u00d71080",
            ha="right", va="bottom", fontfamily=MONO, fontsize=9, color=PAPER if dark else MUTED)
    WF.mkdir(parents=True, exist_ok=True)
    name = f"{slide_id}-{slug}"
    fig.savefig(WF / f"{name}.png", dpi=100, facecolor=bg)
    plt.close(fig)
    print(f"  wrote out/wireframes/{name}.png")
    return name


def contact_sheet(names: list[str]) -> None:
    cols = 4
    rows = (len(names) + cols - 1) // cols
    fig, axes = plt.subplots(rows, cols, figsize=(cols * 4.8, rows * 3.0))
    fig.patch.set_facecolor(CREAM)
    for ax in axes.flat:
        ax.axis("off")
    for ax, name in zip(axes.flat, names):
        ax.imshow(plt.imread(WF / f"{name}.png"))
        ax.set_title(name, fontfamily=MONO, fontsize=10, fontweight="bold", color=INK)
    fig.tight_layout()
    fig.savefig(WF / "_contact-sheet.png", dpi=150, facecolor=CREAM)
    plt.close(fig)
    print("  wrote out/wireframes/_contact-sheet.png")


def main(argv: list[str]) -> None:
    ids = argv or list(SLIDES)
    unknown = [i for i in ids if i not in SLIDES]
    if unknown:
        raise SystemExit(f"Unknown slide id(s): {', '.join(unknown)}. Valid: {', '.join(SLIDES)}")
    names = [render(i) for i in ids]
    if not argv:
        contact_sheet(names)


if __name__ == "__main__":
    main(sys.argv[1:])
