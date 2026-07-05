"""RuleResult model."""

from pydantic import BaseModel
from typing import List, Optional
from app.models.enums import Confidence

class ScoreContribution(BaseModel):
    """A breakdown of how much an indicator contributed to the score."""
    indicator: str
    points: int

class RuleResult(BaseModel):
    """
    Result of a rule evaluation by the RuleEngine.
    """
    rule_id: str
    vulnerability: str
    score: int
    confidence: Confidence
    matched_indicators: List[str]
    score_breakdown: List[ScoreContribution]
    explanation: str
