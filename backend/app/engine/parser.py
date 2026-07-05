"""Request Parser."""

import json
from typing import Dict, Any
from urllib.parse import urlparse, parse_qsl
from http.server import BaseHTTPRequestHandler
from io import BytesIO
from app.models.parsed_request import ParsedRequest
from app.exceptions import AttackLensError

class HTTPRequest(BaseHTTPRequestHandler):
    def __init__(self, request_text: str):
        self.rfile = BytesIO(request_text.encode('utf-8'))
        self.raw_requestline = self.rfile.readline()
        self.error_code = self.error_message = None
        self.parse_request()
        
    def send_error(self, code, message=None, explain=None):
        self.error_code = code
        self.error_message = message

class RequestParser:
    """Parses raw HTTP or structured JSON into a ParsedRequest."""
    
    @staticmethod
    def parse_raw(raw_http: str) -> ParsedRequest:
        try:
            request = HTTPRequest(raw_http)
            if request.error_code:
                raise AttackLensError(f"Invalid HTTP Request: {request.error_message}")
            
            method = request.command
            path_with_query = request.path
            parsed_url = urlparse(path_with_query)
            path = parsed_url.path
            query_params = dict(parse_qsl(parsed_url.query))
            
            headers = {k.lower(): v for k, v in request.headers.items()}
            
            cookies = {}
            cookie_header = headers.get("cookie", "")
                
            if cookie_header:
                for cookie in cookie_header.split(";"):
                    if "=" in cookie:
                        k, v = cookie.strip().split("=", 1)
                        cookies[k] = v
                        
            # Get body
            content_length_str = headers.get("content-length")
            if content_length_str:
                raw_body = request.rfile.read(int(content_length_str))
            else:
                raw_body = request.rfile.read()
                
            body = None
            if raw_body:
                content_type = headers.get("content-type", "").lower()
                if "application/json" in content_type:
                    try:
                        body = json.loads(raw_body.decode("utf-8"))
                    except (json.JSONDecodeError, UnicodeDecodeError):
                        body = None
                else:
                    # Fallback for non-JSON or missing content-type if it happens to be valid JSON
                    try:
                        body = json.loads(raw_body.decode("utf-8"))
                    except:
                        body = raw_body.decode("utf-8", errors="ignore")
                    
            return ParsedRequest(
                method=method,
                path=path,
                query_params=query_params,
                headers=headers,
                cookies=cookies,
                body=body,
                raw_body=raw_body
            )
        except Exception as e:
            if isinstance(e, AttackLensError):
                raise
            raise AttackLensError(f"Failed to parse raw HTTP: {str(e)}")

    @staticmethod
    def parse_json(data: Dict[str, Any]) -> ParsedRequest:
        try:
            return ParsedRequest(
                method=data.get("method", "GET"),
                path=data.get("path", "/"),
                query_params=data.get("query_params", {}),
                headers={k.lower(): v for k, v in data.get("headers", {}).items()},
                cookies=data.get("cookies", {}),
                body=data.get("body"),
                raw_body=str(data.get("body", "")).encode() if data.get("body") else None
            )
        except Exception as e:
            raise AttackLensError(f"Failed to parse JSON request: {str(e)}")
