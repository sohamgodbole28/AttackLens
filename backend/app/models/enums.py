"""Enumerations for the AttackLens knowledge base."""

from enum import Enum

class Confidence(str, Enum):
    """Confidence level of a finding or indicator."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Severity(str, Enum):
    """Severity of a vulnerability."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class Priority(str, Enum):
    """Priority level for manual checklist testing."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"
