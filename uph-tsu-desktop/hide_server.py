import tornado.web

class NoServerHeaderMixin:
    def _write_headers(self):
        # Remove Server header from response
        self._headers.pop('Server', None)
        super()._write_headers()

def patch_tornado_server_header():
    # Patch tornado.web.RequestHandler._write_headers to remove Server header
    tornado.web.RequestHandler._write_headers = NoServerHeaderMixin._write_headers
