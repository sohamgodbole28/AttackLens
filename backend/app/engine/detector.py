"""Indicator Detector."""

import re
from typing import List
from app.models.analysis_context import AnalysisContext
from app.models.detected_indicator import DetectedIndicator, IndicatorMatch

class IndicatorDetector:
    """Evaluates the ParsedRequest against all indicators in the registry."""
    
    @staticmethod
    def _add_match(matches: List[IndicatorMatch], rule: str, location: str, source: str, value: str) -> None:
        """Helper to append an IndicatorMatch to the list."""
        matches.append(IndicatorMatch(
            matched_rule=rule,
            matched_location=location,
            source=source,
            matched_value=value
        ))

    @staticmethod
    def detect(context: AnalysisContext) -> List[DetectedIndicator]:
        """Detect all matching indicators in the request."""
        detected = []
        req = context.parsed_request
        
        for indicator in context.registry.indicators.values():
            matches: List[IndicatorMatch] = []
            detection_rules = indicator.detection
            
            # Check headers
            if "headers" in detection_rules:
                for header_key, expected_values in detection_rules["headers"].items():
                    actual_val = req.headers.get(header_key.lower())
                    if actual_val:
                        for expected in expected_values:
                            if expected == "*" or expected.lower() in actual_val.lower():
                                IndicatorDetector._add_match(matches, "headers", "header", header_key, actual_val)
            
            # Check cookies
            if "cookies" in detection_rules:
                for cookie_name in detection_rules["cookies"]:
                    if cookie_name in req.cookies:
                        IndicatorDetector._add_match(matches, "cookies", "cookie", cookie_name, req.cookies[cookie_name])
            
            # Check query parameters
            if "parameters" in detection_rules:
                for param in detection_rules["parameters"]:
                    if param in req.query_params:
                        IndicatorDetector._add_match(matches, "parameters", "query_parameter", param, req.query_params[param])
                        
            # Check body keys
            if "body_keys" in detection_rules and isinstance(req.body, dict):
                for key in detection_rules["body_keys"]:
                    if key in req.body:
                        IndicatorDetector._add_match(matches, "body_keys", "body", key, str(req.body[key]))
                        
            # Check multipart_field_names
            if "multipart_field_names" in detection_rules and isinstance(req.body, dict):
                for key in detection_rules["multipart_field_names"]:
                    if key in req.body:
                        IndicatorDetector._add_match(matches, "multipart_field_names", "body", key, str(req.body[key]))
                        
            # Check content_types
            if "content_types" in detection_rules:
                ct_header = req.headers.get("content-type", "")
                if ct_header:
                    actual_ct = ct_header.split(";")[0].strip().lower()
                    for expected_ct in detection_rules["content_types"]:
                        if actual_ct == expected_ct.lower():
                            IndicatorDetector._add_match(matches, "content_types", "header", "content-type", actual_ct)
                            
            # Check multipart_headers
            if "multipart_headers" in detection_rules:
                for expected_substr in detection_rules["multipart_headers"]:
                    for header_key, header_val in req.headers.items():
                        if expected_substr.lower() in header_val.lower():
                            IndicatorDetector._add_match(matches, "multipart_headers", "header", header_key, header_val)
            
            # Check path segments
            if "path_segments" in detection_rules:
                segments = req.path.strip("/").split("/")
                for expected_segment in detection_rules["path_segments"]:
                    if expected_segment in segments:
                        IndicatorDetector._add_match(matches, "path_segments", "path", "path", expected_segment)
                        
            # Check endpoint_keywords
            if "endpoint_keywords" in detection_rules:
                segments = req.path.strip("/").split("/")
                for keyword in detection_rules["endpoint_keywords"]:
                    if keyword in segments:
                        IndicatorDetector._add_match(matches, "endpoint_keywords", "path", "path", keyword)
                        
            # Check value_patterns
            if "value_patterns" in detection_rules:
                all_values = []
                # path segments
                all_values.extend([s for s in req.path.strip("/").split("/") if s])
                # query values
                all_values.extend(req.query_params.values())
                # body values
                if isinstance(req.body, dict):
                    all_values.extend([str(v) for v in req.body.values()])
                elif isinstance(req.body, str) and req.body:
                    all_values.append(req.body)
                    
                for pattern_type, regex_list in detection_rules["value_patterns"].items():
                    for regex_str in regex_list:
                        try:
                            pattern = re.compile(regex_str)
                            for val in all_values:
                                if pattern.search(str(val)):
                                    IndicatorDetector._add_match(matches, "value_patterns", pattern_type, "value", str(val))
                        except re.error:
                            pass
                        
            if matches:
                detected.append(DetectedIndicator(
                    id=indicator.id,
                    confidence=indicator.confidence,
                    matches=matches
                ))
                
        return detected
