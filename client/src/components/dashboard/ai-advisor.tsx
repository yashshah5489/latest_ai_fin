import { useState, useEffect, useRef } from "react";
import { Bot, Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChatMessage from "@/components/ai-chat/chat-message";
import UploadButton from "@/components/document-upload/upload-button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export default function AIAdvisor() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Get AI insight
  const { data: insight } = useQuery({
    queryKey: ['/api/ai/insight'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/ai/insight');
      return res.json();
    }
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(input);
    setInput("");
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card className="bg-dark-700 border-dark-600">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Bot className="mr-2 h-5 w-5 text-primary-500" />
          AI Financial Advisor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <p className="text-gray-300 text-sm mb-2">
            {insight?.message || "Based on your portfolio, I recommend diversifying into tech stocks. Your current exposure to financial sector is high (45% of portfolio)."}
          </p>
          <Button variant="outline" size="sm" className="inline-flex items-center text-xs font-medium text-primary-400 hover:text-primary-300 bg-primary-400/10 border-none">
            <Bot className="h-3 w-3 mr-1" />
            AI Insight
          </Button>
        </div>
        
        <div className="mt-4 border-t border-gray-800 pt-4">
          <div className="h-48 overflow-y-auto mb-4 space-y-3 scrollbar-thin">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <Bot className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                <p>No messages yet. Start a conversation!</p>
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
          
          <form onSubmit={handleSubmit} className="flex items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-dark-800 text-white border border-gray-700 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Ask me anything about your finances..."
            />
            <Button 
              type="submit" 
              className="bg-primary-600 rounded-r-lg p-2 text-white"
              disabled={chatMutation.isPending}
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            Your conversation is private and secure. You can ask about investment advice, budget optimization, or retirement planning.
          </p>
        </div>
        
        <div className="mt-4 flex justify-center">
          <UploadButton />
        </div>
      </CardContent>
    </Card>
  );
}
