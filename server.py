import http.server
import socketserver
import mimetypes

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

if __name__ == '__main__':
    # Force fix common Windows MIME type issues
    mimetypes.add_type('text/css', '.css')
    mimetypes.add_type('application/javascript', '.js')
    mimetypes.add_type('text/html', '.html')
    mimetypes.add_type('font/woff2', '.woff2')
    mimetypes.add_type('font/woff', '.woff')
    mimetypes.add_type('font/ttf', '.ttf')
    
    PORT = 3000
    with socketserver.TCPServer(("", PORT), NoCacheHTTPRequestHandler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()
