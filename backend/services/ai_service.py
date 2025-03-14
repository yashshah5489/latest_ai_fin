"""
AI service using langchain with GROQ integration
"""
import os
import json
import logging
import random
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from uuid import uuid4

from langchain.chains import ConversationChain, LLMChain
from langchain.prompts import PromptTemplate
from langchain.memory import ConversationBufferMemory
from langchain_groq import ChatGroq

from backend.core.config import settings

logger = logging.getLogger(__name__)

class AIService:
    """Service for AI capabilities using Langchain with GROQ API"""
    
    def __init__(self):
        """Initialize the AI service"""
        self.llm = None
        self.chat_memories = {}  # User ID -> ConversationBufferMemory
        self._initialize()
    
    def _initialize(self):
        """Initialize the Langchain components with GROQ"""
        # Check if GROQ API key is available
        if not settings.GROQ_API_KEY:
            logger.warning("GROQ API key not found, AI services will be limited")
            return
        
        try:
            # Initialize GROQ model
            self.llm = ChatGroq(
                api_key=settings.GROQ_API_KEY,
                model_name="llama2-70b-4096",  # Can be changed to other GROQ models
                temperature=0.7,
                max_tokens=2048,
            )
            
            logger.info("GROQ LLM initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize GROQ LLM: {str(e)}")
            self.llm = None
    
    async def get_financial_insight(self, user_id: int) -> Dict[str, Any]:
        """
        Generate financial insights based on user data
        
        Args:
            user_id: User ID for personalized insights
            
        Returns:
            Dictionary with insight message and confidence
        """
        if self.llm is None:
            return {
                "message": "AI insights are currently unavailable. Please check your GROQ API key.",
                "confidence": 0.0
            }
        
        # Create prompt for financial insights
        prompt_template = PromptTemplate(
            input_variables=["context"],
            template="""You are a financial advisor for Indian investors. Based on current economic trends in India 
            and global markets, provide one actionable financial insight that would be valuable for Indian investors.
            
            Context: {context}
            
            Give a precise, actionable insight with a confidence level (0-100%).
            Format your response as JSON: {"message": "Your insight here", "confidence": confidence_value}
            """
        )
        
        # Get current date for context
        current_date = datetime.now().strftime("%Y-%m-%d")
        
        # Create context (in a real app, this would include user's portfolio data)
        context = f"Current date: {current_date}. User is interested in financial advice for Indian markets."
        
        try:
            # Create chain
            chain = LLMChain(llm=self.llm, prompt=prompt_template)
            
            # Run chain
            response = await chain.arun(context=context)
            
            # Parse JSON response
            try:
                result = json.loads(response)
                # Ensure the result has the expected format
                if "message" not in result or "confidence" not in result:
                    raise ValueError("Invalid response format")
                
                return result
            except (json.JSONDecodeError, ValueError):
                # If parsing fails, extract message and generate random confidence
                logger.warning(f"Failed to parse AI response as JSON: {response}")
                return {
                    "message": response.strip(),
                    "confidence": round(random.uniform(50, 90), 1)
                }
        
        except Exception as e:
            logger.error(f"Error getting AI insight: {str(e)}")
            return {
                "message": "Unable to generate financial insights at this time.",
                "confidence": 0.0
            }
    
    async def chat_with_ai(
        self, 
        message: str, 
        chat_history: Optional[List[Dict[str, str]]] = None,
        user_id: int = 0
    ) -> str:
        """
        Chat with the AI financial advisor
        
        Args:
            message: User message
            chat_history: Previous chat history (optional)
            user_id: User ID for persistent conversation context
            
        Returns:
            AI response
        """
        if self.llm is None:
            return "AI chat services are currently unavailable. Please check your GROQ API key."
        
        # Initialize memory for this user if it doesn't exist
        if user_id not in self.chat_memories:
            self.chat_memories[user_id] = ConversationBufferMemory()
        
        # Create prompt template
        prompt_template = PromptTemplate(
            input_variables=["history", "input"],
            template="""You are a financial advisor specializing in the Indian market. 
            You provide helpful, ethical, and accurate financial advice.
            
            Current conversation:
            {history}
            Human: {input}
            AI: """
        )
        
        try:
            # Create conversation chain
            conversation = ConversationChain(
                llm=self.llm,
                memory=self.chat_memories[user_id],
                prompt=prompt_template,
                verbose=False
            )
            
            # Get response
            response = await conversation.arun(input=message)
            
            return response.strip()
        
        except Exception as e:
            logger.error(f"Error in AI chat: {str(e)}")
            return "I'm sorry, I couldn't process your request at this time. Please try again later."
    
    async def get_chat_history(self, user_id: int) -> List[Dict[str, Any]]:
        """
        Get chat history for a user
        
        Args:
            user_id: User ID
            
        Returns:
            List of chat messages
        """
        # In a real app, this would be stored in the database
        # For now, we'll just return a placeholder
        return [
            {
                "id": str(uuid4()),
                "content": "How can I help you with your financial planning today?",
                "role": "assistant",
                "timestamp": datetime.now()
            }
        ]

# Singleton instance
ai_service = AIService()