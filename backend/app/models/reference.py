"""Reference model."""

from pydantic import BaseModel
from typing import List, Dict, Optional, Union

class ReferenceResource(BaseModel):
    """A single external resource for a vulnerability."""
    source: str
    title: str
    type: Optional[str] = None
    authors: Optional[List[str]] = None

class Reference(BaseModel):
    """
    References and external links for a specific vulnerability.
    """
    vulnerability: str
    version: Union[str, float]
    resources: Dict[str, List[ReferenceResource]]
    notes: Optional[List[str]] = None
