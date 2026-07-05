"""AnalysisContext model."""

from pydantic import BaseModel
from typing import List, Any
from app.models.parsed_request import ParsedRequest
from app.models.detected_indicator import DetectedIndicator

class AnalysisContext(BaseModel):
    """
    Lightweight model that flows through the engine after parsing.
    """
    parsed_request: ParsedRequest
    detected_indicators: List[DetectedIndicator] = []
    registry: Any  # Reference to KnowledgeRegistry without circular imports
