"""Tests for analyze API."""

from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app
from app.exceptions import AttackLensError

client = TestClient(app)

def test_analyze_raw():
    payload = {
        "format": "raw",
        "data": "GET / HTTP/1.1\r\nHost: example.com\r\n\r\n"
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "parsed_request" in data
    assert data["parsed_request"]["method"] == "GET"

def test_analyze_json():
    payload = {
        "format": "json",
        "data": {
            "method": "POST",
            "path": "/api"
        }
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["parsed_request"]["method"] == "POST"

def test_analyze_invalid_format():
    payload = {
        "format": "unknown",
        "data": ""
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 422 # Pydantic validation error

def test_analyze_logging_unexpected_error():
    with patch("app.api.analyze.RequestParser.parse_raw") as mock_parse:
        mock_parse.side_effect = Exception("Surprise!")
        
        with patch("app.api.analyze.logger") as mock_logger:
            payload = {"format": "raw", "data": "dummy"}
            response = client.post("/analyze", json=payload)
            
            assert response.status_code == 500
            assert response.json()["detail"] == "Internal server error during analysis"
            mock_logger.exception.assert_called_once_with("Unexpected error during analysis")

def test_analyze_logging_attacklens_error():
    with patch("app.api.analyze.RequestParser.parse_raw") as mock_parse:
        mock_parse.side_effect = AttackLensError("Bad data")
        
        with patch("app.api.analyze.logger") as mock_logger:
            payload = {"format": "raw", "data": "dummy"}
            response = client.post("/analyze", json=payload)
            
            assert response.status_code == 400
            assert response.json()["detail"] == "Bad data"
            mock_logger.warning.assert_called_once_with("Analysis failed due to bad request: Bad data")
