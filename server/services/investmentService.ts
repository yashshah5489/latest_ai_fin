import XLSX from "xlsx";

interface Investment {
  id: string;
  name: string;
  type: string;
  value: number;
  allocation: number;
  return: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  icon: string;
}

class InvestmentService {
  async importInvestmentData(filePath: string): Promise<Investment[]> {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetNames = workbook.SheetNames;
      const firstSheet = workbook.Sheets[sheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      
      // Generate unique IDs for investments
      const investments: Investment[] = jsonData.map((row: any, index) => {
        // Try to map the Excel columns to our investment structure
        // The actual implementation would depend on the expected format
        const name = row.Name || row.Security || row.Investment || row.Asset || `Investment ${index + 1}`;
        const type = row.Type || row.AssetClass || row.Category || this.inferType(name);
        const value = this.parseNumber(row.Value || row.Amount || row.Price || 0);
        
        return {
          id: `imported-${Date.now()}-${index}`,
          name,
          type,
          value,
          allocation: 0, // Will be calculated after all investments are processed
          return: this.parseNumber(row.Return || row.Performance || row.Yield || 0),
          riskLevel: this.inferRiskLevel(type, row.Risk || row.RiskLevel),
          icon: this.getIconForType(type)
        };
      });
      
      // Calculate allocations
      const totalValue = investments.reduce((sum, inv) => sum + inv.value, 0);
      investments.forEach(inv => {
        inv.allocation = totalValue > 0 ? (inv.value / totalValue) * 100 : 0;
      });
      
      return investments;
    } catch (error) {
      console.error("Error importing investment data:", error);
      throw new Error("Failed to import investment data. Please check the file format.");
    }
  }

  private parseNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove any currency symbols and commas
      const cleaned = value.replace(/[₹,$,\s,]/g, '');
      return parseFloat(cleaned) || 0;
    }
    return 0;
  }

  private inferType(name: string): string {
    name = name.toLowerCase();
    if (name.includes('nifty') || name.includes('sensex') || name.includes('equity') || name.includes('stock')) {
      return 'Equities';
    }
    if (name.includes('bond') || name.includes('treasury') || name.includes('debt') || name.includes('fixed income')) {
      return 'Fixed Income';
    }
    if (name.includes('gold') || name.includes('silver') || name.includes('commodity')) {
      return 'Commodities';
    }
    if (name.includes('international') || name.includes('global') || name.includes('foreign')) {
      return 'Foreign Equities';
    }
    return 'Other';
  }

  private inferRiskLevel(type: string, risk: any): 'Low' | 'Medium' | 'High' {
    // If risk is explicitly provided
    if (risk) {
      const riskStr = String(risk).toLowerCase();
      if (riskStr.includes('low')) return 'Low';
      if (riskStr.includes('med')) return 'Medium';
      if (riskStr.includes('high')) return 'High';
    }
    
    // Infer based on asset type
    type = type.toLowerCase();
    if (type.includes('bond') || type.includes('treasury') || type.includes('debt') || type.includes('fixed income')) {
      return 'Low';
    }
    if (type.includes('equity') || type.includes('stock') || type.includes('nifty') || type.includes('sensex')) {
      return 'Medium';
    }
    if (type.includes('international') || type.includes('global') || type.includes('foreign')) {
      return 'High';
    }
    if (type.includes('commodity') || type.includes('gold') || type.includes('silver')) {
      return 'Medium';
    }
    
    return 'Medium';
  }

  private getIconForType(type: string): string {
    type = type.toLowerCase();
    if (type.includes('equity') || type.includes('stock') || type.includes('nifty') || type.includes('sensex')) {
      return 'description';
    }
    if (type.includes('bond') || type.includes('treasury') || type.includes('debt') || type.includes('fixed income')) {
      return 'account_balance';
    }
    if (type.includes('international') || type.includes('global') || type.includes('foreign')) {
      return 'public';
    }
    if (type.includes('commodity') || type.includes('gold') || type.includes('silver')) {
      return 'toll';
    }
    return 'pie_chart'; // Default icon
  }
}

export const investmentService = new InvestmentService();
