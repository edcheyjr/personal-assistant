import { MessageProps } from "@/types/message";
import React from "react";
import { cn } from "@/utils/cn";
import { generateThemeCSS, getThemeRGB } from "@/lib/theme";
import MarkdownWrapper from "../MarkdownWrapper";
import { useThemeColor } from "@/providers/color-theme-provider";
import MemoryOperationsDisplay from "./MemoryDisplay";
import AgentActivityDisplay from "./AgentActivityDisplay";

const Message: React.FC<MessageProps> = ({ message, isError }) => {
  const { themeColor } = useThemeColor();

  const themeRGB = getThemeRGB(themeColor);

  const userMessageStyle = {
    backgroundColor: themeColor,
    ...generateThemeCSS(themeColor),
    color: `${themeRGB.r} ${themeRGB.g} ${themeRGB.b}`,
  };

  // Assistant messages now fill width with no background
  if (message.sender === "assistant") {
    return (
      <div className="flex mb-4 px-4 sm:px-6">
        <div className="w-full py-3">
          {/* Agent Name Header */}
          {message.agentName && (
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20">
                <div className="size-2 rounded-full bg-primary" />
                <span className="font-semibold text-sm text-primary">
                  {message.agentName}
                </span>
              </div>
              {message.timestamp && (
                <span className="text-xs text-muted-foreground/70">
                  {message.timestamp}
                </span>
              )}
            </div>
          )}

          <MarkdownWrapper>{message.text}</MarkdownWrapper>

          {/* Memory Operations Display */}
          {message.memoryOperations && message.memoryOperations.length > 0 && (
            <MemoryOperationsDisplay operations={message.memoryOperations} />
          )}

          {/* Agent Activity Display */}
          <AgentActivityDisplay
            currentAgent={message.currentAgent}
            toolCalls={message.toolCalls}
            toolResults={message.toolResults}
            agentTransfers={message.agentTransfers}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex mb-4 px-4 sm:px-6",
        message.sender === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg",
          "transition-all duration-200",

          // User message - modern, clean design
          message.sender === "user" && [
            "rounded-2xl px-4 py-2.5",
            "text-white",
            "shadow-sm hover:shadow-md",
          ],

          // System message (info or error)
          message.sender === "system" && [
            "rounded-lg px-4 py-3 shadow-sm",
            isError
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
            "border",
            isError
              ? "border-red-200 dark:border-red-700"
              : "border-blue-200 dark:border-blue-700",
          ]
        )}
        style={message.sender === "user" ? userMessageStyle : undefined}
      >
        <MarkdownWrapper>{message.text}</MarkdownWrapper>

        {message.timestamp && message.sender !== "user" && (
          <p className="mt-2 text-xs font-medium text-muted-foreground/70">
            {message.timestamp}
          </p>
        )}

        {/* Memory Operations Display */}
        {message.memoryOperations && message.memoryOperations.length > 0 && (
          <MemoryOperationsDisplay operations={message.memoryOperations} />
        )}

        {/* Agent Activity Display */}
        <AgentActivityDisplay
          currentAgent={message.currentAgent}
          toolCalls={message.toolCalls}
          toolResults={message.toolResults}
          agentTransfers={message.agentTransfers}
        />
      </div>
    </div>
  );
};

export default Message;
