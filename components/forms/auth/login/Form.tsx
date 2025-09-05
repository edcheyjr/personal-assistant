"use client";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import AuthImage from "@/public/images/login.png";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const login = () => {
    const redirectUri =
      process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI ||
      `${window.location.origin}/api/auth/callback`;

    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!,
      redirect_uri: redirectUri,
      audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE!,
      scope: "openid profile email",
    });

    setIsAuthenticating(true);
    window.location.href = `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/authorize?${params}`;
  };

  useEffect(() => {
    // Check if user is already authenticated on page load
    const checkAuth = () => {
      const userCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("user="));

      if (userCookie) {
        router.push("/");
      }
    };

    checkAuth();

    // Also check when page becomes visible (user returns from auth)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(checkAuth, 500); // Small delay for cookies to be set
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);

  if (isAuthenticating) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden">
          <CardContent className="flex items-center justify-center p-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Authenticating...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8 lg:py-20">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">
                  Login to your Multi Agents account
                </p>
              </div>
              <Button
                variant="default"
                className="w-full font-bold"
                onClick={() => login()}
              >
                Login or Signup
              </Button>
            </div>
          </div>
          <div className="relative hidden bg-muted md:block">
            <Image
              src={AuthImage}
              alt="Login illustration image"
              fill
              className="size-full absolute inset-0 object-cover dark:brightness-[0.4] dark:grayscale transition-all duration-200 ease-in-out"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
