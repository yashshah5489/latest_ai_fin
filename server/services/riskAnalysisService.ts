interface RiskProfileData {
  age: number;
  investmentHorizon: number;
  riskTolerance: number;
  emergencyFund: number;
  incomeStability: number;
}

interface RiskAnalysisResult {
  riskScore: number;
  riskCategory: string;
  assetAllocation: {
    equities: number;
    fixedIncome: number;
    gold: number;
    cash: number;
  };
  recommendations: string[];
}

class RiskAnalysisService {
  async analyzeRiskProfile(data: RiskProfileData): Promise<RiskAnalysisResult> {
    try {
      // Calculate risk score based on input parameters
      const ageScore = this.calculateAgeScore(data.age);
      const horizonScore = this.calculateHorizonScore(data.investmentHorizon);
      const toleranceScore = data.riskTolerance; // Already on a 0-100 scale
      const emergencyScore = this.calculateEmergencyScore(data.emergencyFund);
      const stabilityScore = data.incomeStability; // Already on a 0-100 scale
      
      // Calculate weighted average for risk score
      const riskScore = Math.round(
        (ageScore * 0.15) +
        (horizonScore * 0.25) +
        (toleranceScore * 0.3) +
        (emergencyScore * 0.15) +
        (stabilityScore * 0.15)
      );
      
      // Determine risk category
      const riskCategory = this.getRiskCategory(riskScore);
      
      // Generate asset allocation recommendation
      const assetAllocation = this.generateAssetAllocation(riskScore);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(data, riskScore, riskCategory);
      
      return {
        riskScore,
        riskCategory,
        assetAllocation,
        recommendations
      };
    } catch (error) {
      console.error("Error analyzing risk profile:", error);
      throw new Error("Failed to analyze risk profile");
    }
  }

  private calculateAgeScore(age: number): number {
    // Younger investors can take more risk
    if (age <= 30) return 90;
    if (age <= 40) return 75;
    if (age <= 50) return 60;
    if (age <= 60) return 40;
    return 20; // Over 60
  }

  private calculateHorizonScore(years: number): number {
    // Longer investment horizon allows for more risk
    if (years >= 20) return 90;
    if (years >= 15) return 80;
    if (years >= 10) return 70;
    if (years >= 5) return 50;
    if (years >= 3) return 30;
    return 10; // Less than 3 years
  }

  private calculateEmergencyScore(months: number): number {
    // More emergency funds allow for more investment risk
    if (months >= 12) return 90;
    if (months >= 9) return 80;
    if (months >= 6) return 60;
    if (months >= 3) return 40;
    return 20; // Less than 3 months
  }

  private getRiskCategory(score: number): string {
    if (score >= 80) return "Aggressive";
    if (score >= 60) return "Moderately Aggressive";
    if (score >= 40) return "Moderate";
    if (score >= 20) return "Moderately Conservative";
    return "Conservative";
  }

  private generateAssetAllocation(riskScore: number): { equities: number; fixedIncome: number; gold: number; cash: number } {
    // Adjust asset allocation based on risk score
    if (riskScore >= 80) {
      return {
        equities: 70,
        fixedIncome: 15,
        gold: 10,
        cash: 5
      };
    } else if (riskScore >= 60) {
      return {
        equities: 60,
        fixedIncome: 25,
        gold: 10,
        cash: 5
      };
    } else if (riskScore >= 40) {
      return {
        equities: 50,
        fixedIncome: 30,
        gold: 15,
        cash: 5
      };
    } else if (riskScore >= 20) {
      return {
        equities: 30,
        fixedIncome: 45,
        gold: 15,
        cash: 10
      };
    } else {
      return {
        equities: 20,
        fixedIncome: 50,
        gold: 20,
        cash: 10
      };
    }
  }

  private generateRecommendations(data: RiskProfileData, riskScore: number, riskCategory: string): string[] {
    const recommendations: string[] = [];
    
    // Age-based recommendations
    if (data.age <= 30) {
      recommendations.push("Your young age allows for a higher risk tolerance. Consider focusing on growth-oriented investments like equity mutual funds.");
    } else if (data.age >= 60) {
      recommendations.push("As you approach retirement, consider shifting towards more conservative investments like government bonds and debt funds.");
    }
    
    // Investment horizon recommendations
    if (data.investmentHorizon >= 15) {
      recommendations.push("With your long investment horizon, you can weather market volatility. Consider a higher allocation to equity markets for long-term growth.");
    } else if (data.investmentHorizon <= 5) {
      recommendations.push("With a shorter investment horizon, prioritize capital preservation. Consider increasing allocation to fixed income securities.");
    }
    
    // Emergency fund recommendations
    if (data.emergencyFund < 6) {
      recommendations.push("Consider building your emergency fund to at least 6 months of expenses before taking on high-risk investments.");
    }
    
    // Income stability recommendations
    if (data.incomeStability < 50) {
      recommendations.push("With lower income stability, consider maintaining a larger cash reserve and being more conservative with your investments.");
    }
    
    // General recommendations based on risk category
    if (riskCategory === "Aggressive") {
      recommendations.push("Consider diversifying across large-cap, mid-cap, and small-cap equity funds, with some exposure to international markets.");
    } else if (riskCategory === "Moderate") {
      recommendations.push("A balanced approach with hybrid funds and a mix of equity and debt instruments could be suitable for your risk profile.");
    } else if (riskCategory === "Conservative") {
      recommendations.push("Focus on debt mutual funds, government securities, and fixed deposits for stable returns with lower risk.");
    }
    
    // India-specific recommendations
    recommendations.push("Consider tax-efficient investment vehicles like ELSS (Equity Linked Savings Scheme) funds for equity exposure with tax benefits under Section 80C.");
    
    return recommendations;
  }
}

export const riskAnalysisService = new RiskAnalysisService();
