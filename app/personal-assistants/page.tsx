"use client";

import { ViewType } from "@/types/view";
import React, { useState } from "react";
import SideMenuBar from "./_layout/SideBar";

import Chat from "./_components/Chat";
import AgentConfiguration from "./_components/AgentConfiguration";
import AgentGroups from "./_components/AgentGroups";
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
    if (view === "agent-groups") {
      setAgentGroupView("list");
      setSelectedGroupId(null);
    }
  };

  const handleConfigureGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setCurrentView("agent-configuration");
  };

  const handleBackToGroups = () => {
    setAgentGroupView("list");
    setSelectedGroupId(null);
  };

  const handleDeleteGroup = () => {
    // Navigate back to agent groups creation page
    setCurrentView("agent-groups");
    setAgentGroupView("list");
    setSelectedGroupId(null);
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

        {/* Agent Groups */}
        {currentView == "agent-groups" && agentGroupView === "list" ? (
          <AgentGroups onConfigureGroup={handleConfigureGroup} />
        ) : (
          <></>
        )}

        {/* Agent Configuration */}
        {currentView == "agent-configuration" ? (
          <AgentConfiguration
            selectedGroupId={selectedGroupId}
            onDeleteGroup={handleDeleteGroup}
          />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
