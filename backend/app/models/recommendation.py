"""Recommendation model."""

from pydantic import BaseModel
from typing import Optional
from app.models.enums import Confidence

class Recommendation(BaseModel):
    """
    The initial recommendation model returned by the recommendation engine.
    """
    vulnerability: str
    score: int
    confidence: Confidence
    explanation: Optional[str] = None
    checklist_identifier: Optional[str] = None
    reference_identifier: Optional[str] = None
