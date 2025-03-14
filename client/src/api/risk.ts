import { apiRequest } from "@/lib/queryClient";

export interface RiskProfileData {
  age: number;
  investment_horizon: number;
  risk_tolerance: number;
  emergency_fund: number;
  income_stability: number;
}

export interface AssetAllocation {
  equities: number;
  fixed_income: number;
  gold: number;
  cash: number;
}

export interface RiskAnalysisResult {
  risk_score: number;
  risk_category: string;
  asset_allocation: AssetAllocation;
  recommendations: string[];
}

/**
 * Analyze user's risk profile
 * @param data Risk profile data
 * @returns Risk analysis results
 */
export async function analyzeRiskProfile(data: RiskProfileData): Promise<RiskAnalysisResult> {
  const response = await apiRequest("POST", "/api/risk/analyze", data);
  return await response.json();
}

/**
 * Get latest risk analysis results
 * @returns Latest risk analysis or null if none exists
 */
export async function getLatestRiskAnalysis(): Promise<RiskAnalysisResult | null> {
  try {
    const response = await apiRequest("GET", "/api/risk/latest");
    return await response.json();
  } catch (error) {
    // Return null if no risk analysis found (404)
    return null;
  }
}