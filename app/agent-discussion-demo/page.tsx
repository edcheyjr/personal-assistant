"use client";

import { useState } from "react";
import AgentDiscussionVisualizer from "@/components/AgentDiscussionVisualizer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function AgentDiscussionDemoPage() {
  const [agentGroupId, setAgentGroupId] = useState("");
  const [userInput, setUserInput] = useState("");
  const [threadId, setThreadId] = useState(() => {
    // Generate UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  });
  const [streamUrl, setStreamUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleStartDiscussion = () => {
    if (!agentGroupId.trim()) {
      setError("Please enter an Agent Group ID");
      return;
    }
    if (!userInput.trim()) {
      setError("Please enter a message");
      return;
    }

    setError("");
    const url = `/api/multi-agents/${agentGroupId}/chat/stream?` +
      `user_input=${encodeURIComponent(userInput)}&` +
      `thread_id=${threadId}`;
    setStreamUrl(url);
  };

  const handleNewConversation = () => {
    setStreamUrl("");
    setUserInput("");
    setThreadId('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }));
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <h1 className="text-2xl font-bold">Agent Discussion Visualizer Demo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Watch AI agents collaborate in real-time
        </p>
      </div>

      {/* Configuration Panel */}
      {!streamUrl && (
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-4">Start a Discussion</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Agent Group ID
                  </label>
                  <Input
                    placeholder="e.g., e846b602-004c-4ba8-9521-d2275378f4b6"
                    value={agentGroupId}
                    onChange={(e) => setAgentGroupId(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">
                    Your Message
                  </label>
                  <Input
                    placeholder="e.g., Discuss the importance of programming"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleStartDiscussion();
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">
                    Thread ID
                  </label>
                  <Input
                    value={threadId}
                    onChange={(e) => setThreadId(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto-generated. Change if continuing an existing conversation.
                  </p>
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleStartDiscussion}
                  className="w-full"
                  size="lg"
                >
                  Start Discussion
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold mb-2">Example Agent Groups</h3>
              <div className="space-y-2">
                <div className="text-sm">
                  <button
                    onClick={() => setAgentGroupId("e846b602-004c-4ba8-9521-d2275378f4b6")}
                    className="text-primary hover:underline"
                  >
                    Programming Discussion Group
                  </button>
                  <p className="text-muted-foreground text-xs">
                    Team leads discuss software development topics
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Discussion View */}
      {streamUrl && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="border-b px-6 py-3 bg-card flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Active Discussion</p>
              <p className="text-xs text-muted-foreground">
                Thread: {threadId.slice(0, 8)}...
              </p>
            </div>
            <Button
              onClick={handleNewConversation}
              variant="outline"
              size="sm"
            >
              New Conversation
            </Button>
          </div>

          <div className="flex-1 min-h-0">
            <AgentDiscussionVisualizer
              streamUrl={streamUrl}
              onError={(err) => {
                setError(err.message);
                console.error("Stream error:", err);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
