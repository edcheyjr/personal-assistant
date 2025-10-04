"use client";

import React from "react";
import { User, LogOut, Settings, Moon, Sun, Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useThemeColor } from "@/providers/color-theme-provider";
import { colorOptions } from "@/lib/theme";
import { setStorageItem } from "@/utils/localstorageAccess";
import { ColorKey } from "@/utils/constants";
import { cn } from "@/utils/cn";
import { useSession } from "@/providers/session-provider";

export interface AuthUser {
  name: string;
  email: string;
  picture: string | null;
}

const Profile = () => {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const { themeColor, setThemeColor } = useThemeColor();

  const user = session?.user;
  const isLoading = status === "loading";

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    // In development mode, just refresh the page
    // if (process.env.NODE_ENV === "development") {
    //   window.location.reload();
    //   return;
    // }

    try {
      const response = await fetch("/api/auth/logout", {
        method: "GET",
      });

      if (response.ok) {
        // Redirect to login or refresh page
        window.location.href = "/auth";
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleColorChange = (color: string) => {
    setThemeColor(color);
    setStorageItem(ColorKey, color);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-10 h-10">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative size-10 rounded-full">
          <Avatar className="size-9">
            <AvatarImage src={user.picture || undefined} alt={user.name} />
            <AvatarFallback>
              {user.picture ? (
                <User className="size-5" />
              ) : (
                getInitials(user.name)
              )}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="size-12">
              <AvatarImage src={user.picture || undefined} alt={user.name} />
              <AvatarFallback>
                {user.picture ? (
                  <User className="size-8" />
                ) : (
                  getInitials(user.name)
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-none mb-1">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Theme Switch */}
        {mounted && (
          <div className="px-2 py-2">
            <div className="flex items-center justify-between px-2 py-1">
              <div className="flex items-center gap-2">
                {theme === "dark" ? (
                  <Moon className="size-4" />
                ) : (
                  <Sun className="size-4" />
                )}
                <span className="text-sm font-medium">Theme</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-8 px-3"
              >
                {theme === "dark" ? "Light" : "Dark"}
              </Button>
            </div>
          </div>
        )}

        <DropdownMenuSeparator />

        {/* Color Theme */}
        <div className="px-2 py-2">
          <div className="flex items-center gap-2 px-2 mb-2">
            <Palette className="size-4" />
            <span className="text-sm font-medium">Color Theme</span>
          </div>
          <div className="flex flex-wrap gap-2 px-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={cn(
                  "size-8 rounded-md border-2 transition-all hover:scale-110",
                  themeColor === color
                    ? "border-foreground scale-110 ring-2 ring-offset-2 ring-foreground"
                    : "border-border hover:border-foreground/50"
                )}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            // Handle profile/settings navigation
            console.log("Navigate to settings");
          }}
          className="cursor-pointer"
        >
          <Settings className="mr-2 size-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 size-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Profile;
