import LoginForm from "@/components/forms/auth/login";
import React from "react";
import { ThemeMenu } from "@/components/ThemeMenu";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams";
import Logo from "@/components/Logo";
import Profile from "@/components/Profile";
import { auth } from "@/lib/auth";

const Login = async () => {
  const session = await auth();

  return (
    <BackgroundBeamsWithCollision>
      <div className="h-screen w-full flex flex-col overflow-hidden bg-muted">
        <div className="w-full flex justify-between items-center p-4 sm:p-6 z-10 flex-shrink-0">
          <Logo />
          <div className="flex items-center gap-2">
            {session?.user && <Profile />}
            <ThemeMenu />
          </div>
        </div>
        <main className="flex-1 flex items-center justify-center px-6 md:px-10">
          <div className="w-full max-w-sm md:max-w-4xl">
            <LoginForm />
          </div>
        </main>
      </div>
    </BackgroundBeamsWithCollision>
  );
};

export default Login;
