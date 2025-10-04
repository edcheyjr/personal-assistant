"use client";

import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ViewType } from "@/types/view";
import {
  LoaderIcon,
  LogOut,
  LucideIcon,
  MessageSquare,
  Settings,
  X,
  Plus,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/utils/cn";
import { useAgentGroupContext } from "@/providers/agent-groups-provider";
import { useMessages } from "@/providers/message-provider"; // Import the messages provider
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { useThemeColor } from "@/providers/color-theme-provider";
import { useTheme } from "next-themes";

type Props = {
  sidebarOpen: boolean;
  currentView: ViewType;
  handleNavClick: (view: ViewType) => void;
  toggleSidebar: () => void;
};

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
  loading?: boolean;
  newChat?: boolean;
  currentTheme?: string;
}

const SideMenuBar = ({
  sidebarOpen,
  currentView,
  handleNavClick,
  toggleSidebar,
}: Props) => {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const currentTheme = theme == "system" ? systemTheme : theme;
  const { themeColor } = useThemeColor();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { agentGroups, isLoading } = useAgentGroupContext();
  const {
    startNewConversation,
    state: { isLoadingNewThread },
  } = useMessages();

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate total agents from all agent groups
  const totalAgents = agentGroups.reduce(
    (total, group) => total + group.num_agents,
    0
  );

  // Count unique architectures (replacing agent types)
  const uniqueArchitectures = new Set(
    agentGroups.map((group) => group.architecture)
  ).size;

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "GET",
      });

      if (response.ok) {
        // Redirect to auth page
        router.push("/auth");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      await startNewConversation();
      // Navigate to customer interface if not already there
      if (currentView !== "customer-interface") {
        handleNavClick("customer-interface");
      }
    } catch (error) {
      console.error("Failed to start new conversation:", error);
    }
  };

  const NavItem: React.FC<NavItemProps> = ({
    icon: Icon,
    label,
    active,
    onClick,
    loading = false,
    newChat,
  }) => (
    <Button
      variant={active ? "default" : "ghost"}
      onClick={onClick}
      disabled={loading}
      style={
        newChat && mounted
          ? {
              color: themeColor,
            }
          : undefined
      }
      className={cn(
        "w-full justify-start gap-3 h-auto font-medium transition-all",
        newChat ? "py-2" : "px-4 py-3",
        active
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      {loading ? (
        <LoaderIcon size={18} className="animate-spin" />
      ) : newChat ? (
        <div
          className="p-2 rounded-md"
          style={
            mounted
              ? {
                  backgroundColor: themeColor,
                  color: currentTheme === "light" ? "white" : "black",
                }
              : undefined
          }
        >
          <Icon size={18} />
        </div>
      ) : (
        <Icon size={18} />
      )}
      <span>{label}</span>
    </Button>
  );

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-card border-r border-border transition-transform duration-300 ease-in-out lg:relative",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="border-b border-border p-3">
          <div className="flex items-center justify-between w-full">
            <Logo />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          {/* New Chat Button */}
          <NavItem
            icon={Plus}
            label="New Chat"
            active={false}
            onClick={handleNewChat}
            loading={isLoadingNewThread}
            newChat
            currentTheme={currentTheme}
          />

          {/* Divider */}
          <Separator orientation="horizontal" />

          <NavItem
            icon={MessageSquare}
            label="Customer Interface"
            active={currentView === "customer-interface"}
            onClick={() => handleNavClick("customer-interface")}
          />
          <NavItem
            icon={Users}
            label="Agent Groups"
            active={currentView === "agent-groups"}
            onClick={() => handleNavClick("agent-groups")}
          />
          <NavItem
            icon={Settings}
            label="Agent Configuration"
            active={currentView === "agent-configuration"}
            onClick={() => handleNavClick("agent-configuration")}
          />
        </nav>

        {/* System Status */}
        <div className="border-t border-border p-3.5">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Agents</span>
              <span className="font-medium text-foreground">{totalAgents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Agent Groups</span>
              <span className="font-medium text-foreground">
                {agentGroups.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Architectures</span>
              <span className="font-medium text-foreground">
                {uniqueArchitectures}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">System Status</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400"></div>
                <span className="font-medium text-green-600 dark:text-green-400">
                  Operational
                </span>
              </div>
            </div>
          </div>
          {/* Logout  */}
          <Button
            variant={"outline"}
            size={"lg"}
            disabled={loading}
            onClick={handleSignOut}
            className="w-full mt-10 "
          >
            {loading ? (
              <LoaderIcon className="animate-spin size-5 " />
            ) : (
              <LogOut className="size-5" />
            )}{" "}
            Logout
          </Button>
        </div>
      </div>
    </>
  );
};

export default SideMenuBar;
