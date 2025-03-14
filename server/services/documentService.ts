import fs from "fs";
import { PDFExtract } from "pdf.js-extract";
import XLSX from "xlsx";
import { aiService } from "./aiService";

interface DocumentAnalysis {
  summary: string;
  insights: string[];
}

class DocumentService {
  private pdfExtract: PDFExtract;

  constructor() {
    this.pdfExtract = new PDFExtract();
  }

  async analyzeDocument(filePath: string): Promise<DocumentAnalysis> {
    try {
      // Check file type by extension
      if (filePath.endsWith('.pdf')) {
        return await this.analyzePdf(filePath);
      } else if (filePath.endsWith('.xlsx') || filePath.endsWith('.xls')) {
        return await this.analyzeExcel(filePath);
      } else {
        throw new Error("Unsupported file type");
      }
    } catch (error) {
      console.error("Error analyzing document:", error);
      return {
        summary: "Could not analyze the document. There was an error processing the file.",
        insights: ["Document analysis failed. Please try uploading a different file."]
      };
    }
  }

  private async analyzePdf(filePath: string): Promise<DocumentAnalysis> {
    try {
      const data = await this.pdfExtract.extract(filePath);
      const textContent = data.pages.map(page => page.content.map(item => item.str).join(' ')).join('\n');
      
      // Analyze the first 1000 characters to prevent token limit issues
      const textSample = textContent.substring(0, 1000);
      
      // Use AI to analyze the document
      const prompt = `Analyze this financial document excerpt: "${textSample}". Provide a short summary and 3-5 key insights in an array.`;
      const aiResponse = await aiService.chatWithAI(0, prompt);
      
      // Parse AI response - this is simplified and would need refinement in production
      let summary = "Financial document analyzed successfully.";
      let insights = [
        "Document appears to contain financial information.",
        "Consider reviewing the full document for more details."
      ];
      
      try {
        // Try to extract structured information from AI response
        if (aiResponse.includes("Summary:")) {
          summary = aiResponse.split("Summary:")[1].split("Insights:")[0].trim();
          const insightsText = aiResponse.split("Insights:")[1].trim();
          insights = insightsText.split(/\d+\./).filter(Boolean).map(s => s.trim());
        } else {
          summary = aiResponse.split("\n")[0].trim();
        }
      } catch (e) {
        console.error("Error parsing AI response:", e);
      }
      
      return {
        summary,
        insights
      };
    } catch (error) {
      console.error("Error extracting PDF:", error);
      throw error;
    }
  }

  private async analyzeExcel(filePath: string): Promise<DocumentAnalysis> {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetNames = workbook.SheetNames;
      const firstSheet = workbook.Sheets[sheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      
      // Convert the first few rows to a string for analysis
      const sampleData = JSON.stringify(jsonData.slice(0, 5));
      
      // Use AI to analyze the document
      const prompt = `Analyze this financial spreadsheet data: ${sampleData}. Provide a short summary and 3-5 key insights in an array.`;
      const aiResponse = await aiService.chatWithAI(0, prompt);
      
      // Parse AI response
      let summary = "Financial spreadsheet analyzed successfully.";
      let insights = [
        "Spreadsheet contains financial data.",
        "Consider reviewing the complete dataset for comprehensive analysis."
      ];
      
      try {
        // Try to extract structured information from AI response
        if (aiResponse.includes("Summary:")) {
          summary = aiResponse.split("Summary:")[1].split("Insights:")[0].trim();
          const insightsText = aiResponse.split("Insights:")[1].trim();
          insights = insightsText.split(/\d+\./).filter(Boolean).map(s => s.trim());
        } else {
          summary = aiResponse.split("\n")[0].trim();
        }
      } catch (e) {
        console.error("Error parsing AI response:", e);
      }
      
      return {
        summary,
        insights
      };
    } catch (error) {
      console.error("Error analyzing Excel:", error);
      throw error;
    }
  }
}

export const documentService = new DocumentService();
