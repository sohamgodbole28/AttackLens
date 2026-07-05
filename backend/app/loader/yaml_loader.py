"""YAML loader for knowledge base."""

import yaml
import logging
from pathlib import Path
from pydantic import BaseModel, ValidationError
from typing import Type, Callable, Any, Dict

from app.models.indicator import Indicator
from app.models.rule import Rule
from app.models.vulnerability import Vulnerability
from app.models.checklist import Checklist
from app.models.reference import Reference
from app.loader.registry import registry
from app.exceptions import KnowledgeLoadError, KnowledgeValidationError

logger = logging.getLogger(__name__)

def load_yaml_file(filepath: Path) -> Dict[str, Any]:
    """Load and parse a YAML file."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
            if not isinstance(data, dict):
                raise KnowledgeLoadError(f"File must contain a YAML dictionary: {filepath}")
            return data
    except yaml.YAMLError as e:
        raise KnowledgeLoadError(f"Invalid YAML syntax in {filepath}: {e}")
    except OSError as e:
        raise KnowledgeLoadError(f"Error reading file {filepath}: {e}")

def load_directory(dir_path: Path, model_class: Type[BaseModel], register_func: Callable[[Any], None]) -> None:
    """Load all YAML files from a directory and register them."""
    if not dir_path.exists() or not dir_path.is_dir():
        logger.warning(f"Directory not found: {dir_path}")
        return

    for file_path in dir_path.glob("*.yaml"):
        logger.debug(f"Loading {file_path}")
        data = load_yaml_file(file_path)
        try:
            model_instance = model_class(**data)
            register_func(model_instance)
        except ValidationError as e:
            raise KnowledgeValidationError(f"Validation failed for {file_path}:\n{e}")

def load_knowledge_base(base_path: str) -> None:
    """Load the entire knowledge base from the given path."""
    path = Path(base_path)
    
    logger.info(f"Loading knowledge base from {path}")
    
    load_directory(path / "indicators", Indicator, registry.register_indicator)
    load_directory(path / "rules", Rule, registry.register_rule)
    load_directory(path / "vulnerabilities", Vulnerability, registry.register_vulnerability)
    load_directory(path / "checklists", Checklist, registry.register_checklist)
    load_directory(path / "references", Reference, registry.register_reference)
    
    logger.info("Knowledge base successfully loaded and validated.")
