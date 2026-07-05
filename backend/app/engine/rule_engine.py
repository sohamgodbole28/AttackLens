"""Rule Engine."""

from typing import List
from app.models.analysis_context import AnalysisContext
from app.models.rule_result import RuleResult, ScoreContribution
from app.models.enums import Confidence

class RuleEngine:
    """Evaluates rules against detected indicators."""
    
    @staticmethod
    def evaluate(context: AnalysisContext) -> List[RuleResult]:
        results = []
        detected_ids = {ind.id for ind in context.detected_indicators}
        
        for rule in context.registry.rules.values():
            if not rule.enabled:
                continue
                
            # Verify required indicators
            if rule.required_indicators:
                missing = [req for req in rule.required_indicators if req not in detected_ids]
                if missing:
                    continue
            
            score = 0
            breakdown: List[ScoreContribution] = []
            matched_indicators = []
            
            # Check weights for any detected indicator
            if rule.weights:
                for ind_id, weight in rule.weights.items():
                    if ind_id in detected_ids:
                        score += weight
                        matched_indicators.append(ind_id)
                        breakdown.append(ScoreContribution(indicator=ind_id, points=weight))
                        
            # Clamp score between 0 and 100
            score = max(0, min(100, score))
            
            if score == 0:
                continue
                        
            # Determine confidence based on thresholds
            confidence = Confidence.LOW
            if rule.thresholds:
                if score >= rule.thresholds.get("high", 100):
                    confidence = Confidence.HIGH
                elif score >= rule.thresholds.get("medium", 50):
                    confidence = Confidence.MEDIUM
            else:
                # Default if no thresholds provided
                confidence = Confidence.MEDIUM
                
            explanation = ""
            if rule.explanation and confidence.value in rule.explanation:
                explanation = rule.explanation[confidence.value]
            elif rule.description:
                explanation = rule.description
                
            results.append(RuleResult(
                rule_id=rule.id,
                vulnerability=rule.vulnerability,
                score=score,
                confidence=confidence,
                matched_indicators=matched_indicators,
                score_breakdown=breakdown,
                explanation=explanation
            ))
            
        return results
