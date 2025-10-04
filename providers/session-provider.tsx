import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

type Session = {
  user: any;
  accessToken: string | null;
  isAuthenticated: boolean;
};

type SessionContextType = {
  data: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  update: (session: Session | null) => void;
};

type SessionProviderProps = {
  children: React.ReactNode;
  session?: Session;
  initialThemeColor?: string;
};

// Create the session context
const SessionContext = createContext<SessionContextType | undefined>(undefined);

/**
 * Session Provider Component - manages session state and auto logout
 */
export function SessionProvider({
  children,
  session: initialSession,
}: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(
    initialSession || null
  );
  const [status, setStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");
  const [hasCheckedCookies, setHasCheckedCookies] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Check for client-side cookies on mount and when URL changes (after login redirect)
  useEffect(() => {
    const checkClientSession = () => {
      console.log("Checking client cookies...");
      console.log("All cookies:", document.cookie);

      // Note: access_token is httpOnly, so we can't read it client-side
      // We only check for the user cookie which is accessible
      const userCookie = Cookies.get("user");

      console.log("User cookie:", userCookie);

      if (userCookie) {
        try {
          const user = JSON.parse(userCookie);
          // We know if user cookie exists, access_token exists too (set together in callback)
          const newSession = {
            user,
            accessToken: "exists", // Can't read httpOnly cookie, but we know it exists
            isAuthenticated: true,
          };
          console.log("Setting session from cookies:", newSession);
          setSession(newSession);
          setStatus("authenticated");
        } catch (error) {
          console.error("Failed to parse user cookie:", error);
        }
      } else {
        console.log("No user cookie found, checking initial session:", initialSession);
        // If no cookies but we have initial session from server, use it
        if (initialSession?.isAuthenticated) {
          setSession(initialSession);
          setStatus("authenticated");
        }
      }
      // Mark that we've checked cookies
      setHasCheckedCookies(true);
    };

    // Check on mount
    checkClientSession();

    // Check again if we detect auth success in URL
    const authSuccess = searchParams?.get("auth");
    if (authSuccess === "success") {
      console.log("Auth success detected, rechecking cookies...");
      setTimeout(() => checkClientSession(), 100); // Small delay to ensure cookies are set
    }
  }, [pathname, searchParams, initialSession]);

  // Only validate session after we've checked cookies
  useEffect(() => {
    // Don't validate until we've checked client-side cookies
    if (!hasCheckedCookies) {
      return;
    }

    console.log("Session check:", session);

    // Check if session is invalid (user logged out or session expired)
    const isSessionInvalid =
      !session ||
      (!session.user && !session.accessToken) ||
      !session.isAuthenticated;

    if (isSessionInvalid) {
      console.log("Session invalid, redirecting to login...");
      setStatus("unauthenticated");

      // Clear any client-side data if needed
      localStorage.clear();
      sessionStorage.clear();

      // Redirect to login page only if not already on auth page
      if (!pathname?.startsWith("/auth")) {
        router.push("/auth");
      }
    } else {
      setStatus("authenticated");
    }
  }, [session, router, pathname, hasCheckedCookies]);

  // Function to update session
  const updateSession = (newSession: Session | null) => {
    setSession(newSession);
  };

  const contextValue: SessionContextType = {
    data: session,
    status,
    update: updateSession,
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

/**
 * Custom hook to use session context
 * Usage: const { data: session, status } = useSession()
 */
export function useSession() {
  const context = useContext(SessionContext);

  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }

  return context;
}

// Optional: Type guard to check if user is authenticated
export function isAuthenticated(session: Session | null): session is Session {
  return !!(
    session &&
    session.user &&
    session.accessToken &&
    session.isAuthenticated
  );
}
