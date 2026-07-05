"""Rule model."""

from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Union

class Rule(BaseModel):
    """
    A knowledge rule that maps detected indicators to a recommended vulnerability test.
    """
    id: str
    name: str
    description: str
    version: Union[str, float]
    enabled: bool
    vulnerability: str
    required_indicators: Optional[List[str]] = None
    optional_indicators: Optional[List[str]] = None
    related_indicators: Optional[List[str]] = None
    weights: Optional[Dict[str, int]] = None
    thresholds: Optional[Dict[str, int]] = None
    recommendation: Optional[Dict[str, Any]] = None
    explanation: Optional[Dict[str, str]] = None
    notes: Optional[List[str]] = None
