"""Tests for YAML loader and registry."""

import pytest
import yaml
from pathlib import Path
from app.loader.yaml_loader import load_knowledge_base
from app.loader.registry import registry
from app.exceptions import KnowledgeLoadError, KnowledgeValidationError, DuplicateKnowledgeError

@pytest.fixture(autouse=True)
def reset_registry():
    """Reset the registry before each test."""
    registry.indicators = {}
    registry.rules = {}
    registry.vulnerabilities = {}
    registry.checklists = {}
    registry.references = {}

def create_yaml_file(path: Path, content: dict):
    with open(path, "w", encoding="utf-8") as f:
        yaml.dump(content, f)

def test_load_valid_knowledge(mock_knowledge_dir):
    # Create valid indicator
    ind_data = {
        "id": "test_ind", "name": "Test", "description": "Test",
        "version": "1.0", "category": "test", "confidence": "high",
        "priority": 100, "detection": {}
    }
    create_yaml_file(mock_knowledge_dir / "indicators" / "test.yaml", ind_data)
    
    # Load knowledge base
    load_knowledge_base(str(mock_knowledge_dir))
    
    assert "test_ind" in registry.indicators
    assert registry.indicators["test_ind"].name == "Test"

def test_load_invalid_yaml_syntax(mock_knowledge_dir):
    bad_yaml_file = mock_knowledge_dir / "indicators" / "bad.yaml"
    with open(bad_yaml_file, "w", encoding="utf-8") as f:
        f.write("unclosed_string: '")
        
    with pytest.raises(KnowledgeLoadError) as exc:
        load_knowledge_base(str(mock_knowledge_dir))
    assert "Invalid YAML syntax" in str(exc.value)

def test_load_invalid_schema(mock_knowledge_dir):
    ind_data = {
        "id": "test_ind"
        # missing required fields
    }
    create_yaml_file(mock_knowledge_dir / "indicators" / "bad_schema.yaml", ind_data)
    
    with pytest.raises(KnowledgeValidationError) as exc:
        load_knowledge_base(str(mock_knowledge_dir))
    assert "Validation failed" in str(exc.value)

def test_load_duplicate_id(mock_knowledge_dir):
    ind_data = {
        "id": "duplicate_id", "name": "Test", "description": "Test",
        "version": "1.0", "category": "test", "confidence": "high",
        "priority": 100, "detection": {}
    }
    create_yaml_file(mock_knowledge_dir / "indicators" / "test1.yaml", ind_data)
    create_yaml_file(mock_knowledge_dir / "indicators" / "test2.yaml", ind_data)
    
    with pytest.raises(DuplicateKnowledgeError) as exc:
        load_knowledge_base(str(mock_knowledge_dir))
    assert "Duplicate knowledge ID detected" in str(exc.value)
