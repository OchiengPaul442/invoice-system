"use client";

import { SessionProvider as NextAuthProvider } from "next-auth/react";

export function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return <NextAuthProvider>{children}</NextAuthProvider>;
}
