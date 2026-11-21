# The carousel editor: a page in the browser for setting the sizes of the works
# in the home page carousel, and seeing the result right away.
#
# How to run it (from the project folder):   python3 tools/carousel-editor.py
# It opens http://127.0.0.1:8765/carousel-editor.html in the browser.
# To stop it: Ctrl+C in the Terminal.
#
# "Save" in the editor writes:
#   - the size and place of every work  -> projects.json   (cover.size, cover.align)
#   - the height of the row and the space between the works -> styles.css (.carousel, .carousel-item)
# Then upload the site as usual (or ask Claude to).
#
# Nothing to install: it uses only what comes with Python.

import http.server
import json
import re
import threading
import webbrowser
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent  # the project folder
PORT = 8765

# Where the two numbers live in styles.css (Figma pixels)
ROW_HEIGHT = re.compile(r"(\.carousel \{\s*height: calc\()([\d.]+)( \* var\(--px\)\);)")
GAP = re.compile(r"(\.carousel-item \{[^}]*?margin-right: calc\()([\d.]+)( \* var\(--px\)\);)")


def read_settings():
    css = (SITE / "styles.css").read_text()
    return {
        "rowHeight": float(ROW_HEIGHT.search(css).group(2)),
        "gap": float(GAP.search(css).group(2)),
    }


def save(data):
    # 1. The works: projects.json
    path = SITE / "projects.json"
    content = json.loads(path.read_text())
    by_slug = {work["slug"]: work for work in data["works"]}
    for project in content["projects"]:
        work = by_slug.get(project["slug"])
        if not work or "cover" not in project:
            continue
        cover = project["cover"]
        # 100% and "center" are the defaults, so they are not written
        if work["size"] >= 100:
            cover.pop("size", None)
        else:
            cover["size"] = f'{work["size"]:g}%'
        if work["align"] == "center":
            cover.pop("align", None)
        else:
            cover["align"] = work["align"]
    path.write_text(json.dumps(content, indent=2, ensure_ascii=False) + "\n")

    # 2. The row: styles.css
    css_path = SITE / "styles.css"
    css = css_path.read_text()
    css = ROW_HEIGHT.sub(lambda m: f'{m.group(1)}{data["rowHeight"]:g}{m.group(3)}', css, count=1)
    css = GAP.sub(lambda m: f'{m.group(1)}{data["gap"]:g}{m.group(3)}', css, count=1)
    css_path.write_text(css)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(SITE), **kwargs)

    def end_headers(self):
        # Always the newest files (so a reload after saving shows the change)
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        if self.path == "/carousel-settings":
            self.send_json(read_settings())
        else:
            super().do_GET()

    def do_POST(self):
        if self.path != "/save-carousel":
            self.send_error(404)
            return
        length = int(self.headers["Content-Length"])
        save(json.loads(self.rfile.read(length)))
        self.send_json({"saved": True})

    def send_json(self, value):
        body = json.dumps(value).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass  # keep the Terminal quiet


if __name__ == "__main__":
    server = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    url = f"http://127.0.0.1:{PORT}/carousel-editor.html"
    print(f"The carousel editor is open at {url}  (Ctrl+C to stop)")
    threading.Timer(0.5, lambda: webbrowser.open(url)).start()
    server.serve_forever()
