import { Button } from "@/components/ui/button";
import { ThemedTextarea as Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import React, { useRef, useEffect } from "react";
import { cn } from "@/utils/cn";

type Props = {
  message: string;
  disabled: boolean;
  handleSendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
};

const MessageInput = ({
  disabled,
  message,
  handleKeyPress,
  setMessage,
  handleSendMessage,
}: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextareaInput = (
    e: React.FormEvent<HTMLTextAreaElement>
  ): void => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = "auto";
    target.style.height = Math.min(target.scrollHeight, 120) + "px";
  };

  // Auto-resize textarea when message changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [message]);

  return (
    <div className="relative">
      <div className="flex items-end gap-3">
        <div className="relative flex-1">
          <Textarea
            disabled={disabled}
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className={cn(
              "min-h-[56px] max-h-[120px] resize-none transition-all duration-300",
              "rounded-xl border-2 px-4 py-3.5",
              "focus:ring-2 focus:ring-primary/20 focus:border-primary",
              "text-sm sm:text-base",
              "placeholder:text-muted-foreground/60",
              "shadow-sm focus:shadow-md",
              "bg-background/50 backdrop-blur-sm",
              disabled && "opacity-60 cursor-not-allowed"
            )}
            rows={1}
            onInput={handleTextareaInput}
          />
        </div>

        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || disabled}
          size="icon"
          className={cn(
            "size-12 sm:size-13 rounded-xl transition-all duration-300 shadow-lg",
            !message.trim() || disabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:shadow-xl hover:-translate-y-0.5 bg-primary hover:bg-primary/90"
          )}
        >
          <Send
            className={cn(
              "size-5 transition-transform duration-300",
              message.trim() && !disabled && "group-hover:translate-x-0.5"
            )}
          />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
