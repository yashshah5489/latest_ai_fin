import OpenAI from "openai";
import axios from "axios";

interface AIInsight {
  message: string;
  confidence: number;
}

class AIService {
  private openai: OpenAI | null = null;
  private groqApiKey: string | null = null;
  private groqApiUrl: string = "https://api.groq.com/openai/v1/chat/completions";

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Initialize OpenAI if API key is present
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: openaiApiKey,
      });
    }

    // Store Groq API key if present
    this.groqApiKey = process.env.GROQ_API_KEY || null;
  }

  async getInsight(userId: number): Promise<AIInsight> {
    try {
      const prompt = `You are a financial advisor specialized in Indian markets. Provide a concise insight about portfolio diversification. The insight should be specific to the Indian stock market and financial context. Keep it under 200 characters.`;
      
      const response = await this.sendPromptToAI(prompt);
      
      return {
        message: response,
        confidence: 0.92
      };
    } catch (error) {
      console.error("Error getting AI insight:", error);
      return {
        message: "Consider diversifying your portfolio based on your risk profile. The Indian market has seen volatility recently, so a balanced approach is recommended.",
        confidence: 0.85
      };
    }
  }

  async chatWithAI(userId: number, message: string): Promise<string> {
    try {
      const prompt = `You are a financial advisor specialized in Indian markets and financial systems. The user is asking: "${message}". Provide a helpful, accurate and concise response that is tailored to the Indian financial context. Use INR (₹) for any currency values.`;
      
      return await this.sendPromptToAI(prompt);
    } catch (error) {
      console.error("Error in AI chat:", error);
      throw new Error("Unable to process your request. Please try again later.");
    }
  }

  private async sendPromptToAI(prompt: string): Promise<string> {
    // Try to use Groq API first if API key is available
    if (this.groqApiKey) {
      try {
        const response = await axios.post(
          this.groqApiUrl,
          {
            model: "llama3-70b-8192",
            messages: [
              { role: "system", content: "You are a helpful financial advisor specializing in Indian markets and financial systems." },
              { role: "user", content: prompt }
            ],
            temperature: 0.5,
            max_tokens: 500
          },
          {
            headers: {
              "Authorization": `Bearer ${this.groqApiKey}`,
              "Content-Type": "application/json"
            }
          }
        );

        return response.data.choices[0].message.content.trim();
      } catch (error) {
        console.error("Error with Groq API:", error);
        // Fall back to OpenAI if Groq fails
      }
    }

    // Fall back to OpenAI if Groq key is not available or if Groq request failed
    if (this.openai) {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful financial advisor specializing in Indian markets and financial systems." },
          { role: "user", content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.5,
      });

      return response.choices[0].message.content?.trim() || "";
    }

    // If no AI service is available, return a fallback message
    return "I'm sorry, I couldn't process your request at the moment. Please check your API configuration or try again later.";
  }
}

export const aiService = new AIService();
