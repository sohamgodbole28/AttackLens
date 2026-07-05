"""Custom exceptions for AttackLens."""

class AttackLensError(Exception):
    """Base exception for AttackLens."""
    pass

class KnowledgeLoadError(AttackLensError):
    """Raised when there is an error loading knowledge."""
    pass

class DuplicateKnowledgeError(AttackLensError):
    """Raised when duplicate knowledge IDs are detected."""
    pass

class KnowledgeValidationError(AttackLensError):
    """Raised when knowledge fails schema validation."""
    pass

class ConfigurationError(AttackLensError):
    """Raised when there is a configuration error."""
    pass
