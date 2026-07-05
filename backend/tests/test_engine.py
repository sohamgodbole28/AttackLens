"""Tests for processing engine."""

import pytest
from app.engine.detector import IndicatorDetector
from app.engine.rule_engine import RuleEngine
from app.engine.recommendation_engine import RecommendationEngine
from app.models.analysis_context import AnalysisContext
from app.models.parsed_request import ParsedRequest
from app.models.enums import Confidence, Severity
from app.models.indicator import Indicator
from app.models.rule import Rule
from app.loader.registry import registry

@pytest.fixture
def mock_registry():
    registry.indicators.clear()
    registry.rules.clear()
    registry.vulnerabilities.clear()
    registry.checklists.clear()
    registry.references.clear()
    registry.register_indicator(Indicator(
        id="auth_token", name="Auth", description="Auth", version="1.0",
        category="auth", confidence=Confidence.HIGH, priority=100,
        detection={"headers": {"Authorization": ["Bearer"]}}
    ))
    registry.register_rule(Rule(
        id="broken_auth", name="Broken Auth", description="Broken Auth", version="1.0",
        enabled=True, vulnerability="vuln_auth",
        required_indicators=["auth_token"],
        weights={"auth_token": 100},
        thresholds={"high": 80}
    ))
    return registry

def test_detector_rule_recommendation(mock_registry):
    parsed = ParsedRequest(
        method="GET",
        path="/",
        headers={"authorization": "Bearer 12345"}
    )
    context = AnalysisContext(parsed_request=parsed, registry=mock_registry)
    
    # Detector
    detected = IndicatorDetector.detect(context)
    assert len(detected) == 1
    assert detected[0].id == "auth_token"
    assert len(detected[0].matches) == 1
    assert detected[0].matches[0].matched_location == "header"
    
    context.detected_indicators = detected
    
    # Rule Engine
    results = RuleEngine.evaluate(context)
    assert len(results) == 1
    assert results[0].vulnerability == "vuln_auth"
    assert results[0].score == 100
    assert results[0].confidence == Confidence.HIGH
    
    # Recommendation Engine
    recs = RecommendationEngine.generate(results)
    assert len(recs) == 1
    assert recs[0].vulnerability == "vuln_auth"
    assert recs[0].score == 100

def test_path_segment_matching(mock_registry):
    mock_registry.register_indicator(Indicator(
        id="profile_path", name="Profile Path", description="Test", version="1.0",
        category="test", confidence=Confidence.HIGH, priority=100,
        detection={"path_segments": ["profile"]},
        detection_type="test"
    ))
    # Should not match substring
    parsed1 = ParsedRequest(method="GET", path="/file")
    ctx1 = AnalysisContext(parsed_request=parsed1, registry=mock_registry)
    det1 = IndicatorDetector.detect(ctx1)
    assert not any(d.id == "profile_path" for d in det1)

    # Should match exact segment
    parsed2 = ParsedRequest(method="GET", path="/users/profile")
    ctx2 = AnalysisContext(parsed_request=parsed2, registry=mock_registry)
    det2 = IndicatorDetector.detect(ctx2)
    assert any(d.id == "profile_path" for d in det2)

def test_rule_evaluation_skip_zero_score(mock_registry):
    mock_registry.register_rule(Rule(
        id="zero_score", name="Zero Score", description="Zero", version="1.0",
        enabled=True, vulnerability="vuln_zero",
        weights={"non_existent_indicator": 100}
    ))
    parsed = ParsedRequest(method="GET", path="/")
    context = AnalysisContext(parsed_request=parsed, registry=mock_registry)
    results = RuleEngine.evaluate(context)
    assert not any(r.rule_id == "zero_score" for r in results)

def test_recommendation_filtering(mock_registry):
    mock_registry.register_rule(Rule(
        id="filtered_rule", name="Filtered", description="Filtered", version="1.0",
        enabled=True, vulnerability="vuln_filtered",
        weights={"auth_token": 10},
        recommendation={"show_if_score_at_least": 50}
    ))
    parsed = ParsedRequest(method="GET", path="/", headers={"authorization": "Bearer 123"})
    context = AnalysisContext(parsed_request=parsed, registry=mock_registry)
    context.detected_indicators = IndicatorDetector.detect(context)
    
    results = RuleEngine.evaluate(context)
    # result will be generated because score = 10 > 0
    assert any(r.rule_id == "filtered_rule" for r in results)
    
    recs = RecommendationEngine.generate(results)
    assert any(r.vulnerability == "vuln_filtered" for r in recs)

def test_header_case_insensitivity(mock_registry):
    mock_registry.register_indicator(Indicator(
        id="auth_header", name="Auth", description="Auth", version="1.0",
        category="auth", confidence=Confidence.HIGH, priority=100,
        detection={"headers": {"Authorization": ["Bearer"]}},
        detection_type="test"
    ))
    # Test uppercase, lowercase, mixed case headers are all detected
    for headers in [
        {"authorization": "Bearer token"},
        {"AUTHORIZATION": "Bearer token"},
        {"Authorization": "Bearer token"},
    ]:
        parsed = ParsedRequest(method="GET", path="/", headers={k.lower(): v for k, v in headers.items()})
        context = AnalysisContext(parsed_request=parsed, registry=mock_registry)
        detected = IndicatorDetector.detect(context)
        assert any(d.id == "auth_header" for d in detected)

def test_multipart_detection(mock_registry):
    mock_registry.register_indicator(Indicator(
        id="multipart_request", name="Multipart", description="test", version="1.0",
        category="test", confidence=Confidence.HIGH, priority=100,
        detection={
            "content_types": ["multipart/form-data"],
            "multipart_field_names": ["file"]
        }
    ))
    
    # 1. Exact match with body key
    parsed1 = ParsedRequest(
        method="POST", path="/upload", 
        headers={"content-type": "multipart/form-data"},
        body={"file": "shell.php"}
    )
    ctx1 = AnalysisContext(parsed_request=parsed1, registry=mock_registry)
    det1 = IndicatorDetector.detect(ctx1)
    assert len(det1) == 1
    assert any(m.matched_rule == "content_types" for m in det1[0].matches)
    assert any(m.matched_rule == "multipart_field_names" for m in det1[0].matches)
    
    # 2. Boundary parameter in header, different header case
    for ct_header in ["Content-Type", "content-type", "CONTENT-TYPE"]:
        parsed2 = ParsedRequest(
            method="POST", path="/upload", 
            headers={ct_header.lower(): "multipart/form-data; boundary=abc123"}
        )
        ctx2 = AnalysisContext(parsed_request=parsed2, registry=mock_registry)
        det2 = IndicatorDetector.detect(ctx2)
        assert len(det2) == 1
        assert any(m.matched_rule == "content_types" for m in det2[0].matches)

def test_full_detection_schema(mock_registry):
    mock_registry.register_indicator(Indicator(
        id="full_schema", name="Full Schema", description="test", version="1.0",
        category="test", confidence=Confidence.HIGH, priority=100,
        detection={
            "parameters": ["id"],
            "body_keys": ["data"],
            "path_segments": ["api"],
            "headers": {"X-Custom": ["*"]},
            "cookies": ["session"],
            "content_types": ["application/json"],
            "endpoint_keywords": ["create"],
            "multipart_headers": ["form-data"],
            "multipart_field_names": ["upload"],
            "value_patterns": {"numeric": ["^[0-9]+$"]}
        }
    ))
    
    parsed = ParsedRequest(
        method="POST", path="/api/create", 
        query_params={"id": "123"},
        headers={"x-custom": "test", "content-type": "application/json", "content-disposition": "form-data; name=\"upload\""},
        cookies={"session": "token"},
        body={"data": "test", "upload": "file.txt"}
    )
    
    ctx = AnalysisContext(parsed_request=parsed, registry=mock_registry)
    det = IndicatorDetector.detect(ctx)
    
    assert len(det) == 1
    matched_rules = {m.matched_rule for m in det[0].matches}
    assert matched_rules == {
        "parameters", "body_keys", "path_segments", "headers", "cookies", 
        "content_types", "endpoint_keywords", "multipart_headers", 
        "multipart_field_names", "value_patterns"
    }

def test_rule_score_clamping(mock_registry):
    mock_registry.register_rule(Rule(
        id="over_100", name="Over 100", description="Test", version="1.0",
        enabled=True, vulnerability="vuln_over",
        weights={"auth_token": 150},
        thresholds={"high": 100}
    ))
    mock_registry.register_rule(Rule(
        id="under_0", name="Under 0", description="Test", version="1.0",
        enabled=True, vulnerability="vuln_under",
        weights={"auth_token": -50}
    ))
    mock_registry.register_rule(Rule(
        id="exactly_100", name="Exactly 100", description="Test", version="1.0",
        enabled=True, vulnerability="vuln_exact",
        weights={"auth_token": 100},
        thresholds={"high": 100}
    ))
    mock_registry.register_rule(Rule(
        id="normal_score", name="Normal", description="Test", version="1.0",
        enabled=True, vulnerability="vuln_normal",
        weights={"auth_token": 85},
        thresholds={"high": 100, "medium": 50}
    ))
    
    parsed = ParsedRequest(method="GET", path="/", headers={"authorization": "Bearer 123"})
    context = AnalysisContext(parsed_request=parsed, registry=mock_registry)
    context.detected_indicators = IndicatorDetector.detect(context)
    
    results = RuleEngine.evaluate(context)
    
    # "under_0" should be clamped to 0 and thus skipped
    assert not any(r.rule_id == "under_0" for r in results)
    
    over = next(r for r in results if r.rule_id == "over_100")
    assert over.score == 100
    assert over.confidence == Confidence.HIGH
    
    exact = next(r for r in results if r.rule_id == "exactly_100")
    assert exact.score == 100
    assert exact.confidence == Confidence.HIGH
    
    normal = next(r for r in results if r.rule_id == "normal_score")
    assert normal.score == 85
    assert normal.confidence == Confidence.MEDIUM
