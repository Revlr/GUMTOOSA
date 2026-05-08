from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]


class FrontendRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def main() -> None:
    handler = partial(FrontendRequestHandler, directory=str(ROOT_DIR))
    server = ThreadingHTTPServer(("127.0.0.1", 5173), handler)
    print("GUMTOOSA frontend server running at http://127.0.0.1:5173")
    print(f"Serving static files from {ROOT_DIR}")
    server.serve_forever()


if __name__ == "__main__":
    main()
