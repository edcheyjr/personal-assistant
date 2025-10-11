import React from "react";
import type { ToolCall, ToolResult, AgentTransfer } from "@/types/message";

interface AgentActivityDisplayProps {
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  agentTransfers?: AgentTransfer[];
  currentAgent?: string;
}

const AgentActivityDisplay: React.FC<AgentActivityDisplayProps> = ({
  toolCalls,
  toolResults,
  agentTransfers,
  currentAgent,
}) => {
  const hasActivity =
    (toolCalls && toolCalls.length > 0) ||
    (toolResults && toolResults.length > 0) ||
    (agentTransfers && agentTransfers.length > 0) ||
    currentAgent;

  if (!hasActivity) return null;

  return (
    <div className="mt-2 space-y-0.5">
      {/* Tool Calls */}
      {toolCalls &&
        toolCalls.map((toolCall, index) => (
          <div
            key={`tool-call-${index}`}
            className="text-xs text-muted-foreground/60 mt-1"
          >
            🔧 Calling: {toolCall.tool}
          </div>
        ))}

      {/* Tool Results */}
      {toolResults &&
        toolResults.map((toolResult, index) => (
          <div
            key={`tool-result-${index}`}
            className="text-xs text-muted-foreground/60 mt-1"
          >
            ✓ Completed: {toolResult.tool}
          </div>
        ))}

      {/* Agent Transfers */}
      {agentTransfers &&
        agentTransfers.map((transfer, index) => (
          <div
            key={`transfer-${index}`}
            className="mt-3 pt-3 border-t border-border/50"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-purple-500 animate-pulse" />
                <span className="italic">
                  Transferring to{" "}
                  <span className="font-medium text-foreground">
                    {transfer.to}
                  </span>
                </span>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default AgentActivityDisplay;
