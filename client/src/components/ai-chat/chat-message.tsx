import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export default function ChatMessage({
  message,
  role,
  timestamp
}: ChatMessageProps) {
  const isAssistant = role === "assistant";
  
  return (
    <div className={cn(
      "p-3 max-w-[85%] rounded-lg flex gap-2",
      isAssistant 
        ? "bg-accent/50" 
        : "ml-auto bg-primary/10"
    )}>
      {isAssistant && (
        <div className="flex-shrink-0 rounded-full bg-primary/10 h-6 w-6 flex items-center justify-center">
          <Bot className="h-3.5 w-3.5 text-primary" />
        </div>
      )}
      
      <div className="flex-1 space-y-1">
        <p className="text-sm whitespace-pre-wrap break-words">
          {message}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </p>
      </div>
      
      {!isAssistant && (
        <div className="flex-shrink-0 rounded-full bg-primary/20 h-6 w-6 flex items-center justify-center">
          <User className="h-3.5 w-3.5 text-primary" />
        </div>
      )}
    </div>
  );
}
