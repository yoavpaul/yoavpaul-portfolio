# Shrinks the site's photos and saves them as WebP.
#
# What it does, for every JPG and PNG in the "images" folder:
#   1. makes it smaller, so its long side is at most 2400px (small photos keep their size)
#   2. saves it as WebP, quality 80, next to it in "images" (same name, ending .webp)
#   3. moves the original into the "originals" folder (it is not uploaded, see .gitignore)
# At the end it prints a table: the size of every file before and after.
#
# How to run it (from the project folder):   python3 tools/shrink-images.py
#
# It needs nothing to be installed: it uses Google Chrome, which can write WebP files.
# Chrome opens a small page (in the background, no window) that draws each photo
# smaller on a canvas and sends the WebP back to this script, which saves it.
#
# The pages, styles.css and the scripts still point to the old .jpg/.png names:
# change them to .webp after running this.

import http.server
import json
import shutil
import subprocess
import sys
import tempfile
import threading
import time
from pathlib import Path

LONG_SIDE = 2400   # the long side of a photo, at most (pixels)
QUALITY = 0.8      # WebP quality: 0.8 = 80

PROJECT = Path(__file__).resolve().parent.parent
IMAGES = PROJECT / "images"
ORIGINALS = PROJECT / "originals"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Not changed: the mouse pointer (fly swatter) stays PNG, not every browser shows a WebP pointer
KEEP = {"cursor-swatter.png", "cursor-swatter@2x.png"}

# The page that Chrome opens: it makes every WebP and sends it back
PAGE = """<!DOCTYPE html><meta charset="utf-8"><script>
(async () => {
  const names = %s;
  for (const name of names) {
    try {
      const img = new Image();
      img.src = "/images/" + encodeURIComponent(name);
      await img.decode();
      const scale = Math.min(1, %d / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const context = canvas.getContext("2d");
      context.imageSmoothingQuality = "high";
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      const webp = await new Promise((done) => canvas.toBlob(done, "image/webp", %s));
      if (!webp || webp.type !== "image/webp") throw new Error("Chrome did not make a WebP");
      await fetch("/save/" + encodeURIComponent(name), { method: "POST", body: webp });
    } catch (error) {
      await fetch("/error/" + encodeURIComponent(name), { method: "POST", body: String(error) });
    }
  }
})();
</script>"""


def webp_name(name):
    return Path(name).stem + ".webp"


def size_text(size):
    return f"{size / 1024 / 1024:.2f} MB" if size >= 1024 * 1024 else f"{size / 1024:.0f} KB"


def main():
    names = sorted(
        p.name for p in IMAGES.iterdir()
        if p.suffix.lower() in (".jpg", ".jpeg", ".png") and p.name not in KEEP
    )
    if not names:
        print("No JPG or PNG photos to shrink in", IMAGES)
        return

    # Stop before changing anything if a WebP with the same name is already there,
    # or the original is already in "originals"
    for name in names:
        if (IMAGES / webp_name(name)).exists():
            sys.exit(f"Stopped: images/{webp_name(name)} is already there. Nothing was changed.")
        if (ORIGINALS / name).exists():
            sys.exit(f"Stopped: originals/{name} is already there. Nothing was changed.")
    if len({webp_name(n) for n in names}) != len(names):
        sys.exit("Stopped: two photos have the same name (e.g. a.jpg and a.png). Nothing was changed.")

    saved = {}    # name -> size of its WebP
    errors = {}   # name -> what went wrong

    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(PROJECT), **kwargs)

        def do_GET(self):
            if self.path == "/shrink.html":
                body = (PAGE % (json.dumps(names), LONG_SIDE, QUALITY)).encode()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                self.wfile.write(body)
            else:
                super().do_GET()

        def do_POST(self):
            from urllib.parse import unquote
            kind, _, name = self.path.lstrip("/").partition("/")
            name = unquote(name)
            data = self.rfile.read(int(self.headers["Content-Length"]))
            if name in names and kind == "save":
                (IMAGES / webp_name(name)).write_bytes(data)
                saved[name] = len(data)
            elif name in names and kind == "error":
                errors[name] = data.decode()
            self.send_response(200)
            self.end_headers()

        def log_message(self, *args):
            pass

    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f"http://127.0.0.1:{server.server_port}/shrink.html"

    print(f"Shrinking {len(names)} photos with Chrome...")
    with tempfile.TemporaryDirectory() as chrome_profile:
        chrome = subprocess.Popen(
            [CHROME, "--headless=new", f"--user-data-dir={chrome_profile}", url],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        deadline = time.time() + 20 * 60
        while len(saved) + len(errors) < len(names) and time.time() < deadline:
            time.sleep(0.5)
        chrome.terminate()
        chrome.wait()
    server.shutdown()

    if errors or len(saved) < len(names):
        # Something went wrong: take away the new WebP files, the originals stay where they were
        for name in saved:
            (IMAGES / webp_name(name)).unlink()
        for name, error in errors.items():
            print(f"  {name}: {error}")
        sys.exit(f"Stopped: {len(saved)} of {len(names)} photos worked. Nothing was changed.")

    # All worked: move the originals into "originals"
    ORIGINALS.mkdir(exist_ok=True)
    rows = []
    for name in names:
        before = (IMAGES / name).stat().st_size
        shutil.move(str(IMAGES / name), str(ORIGINALS / name))
        rows.append((name, webp_name(name), before, saved[name]))

    # The table: before and after
    print()
    print(f"{'Before':<45} {'Size':>10}   {'After':<45} {'Size':>10}")
    for name, new_name, before, after in rows:
        print(f"{name:<45} {size_text(before):>10}   {new_name:<45} {size_text(after):>10}")
    total_before = sum(r[2] for r in rows)
    total_after = sum(r[3] for r in rows)
    print(f"{'Total':<45} {size_text(total_before):>10}   {'':<45} {size_text(total_after):>10}")

    # Also kept in a file, to look at later
    with open(ORIGINALS / "sizes.tsv", "w") as table:
        table.write("before\tbytes before\tafter\tbytes after\n")
        for name, new_name, before, after in rows:
            table.write(f"{name}\t{before}\t{new_name}\t{after}\n")
    print("\nThe originals are in", ORIGINALS)


if __name__ == "__main__":
    main()
