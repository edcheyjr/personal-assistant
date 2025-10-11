"use client";

import React, { useState, useEffect, useRef } from "react";
import { Users, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

interface AgentMessage {
  id: string;
  agent: string;
  content: string;
  timestamp: Date;
}

interface AgentTransfer {
  id: string;
  from: string;
  to: string;
  timestamp: Date;
}

interface AgentDiscussionVisualizerProps {
  streamUrl: string;
  onError?: (error: Error) => void;
  className?: string;
}

const AgentDiscussionVisualizer: React.FC<AgentDiscussionVisualizerProps> = ({
  streamUrl,
  onError,
  className,
}) => {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [transfers, setTransfers] = useState<AgentTransfer[]>([]);
  const [currentAgent, setCurrentAgent] = useState<string>("Supervisor");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingContent, setStreamingContent] = useState<string>("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messageIdCounter = useRef<number>(0);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, transfers]);

  // Generate unique ID
  const generateId = () => {
    messageIdCounter.current += 1;
    return `${Date.now()}-${messageIdCounter.current}`;
  };

  // Get agent color
  const getAgentColor = (agent: string): string => {
    const colors: Record<string, string> = {
      Supervisor: "bg-blue-500",
      "Team Lead 1": "bg-purple-500",
      "Team Lead 2": "bg-green-500",
      "Peer 1": "bg-orange-500",
      "Peer 2": "bg-pink-500",
      "Specialist 1": "bg-indigo-500",
      "Specialist 2": "bg-cyan-500",
    };
    
    // Check for exact match
    if (colors[agent]) return colors[agent];
    
    // Generate color based on agent name hash
    const hash = agent.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorOptions = Object.values(colors);
    return colorOptions[hash % colorOptions.length];
  };

  // Get agent initials
  const getAgentInitials = (agent: string): string => {
    return agent
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Finish current message
  const finishCurrentMessage = () => {
    if (streamingContent.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          agent: currentAgent,
          content: streamingContent.trim(),
          timestamp: new Date(),
        },
      ]);
      setStreamingContent("");
    }
  };

  // Handle agent transfer
  const handleTransfer = (from: string, to: string) => {
    // Finish current message
    finishCurrentMessage();

    // Add transfer indicator
    setTransfers((prev) => [
      ...prev,
      {
        id: generateId(),
        from,
        to,
        timestamp: new Date(),
      },
    ]);

    // Update current agent
    setCurrentAgent(to);
  };

  // Format agent name from tool name
  const formatAgentName = (toolName: string): string => {
    return toolName
      .replace("transfer_to_", "")
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Start streaming
  useEffect(() => {
    const startStream = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setIsStreaming(true);

      try {
        const response = await fetch(streamUrl, {
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No reader available");
        }

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));

          for (const line of lines) {
            try {
              const jsonStr = line.replace("data: ", "");
              const data = JSON.parse(jsonStr);

              // Handle different event types
              if (data.type === "content" && data.content) {
                setStreamingContent((prev) => prev + data.content);
              } else if (data.type === "tool_call") {
                if (data.tool && data.tool.startsWith("transfer_to_")) {
                  const targetAgent = formatAgentName(data.tool);
                  handleTransfer(currentAgent, targetAgent);
                }
              } else if (data.type === "end") {
                finishCurrentMessage();
              }
            } catch (parseError) {
              console.warn("Failed to parse SSE data:", parseError);
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Streaming error:", error);
          onError?.(error);
        }
      } finally {
        setIsStreaming(false);
        finishCurrentMessage();
      }
    };

    if (streamUrl) {
      startStream();
    }

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [streamUrl]);

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="border-b px-4 py-3 bg-card">
        <div className="flex items-center gap-2">
          <Users className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Agent Discussion</h2>
          {isStreaming && (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          // Check if there's a transfer after this message
          const transferAfter = transfers.find(
            (t) => t.timestamp > message.timestamp && 
            (!messages[index + 1] || t.timestamp < messages[index + 1].timestamp)
          );

          return (
            <React.Fragment key={message.id}>
              {/* Agent Message */}
              <div className="flex gap-3">
                {/* Avatar */}
                <div
                  className={cn(
                    "flex-shrink-0 size-10 rounded-full flex items-center justify-center text-white font-semibold text-sm",
                    getAgentColor(message.agent)
                  )}
                >
                  {getAgentInitials(message.agent)}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{message.agent}</span>
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-foreground whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>

              {/* Transfer Indicator */}
              {transferAfter && (
                <div className="flex items-center justify-center py-3">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border">
                    <ArrowRight className="size-4 text-primary" />
                    <span className="text-sm font-medium">
                      Transferred to <span className="text-primary">{transferAfter.to}</span>
                    </span>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Streaming Message */}
        {streamingContent && (
          <div className="flex gap-3">
            <div
              className={cn(
                "flex-shrink-0 size-10 rounded-full flex items-center justify-center text-white font-semibold text-sm",
                getAgentColor(currentAgent)
              )}
            >
              {getAgentInitials(currentAgent)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{currentAgent}</span>
                <Loader2 className="size-3 animate-spin text-muted-foreground" />
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-foreground whitespace-pre-wrap">{streamingContent}</p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default AgentDiscussionVisualizer;
