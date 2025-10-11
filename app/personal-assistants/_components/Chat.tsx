"use client";

import React, { useEffect, useRef, useState } from "react";
import { Users, ChevronDown } from "lucide-react";
import { default as MessageComponent } from "@/components/chat/Message";
import MessageInput from "@/components/chat/MessageInput";
import MessageLoading from "@/components/chat/MessageLoading";
import { Button } from "@/components/ui/button";
import { ViewType } from "@/types/view";
import { useThemeColor } from "@/providers/color-theme-provider";
import { logger } from "@/utils/logger";
import { useMessages, MemoryOperation } from "@/providers/message-provider";
import { useQuery } from "@tanstack/react-query";
import { AgentGroupService } from "@/service/agent-groups";
import { cn } from "@/utils/cn";
import { Badge } from "@/components/ui/badge";
import { useAgentGroupSelection } from "@/providers/agent-groups-provider";

type Props = {
  handleNavClick: (view: ViewType) => void;
};

// Helper function to format error messages for better UX
const formatErrorMessage = (error: string): string => {
  // Try to parse as JSON error
  if (error.includes('{"detail":[')) {
    try {
      const errorObj = JSON.parse(error);
      if (errorObj.detail && Array.isArray(errorObj.detail)) {
        const messages = errorObj.detail
          .map((e: any) => e.msg || e.message)
          .filter(Boolean);
        if (messages.length > 0) {
          return messages.join(". ");
        }
      }
    } catch {
      // Continue with original error
    }
  }

  // Remove common JSON error patterns
  let formatted = error
    .replace(/\{"detail":\[.*?\]\}/g, "")
    .replace(/\[object Object\]/g, "")
    .trim();

  // If error is too generic, make it more helpful
  if (formatted === "Message" || formatted.length < 3) {
    return "The agent encountered an issue processing your request. Please try rephrasing your message.";
  }

  return formatted || "An unexpected error occurred. Please try again.";
};

const ChatInterface: React.FC<Props> = ({ handleNavClick }) => {
  const { themeColor } = useThemeColor();
  const { selectedAgentGroup, selectAgentGroup } = useAgentGroupSelection();
  const {
    state: messagesState,
    abortControllerRef,
    addUserMessage,
    startStreaming,
    updateStreamingContent,
    addMemoryOperation,
    addToolCall,
    addAgentTransfer,
    setCurrentAgent,
    finishResponse,
    addError,
    stopStreaming,
  } = useMessages();

  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isWaitingForStream, setIsWaitingForStream] = useState<boolean>(false);

  const selectedGroupId = selectedAgentGroup?.group_id || null;

  // Fetch agent groups
  const { data: agentGroupsResponse, isLoading: groupsLoading } = useQuery({
    queryKey: ["agent-groups"],
    queryFn: () => AgentGroupService.getAgentGroups(),
  });

  const agentGroups = agentGroupsResponse?.data?.items || [];

  // Auto-select first group if none selected
  useEffect(() => {
    if (agentGroups.length > 0 && !selectedGroupId) {
      selectAgentGroup(agentGroups[0]);
    }
  }, [agentGroups, selectedGroupId, selectAgentGroup]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesState.messages]);

  const handleStreamResponse = async (userMessage: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsWaitingForStream(true);

    try {
      if (!selectedGroupId) {
        setIsWaitingForStream(false);
        throw Error("No agent group selected. Please select an agent group.");
      }

      if (!messagesState.currentThreadId) {
        setIsWaitingForStream(false);
        throw Error("No thread ID available. Please start a new conversation.");
      }

      // Use the agent group streaming endpoint
      const streamUrl = AgentGroupService.streamAgentGroupChat(
        selectedGroupId,
        userMessage,
        messagesState.currentThreadId
      );

      const response = await fetch(streamUrl, {
        method: "GET",
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const stream = response.body;

      if (!stream) {
        addError("No response received from the server");
        return;
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();

      const selectedGroup = agentGroups.find(
        (g) => g.group_id === selectedGroupId
      );
      const streamingMessageId = startStreaming(
        selectedGroup?.name || "Agent Group"
      );

      let accumulatedContent = "";
      let pendingMemoryCall: {
        type: string;
        tool: string;
        args: any;
      } | null = null;

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });

          // Hide loading indicator once we start receiving data
          if (isWaitingForStream) {
            setIsWaitingForStream(false);
          }

          // Parse each line that starts with "data: "
          const lines = chunk
            .split("\n")
            .filter((line) => line.startsWith("data: "));

          for (const line of lines) {
            try {
              const jsonStr = line.replace("data: ", "");
              let data: any;
              try {
                data = JSON.parse(jsonStr);
              } catch (parseError) {
                process.env.NODE_ENV == "development"
                  ? logger(parseError, "JSON Parse Failed, Error ", "error")
                  : logger("json parsing might have failed", "", "warning");
                continue;
              }

              // Handle error messages from the backend
              if (data.type === "error" || data.error) {
                const rawError =
                  data.message || data.error || "An error occurred";
                const formattedError = formatErrorMessage(rawError);
                logger(`Stream error: ${formattedError}`, "Error", "error");
                addError(formattedError);
                stopStreaming();
                return;
              } else if (data.type === "content" && data.content) {
                // Check if content looks like an error object
                if (
                  data.content.trim().startsWith("{") &&
                  data.content.includes("detail")
                ) {
                  try {
                    const errorObj = JSON.parse(data.content);
                    if (errorObj.detail) {
                      // Extract error message from detail array
                      const errorMsg = Array.isArray(errorObj.detail)
                        ? errorObj.detail.map((e: any) => e.msg).join(", ")
                        : errorObj.detail;
                      logger(
                        `Parsed error from content: ${errorMsg}`,
                        "Error",
                        "error"
                      );
                      addError(formatErrorMessage(errorMsg));
                      stopStreaming();
                      return;
                    }
                  } catch {
                    // Not a JSON error, continue normally
                  }
                }

                accumulatedContent += data.content;
                updateStreamingContent(streamingMessageId, data.content);
              } else if (data.type === "memory_call") {
                pendingMemoryCall = data;
              } else if (data.type === "memory_result" && pendingMemoryCall) {
                const memoryOperation: MemoryOperation = {
                  type: pendingMemoryCall.tool as
                    | "add_message_to_memory"
                    | "retrieve_memory",
                  args: pendingMemoryCall.args,
                  result: JSON.parse(data.output),
                };

                addMemoryOperation(memoryOperation);
                pendingMemoryCall = null;
              } else if (data.type === "tool_call") {
                // Handle tool calls, especially transfers
                if (data.tool) {
                  addToolCall(streamingMessageId, data.tool, data.args || {});

                  // Check if this is a transfer
                  if (
                    data.tool.startsWith("transfer_to_") ||
                    data.tool.toLowerCase().includes("transfer")
                  ) {
                    // Extract the target agent name
                    const targetAgent = data.tool
                      .replace("transfer_to_", "")
                      .replace(/_/g, " ");
                    const currentAgentName = selectedGroup?.name || "Agent";

                    addAgentTransfer(
                      streamingMessageId,
                      currentAgentName,
                      targetAgent
                    );

                    logger(
                      `Agent transfer: ${currentAgentName} -> ${targetAgent}`,
                      "Transfer",
                      "info"
                    );
                  }
                }
              } else if (data.type === "agent_name" && data.agent_name) {
                // Handle agent name/switch events
                setCurrentAgent(streamingMessageId, data.agent_name);
                logger(
                  `Agent switched to: ${data.agent_name}`,
                  "Agent",
                  "info"
                );
              }
            } catch (e) {
              console.error("Error parsing stream data:", e);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      if (accumulatedContent) {
        // Check if accumulated content contains error patterns
        if (accumulatedContent.includes('{"detail":[')) {
          try {
            const errorObj = JSON.parse(accumulatedContent);
            if (errorObj.detail) {
              const errorMsg = Array.isArray(errorObj.detail)
                ? errorObj.detail
                    .map((e: any) => e.msg || e)
                    .filter(Boolean)
                    .join(", ") || "An error occurred"
                : errorObj.detail;
              logger(
                `Error detected in final content: ${errorMsg}`,
                "Error",
                "error"
              );
              addError(formatErrorMessage(errorMsg));
              stopStreaming();
              return;
            }
          } catch {
            // Not parseable JSON, check for plain error text
          }
        }

        // Check for common error patterns in text
        if (
          accumulatedContent.toLowerCase().includes("error") &&
          accumulatedContent.trim().length < 200 &&
          (accumulatedContent.includes("connecting") ||
            accumulatedContent.includes("failed"))
        ) {
          logger(
            `Potential error in content: ${accumulatedContent}`,
            "Error",
            "warning"
          );
          addError(formatErrorMessage(accumulatedContent));
          stopStreaming();
          return;
        }

        finishResponse(
          streamingMessageId,
          accumulatedContent,
          selectedGroup?.name || "Agent Group"
        );
      } else {
        stopStreaming();
      }
    } catch (error) {
      setIsError(true);

      if (error instanceof Error && error.name === "AbortError") {
        stopStreaming();
        return;
      }

      const errorText =
        error instanceof Error
          ? error.message
          : "I'm sorry, I encountered an error. Please try again.";

      addError(errorText);
    } finally {
      setIsError(false);
      setIsWaitingForStream(false);
      stopStreaming();
    }
  };

  const handleSendMessage = async (): Promise<void> => {
    if (message.trim() && !messagesState.isStreaming) {
      addUserMessage(message);
      const userMessage = message;
      setMessage("");

      await handleStreamResponse(userMessage);
    }
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="flex flex-1 flex-col overflow-hidden max-h-screen md:max-h-[92vh] min-[2048px]:max-h-[95vh]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 h-full">
        {groupsLoading ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-secondary animate-pulse">
              <Users className="size-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-xl font-medium">Loading Agent Groups</h3>
            <p className="text-muted-foreground">
              Please wait while we load your agent groups...
            </p>
          </div>
        ) : agentGroups.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div
              style={{ backgroundColor: themeColor }}
              className="mb-4 flex size-16 items-center justify-center rounded-full text-white"
            >
              <Users className="size-8" />
            </div>
            <h3 className="mb-2 text-xl font-medium">No Agent Groups Found</h3>
            <p className="mb-6 text-muted-foreground">
              Create your first agent group to start multi-agent conversations
            </p>
            <Button
              variant="default"
              style={{ backgroundColor: themeColor }}
              onClick={() => {
                handleNavClick("multi-agent-creation");
              }}
            >
              Create Agent Group
            </Button>
          </div>
        ) : !selectedGroupId ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div
              style={{ backgroundColor: themeColor }}
              className="mb-4 flex size-16 items-center justify-center rounded-full text-white"
            >
              <Users className="size-8" />
            </div>
            <h3 className="mb-2 text-xl font-medium">
              No Agent Group Selected
            </h3>
            <p className="mb-6 text-muted-foreground">
              Select an agent group to start a multi-agent conversation
            </p>
          </div>
        ) : messagesState.messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center px-4">
            <div
              style={{ backgroundColor: themeColor }}
              className="mb-6 flex size-16 items-center justify-center rounded-full text-white"
            >
              <Users className="size-8" />
            </div>
            <h3 className="mb-6 text-xl font-medium">Start a conversation</h3>

            {/* Agent Group Selector */}
            {agentGroups.length > 0 && (
              <div className="w-full max-w-md mb-6">
                <div className="flex flex-col items-center gap-3">
                  <span className="text-sm text-muted-foreground whitespace-nowrap font-medium">
                    Agent Group
                  </span>
                  <div className="relative w-full">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        <span className="text-nowrap truncate">
                          {agentGroups.find(
                            (g) => g.group_id === selectedGroupId
                          )?.name || "Select Agent Group"}
                        </span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setIsDropdownOpen(false)}
                        />
                        <div className="absolute top-full left-0 right-0 bg-popover border rounded-lg shadow-lg z-20 mt-1 max-h-64 overflow-y-auto">
                          {agentGroups.map((group) => (
                            <button
                              key={group.group_id}
                              onClick={() => {
                                selectAgentGroup(group);
                                setIsDropdownOpen(false);
                              }}
                              className={cn(
                                "w-full p-3 text-left hover:bg-accent transition-colors border-b last:border-b-0",
                                selectedGroupId === group.group_id &&
                                  "bg-accent"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">
                                    {group.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground truncate">
                                    {group.description}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {group.num_agents} agents
                                  </Badge>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {group.architecture}
                                  </Badge>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              Type a message below to engage with the multi-agent system
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl">
            {messagesState.messages.map((msg) => (
              <div key={msg.id} className="mb-4">
                <MessageComponent message={msg} isError={isError} />

                {msg.isStreaming && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageLoading size="size-2" />
                    <span>Agents are collaborating...</span>
                  </div>
                )}

                {msg.agentName &&
                  msg.sender === "assistant" &&
                  !msg.isStreaming && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      — {msg.agentName}
                    </div>
                  )}
              </div>
            ))}

            {/* Loading indicator while waiting for stream to start */}
            {isWaitingForStream && (
              <div className="mb-4 flex items-start gap-3 animate-in fade-in duration-300">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                  <MessageLoading size="size-2" />
                </div>
                <div className="flex-1 mt-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>Connecting to agents...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 md:p-5">
        <div className="mx-auto max-w-4xl">
          {/* Message Input */}
          <MessageInput
            message={message}
            setMessage={setMessage}
            handleKeyPress={handleKeyPress}
            handleSendMessage={handleSendMessage}
            disabled={messagesState.isStreaming || !selectedGroupId}
          />

          {messagesState.isStreaming && (
            <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
              <MessageLoading />
              <span>
                Processing your message with{" "}
                {agentGroups.find((g) => g.group_id === selectedGroupId)?.name}
                ...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
