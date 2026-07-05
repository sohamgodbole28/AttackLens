"""DetectedIndicator and IndicatorMatch models."""

from pydantic import BaseModel
from typing import List
from app.models.enums import Confidence

class IndicatorMatch(BaseModel):
    """
    Represents one individual match that caused an indicator to be detected.
    """
    matched_rule: str
    matched_location: str
    source: str
    matched_value: str

class DetectedIndicator(BaseModel):
    """
    Represents an indicator that was detected in the request.
    Stores a collection of matches to explain why, where, and what matched.
    """
    id: str
    confidence: Confidence
    matches: List[IndicatorMatch]
