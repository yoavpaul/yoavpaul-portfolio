# Makes a smaller copy of photos, for phones and regular (not Retina) screens.
#
# For every photo name given, it takes the original from "originals" and saves
#   images/<name>-1200.webp   (1200px wide, WebP quality 80, like the other photos)
# next to the big one (images/<name>.webp, 2400px). The page lists both in "srcset",
# and the browser loads only the one that is sharp enough for the screen.
#
# How to run it (from the project folder):
#   python3 tools/make-small-photos.py monsters-02 monsters-03 ...
#
# Like shrink-images.py it needs nothing to be installed: it uses Google Chrome to write the WebP files.

import http.server
import json
import subprocess
import sys
import tempfile
import threading
import time
from pathlib import Path

WIDTH = 1200       # the width of the small copy (pixels). Enough for phones and regular screens
QUALITY = 0.8      # WebP quality: 0.8 = 80

PROJECT = Path(__file__).resolve().parent.parent
IMAGES = PROJECT / "images"
ORIGINALS = PROJECT / "originals"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# The page that Chrome opens: it makes every small WebP and sends it back
PAGE = """<!DOCTYPE html><meta charset="utf-8"><script>
(async () => {
  const files = %s;
  for (const file of files) {
    try {
      const img = new Image();
      img.src = "/originals/" + encodeURIComponent(file);
      await img.decode();
      const scale = Math.min(1, %d / img.naturalWidth);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const context = canvas.getContext("2d");
      context.imageSmoothingQuality = "high";
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      const webp = await new Promise((done) => canvas.toBlob(done, "image/webp", %s));
      await fetch("/save/" + encodeURIComponent(file), { method: "POST", body: webp });
    } catch (error) {
      await fetch("/error/" + encodeURIComponent(file), { method: "POST", body: String(error) });
    }
  }
})();
</script>"""


def main():
    # The original of every name (a .jpg or a .png in "originals")
    files = []
    for name in sys.argv[1:]:
        found = [p.name for p in ORIGINALS.glob(name + ".*")]
        if not found:
            sys.exit(f"Stopped: there is no original for {name} in originals. Nothing was made.")
        files.append(found[0])

    done = {}   # file -> size of its small WebP, or an error

    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(PROJECT), **kwargs)

        def do_GET(self):
            if self.path == "/small.html":
                body = (PAGE % (json.dumps(files), WIDTH, QUALITY)).encode()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                self.wfile.write(body)
            else:
                super().do_GET()

        def do_POST(self):
            from urllib.parse import unquote
            kind, _, file = self.path.lstrip("/").partition("/")
            file = unquote(file)
            data = self.rfile.read(int(self.headers["Content-Length"]))
            if file in files and kind == "save":
                (IMAGES / f"{Path(file).stem}-{WIDTH}.webp").write_bytes(data)
                done[file] = f"{len(data) / 1024:.0f} KB"
            elif file in files:
                done[file] = "ERROR: " + data.decode()
            self.send_response(200)
            self.end_headers()

        def log_message(self, *args):
            pass

    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    with tempfile.TemporaryDirectory() as chrome_profile:
        chrome = subprocess.Popen(
            [CHROME, "--headless=new", f"--user-data-dir={chrome_profile}",
             f"http://127.0.0.1:{server.server_port}/small.html"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        deadline = time.time() + 10 * 60
        while len(done) < len(files) and time.time() < deadline:
            time.sleep(0.5)
        chrome.terminate()
        chrome.wait()

    for file in files:
        big = IMAGES / f"{Path(file).stem}.webp"
        big_size = f"{big.stat().st_size / 1024:.0f} KB" if big.exists() else "-"
        print(f"{Path(file).stem:<28} big: {big_size:>8}   {WIDTH}px wide: {done.get(file, 'not made')}")


if __name__ == "__main__":
    main()
