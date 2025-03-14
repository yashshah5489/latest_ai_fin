import { useState } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export default function ChatInput({ onSendMessage, isLoading = false }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    onSendMessage(input);
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-1 bg-dark-800 text-white border border-gray-700 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
        placeholder="Ask me anything about your finances..."
        disabled={isLoading}
      />
      <Button 
        type="submit" 
        className="bg-primary-600 rounded-r-lg p-2 text-white"
        disabled={isLoading}
      >
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
}
