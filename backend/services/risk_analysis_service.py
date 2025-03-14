import logging
from typing import Dict, Any, List

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RiskAnalysisService:
    """Service for analyzing investor risk profile with focus on Indian market context"""
    
    async def analyze_risk_profile(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze a user's risk profile and generate recommendations
        
        Args:
            profile_data: Dictionary with user's risk profile data
            
        Returns:
            Dictionary with risk analysis results
        """
        # Calculate risk score based on various factors
        try:
            age_score = self._calculate_age_score(profile_data.get("age", 35))
            horizon_score = self._calculate_horizon_score(profile_data.get("investmentHorizon", 5))
            risk_tolerance_score = float(profile_data.get("riskTolerance", 5)) / 10  # Convert to 0-1 scale
            emergency_score = self._calculate_emergency_score(profile_data.get("emergencyFund", 3))
            income_stability_score = float(profile_data.get("incomeStability", 5)) / 10  # Convert to 0-1 scale
            
            # Calculate overall risk score (0-100 scale)
            # Weighted average of the factors
            risk_score = (
                age_score * 0.20 + 
                horizon_score * 0.25 + 
                risk_tolerance_score * 0.30 + 
                emergency_score * 0.15 + 
                income_stability_score * 0.10
            ) * 100
            
            # Determine risk category
            risk_category = self._get_risk_category(risk_score)
            
            # Generate asset allocation
            asset_allocation = self._generate_asset_allocation(risk_score)
            
            # Generate personalized recommendations
            recommendations = self._generate_recommendations(profile_data, risk_score, risk_category)
            
            return {
                "riskScore": round(risk_score, 1),
                "riskCategory": risk_category,
                "assetAllocation": asset_allocation,
                "recommendations": recommendations
            }
            
        except Exception as e:
            logger.error(f"Error analyzing risk profile: {str(e)}")
            raise
    
    def _calculate_age_score(self, age: int) -> float:
        """Calculate age component of risk score"""
        # Younger investors can take more risk
        if age < 30:
            return 0.9  # Higher risk capacity
        elif age < 40:
            return 0.75
        elif age < 50:
            return 0.6
        elif age < 60:
            return 0.4
        else:
            return 0.25  # Lower risk capacity
    
    def _calculate_horizon_score(self, years: int) -> float:
        """Calculate investment horizon component of risk score"""
        # Longer time horizons allow for more risk
        if years < 2:
            return 0.2  # Short term needs safety
        elif years < 5:
            return 0.4
        elif years < 10:
            return 0.6
        elif years < 20:
            return 0.8
        else:
            return 0.95  # Long horizon allows high risk
    
    def _calculate_emergency_score(self, months: int) -> float:
        """Calculate emergency fund component of risk score"""
        # More emergency savings allow for more investment risk
        if months < 1:
            return 0.1  # Very risky with no emergency fund
        elif months < 3:
            return 0.3
        elif months < 6:
            return 0.6
        elif months < 12:
            return 0.8
        else:
            return 0.9  # Good emergency fund
    
    def _get_risk_category(self, score: float) -> str:
        """Determine risk category based on score"""
        if score < 30:
            return "Conservative"
        elif score < 50:
            return "Moderately Conservative"
        elif score < 70:
            return "Moderate"
        elif score < 85:
            return "Moderately Aggressive"
        else:
            return "Aggressive"
    
    def _generate_asset_allocation(self, risk_score: float) -> Dict[str, int]:
        """Generate asset allocation based on risk score"""
        # Indian market context for asset allocation
        if risk_score < 30:
            # Conservative - heavy on fixed income, gold
            return {
                "equities": 25,
                "fixedIncome": 50,
                "gold": 15,
                "cash": 10
            }
        elif risk_score < 50:
            # Moderately Conservative
            return {
                "equities": 40,
                "fixedIncome": 40,
                "gold": 15,
                "cash": 5
            }
        elif risk_score < 70:
            # Moderate
            return {
                "equities": 55,
                "fixedIncome": 30,
                "gold": 10,
                "cash": 5
            }
        elif risk_score < 85:
            # Moderately Aggressive
            return {
                "equities": 70,
                "fixedIncome": 20,
                "gold": 5,
                "cash": 5
            }
        else:
            # Aggressive
            return {
                "equities": 80,
                "fixedIncome": 15,
                "gold": 3,
                "cash": 2
            }
    
    def _generate_recommendations(
        self, 
        data: Dict[str, Any], 
        risk_score: float, 
        risk_category: str
    ) -> List[str]:
        """Generate personalized recommendations based on risk profile"""
        age = data.get("age", 35)
        investment_horizon = data.get("investmentHorizon", 5)
        emergency_fund = data.get("emergencyFund", 3)
        
        recommendations = []
        
        # Basic recommendation based on risk category
        if risk_category == "Conservative":
            recommendations.append(
                "Focus on capital preservation with safer options like bank fixed deposits, government bonds, and PSU bonds."
            )
        elif risk_category == "Moderately Conservative":
            recommendations.append(
                "Consider a mix of debt mutual funds, corporate bonds, and a small allocation to large-cap equity funds."
            )
        elif risk_category == "Moderate":
            recommendations.append(
                "Balance your portfolio with quality large and mid-cap funds, along with debt instruments like corporate bonds."
            )
        elif risk_category == "Moderately Aggressive":
            recommendations.append(
                "Increase exposure to equity through diversified multi-cap funds and a small allocation to sectoral/thematic funds."
            )
        else:  # Aggressive
            recommendations.append(
                "Focus on growth through a diversified equity portfolio with mid and small-cap exposure, along with some international equity funds."
            )
        
        # Emergency fund recommendation
        if emergency_fund < 6:
            recommendations.append(
                f"Build your emergency fund to cover at least 6 months of expenses, currently at {emergency_fund} months."
            )
        
        # Tax-saving recommendation
        if age < 60:
            recommendations.append(
                "Consider tax-saving options like ELSS funds or PPF to maximize tax benefits under Section 80C."
            )
        
        # Retirement specific recommendation
        if age > 40:
            recommendations.append(
                "Allocate to the National Pension System (NPS) for additional tax benefits and retirement planning."
            )
        
        # Investment horizon recommendation
        if investment_horizon > 10:
            recommendations.append(
                "With your long investment horizon, consider Systematic Investment Plans (SIPs) in equity mutual funds to benefit from rupee cost averaging."
            )
        
        # Age-specific recommendations
        if age < 30:
            recommendations.append(
                "At your age, consider starting a SIP in a mix of equity funds to build wealth over the long term."
            )
        elif 30 <= age < 45:
            recommendations.append(
                "Balance growth and stability with a mix of equity and debt instruments appropriate for your mid-career stage."
            )
        else:
            recommendations.append(
                "Consider gradually increasing allocation to safer assets as you approach retirement age."
            )
        
        return recommendations[:5]  # Return top 5 recommendations

# Create a singleton instance
risk_analysis_service = RiskAnalysisService()