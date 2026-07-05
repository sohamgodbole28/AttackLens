"""Analyze API Endpoint."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Union, Dict, Any, List
from enum import Enum
from app.engine.parser import RequestParser
from app.engine.detector import IndicatorDetector
from app.engine.rule_engine import RuleEngine
from app.engine.recommendation_engine import RecommendationEngine
from app.models.analysis_context import AnalysisContext
from app.models.parsed_request import ParsedRequest
from app.models.detected_indicator import DetectedIndicator
from app.models.rule_result import RuleResult
from app.models.recommendation import Recommendation
from app.loader.registry import registry
from app.exceptions import AttackLensError
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class RequestFormat(str, Enum):
    RAW = "raw"
    JSON = "json"

class AnalyzeRequest(BaseModel):
    format: RequestFormat
    data: Union[str, Dict[str, Any]]

class AnalyzeResponse(BaseModel):
    parsed_request: ParsedRequest
    detected_indicators: List[DetectedIndicator]
    rule_results: List[RuleResult]
    recommendations: List[Recommendation]

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    """
    Analyzes an incoming HTTP request and returns structured recommendations.
    """
    try:
        # 1. Parse Request
        if request.format == RequestFormat.RAW:
            if not isinstance(request.data, str):
                raise AttackLensError("Data must be a string for 'raw' format")
            parsed_req = RequestParser.parse_raw(request.data)
        elif request.format == RequestFormat.JSON:
            if not isinstance(request.data, dict):
                raise AttackLensError("Data must be a dictionary for 'json' format")
            parsed_req = RequestParser.parse_json(request.data)
        else:
            raise AttackLensError("Unsupported format")

        # 2. Check for empty request
        is_empty = (
            parsed_req.method == "GET" and
            parsed_req.path == "/" and
            not parsed_req.headers and
            not parsed_req.cookies and
            not parsed_req.query_params and
            not parsed_req.body
        )
        if is_empty:
            return AnalyzeResponse(
                parsed_request=parsed_req,
                detected_indicators=[],
                rule_results=[],
                recommendations=[]
            )

        # 3. Analysis Context
        context = AnalysisContext(
            parsed_request=parsed_req,
            registry=registry
        )

        # 3. Indicator Detector
        context.detected_indicators = IndicatorDetector.detect(context)

        # 4. Rule Engine
        rule_results = RuleEngine.evaluate(context)

        # 5. Recommendation Engine
        recommendations = RecommendationEngine.generate(rule_results)

        return AnalyzeResponse(
            parsed_request=context.parsed_request,
            detected_indicators=context.detected_indicators,
            rule_results=rule_results,
            recommendations=recommendations
        )
    except AttackLensError as e:
        logger.warning(f"Analysis failed due to bad request: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Unexpected error during analysis")
        raise HTTPException(status_code=500, detail="Internal server error during analysis")


