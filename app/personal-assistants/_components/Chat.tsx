"use client";

import React, { useEffect, useRef, useState } from "react";
import { Users, ChevronDown, Settings } from "lucide-react";
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

type Props = {
  handleNavClick: (view: ViewType) => void;
};

const VoiceAICustomerInterface: React.FC<Props> = ({ handleNavClick }) => {
  const { themeColor } = useThemeColor();
  const {
    state: messagesState,
    abortControllerRef,
    addUserMessage,
    startStreaming,
    updateStreamingContent,
    addMemoryOperation,
    finishResponse,
    addError,
    stopStreaming,
  } = useMessages();

  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Fetch agent groups
  const { data: agentGroupsResponse, isLoading: groupsLoading } = useQuery({
    queryKey: ["agent-groups"],
    queryFn: () => AgentGroupService.getAgentGroups(),
  });

  const agentGroups = agentGroupsResponse?.data?.items || [];

  // Auto-select first group if none selected
  useEffect(() => {
    if (agentGroups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(agentGroups[0].group_id);
    }
  }, [agentGroups, selectedGroupId]);

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

    try {
      if (!selectedGroupId) {
        throw Error("No agent group selected. Please select an agent group.");
      }

      if (!messagesState.currentThreadId) {
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

              if (data.type === "content" && data.content) {
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

  const toggleListening = (): void => {
    setIsListening(!isListening);
    setIsRecording(!isRecording);
  };

  // Auto-select first group if available
  useEffect(() => {
    if (agentGroups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(agentGroups[0].group_id);
    }
  }, [agentGroups, selectedGroupId]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="flex flex-1 flex-col overflow-hidden max-h-[92vh] min-[2048px]:max-h-[95vh]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 h-full">
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
                handleNavClick("agent-groups");
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
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div
              style={{ backgroundColor: themeColor }}
              className="mb-4 flex size-16 items-center justify-center rounded-full text-white"
            >
              <Users className="size-8" />
            </div>
            <h3 className="mb-2 text-xl font-medium">
              Start a conversation with{" "}
              {agentGroups.find((g) => g.group_id === selectedGroupId)?.name}
            </h3>
            <p className="mb-6 text-muted-foreground">
              Type a message to engage with this multi-agent system
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

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t p-5 bg-card">
        <div className="mx-auto max-w-4xl">
          {/* Agent Group Selector */}
          {agentGroups.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  Agent Group:
                </span>
                <div className="relative flex-1 max-w-md">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      <span className="text-nowrap truncate">
                        {agentGroups.find((g) => g.group_id === selectedGroupId)
                          ?.name || "Select Agent Group"}
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
                    <div className="absolute bottom-full left-0 right-0 bg-popover border rounded-lg shadow-lg z-10 mb-1 max-h-64 overflow-y-auto">
                      {agentGroups.map((group) => (
                        <button
                          key={group.group_id}
                          onClick={() => {
                            setSelectedGroupId(group.group_id);
                            setIsDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full p-3 text-left hover:bg-accent transition-colors border-b last:border-b-0",
                            selectedGroupId === group.group_id && "bg-accent"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{group.name}</div>
                              <div className="text-sm text-muted-foreground truncate">
                                {group.description}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {group.num_agents} agents
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {group.architecture}
                              </Badge>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleNavClick("agent-configuration")}
                  className="size-12 sm:size-13"
                >
                  <Settings className="size-4 lg:size-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Message Input */}
          <MessageInput
            message={message}
            isRecording={isRecording}
            setMessage={setMessage}
            handleKeyPress={handleKeyPress}
            handleSendMessage={handleSendMessage}
            toggleListening={toggleListening}
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

export default VoiceAICustomerInterface;
