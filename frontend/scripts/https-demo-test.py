"""Local TLS proxy for public-mode browser tests. Never deploy this harness."""
import functools
import http.client
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os
from pathlib import Path
import ssl
import subprocess
import sys
import tempfile
import threading
import time
from urllib.parse import urlsplit

import uvicorn

root = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(root / "backend"))


class Proxy(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def proxy(self):
        connection = http.client.HTTPConnection("127.0.0.1", 8002, timeout=10)
        try:
            body = self.rfile.read(int(self.headers.get("Content-Length", 0)))
            headers = {k: v for k, v in self.headers.items() if k.lower() not in {"host", "connection"}}
            connection.request(self.command, self.path.removeprefix("/api"), body, headers)
            response = connection.getresponse()
            content = response.read()
            self.send_response(response.status)
            for key, value in response.getheaders():
                if key.lower() not in {"connection", "transfer-encoding", "content-length"}:
                    self.send_header(key, value)
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        finally:
            connection.close()

    def do_GET(self):
        if self.path.startswith("/api/"):
            return self.proxy()
        if not (root / "frontend/dist" / urlsplit(self.path).path.lstrip("/")).is_file():
            self.path = "/index.html"
        super().do_GET()

    do_POST = proxy
    do_DELETE = proxy
    do_OPTIONS = proxy


with tempfile.TemporaryDirectory(prefix="bloom-public-test-") as directory:
    os.environ.update(DEMO_MODE="public", DEMO_ORIGINS="https://127.0.0.1:5443",
                      LLM_MODE="deterministic", DATABASE_PATH=directory + "/registry.sqlite3")
    os.environ.pop("OPENAI_API_KEY", None)
    subprocess.run(["openssl", "req", "-x509", "-newkey", "rsa:2048", "-nodes",
                    "-keyout", directory + "/key.pem", "-out", directory + "/cert.pem",
                    "-days", "1", "-subj", "/CN=localhost"],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    server = uvicorn.Server(uvicorn.Config("app.main:app", host="127.0.0.1", port=8002, access_log=False))
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    for _ in range(100):
        if server.started:
            break
        time.sleep(0.05)
    if not server.started:
        raise RuntimeError("Backend did not start")
    handler = functools.partial(Proxy, directory=str(root / "frontend/dist"))
    proxy = ThreadingHTTPServer(("127.0.0.1", 5443), handler)
    tls = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    tls.load_cert_chain(directory + "/cert.pem", directory + "/key.pem")
    proxy.socket = tls.wrap_socket(proxy.socket, server_side=True)
    try:
        proxy.serve_forever()
    finally:
        server.should_exit = True
        thread.join(timeout=10)
