"use client";

import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps,
} from "next-themes";
import { ThemeProvider } from "./theme-provider";
import QueryProvider from "./query-provider";
import { Session } from "@/types/user";
import { ColorThemeProvider } from "./color-theme-provider";
import { SessionProvider } from "./session-provider";
import { AgentProvider } from "./agents-provider";
import { MessagesProvider } from "./message-provider";
type ProviderType = {
  session?: Session;
  children: React.ReactNode;
  initialThemeColor?: string;
};

/**
 * Add all provider in this one function and pass it on children in layout
 * @param {React.ReactNode} children child elements
 * @returns
 */
export default function Providers({
  children,
  session,
  initialThemeColor,
  ...props
}: ProviderType & ThemeProviderProps) {
  return (
    <SessionProvider session={session}>
      {/* <SessionMonitor session={session}> */}
      <QueryProvider>
        <AgentProvider>
          <MessagesProvider>
            <ThemeProvider {...props}>
              <ColorThemeProvider initialThemeColor={initialThemeColor}>
                {children}
              </ColorThemeProvider>
            </ThemeProvider>
          </MessagesProvider>
        </AgentProvider>
      </QueryProvider>
      {/* </SessionMonitor> */}
    </SessionProvider>
  );
}
