"""Shared VELO brand style for deck charts and wireframes.

Colours mirror public/tokens.css. Fonts: Archivo Black (display), IBM Plex Sans (body),
IBM Plex Mono (labels) when installed; otherwise system fallbacks.
Set VELO_FONTS=<folder with .ttf/.otf files> to load fonts that are not installed system-wide.
"""
from __future__ import annotations

import os
import textwrap
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib import font_manager  # noqa: E402
from matplotlib.patches import FancyArrowPatch, Rectangle  # noqa: E402

HERE = Path(__file__).resolve().parent
OUT = HERE / "out"
DATA = HERE / "data"

# ---- colours (public/tokens.css) ----
INK = "#20201D"
PAPER = "#F7F0E2"
CREAM = "#F1E5CB"
YELLOW = "#F0C642"
RED = "#B92D25"
BLUE = "#315C91"
MUTED = "#555247"
WHITE = "#FFFFFF"
TRACK = "#D8CCB4"


# ---- fonts ----
def _register_extra_fonts() -> None:
    folders = [os.environ.get("VELO_FONTS"), os.environ.get("FIGCRAFT_FONTS")]
    local = os.environ.get("LOCALAPPDATA")
    if local:
        folders.append(str(Path(local) / "Microsoft" / "Windows" / "Fonts"))
    for folder in filter(None, folders):
        path = Path(folder)
        if not path.is_dir():
            continue
        for font in list(path.glob("*.ttf")) + list(path.glob("*.otf")):
            try:
                font_manager.fontManager.addfont(str(font))
            except (OSError, RuntimeError):
                pass


def _pick(candidates: list[str], fallback: str, need_bold: bool = False) -> str:
    fonts = font_manager.fontManager.ttflist
    for name in candidates:
        weights = {f.weight for f in fonts if f.name == name}
        if weights and (not need_bold or any(isinstance(w, int) and w >= 600 for w in weights)):
            return name
    return fallback


_register_extra_fonts()
DISPLAY = _pick(["Archivo Black"], "DejaVu Sans")
# Bold body text needs a static bold file; a variable IBM Plex Sans only exposes weight 400 to matplotlib.
SANS = _pick(["IBM Plex Sans", "Segoe UI", "Arial"], "DejaVu Sans", need_bold=True)
MONO = _pick(["IBM Plex Mono"], "DejaVu Sans Mono")
if SANS != "IBM Plex Sans":
    print(f"note: static IBM Plex Sans (Regular + Bold .ttf) not found; body text uses {SANS}")
DISPLAY_WEIGHT = "normal" if DISPLAY == "Archivo Black" else "bold"

plt.rcParams.update(
    {
        "font.family": [SANS, "DejaVu Sans"],  # DejaVu covers glyphs such as \u25cf
        "text.color": INK,
        "axes.edgecolor": INK,
        "axes.labelcolor": INK,
        "xtick.color": INK,
        "ytick.color": INK,
        "axes.linewidth": 1.6,
        "svg.fonttype": "none",  # keep SVG text editable in slide tools
    }
)


# ---- helpers ----
def wrap(text: str, width: int) -> str:
    return "\n".join(
        "\n".join(textwrap.wrap(line, width)) if line else "" for line in text.split("\n")
    )


def canvas(w: float, h: float, bg: str | None = None):
    """Figure in inch units: x 0..w, y 0..h (y up)."""
    fig = plt.figure(figsize=(w, h))
    ax = fig.add_axes((0, 0, 1, 1))
    ax.set_xlim(0, w)
    ax.set_ylim(0, h)
    ax.axis("off")
    if bg:
        fig.patch.set_facecolor(bg)
    return fig, ax


def box(ax, x, y, w, h, fc=PAPER, ec=INK, lw=2.5, ls="-", shadow=None, shadow_offset=0.09, z=2):
    if shadow:
        ax.add_patch(
            Rectangle((x + shadow_offset, y - shadow_offset), w, h, fc=shadow, ec="none", zorder=z - 1)
        )
    ax.add_patch(Rectangle((x, y), w, h, fc=fc, ec=ec, lw=lw, ls=ls, zorder=z))


def arrow(ax, x1, y1, x2, y2, color=INK, lw=2.5, style="-|>", scale=20, z=1):
    ax.add_patch(
        FancyArrowPatch(
            (x1, y1), (x2, y2), arrowstyle=style, mutation_scale=scale, color=color, lw=lw,
            shrinkA=0, shrinkB=0, zorder=z,
        )
    )


def display(ax, x, y, text, size, color=INK, **kw):
    return ax.text(x, y, text, fontfamily=DISPLAY, fontweight=DISPLAY_WEIGHT, fontsize=size, color=color, **kw)


def mono(ax, x, y, text, size, color=INK, weight="bold", **kw):
    return ax.text(x, y, text, fontfamily=MONO, fontweight=weight, fontsize=size, color=color, **kw)


def chip(ax, x, y, text, fc=YELLOW, tc=INK, ec=INK, size=9, ls="-", **kw):
    return ax.text(
        x, y, text, fontfamily=MONO, fontweight="bold", fontsize=size, color=tc, zorder=6,
        bbox={"boxstyle": "square,pad=0.35", "fc": fc, "ec": ec, "lw": 1.6, "ls": ls}, **kw,
    )


def watermark(fig, text="SAMPLE DATA — DO NOT SUBMIT"):
    fig.text(
        0.5, 0.5, text, rotation=18, ha="center", va="center", fontsize=34, color=RED, alpha=0.35,
        fontfamily=DISPLAY, fontweight=DISPLAY_WEIGHT, zorder=100,
    )


def save(fig, name: str, transparent: bool = False, folder: Path | None = None) -> Path:
    folder = folder or OUT
    folder.mkdir(parents=True, exist_ok=True)
    png = folder / f"{name}.png"
    kw = {"transparent": True} if transparent else {"facecolor": fig.get_facecolor()}
    fig.savefig(png, dpi=300, **kw)
    fig.savefig(folder / f"{name}.svg", **kw)
    plt.close(fig)
    print(f"  wrote {png.relative_to(HERE)} (+ .svg)")
    return png
