import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

const LONG_SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days
const SHORT_SESSION_MAX_AGE = 24 * 60 * 60; // 1 day

async function ensureUserDefaults(userId: string): Promise<void> {
  await Promise.all([
    prisma.userProfile.upsert({
      where: { userId },
      update: {},
      create: { userId },
    }),
    prisma.invoiceSettings.upsert({
      where: { userId },
      update: {},
      create: { userId },
    }),
  ]);
}

async function ensureOAuthUser({
  email,
  name,
}: {
  email: string;
  name?: string | null;
}): Promise<{ id: string; name: string; email: string }> {
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true },
  });

  if (existing) {
    await ensureUserDefaults(existing.id);
    return existing;
  }

  const fallbackName = (name || "").trim() || email.split("@")[0] || "User";
  const password = await bcrypt.hash(crypto.randomUUID(), 12);
  const created = await prisma.user.create({
    data: {
      email,
      name: fallbackName,
      password,
    },
    select: { id: true, name: true, email: true },
  });

  await ensureUserDefaults(created.id);
  return created;
}

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      remember: { label: "Remember", type: "text" },
    },
    async authorize(credentials) {
      const email = credentials?.email;
      const password = credentials?.password;
      if (typeof email !== "string" || typeof password !== "string") {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (!user?.password) {
        return null;
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return null;
      }

      await ensureUserDefaults(user.id);
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        remember: credentials?.remember === "true",
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: LONG_SESSION_MAX_AGE },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider === "credentials") {
        return true;
      }

      const email = user.email?.trim().toLowerCase();
      if (!email) {
        return false;
      }

      const dbUser = await ensureOAuthUser({ email, name: user.name });
      user.id = dbUser.id;
      user.name = dbUser.name;
      user.email = dbUser.email;
      return true;
    },
    async jwt({ token, user, account }) {
      if (user?.id) {
        token.id = user.id;
      }

      if (typeof (user as { remember?: unknown } | undefined)?.remember === "boolean") {
        token.remember = Boolean((user as { remember: boolean }).remember);
      }

      if (account && (account.provider === "google" || account.provider === "github")) {
        const email = token.email?.trim().toLowerCase();
        if (email && !token.id) {
          const dbUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
          }
        }
        if (token.remember === undefined) {
          token.remember = true;
        }
      }

      const now = Math.floor(Date.now() / 1000);
      const remember = token.remember !== false;
      token.exp = now + (remember ? LONG_SESSION_MAX_AGE : SHORT_SESSION_MAX_AGE);
      return token;
    },
    session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
      }
      if (typeof token.exp === "number") {
        session.expires = new Date(token.exp * 1000).toISOString();
      }
      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}
