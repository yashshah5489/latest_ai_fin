import { useState, useEffect, useRef } from "react";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChatMessage from "@/components/ai-chat/chat-message";
import ChatInput from "@/components/ai-chat/chat-input";
import UploadButton from "@/components/document-upload/upload-button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { fetchAIInsight, sendChatMessage, fetchChatHistory, type ChatMessage as ChatMessageType, type AIInsight } from "@/api/ai";
import { Skeleton } from "@/components/ui/skeleton";

export default function AIAdvisor() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [localMessages, setLocalMessages] = useState<ChatMessageType[]>([]);

  // Get AI insight
  const { 
    data: insight, 
    isLoading: isInsightLoading,
    error: insightError
  } = useQuery<AIInsight>({
    queryKey: ['/api/ai/insights'],
    queryFn: fetchAIInsight,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Get chat history
  const {
    data: chatHistory,
    isLoading: isHistoryLoading
  } = useQuery<ChatMessageType[]>({
    queryKey: ['/api/ai/chat-history'],
    queryFn: fetchChatHistory,
    onSuccess: (data) => {
      // Only set messages from the server if we don't have local messages yet
      if (localMessages.length === 0 && data.length > 0) {
        setLocalMessages(data);
      }
    }
  });

  // AI chat mutation
  const chatMutation = useMutation({
    mutationFn: sendChatMessage,
    onSuccess: (data) => {
      // Add the assistant response
      const assistantMessage: ChatMessageType = {
        id: `assistant-${Date.now()}`,
        content: data.response,
        role: "assistant",
        timestamp: new Date().toISOString()
      };
      
      setLocalMessages(prev => [...prev, assistantMessage]);
      
      // Invalidate chat history query to refresh on next fetch
      queryClient.invalidateQueries({ queryKey: ['/api/ai/chat-history'] });
    }
  });

  const handleSubmit = (message: string) => {
    // Add user message to local state
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      content: message,
      role: "user",
      timestamp: new Date().toISOString()
    };
    
    setLocalMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(message);
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const messages = localMessages.length > 0 ? localMessages : (chatHistory || []);

  return (
    <Card className="border">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Bot className="mr-2 h-5 w-5 text-primary" />
          AI Financial Advisor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          {isInsightLoading ? (
            <Skeleton className="h-12 w-full" />
          ) : insightError ? (
            <p className="text-sm text-muted-foreground">Unable to get personalized insights now. Try again later.</p>
          ) : (
            <>
              <p className="text-sm mb-2">
                {insight?.message || "Connect your accounts to get personalized AI insights."}
              </p>
              <Button variant="outline" size="sm" className="inline-flex items-center text-xs font-medium">
                <Bot className="h-3 w-3 mr-1" />
                AI Insight {insight && `(${Math.round(insight.confidence * 100)}% confidence)`}
              </Button>
            </>
          )}
        </div>
        
        <div className="mt-4 border-t pt-4">
          <div className="h-48 overflow-y-auto mb-4 space-y-3 pr-1">
            {isHistoryLoading && messages.length === 0 ? (
              <>
                <Skeleton className="h-16 w-3/4 mx-auto mb-2" />
                <Skeleton className="h-16 w-3/4 mx-auto" />
              </>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.content}
                  role={message.role}
                  timestamp={new Date(message.timestamp)}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <ChatInput 
            onSendMessage={handleSubmit} 
            isLoading={chatMutation.isPending}
            placeholder="Ask me anything about your finances..."
          />
          <p className="text-xs text-muted-foreground mt-2">
            Your conversation is private and secure. Ask about investment advice, tax planning, or retirement strategies.
          </p>
        </div>
        
        <div className="mt-4 flex justify-center">
          <UploadButton />
        </div>
      </CardContent>
    </Card>
  );
}
