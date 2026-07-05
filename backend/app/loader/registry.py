"""Knowledge registry."""

from typing import Dict, Any
import logging
from app.models.indicator import Indicator
from app.models.rule import Rule
from app.models.vulnerability import Vulnerability
from app.models.checklist import Checklist
from app.models.reference import Reference
from app.exceptions import DuplicateKnowledgeError

logger = logging.getLogger(__name__)

class KnowledgeRegistry:
    """Stores all validated knowledge objects in memory."""
    
    def __init__(self) -> None:
        self.indicators: Dict[str, Indicator] = {}
        self.rules: Dict[str, Rule] = {}
        self.vulnerabilities: Dict[str, Vulnerability] = {}
        self.checklists: Dict[str, Checklist] = {}
        self.references: Dict[str, Reference] = {}
        
    def _register(self, collection: dict, item: Any, id_key: str) -> None:
        """Register an item into a specific collection."""
        item_id = getattr(item, id_key)
        if item_id in collection:
            raise DuplicateKnowledgeError(f"Duplicate knowledge ID detected: {item_id}")
        collection[item_id] = item

    def register_indicator(self, indicator: Indicator) -> None:
        """Register an indicator."""
        self._register(self.indicators, indicator, "id")

    def register_rule(self, rule: Rule) -> None:
        """Register a rule."""
        self._register(self.rules, rule, "id")

    def register_vulnerability(self, vulnerability: Vulnerability) -> None:
        """Register a vulnerability."""
        self._register(self.vulnerabilities, vulnerability, "id")

    def register_checklist(self, checklist: Checklist) -> None:
        """Register a checklist."""
        self._register(self.checklists, checklist, "vulnerability")

    def register_reference(self, reference: Reference) -> None:
        """Register a reference."""
        self._register(self.references, reference, "vulnerability")

registry = KnowledgeRegistry()
