import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function ChatInput({ 
  onSendMessage, 
  isLoading = false,
  placeholder = "Type your message..."
}: ChatInputProps) {
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
        className="flex-1 rounded-r-none focus-visible:ring-1 focus-visible:ring-primary/70"
        placeholder={placeholder}
        disabled={isLoading}
        autoComplete="off"
      />
      <Button 
        type="submit" 
        variant="default"
        size="icon"
        className="rounded-l-none h-10"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}
