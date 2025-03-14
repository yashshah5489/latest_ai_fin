import os
from typing import Dict, Any, List, Optional
import logging
from langchain.chains import ConversationChain, LLMChain
from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq
from langchain.schema import AIMessage, HumanMessage

from backend.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIService:
    """Service for AI capabilities using Langchain with GROQ API"""
    
    def __init__(self):
        self.llm = None
        self.financial_insight_chain = None
        self.conversation_chain = None
        self._initialize()
    
    def _initialize(self):
        """Initialize the Langchain components with GROQ"""
        # Check if GROQ API key is set
        groq_api_key = settings.GROQ_API_KEY
        if not groq_api_key:
            logger.warning("GROQ API key not set, AI services will not be available")
            return
        
        try:
            # Initialize the LLM with GROQ
            self.llm = ChatGroq(
                model="llama3-70b-8192",  # Using Llama 3 70B model
                groq_api_key=groq_api_key,
                temperature=0.7,
                max_tokens=2048
            )
            
            # Create chain for financial insights
            financial_insight_template = """
            You are an AI financial advisor specializing in the Indian financial market. You provide personalized
            insights and advice based on user's financial data. Focus on Indian market specifics like taxation,
            investment options available in India, and local financial regulations.

            USER FINANCIAL DATA:
            {user_data}

            Based on this data, provide a concise and personalized financial insight. 
            Consider current Indian market conditions, tax implications, and suitable investment strategies for Indian investors.
            Your response should include:
            1. A brief assessment of their current financial position
            2. One specific, actionable recommendation
            3. A confidence score (1-10) for your insight, with rationale

            Keep your response brief and specific to the Indian financial context.
            """
            
            financial_insight_prompt = PromptTemplate(
                template=financial_insight_template,
                input_variables=["user_data"]
            )
            
            self.financial_insight_chain = LLMChain(
                llm=self.llm, 
                prompt=financial_insight_prompt
            )
            
            # Create conversation chain
            conversation_template = """
            You are a helpful AI financial advisor specializing in the Indian financial market. 
            You provide advice on investments, savings, tax planning, and financial planning specifically 
            for individuals in India.

            Current conversation:
            {history}
            Human: {input}
            AI:
            """
            
            conversation_prompt = PromptTemplate(
                template=conversation_template,
                input_variables=["history", "input"]
            )
            
            self.conversation_chain = LLMChain(
                llm=self.llm,
                prompt=conversation_prompt
            )
            
            logger.info("AI Service initialized successfully with GROQ")
            
        except Exception as e:
            logger.error(f"Failed to initialize AI service: {str(e)}")
            self.llm = None
    
    async def get_financial_insight(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate financial insights based on user data
        
        Args:
            user_data: Dictionary containing user financial data
            
        Returns:
            Dictionary with insight message and confidence
        """
        if not self.financial_insight_chain:
            return {
                "message": "AI service is not available. Please check if the GROQ API key is configured.",
                "confidence": 0
            }
        
        try:
            # Convert user data to string format for the prompt
            user_data_str = "\n".join([f"{k}: {v}" for k, v in user_data.items()])
            
            # Get insight from LLM
            response = await self.financial_insight_chain.arun(user_data=user_data_str)
            
            # Parse response to extract confidence score and message
            # This is a simplified parsing, could be more sophisticated
            lines = response.strip().split('\n')
            message = '\n'.join([line for line in lines if not line.startswith("Confidence:")])
            
            # Extract confidence score - assume it's mentioned as "Confidence: X/10"
            confidence = 7  # Default confidence
            for line in lines:
                if "confidence" in line.lower() and ":" in line:
                    try:
                        score_text = line.split(':')[1].strip()
                        if '/' in score_text:
                            confidence = int(score_text.split('/')[0].strip())
                        else:
                            confidence = int(score_text)
                    except (ValueError, IndexError):
                        pass
            
            return {
                "message": message.strip(),
                "confidence": confidence
            }
            
        except Exception as e:
            logger.error(f"Error generating financial insight: {str(e)}")
            return {
                "message": "Error generating financial insight. Please try again later.",
                "confidence": 0
            }
    
    async def chat_with_ai(self, message: str, chat_history: Optional[List[Dict[str, str]]] = None) -> str:
        """
        Chat with the AI financial advisor
        
        Args:
            message: User message
            chat_history: Previous chat history (optional)
            
        Returns:
            AI response as string
        """
        if not self.conversation_chain:
            return "AI service is not available. Please check if the GROQ API key is configured."
        
        try:
            # Format chat history
            history_text = ""
            if chat_history:
                for entry in chat_history:
                    if entry["role"] == "user":
                        history_text += f"Human: {entry['content']}\n"
                    else:
                        history_text += f"AI: {entry['content']}\n"
            
            # Get response from LLM
            response = await self.conversation_chain.arun(
                history=history_text,
                input=message
            )
            
            return response.strip()
            
        except Exception as e:
            logger.error(f"Error in AI conversation: {str(e)}")
            return "I apologize, but I encountered an error. Please try again later."

# Create a singleton instance
ai_service = AIService()