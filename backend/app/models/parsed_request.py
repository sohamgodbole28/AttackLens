"""ParsedRequest model."""

from pydantic import BaseModel
from typing import Dict, Optional, Any

class ParsedRequest(BaseModel):
    """
    The canonical normalized representation of every incoming request.
    
    Regardless of whether the input originates from raw HTTP, JSON,
    Burp Suite, Postman, etc., it must be parsed into this model.
    """
    method: str
    path: str
    query_params: Dict[str, str] = {}
    headers: Dict[str, str] = {}
    cookies: Dict[str, str] = {}
    body: Optional[Any] = None
    raw_body: Optional[bytes] = None
