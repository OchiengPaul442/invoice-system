"use client";

import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

function GoogleIcon(): JSX.Element {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
      <path
        d="M21.6 12.23c0-.67-.06-1.31-.18-1.93H12v3.64h5.39a4.61 4.61 0 0 1-2 3.03v2.5h3.24c1.9-1.75 2.97-4.33 2.97-7.24Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.97-.9 6.63-2.53l-3.24-2.5c-.9.6-2.05.95-3.39.95-2.61 0-4.82-1.76-5.61-4.13H3.04v2.58A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.39 13.79a6.01 6.01 0 0 1 0-3.58V7.63H3.04a10 10 0 0 0 0 8.74l3.35-2.58Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.08c1.47 0 2.79.5 3.83 1.5l2.87-2.87C16.96 3.08 14.7 2 12 2A10 10 0 0 0 3.04 7.63l3.35 2.58c.79-2.37 3-4.13 5.61-4.13Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function SocialAuthButtons({
  isLoading,
  onGoogle,
  onGithub,
  googleAvailable = true,
  githubAvailable = true,
}: {
  isLoading: "google" | "github" | null;
  onGoogle: () => void;
  onGithub: () => void;
  googleAvailable?: boolean;
  githubAvailable?: boolean;
}): JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        className="w-full justify-center rounded-md"
        disabled={isLoading !== null || !googleAvailable}
        onClick={onGoogle}
        type="button"
        variant="outline"
      >
        <GoogleIcon />
        {isLoading === "google" ? "Connecting..." : "Sign in with Google"}
      </Button>
      <Button
        className="w-full justify-center rounded-md"
        disabled={isLoading !== null || !githubAvailable}
        onClick={onGithub}
        type="button"
        variant="outline"
      >
        <Github className="h-4 w-4" />
        {isLoading === "github" ? "Connecting..." : "Continue with GitHub"}
      </Button>
    </div>
  );
}
