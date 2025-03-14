"""
Document service for processing and analyzing financial documents
"""
import os
import json
import logging
from typing import Dict, Any, List, Optional
from pathlib import Path

import pandas as pd
from pypdf import PdfReader
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq

from backend.core.config import settings

logger = logging.getLogger(__name__)

class DocumentService:
    """Service for document processing and analysis specific to financial documents"""
    
    def __init__(self):
        """Initialize document service"""
        self.llm = None
        self._initialize()
    
    def _initialize(self):
        """Initialize the LLM for document analysis"""
        # Check if GROQ API key is available
        if not settings.GROQ_API_KEY:
            logger.warning("GROQ API key not found, document analysis will be limited")
            return
        
        try:
            # Initialize GROQ model
            self.llm = ChatGroq(
                api_key=settings.GROQ_API_KEY,
                model_name="llama2-70b-4096",  # Can be changed to other GROQ models
                temperature=0.3,  # Lower temperature for more focused analysis
                max_tokens=2048,
            )
            
            logger.info("GROQ LLM initialized successfully for document analysis")
        except Exception as e:
            logger.error(f"Failed to initialize GROQ LLM for document analysis: {str(e)}")
            self.llm = None
    
    async def analyze_document(self, file_path: str, file_type: str) -> Dict[str, Any]:
        """
        Analyze a document and extract financial insights
        
        Args:
            file_path: Path to the document
            file_type: Type of document (pdf, xlsx, etc.)
            
        Returns:
            Dictionary with summary and insights
        """
        # Default response if analysis fails
        default_response = {
            "summary": "Document analysis is not available at this time.",
            "insights": ["Unable to analyze the document"]
        }
        
        if self.llm is None:
            return default_response
        
        try:
            # Extract content based on file type
            document_content = ""
            
            if file_type.lower() in ["pdf", "application/pdf"]:
                document_content = await self._extract_pdf_content(file_path)
            elif file_type.lower() in ["xlsx", "xls", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"]:
                document_content = await self._extract_excel_content(file_path)
            else:
                return {
                    "summary": "Unsupported document type",
                    "insights": ["The document type is not supported for analysis"]
                }
            
            # If content extraction failed
            if not document_content:
                return default_response
            
            # Analyze content using AI
            return await self._analyze_with_ai(document_content)
            
        except Exception as e:
            logger.error(f"Error analyzing document: {str(e)}")
            return default_response
    
    async def _extract_pdf_content(self, file_path: str) -> str:
        """Extract text content from PDF"""
        try:
            # Read PDF
            reader = PdfReader(file_path)
            
            # Extract text from each page
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n\n"
            
            return text
        except Exception as e:
            logger.error(f"Error extracting PDF content: {str(e)}")
            return ""
    
    async def _extract_excel_content(self, file_path: str) -> str:
        """Extract data from Excel file"""
        try:
            # Read Excel file
            df = pd.read_excel(file_path)
            
            # Convert to string representation
            excel_content = f"Excel file with {len(df)} rows and {len(df.columns)} columns.\n\n"
            excel_content += "Column names: " + ", ".join(df.columns.astype(str)) + "\n\n"
            
            # Add sample data (first few rows)
            sample_rows = min(5, len(df))
            excel_content += f"Sample data (first {sample_rows} rows):\n"
            excel_content += df.head(sample_rows).to_string() + "\n\n"
            
            # Add basic statistics for numeric columns
            numeric_cols = df.select_dtypes(include=["number"]).columns
            if len(numeric_cols) > 0:
                excel_content += "Basic statistics for numeric columns:\n"
                excel_content += df[numeric_cols].describe().to_string()
            
            return excel_content
        except Exception as e:
            logger.error(f"Error extracting Excel content: {str(e)}")
            return ""
    
    async def _analyze_with_ai(self, document_content: str) -> Dict[str, Any]:
        """Analyze document content using AI"""
        if self.llm is None:
            return {
                "summary": "AI-powered document analysis is not available.",
                "insights": ["Check GROQ API key configuration"]
            }
        
        # Limit content length for API
        max_content_length = 10000
        if len(document_content) > max_content_length:
            document_content = document_content[:max_content_length] + "...[truncated]"
        
        # Create prompt template
        prompt_template = PromptTemplate(
            input_variables=["document"],
            template="""You are a financial document analyzer specializing in Indian financial markets.
            Analyze the following document text and extract key financial insights.
            
            Document text:
            {document}
            
            Provide a concise summary of the document and extract 3-5 key financial insights.
            Format your response as JSON with two fields:
            1. "summary": A concise summary of the document (1-2 paragraphs)
            2. "insights": An array of strings, each string being a key financial insight
            
            Your response should be only the JSON object, nothing else.
            """
        )
        
        try:
            # Create chain
            chain = LLMChain(llm=self.llm, prompt=prompt_template)
            
            # Run chain
            response = await chain.arun(document=document_content)
            
            # Parse JSON response
            try:
                result = json.loads(response)
                # Ensure the result has the expected format
                if "summary" not in result or "insights" not in result:
                    raise ValueError("Invalid response format")
                
                return result
            except (json.JSONDecodeError, ValueError) as e:
                logger.warning(f"Failed to parse AI document analysis as JSON: {str(e)}")
                # Try to extract information from non-JSON response
                lines = response.strip().split("\n")
                summary = "\n".join(lines[:2]) if len(lines) >= 2 else "Summary not available"
                insights = lines[2:7] if len(lines) > 2 else ["No insights available"]
                
                return {
                    "summary": summary,
                    "insights": insights
                }
        
        except Exception as e:
            logger.error(f"Error analyzing document with AI: {str(e)}")
            return {
                "summary": "An error occurred during document analysis.",
                "insights": ["The analysis service encountered an error"]
            }

# Singleton instance
document_service = DocumentService()