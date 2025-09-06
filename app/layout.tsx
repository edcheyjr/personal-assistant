import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/providers/Providers";
import { Toaster } from "sonner";
import { ColorKey, MAX_TOAST_NOTIFICATION_COUNT } from "@/utils/constants";
import { cookies } from "next/headers";
import { Session } from "@/types/user";
import { auth } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Multi-agent: personal assistants",
  description: "Create your very own multi agent personal assistant",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeColor = cookieStore.get(ColorKey);

  // Get session using the auth utility
  const authResult = await auth();
  const session = {
    user: authResult?.user || null,
    accessToken: authResult?.accessToken || null,
    isAuthenticated: !!authResult,
  } as Session;

  console.log("Theme color:", themeColor?.name, themeColor?.value);
  console.log("Session:", session);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="relative min-h-screen font-[family-name:var(--font-geist-sans)]">
          <Providers
            session={session}
            attribute="class"
            defaultTheme="system"
            enableSystem
            initialThemeColor={themeColor?.value}
          >
            {children}
            <Toaster
              expand
              visibleToasts={MAX_TOAST_NOTIFICATION_COUNT}
              closeButton
              richColors
            />
          </Providers>
        </div>
      </body>
    </html>
  );
}
