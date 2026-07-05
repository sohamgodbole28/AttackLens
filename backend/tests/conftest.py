"""Pytest fixtures."""

import pytest
from fastapi.testclient import TestClient
from pathlib import Path

@pytest.fixture
def test_app():
    from app.main import app
    return app

@pytest.fixture
def client(test_app):
    return TestClient(test_app)

@pytest.fixture
def mock_knowledge_dir(tmp_path):
    knowledge_dir = tmp_path / "knowledge"
    for subdir in ["indicators", "rules", "vulnerabilities", "checklists", "references"]:
        (knowledge_dir / subdir).mkdir(parents=True)
    return knowledge_dir
