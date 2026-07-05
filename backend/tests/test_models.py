"""Tests for Pydantic models."""

import pytest
from pydantic import ValidationError
from app.models import Indicator, Rule, Vulnerability
from app.models.enums import Confidence, Severity

def test_indicator_valid():
    data = {
        "id": "test_indicator",
        "name": "Test Indicator",
        "description": "A test indicator.",
        "version": "1.0",
        "category": "test",
        "confidence": "high",
        "priority": 100,
        "detection": {"headers": {"X-Test": ["*"]}}
    }
    indicator = Indicator(**data)
    assert indicator.id == "test_indicator"
    assert indicator.priority == 100
    assert indicator.confidence == Confidence.HIGH

def test_indicator_missing_required_field():
    data = {
        "id": "test_indicator",
        "name": "Test Indicator"
        # missing other fields
    }
    with pytest.raises(ValidationError):
        Indicator(**data)

def test_rule_valid():
    data = {
        "id": "test_rule",
        "name": "Test Rule",
        "description": "A test rule.",
        "version": "1.0",
        "enabled": True,
        "vulnerability": "test_vuln",
        "required_indicators": ["test_indicator"]
    }
    rule = Rule(**data)
    assert rule.enabled is True
    assert rule.vulnerability == "test_vuln"

def test_vulnerability_valid():
    data = {
        "id": "test_vuln",
        "name": "Test Vulnerability",
        "description": "Test.",
        "version": "1.0",
        "category": "test",
        "severity": "high",
        "confidence": "high",
        "owasp": {"top10": ["A01:2021"]}
    }
    vuln = Vulnerability(**data)
    assert vuln.owasp.top10 == ["A01:2021"]
    assert vuln.severity == Severity.HIGH
