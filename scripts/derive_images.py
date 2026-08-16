"""Generate responsive derivatives for every project still.

The masters in public/assets/projects are a single 1584x672 JPEG each (~0.9 MB).
That one file was being served to a 390px phone and to a 2560px desktop alike,
and — as a 2.36:1 frame used full-bleed behind a portrait phone screen — roughly
four fifths of it was thrown away by `object-cover` after being downloaded.

This writes, next to each master:

    {stem}-{w}w.jpg / .webp     landscape ladder, for cards, galleries, wide heroes
    {stem}-p{w}w.jpg / .webp    3:4 centre crop, for full-bleed heroes on phones

The portrait crop is the same framing `object-cover` already produces (it centres
by default) — it just ships the pixels that survive instead of the ones that do
not.

Re-runnable and idempotent: existing derivatives are skipped unless --force.

    python3 scripts/derive_images.py [--force]

NOTE ON MASTERS: 672px of height is the hard ceiling here. A phone hero at
844 CSS px and DPR 3 wants ~2500px of height, so the full-bleed hero is upscaled
on every phone no matter what this script does. Fixing *that* needs the stills
re-exported from source at >=2000px on the short edge; then re-run this.
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "frontend" / "public" / "assets" / "projects"

# Display widths that matter: card in a 3-up grid, card in a 2-up grid / phone
# full-bleed, half-screen hero, and the untouched master.
LANDSCAPE_WIDTHS = [480, 768, 1200, 1584]
PORTRAIT_WIDTHS = [360, 504]
PORTRAIT_RATIO = 3 / 4  # width / height

JPEG_QUALITY = 82
WEBP_QUALITY = 80

CWEBP = "/opt/homebrew/bin/cwebp"


def encode(img: Image.Image, dest_jpg: Path, force: bool) -> tuple[int, int]:
    """Write one JPEG + WebP pair. Returns (bytes written, files written)."""
    written = 0
    count = 0
    dest_webp = dest_jpg.with_suffix(".webp")

    if force or not dest_jpg.exists():
        img.save(dest_jpg, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
        written += dest_jpg.stat().st_size
        count += 1

    if force or not dest_webp.exists():
        if Path(CWEBP).exists():
            subprocess.run(
                [CWEBP, "-quiet", "-q", str(WEBP_QUALITY), str(dest_jpg), "-o", str(dest_webp)],
                check=True,
            )
        else:
            img.save(dest_webp, "WEBP", quality=WEBP_QUALITY, method=5)
        written += dest_webp.stat().st_size
        count += 1

    return written, count


def portrait_crop(img: Image.Image) -> Image.Image:
    """Centre crop to 3:4 — the same region object-cover keeps on a phone."""
    w, h = img.size
    target_w = round(h * PORTRAIT_RATIO)
    if target_w > w:  # already narrower than 3:4; crop height instead
        target_h = round(w / PORTRAIT_RATIO)
        top = (h - target_h) // 2
        return img.crop((0, top, w, top + target_h))
    left = (w - target_w) // 2
    return img.crop((left, 0, left + target_w, h))


def is_derivative(path: Path) -> bool:
    stem = path.stem
    return "-" in stem and (stem.rsplit("-", 1)[-1].endswith("w"))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="rewrite existing derivatives")
    args = parser.parse_args()

    if not SRC.is_dir():
        print(f"no such directory: {SRC}", file=sys.stderr)
        return 1

    masters = sorted(p for p in SRC.glob("*.jpg") if not is_derivative(p))
    if not masters:
        print("nothing to do — no masters found")
        return 0

    total_bytes = 0
    total_files = 0

    for master in masters:
        with Image.open(master) as img:
            img = img.convert("RGB")
            native_w, native_h = img.size
            print(f"{master.name}  {native_w}x{native_h}")

            for w in LANDSCAPE_WIDTHS:
                if w > native_w:
                    continue
                resized = img if w == native_w else img.resize(
                    (w, round(native_h * w / native_w)), Image.LANCZOS
                )
                b, c = encode(resized, master.with_name(f"{master.stem}-{w}w.jpg"), args.force)
                total_bytes += b
                total_files += c

            cropped = portrait_crop(img)
            crop_w, crop_h = cropped.size
            for w in PORTRAIT_WIDTHS:
                if w > crop_w:
                    continue
                resized = cropped if w == crop_w else cropped.resize(
                    (w, round(crop_h * w / crop_w)), Image.LANCZOS
                )
                b, c = encode(resized, master.with_name(f"{master.stem}-p{w}w.jpg"), args.force)
                total_bytes += b
                total_files += c

    print(f"\n{total_files} files written, {total_bytes / 1_048_576:.1f} MB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
