"""Tests for configuration."""

import os
from pathlib import Path
from app.config import Settings, BASE_DIR

def test_config_defaults():
    settings = Settings()
    assert settings.DEBUG is False
    assert settings.HOST == "127.0.0.1"
    assert settings.PORT == 8000
    assert settings.KNOWLEDGE_PATH == BASE_DIR / "knowledge"

def test_config_env_vars(monkeypatch):
    monkeypatch.setenv("DEBUG", "True")
    monkeypatch.setenv("PORT", "9000")
    monkeypatch.setenv("KNOWLEDGE_PATH", "/tmp/knowledge")
    
    settings = Settings()
    
    assert settings.DEBUG is True
    assert settings.PORT == 9000
    assert settings.KNOWLEDGE_PATH == Path("/tmp/knowledge")
