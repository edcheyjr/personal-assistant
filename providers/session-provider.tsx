import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

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
  const router = useRouter();

  useEffect(() => {
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

      // Redirect to login page
      router.push("/auth"); // Adjust route as needed
    } else {
      setStatus("authenticated");
    }
  }, [session, router]);

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
