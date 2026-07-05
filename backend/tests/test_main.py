"""Tests for FastAPI app."""

import pytest
from app.exceptions import AttackLensError

def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
