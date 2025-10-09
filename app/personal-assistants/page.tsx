"use client";

import { ViewType } from "@/types/view";
import React, { useState } from "react";
import SideMenuBar from "./_layout/SideBar";

import Chat from "./_components/Chat";
import MultiAgentCreation from "./_components/final/MultiAgentCreation";
import FinalAgentConfiguration from "./_components/final/AgentConfiguration";
import NavBar from "./_layout/NavBar";

export default function PersonalAssitants() {
  const [currentView, setCurrentView] =
    useState<ViewType>("customer-interface");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [agentGroupView, setAgentGroupView] = useState<"list" | "configure">(
    "list"
  );

  const toggleSidebar = (): void => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavClick = (view: ViewType): void => {
    setCurrentView(view);
    setSidebarOpen(false);
    if (view === "multi-agent-creation") {
      setAgentGroupView("list");
      setSelectedGroupId(null);
    }
    // Reset selectedGroupId when navigating to agent-configuration to show empty state
    if (view === "agent-configuration") {
      setSelectedGroupId(null);
    }
  };

  const handleConfigureGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setCurrentView("agent-configuration");
  };

  const handleDeleteGroup = () => {
    // Navigate back to multi-agent creation page
    setCurrentView("multi-agent-creation");
    setAgentGroupView("list");
    setSelectedGroupId(null);
  };

  const handleCreateGroup = () => {
    // Navigate to multi-agent creation page
    setCurrentView("multi-agent-creation");
    setAgentGroupView("list");
  };

  return (
    <div className="relative flex min-h-screen size-full overflow-hidden ">
      {/* Sidebar Overlay for Mobile */}

      {/* Sidebar */}
      <SideMenuBar
        sidebarOpen={sidebarOpen}
        currentView={currentView}
        handleNavClick={handleNavClick}
        toggleSidebar={toggleSidebar}
      />
      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <NavBar toggleSidebar={toggleSidebar} />
        {/* Chat Area */}
        {currentView == "customer-interface" ? (
          <Chat handleNavClick={handleNavClick} />
        ) : (
          <></>
        )}

        {/* Multi-Agent Creation */}
        {currentView == "multi-agent-creation" && agentGroupView === "list" ? (
          <MultiAgentCreation onConfigureGroup={handleConfigureGroup} />
        ) : (
          <></>
        )}

        {/* Agent Configuration */}
        {currentView == "agent-configuration" ? (
          <FinalAgentConfiguration
            selectedGroupId={selectedGroupId}
            onDeleteGroup={handleDeleteGroup}
            onCreateGroup={handleCreateGroup}
          />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
