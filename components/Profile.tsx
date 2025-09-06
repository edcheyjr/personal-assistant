"use client";

import React, { useState, useEffect } from "react";
import { User, LogOut, Settings } from "lucide-react";
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

export interface AuthUser {
  name: string;
  email: string;
  picture: string | null;
}

const Profile = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  console.log("user", user);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // if (process.env.NODE_ENV === "development") {
    //   const mockUser: AuthUser = {
    //     name: "John Doe",
    //     email: "john.doe@example.com",
    //     picture: null,
    //   };
    //   setUser(mockUser);
    //   setIsLoading(false);
    //   return;
    // }

    // Get user from cookies
    const getUserFromCookies = () => {
      const cookies = document.cookie.split(";");
      const userCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("user=")
      );

      if (userCookie) {
        try {
          const userValue = userCookie.split("=")[1];
          const decodedUser = decodeURIComponent(userValue);
          return JSON.parse(decodedUser);
        } catch (error) {
          console.error("Error parsing user cookie:", error);
          return null;
        }
      }
      return null;
    };

    const userData = getUserFromCookies();
    setUser(userData);
    setIsLoading(false);
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
