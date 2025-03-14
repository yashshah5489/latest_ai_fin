import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

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
  return (
    <div className={cn(
      "p-3 max-w-[80%]",
      role === "assistant" 
        ? "chat-bubble-ai bg-dark-600 rounded-tr-xl rounded-br-xl rounded-bl-xl" 
        : "chat-bubble-user ml-auto bg-primary-600 rounded-tl-xl rounded-tr-xl rounded-bl-xl"
    )}>
      <p className={cn(
        "text-sm",
        role === "assistant" ? "text-gray-200" : "text-white"
      )}>
        {message}
      </p>
      <p className={cn(
        "text-xs mt-1",
        role === "assistant" ? "text-gray-400" : "text-gray-300"
      )}>
        {formatDistanceToNow(timestamp, { addSuffix: true })}
      </p>
    </div>
  );
}
