"""Indicator model."""

from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Union
from app.models.enums import Confidence

class Indicator(BaseModel):
    """
    An observable indicator inside an HTTP request or response.
    """
    id: str
    name: str
    description: str
    version: Union[str, float]
    category: str
    confidence: Confidence
    priority: int
    detection: Dict[str, Any]
    examples: Optional[Dict[str, Any]] = None
    notes: Optional[List[str]] = None
