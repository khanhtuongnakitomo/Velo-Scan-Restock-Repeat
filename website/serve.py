"""Dev server for the Velo site: serves /website with no-cache headers.

Style exploration archive lives at /variants/index.html.
"""
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

ROOT = os.path.dirname(os.path.abspath(__file__))


class NoCacheHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        # the site edits live during a demo — never let a browser serve a stale page
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def log_message(self, fmt, *args):
        pass  # keep the background console quiet


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8321"))
    server = HTTPServer(("127.0.0.1", port), NoCacheHandler)
    print(f"serving {ROOT} on http://127.0.0.1:{port} (no-store)")
    server.serve_forever()
