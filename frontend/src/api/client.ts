import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export interface AnalyzeRequest {
  format: "raw" | "json";
  data: string | Record<string, any>;
}

export interface ParsedRequest {
  method: string;
  path: string;
  query_params: Record<string, any>;
  headers: Record<string, string>;
  cookies: Record<string, string>;
  body: any;
}

export interface Match {
  matched_rule: string;
  matched_location: string;
  source: string;
  matched_value: string;
}

export interface DetectedIndicator {
  id: string;
  confidence: "low" | "medium" | "high" | "critical";
  matches: Match[];
}

export interface ScoreContribution {
  indicator: string;
  points: number;
}

export interface RuleResult {
  rule_id: string;
  vulnerability: string;
  confidence: "low" | "medium" | "high" | "critical";
  score: number;
  explanation: string;
  matched_indicators: string[];
  score_breakdown: ScoreContribution[];
}

export interface Recommendation {
  vulnerability: string;
  score: number;
  confidence: "low" | "medium" | "high" | "critical";
  explanation?: string;
  checklist_identifier?: string;
  reference_identifier?: string;
}

export interface AnalyzeResponse {
  parsed_request: ParsedRequest;
  detected_indicators: DetectedIndicator[];
  rule_results: RuleResult[];
  recommendations: Recommendation[];
}

export const analyzeRequest = async (payload: AnalyzeRequest): Promise<AnalyzeResponse> => {
  const response = await apiClient.post<AnalyzeResponse>("/analyze", payload);
  return response.data;
};
