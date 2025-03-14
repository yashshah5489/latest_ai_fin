import { apiRequest } from "@/lib/queryClient";

export interface Investment {
  id: string;
  name: string;
  type: string;
  value: number;
  allocation: number;
  return: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  icon: string;
}

export interface PortfolioSummary {
  portfolioValue: number;
  valueChange: number;
  annualReturn: number;
  benchmarkDiff: number;
  dividendIncome: number;
  lastPaymentDate: string;
}

export async function fetchInvestments(): Promise<Investment[]> {
  const res = await apiRequest('GET', '/api/investments');
  if (!res.ok) {
    throw new Error('Failed to fetch investments');
  }
  return res.json();
}

export async function fetchPortfolioSummary(): Promise<PortfolioSummary> {
  const res = await apiRequest('GET', '/api/investments/summary');
  if (!res.ok) {
    throw new Error('Failed to fetch portfolio summary');
  }
  return res.json();
}

export async function importInvestmentData(formData: FormData): Promise<{ success: boolean; message: string }> {
  const res = await apiRequest('POST', '/api/investments/import', formData, {
    isFormData: true,
  });
  
  return res.json();
}
