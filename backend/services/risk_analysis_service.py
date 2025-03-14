"""
Risk analysis service for generating investment recommendations
"""
import logging
from typing import Dict, Any, List

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
        try:
            # Extract profile data
            age = profile_data.get("age", 30)
            investment_horizon = profile_data.get("investment_horizon", 10)
            risk_tolerance = profile_data.get("risk_tolerance", 5)
            emergency_fund = profile_data.get("emergency_fund", 6)
            income_stability = profile_data.get("income_stability", 5)
            
            # Calculate risk scores
            age_score = self._calculate_age_score(age)
            horizon_score = self._calculate_horizon_score(investment_horizon)
            tolerance_score = risk_tolerance * 2  # Scale 1-10 to 2-20
            emergency_score = self._calculate_emergency_score(emergency_fund)
            stability_score = income_stability * 2  # Scale 1-10 to 2-20
            
            # Calculate total risk score (out of 100)
            risk_score = (
                age_score * 0.15 +          # 15% weight
                horizon_score * 0.20 +      # 20% weight
                tolerance_score * 0.35 +    # 35% weight
                emergency_score * 0.15 +    # 15% weight
                stability_score * 0.15      # 15% weight
            )
            
            # Determine risk category
            risk_category = self._get_risk_category(risk_score)
            
            # Generate asset allocation
            asset_allocation = self._generate_asset_allocation(risk_score)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(
                profile_data, risk_score, risk_category
            )
            
            # Return results
            return {
                "risk_score": round(risk_score, 1),
                "risk_category": risk_category,
                "asset_allocation": asset_allocation,
                "recommendations": recommendations
            }
            
        except Exception as e:
            logger.error(f"Error analyzing risk profile: {str(e)}")
            # Return default values
            return {
                "risk_score": 50.0,
                "risk_category": "Moderate",
                "asset_allocation": {
                    "equities": 50,
                    "fixed_income": 30,
                    "gold": 10,
                    "cash": 10
                },
                "recommendations": [
                    "We encountered an error analyzing your risk profile. Please try again."
                ]
            }
    
    def _calculate_age_score(self, age: int) -> float:
        """
        Calculate risk score component based on age
        
        Args:
            age: User's age
            
        Returns:
            Age risk score component (0-20)
        """
        # Younger investors can take more risk
        if age < 30:
            return 18.0
        elif age < 40:
            return 16.0
        elif age < 50:
            return 12.0
        elif age < 60:
            return 8.0
        else:
            return 5.0
    
    def _calculate_horizon_score(self, years: int) -> float:
        """
        Calculate risk score component based on investment horizon
        
        Args:
            years: Investment horizon in years
            
        Returns:
            Horizon risk score component (0-20)
        """
        # Longer horizons can handle more risk
        if years < 3:
            return 5.0
        elif years < 5:
            return 10.0
        elif years < 10:
            return 15.0
        else:
            return 20.0
    
    def _calculate_emergency_score(self, months: int) -> float:
        """
        Calculate risk score component based on emergency fund
        
        Args:
            months: Emergency fund in months of expenses
            
        Returns:
            Emergency fund risk score component (0-20)
        """
        # More emergency savings can handle more investment risk
        if months < 3:
            return 5.0
        elif months < 6:
            return 10.0
        elif months < 9:
            return 15.0
        else:
            return 20.0
    
    def _get_risk_category(self, score: float) -> str:
        """
        Get risk category based on score
        
        Args:
            score: Risk score (0-100)
            
        Returns:
            Risk category
        """
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
        """
        Generate asset allocation based on risk score
        
        Args:
            risk_score: Risk score (0-100)
            
        Returns:
            Dictionary with asset allocation percentages
        """
        # Conservative allocation (score < 30)
        if risk_score < 30:
            return {
                "equities": 20,
                "fixed_income": 50,
                "gold": 20,
                "cash": 10
            }
        # Moderately Conservative (score < 50)
        elif risk_score < 50:
            return {
                "equities": 35,
                "fixed_income": 45,
                "gold": 15,
                "cash": 5
            }
        # Moderate (score < 70)
        elif risk_score < 70:
            return {
                "equities": 50,
                "fixed_income": 30,
                "gold": 15,
                "cash": 5
            }
        # Moderately Aggressive (score < 85)
        elif risk_score < 85:
            return {
                "equities": 70,
                "fixed_income": 20,
                "gold": 5,
                "cash": 5
            }
        # Aggressive (score >= 85)
        else:
            return {
                "equities": 80,
                "fixed_income": 10,
                "gold": 5,
                "cash": 5
            }
    
    def _generate_recommendations(
        self, data: Dict[str, Any], risk_score: float, risk_category: str
    ) -> List[str]:
        """
        Generate personalized recommendations
        
        Args:
            data: User profile data
            risk_score: Calculated risk score
            risk_category: Risk category
            
        Returns:
            List of personalized recommendations
        """
        recommendations = []
        
        # Age-based recommendations
        age = data.get("age", 30)
        if age < 30:
            recommendations.append(
                "At your age, you can afford to take more risk for potentially higher returns. "
                "Consider allocating more to equity mutual funds or direct equity investments."
            )
        elif age > 50:
            recommendations.append(
                "As you approach retirement, consider gradually shifting towards more conservative "
                "investments like government bonds and fixed deposits."
            )
        
        # Emergency fund recommendations
        emergency_fund = data.get("emergency_fund", 6)
        if emergency_fund < 6:
            recommendations.append(
                f"Your emergency fund covers {emergency_fund} months of expenses. Consider building this "
                "to at least 6 months before taking on high-risk investments."
            )
        
        # Investment horizon recommendations
        horizon = data.get("investment_horizon", 10)
        if horizon < 5 and risk_score > 50:
            recommendations.append(
                f"Your investment horizon is {horizon} years, which may be too short for your risk profile. "
                "Consider reducing exposure to volatile assets or extending your time horizon."
            )
        
        # Income stability recommendations
        stability = data.get("income_stability", 5)
        if stability < 5:
            recommendations.append(
                "With your income stability level, consider allocating more to liquid investments "
                "and reducing exposure to illiquid assets like real estate."
            )
        
        # Risk-category specific recommendations
        if risk_category == "Conservative":
            recommendations.append(
                "Your risk profile suggests a focus on capital preservation. Consider investments "
                "like fixed deposits, government bonds, and post office schemes like PPF."
            )
        elif risk_category == "Aggressive":
            recommendations.append(
                "Your risk profile allows for significant equity exposure. Consider a mix of "
                "large-cap, mid-cap, and small-cap mutual funds or direct equity investments."
            )
        
        # Tax-saving recommendations
        recommendations.append(
            "For tax efficiency, consider ELSS mutual funds that offer tax benefits under Section 80C "
            "with the potential for higher returns than traditional tax-saving instruments."
        )
        
        return recommendations

# Singleton instance
risk_analysis_service = RiskAnalysisService()