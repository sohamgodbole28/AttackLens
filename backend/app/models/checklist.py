"""Checklist model."""

from pydantic import BaseModel
from typing import List, Union
from app.models.enums import Priority

class ChecklistTest(BaseModel):
    """A single manual test case within a checklist."""
    id: str
    priority: Priority
    title: str
    objective: str
    expected: str

class ChecklistCategory(BaseModel):
    """A category grouping multiple checklist tests."""
    name: str
    tests: List[ChecklistTest]

class Checklist(BaseModel):
    """
    A manual testing checklist for a specific vulnerability.
    """
    vulnerability: str
    version: Union[str, float]
    categories: List[ChecklistCategory]
