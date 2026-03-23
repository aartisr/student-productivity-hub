import { DefaultSession } from "next-auth";
import "next-auth/jwt";

type AppRole = "student" | "instructor" | "admin";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id: string;
      role: AppRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: AppRole;
  }
}
