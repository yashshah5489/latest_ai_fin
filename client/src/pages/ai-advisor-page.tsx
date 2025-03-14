import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ChatMessage from "@/components/ai-chat/chat-message";
import ChatInput from "@/components/ai-chat/chat-input";
import UploadButton from "@/components/document-upload/upload-button";
import { Bot } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export default function AIAdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get chat history
  const { data: chatHistory } = useQuery({
    queryKey: ['/api/ai/chat/history'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/ai/chat/history');
      return res.json();
    }
  });

  // Set chat history
  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      setMessages(chatHistory.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })));
    }
  }, [chatHistory]);

  // AI chat mutation
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest('POST', '/api/ai/chat', { message });
      return res.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: data.response,
        role: "assistant",
        timestamp: new Date()
      }]);
    }
  });

  const handleSendMessage = (message: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(message);
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen overflow-hidden bg-dark-800 text-white">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <h1 className="text-2xl font-heading font-bold">AI Financial Advisor</h1>
          <p className="text-gray-400">Get personalized financial advice and insights.</p>
          
          <Card className="bg-dark-700 border-dark-600">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="mr-2 h-5 w-5 text-primary-500" />
                Chat with your AI Advisor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] flex flex-col">
                <div className="flex-1 overflow-y-auto mb-4 p-4 space-y-4 bg-dark-800 rounded-lg">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <Bot className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                      <h3 className="text-lg font-medium mb-2">Welcome to your AI Financial Advisor</h3>
                      <p className="max-w-md mx-auto">
                        Ask me anything about your finances, investments, budget planning, or financial goals.
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <ChatMessage
                        key={message.id}
                        message={message.content}
                        role={message.role}
                        timestamp={message.timestamp}
                      />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="mt-auto">
                  <ChatInput 
                    onSendMessage={handleSendMessage} 
                    isLoading={chatMutation.isPending}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Your conversation is private and secure. Our AI is trained on Indian financial data to provide tailored advice.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-center">
                <UploadButton />
                <p className="text-xs text-gray-500 ml-4 max-w-xs">
                  Upload financial documents for AI analysis. We support PDF and Excel formats for statements, tax returns, and investment reports.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
