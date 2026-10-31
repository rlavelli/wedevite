"""Ridimensiona una foto per il sito: crea versioni WebP e JPG in assets/img/.

Uso (dalla cartella del progetto):
    python tools/ottimizza-foto.py <foto originale> <nome> [larghezze...]

Esempio:
    python tools/ottimizza-foto.py "stats/img/DSC01997.jpg" hero-verticale 800 1200
    -> assets/img/hero-verticale-800.webp, hero-verticale-800.jpg, ...

Opzione --og: crea anche og-image.jpg (1200x630) per l'anteprima su WhatsApp.
"""
import sys
from pathlib import Path

from PIL import Image, ImageOps

OUT = Path(__file__).resolve().parent.parent / "assets" / "img"


def save_variants(img, name, width):
    if img.width > width:
        img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    img.save(OUT / f"{name}-{width}.webp", "WEBP", quality=78, method=6)
    img.save(OUT / f"{name}-{width}.jpg", "JPEG", quality=80, optimize=True, progressive=True)
    print(f"  {name}-{width}: {img.width}x{img.height}")


def save_og(img):
    og = ImageOps.fit(img, (1200, 630), Image.LANCZOS, centering=(0.5, 0.55))
    og.save(OUT.parent.parent / "og-image.jpg", "JPEG", quality=82, optimize=True, progressive=True)
    print("  og-image.jpg: 1200x630")


def main():
    args = [a for a in sys.argv[1:] if a != "--og"]
    if len(args) < 2:
        sys.exit(__doc__)
    src, name, widths = Path(args[0]), args[1], [int(w) for w in args[2:]] or [800, 1600]
    OUT.mkdir(parents=True, exist_ok=True)
    img = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    print(f"{src.name} ({img.width}x{img.height})")
    for w in widths:
        save_variants(img, name, w)
    if "--og" in sys.argv:
        save_og(img)


if __name__ == "__main__":
    main()
