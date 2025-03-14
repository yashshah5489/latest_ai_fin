import os
import logging
import json
from typing import Dict, Any, List, Optional
import tempfile
import pandas as pd
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq
import io

from backend.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import PDF reading libraries
try:
    from pdfjs import PDFExtract
    PDF_EXTRACTOR = "pdfjs"
except ImportError:
    PDF_EXTRACTOR = "pypdf"
    logger.warning("pdfjs not available, falling back to pypdf")

class DocumentService:
    """Service for document processing and analysis specific to financial documents"""
    
    def __init__(self):
        self.llm = None
        self.document_analysis_chain = None
        self._initialize()
    
    def _initialize(self):
        """Initialize the LLM for document analysis"""
        # Check if GROQ API key is set
        groq_api_key = settings.GROQ_API_KEY
        if not groq_api_key:
            logger.warning("GROQ API key not set, document analysis will not be available")
            return
        
        try:
            # Initialize the LLM with GROQ
            self.llm = ChatGroq(
                model="llama3-70b-8192",  # Using Llama 3 70B model
                groq_api_key=groq_api_key,
                temperature=0.2,  # Lower temperature for more factual analysis
                max_tokens=2048
            )
            
            # Create chain for document analysis
            document_analysis_template = """
            You are an AI financial document analyzer specializing in Indian financial documents. 
            You extract key insights and provide summaries of financial documents in the context of Indian finance and taxation.

            DOCUMENT CONTENT:
            {document_content}

            Please analyze this financial document and provide:
            1. A concise summary (3-5 sentences) of the document's key information
            2. Five specific financial insights from the document, focusing on:
               - Key financial metrics mentioned
               - Important financial decisions or strategies
               - Relevant tax implications for Indian investors
               - Potential risks or opportunities highlighted
               - Any actionable financial advice contained in the document

            Format your response as JSON with the following structure:
            {
                "summary": "...",
                "insights": ["...", "...", "...", "...", "..."]
            }

            Ensure your analysis is specifically relevant to Indian financial context, including references to
            Indian taxation, financial regulations, or market conditions if applicable.
            """
            
            document_analysis_prompt = PromptTemplate(
                template=document_analysis_template,
                input_variables=["document_content"]
            )
            
            self.document_analysis_chain = LLMChain(
                llm=self.llm, 
                prompt=document_analysis_prompt
            )
            
            logger.info("Document Service initialized successfully with GROQ")
            
        except Exception as e:
            logger.error(f"Failed to initialize document service: {str(e)}")
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
        if not self.document_analysis_chain:
            return {
                "summary": "Document analysis service is not available. Please check if the GROQ API key is configured.",
                "insights": ["API key configuration required for document analysis"]
            }
        
        try:
            # Extract content based on file type
            if file_type.lower() in ['pdf']:
                document_content = await self._extract_pdf_content(file_path)
            elif file_type.lower() in ['xlsx', 'xls', 'csv']:
                document_content = await self._extract_excel_content(file_path)
            else:
                # For text files or other types
                with open(file_path, 'r', encoding='utf-8') as f:
                    document_content = f.read()
            
            # Truncate document content if too large (to fit in context window)
            if len(document_content) > 20000:
                document_content = document_content[:20000] + "...[content truncated due to length]"
            
            # Analyze with LLM
            analysis_result = await self._analyze_with_ai(document_content)
            return analysis_result
            
        except Exception as e:
            logger.error(f"Error analyzing document: {str(e)}")
            return {
                "summary": "Error analyzing document. Please try again later.",
                "insights": [f"Error: {str(e)}"]
            }
    
    async def _extract_pdf_content(self, file_path: str) -> str:
        """Extract text content from PDF"""
        try:
            if PDF_EXTRACTOR == "pdfjs":
                # Use pdfjs-extract
                extract = PDFExtract()
                data = extract.extract(file_path)
                
                # Combine all pages content
                content = ""
                for page in data["pages"]:
                    for content_item in page.get("content", []):
                        content += content_item.get("str", "") + " "
                
                return content
            else:
                # Use PyPDF2 as fallback
                from pypdf import PdfReader
                
                reader = PdfReader(file_path)
                content = ""
                
                for page in reader.pages:
                    content += page.extract_text() + "\n"
                
                return content
        except Exception as e:
            logger.error(f"Error extracting PDF content: {str(e)}")
            raise
    
    async def _extract_excel_content(self, file_path: str) -> str:
        """Extract data from Excel file"""
        try:
            if file_path.lower().endswith('.csv'):
                df = pd.read_csv(file_path)
            else:
                df = pd.read_excel(file_path)
            
            # Convert DataFrame to string representation
            buffer = io.StringIO()
            df.to_csv(buffer)
            content = buffer.getvalue()
            
            return content
        except Exception as e:
            logger.error(f"Error extracting Excel content: {str(e)}")
            raise
    
    async def _analyze_with_ai(self, document_content: str) -> Dict[str, Any]:
        """Analyze document content using AI"""
        try:
            # Get analysis from LLM
            response = await self.document_analysis_chain.arun(document_content=document_content)
            
            try:
                # Try to parse as JSON
                return json.loads(response)
            except json.JSONDecodeError:
                # If not valid JSON, extract summary and insights manually
                lines = response.strip().split('\n')
                
                # Find summary
                summary = "No summary available"
                for i, line in enumerate(lines):
                    if "summary" in line.lower() and i+1 < len(lines):
                        summary = lines[i+1].strip().strip('"').strip()
                        break
                
                # Find insights
                insights = []
                in_insights_section = False
                for line in lines:
                    if "insights" in line.lower():
                        in_insights_section = True
                        continue
                    
                    if in_insights_section and line.strip().startswith('-'):
                        insights.append(line.strip().strip('-').strip())
                
                return {
                    "summary": summary,
                    "insights": insights if insights else ["No insights extracted"]
                }
            
        except Exception as e:
            logger.error(f"Error in AI document analysis: {str(e)}")
            return {
                "summary": "Error analyzing document content.",
                "insights": ["Document analysis failed. Please try again."]
            }

# Create a singleton instance
document_service = DocumentService()