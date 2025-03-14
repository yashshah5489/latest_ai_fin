"""
Investment service for processing and analyzing investment data
"""
import os
import json
import logging
import random
from datetime import datetime
from typing import List, Dict, Any, Optional

import pandas as pd

from backend.core.config import settings

logger = logging.getLogger(__name__)

class InvestmentService:
    """Service for processing investment data specific to Indian markets"""
    
    async def import_investment_data(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Import investment data from Excel file
        
        Args:
            file_path: Path to the Excel file
            
        Returns:
            List of investment objects
        """
        try:
            # Read Excel file
            df = pd.read_excel(file_path)
            
            # Validate required columns
            required_columns = ["Name", "Type", "Value", "Return"]
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                logger.error(f"Missing required columns in Excel file: {missing_columns}")
                return []
            
            # Process data
            investments = []
            for _, row in df.iterrows():
                # Skip rows with missing essential data
                if pd.isna(row["Name"]) or pd.isna(row["Value"]):
                    continue
                
                # Process investment type
                investment_type = row["Type"] if not pd.isna(row["Type"]) else self._infer_type(row["Name"])
                
                # Process risk level (if available)
                risk_level = row.get("Risk Level", None)
                if pd.isna(risk_level):
                    risk_level = self._infer_risk_level(investment_type, None)
                else:
                    risk_level = self._infer_risk_level(investment_type, risk_level)
                
                # Process allocation (if available)
                allocation = row.get("Allocation", None)
                if pd.isna(allocation):
                    allocation = 0.0
                
                # Get return value
                return_value = row["Return"] if not pd.isna(row["Return"]) else 0.0
                
                # Create investment object
                investment = {
                    "id": f"inv_{len(investments) + 1}",
                    "name": row["Name"],
                    "type": investment_type,
                    "value": self._parse_number(row["Value"]),
                    "allocation": self._parse_number(allocation),
                    "return": self._parse_number(return_value),
                    "riskLevel": risk_level,
                    "icon": self._get_icon_for_type(investment_type)
                }
                
                investments.append(investment)
            
            return investments
            
        except Exception as e:
            logger.error(f"Error importing investment data: {str(e)}")
            return []
    
    def _parse_number(self, value: Any) -> float:
        """
        Parse a number from various formats
        
        Args:
            value: Number in various formats
            
        Returns:
            Parsed float value
        """
        try:
            if pd.isna(value):
                return 0.0
                
            if isinstance(value, (int, float)):
                return float(value)
                
            if isinstance(value, str):
                # Remove currency symbols and commas
                value = value.replace('₹', '').replace(',', '').replace('Rs.', '').replace('Rs', '').strip()
                return float(value)
                
            return 0.0
        except (ValueError, TypeError):
            return 0.0
    
    def _infer_type(self, name: str) -> str:
        """
        Infer investment type from name
        
        Args:
            name: Investment name
            
        Returns:
            Inferred investment type
        """
        name_lower = name.lower()
        
        # Check for common Indian investment types
        if any(term in name_lower for term in ['equity', 'stock', 'share']):
            return 'Equity'
        elif any(term in name_lower for term in ['mutual fund', 'fund']):
            return 'Mutual Fund'
        elif any(term in name_lower for term in ['fd', 'fixed deposit']):
            return 'Fixed Deposit'
        elif any(term in name_lower for term in ['ppf', 'provident fund', 'epf']):
            return 'Provident Fund'
        elif any(term in name_lower for term in ['nps', 'national pension']):
            return 'Pension'
        elif any(term in name_lower for term in ['gold', 'silver']):
            return 'Gold'
        elif any(term in name_lower for term in ['real estate', 'property']):
            return 'Real Estate'
        elif any(term in name_lower for term in ['bond', 'debenture']):
            return 'Bonds'
        else:
            return 'Other'
    
    def _infer_risk_level(self, type: str, risk: Any) -> str:
        """
        Infer risk level based on investment type and given risk value
        
        Args:
            type: Investment type
            risk: Risk value (if available)
            
        Returns:
            Risk level as 'Low', 'Medium', or 'High'
        """
        # If risk is provided and valid
        if risk and isinstance(risk, str):
            risk_lower = risk.lower()
            if 'high' in risk_lower:
                return 'High'
            elif 'medium' in risk_lower or 'moderate' in risk_lower:
                return 'Medium'
            elif 'low' in risk_lower:
                return 'Low'
        
        # Infer from type
        high_risk_types = ['Equity', 'Real Estate', 'Cryptocurrency']
        medium_risk_types = ['Mutual Fund', 'Gold', 'Bonds']
        low_risk_types = ['Fixed Deposit', 'Provident Fund', 'Pension']
        
        if type in high_risk_types:
            return 'High'
        elif type in medium_risk_types:
            return 'Medium'
        elif type in low_risk_types:
            return 'Low'
        else:
            return 'Medium'  # Default to Medium risk
    
    def _get_icon_for_type(self, type: str) -> str:
        """
        Get icon name for investment type
        
        Args:
            type: Investment type
            
        Returns:
            Icon name for the type
        """
        icon_map = {
            'Equity': 'trending-up',
            'Mutual Fund': 'pie-chart',
            'Fixed Deposit': 'landmark',
            'Provident Fund': 'shield',
            'Pension': 'umbrella',
            'Gold': 'coins',
            'Real Estate': 'home',
            'Bonds': 'file-text',
            'Other': 'box'
        }
        
        return icon_map.get(type, 'box')

# Singleton instance
investment_service = InvestmentService()