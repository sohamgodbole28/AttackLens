"""Recommendation Engine."""

from typing import List
from app.models.rule_result import RuleResult
from app.models.recommendation import Recommendation
from app.loader.registry import registry

class RecommendationEngine:
    """Generates recommendations from rule results."""
    
    @staticmethod
    def generate(rule_results: List[RuleResult]) -> List[Recommendation]:
        recommendations = []
        
        for result in rule_results:
            rule = registry.rules.get(result.rule_id)
            
            # Check if checklist exists
            checklist_id = None
            if result.vulnerability in registry.checklists:
                checklist_id = result.vulnerability
                
            # Check if reference exists
            reference_id = None
            if result.vulnerability in registry.references:
                reference_id = result.vulnerability
                
            recommendations.append(Recommendation(
                vulnerability=result.vulnerability,
                score=result.score,
                confidence=result.confidence,
                explanation=result.explanation,
                checklist_identifier=checklist_id,
                reference_identifier=reference_id
            ))
            
        return recommendations
