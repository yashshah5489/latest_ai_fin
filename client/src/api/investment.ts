import { apiRequest } from "@/lib/queryClient";

export interface Investment {
  id: string;
  name: string;
  type: string;
  value: number;
  allocation: number;
  return: number;
  riskLevel: string;
  icon: string;
}

export interface PortfolioSummary {
  portfolio_value: number;
  value_change: number;
  annual_return: number;
  benchmark_diff: number;
  dividend_income: number;
  last_payment_date: string;
}

/**
 * Fetch user investments
 */
export async function fetchInvestments(): Promise<Investment[]> {
  const response = await apiRequest("GET", "/api/investments");
  return await response.json();
}

/**
 * Fetch portfolio summary
 */
export async function fetchPortfolioSummary(): Promise<PortfolioSummary> {
  const response = await apiRequest("GET", "/api/investments/summary");
  return await response.json();
}

/**
 * Import investments from Excel file
 */
export async function importInvestments(formData: FormData): Promise<{success: boolean, message: string}> {
  const response = await apiRequest("POST", "/api/investments/import", formData, {
    isFormData: true,
  });
  return await response.json();
}