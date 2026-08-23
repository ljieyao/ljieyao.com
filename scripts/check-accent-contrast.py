#!/usr/bin/env python3
"""WCAG contrast check for the ljieyao.com accent tokens (plan V4).

Usage: python3 scripts/check-accent-contrast.py
Exit code 0 iff every pair meets the threshold (default 3.0, WCAG 1.4.11 non-text).
"""
import sys

THRESHOLD = 3.0

PAIRS = [
    ("light-mode accent on page bg", "#059669", "#ffffff"),  # emerald-600 / white
    ("dark-mode accent on page bg", "#34d399", "#0a0a0a"),   # emerald-400 / zinc-950
]


def _lin(c: float) -> float:
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def luminance(hex_color: str) -> float:
    h = hex_color.lstrip("#")
    r, g, b = (int(h[i : i + 2], 16) / 255 for i in (0, 2, 4))
    return 0.2126 * _lin(r) + 0.7152 * _lin(g) + 0.0722 * _lin(b)


def ratio(fg: str, bg: str) -> float:
    lo, hi = sorted((luminance(fg), luminance(bg)))
    return (hi + 0.05) / (lo + 0.05)


def main() -> int:
    failures: list[str] = []
    for label, fg, bg in PAIRS:
        r = ratio(fg, bg)
        status = "PASS" if r >= THRESHOLD else "FAIL"
        print(f"{status} {label}: {fg} on {bg} = {r:.2f}:1")
        if r < THRESHOLD:
            failures.append(label)
    if failures:
        print(f"\n{len(failures)} pair(s) below {THRESHOLD}:1 — adjust token and re-run.")
        return 1
    print(f"\nAll pairs ≥ {THRESHOLD}:1.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
