import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Apple from "next-auth/providers/apple";
import AzureAD from "next-auth/providers/azure-ad";
import Discord from "next-auth/providers/discord";
import Facebook from "next-auth/providers/facebook";
import GitHub from "next-auth/providers/github";
import GitLab from "next-auth/providers/gitlab";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import Slack from "next-auth/providers/slack";
import Twitter from "next-auth/providers/twitter";

const isProduction = process.env.NODE_ENV === "production";
const isProductionBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

const providerEnvMap = {
  google: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  microsoftEntraId: ["MICROSOFT_ENTRA_ID_CLIENT_ID", "MICROSOFT_ENTRA_ID_CLIENT_SECRET", "MICROSOFT_ENTRA_ID_TENANT_ID"],
  github: ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"],
  apple: ["APPLE_ID", "APPLE_SECRET"],
  facebook: ["FACEBOOK_CLIENT_ID", "FACEBOOK_CLIENT_SECRET"],
  linkedin: ["LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET"],
  x: ["X_CLIENT_ID", "X_CLIENT_SECRET"],
  discord: ["DISCORD_CLIENT_ID", "DISCORD_CLIENT_SECRET"],
  slack: ["SLACK_CLIENT_ID", "SLACK_CLIENT_SECRET"],
  gitlab: ["GITLAB_CLIENT_ID", "GITLAB_CLIENT_SECRET"],
} as const;

function hasEnv(keys: readonly string[]) {
  return keys.every((key) => Boolean(process.env[key] && process.env[key]?.trim().length));
}

type AppRole = "student" | "instructor" | "admin";

function parseEmailSet(raw: string | undefined): Set<string> {
  return new Set(
    (raw || "")
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
  );
}

const adminEmailSet = parseEmailSet(process.env.ADMIN_EMAILS);
const instructorEmailSet = parseEmailSet(process.env.INSTRUCTOR_EMAILS);

function resolveRole(email: string | undefined | null): AppRole {
  const normalized = (email || "").trim().toLowerCase();
  if (!normalized) return "student";
  if (adminEmailSet.has(normalized)) return "admin";
  if (instructorEmailSet.has(normalized)) return "instructor";
  return "student";
}

function resolveTokenRole(token: JWT): AppRole {
  const role = token.role;
  if (role === "admin" || role === "instructor" || role === "student") {
    return role;
  }
  return resolveRole(token.email);
}

const providers = [];

if (isProduction && !isProductionBuildPhase && !process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET is required in production.");
}

if (hasEnv(providerEnvMap.google)) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  );
}

if (hasEnv(providerEnvMap.microsoftEntraId)) {
  providers.push(
    AzureAD({
      clientId: process.env.MICROSOFT_ENTRA_ID_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_ENTRA_ID_CLIENT_SECRET!,
      tenantId: process.env.MICROSOFT_ENTRA_ID_TENANT_ID!,
    }),
  );
}

if (hasEnv(providerEnvMap.github)) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  );
}

if (hasEnv(providerEnvMap.apple)) {
  providers.push(
    Apple({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_SECRET!,
    }),
  );
}

if (hasEnv(providerEnvMap.facebook)) {
  providers.push(
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  );
}

if (hasEnv(providerEnvMap.linkedin)) {
  providers.push(
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  );
}

if (hasEnv(providerEnvMap.x)) {
  providers.push(
    Twitter({
      clientId: process.env.X_CLIENT_ID!,
      clientSecret: process.env.X_CLIENT_SECRET!,
      version: "2.0",
    }),
  );
}

if (hasEnv(providerEnvMap.discord)) {
  providers.push(
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  );
}

if (hasEnv(providerEnvMap.slack)) {
  providers.push(
    Slack({
      clientId: process.env.SLACK_CLIENT_ID!,
      clientSecret: process.env.SLACK_CLIENT_SECRET!,
    }),
  );
}

if (hasEnv(providerEnvMap.gitlab)) {
  providers.push(
    GitLab({
      clientId: process.env.GITLAB_CLIENT_ID!,
      clientSecret: process.env.GITLAB_CLIENT_SECRET!,
    }),
  );
}

if (providers.length === 0 && process.env.NODE_ENV !== "test") {
  // Surface misconfiguration early; users otherwise only see an empty auth panel.
  console.warn("No OAuth providers are configured. Set provider credentials in environment variables.");
}

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/",
  },
  callbacks: {
    redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
    jwt({ token, user }) {
      const signInEmail = user?.email || token.email;
      token.role = resolveRole(signInEmail);
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = resolveTokenRole(token);
      }
      return session;
    },
  },
};
