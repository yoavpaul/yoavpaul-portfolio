# The grass editor: a page in the browser for making the grass behind the
# Soccer project panel (graphics page) and seeing it on the page right away.
#
# How to run it (from the project folder):   python3 tools/grass-editor.py
# It opens http://127.0.0.1:8766/tools/grass-editor.html in the browser.
# To stop it: Ctrl+C in the Terminal.
#
# "Save to the site" in the editor writes:
#   - the grass picture          -> images/grass-texture.webp
#   - its color and size on screen -> styles.css (the "Soccer - Joint" part)
#
# Nothing to install: it uses only what comes with Python.

import base64
import http.server
import json
import re
import threading
import webbrowser
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent  # the project folder
PORT = 8766

# The line in styles.css with the grass: its color, its picture and its size
GRASS_LINE = re.compile(r'background: #[0-9a-fA-F]{6} url\("images/grass-texture\.webp(?:\?v=\d+)?"\) 0 0 / [\d.]+px;')


def save(data):
    # The picture comes as "data:image/webp;base64,....."
    picture = base64.b64decode(data["image"].split(",", 1)[1])
    (SITE / "images" / "grass-texture.webp").write_bytes(picture)

    css_file = SITE / "styles.css"
    css = css_file.read_text()
    new_line = f'background: {data["color"]} url("images/grass-texture.webp") 0 0 / {round(data["size"])}px;'
    css, found = GRASS_LINE.subn(new_line, css)
    if not found:
        raise ValueError("The grass line was not found in styles.css")
    css_file.write_text(css)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(SITE), **kwargs)

    # Always the newest files (no old copies from the browser's memory)
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_POST(self):
        if self.path != "/save":
            self.send_error(404)
            return
        length = int(self.headers["Content-Length"])
        try:
            save(json.loads(self.rfile.read(length)))
            answer = b'{"ok": true}'
        except Exception as problem:
            answer = json.dumps({"ok": False, "error": str(problem)}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(answer)


if __name__ == "__main__":
    server = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    url = f"http://127.0.0.1:{PORT}/tools/grass-editor.html"
    print("The grass editor is at", url, "  (Ctrl+C to stop)")
    threading.Timer(0.5, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
