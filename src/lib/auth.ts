import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

// Extend session user types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "user" | "admin" | "moderator";
      preferredLanguage?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: "user" | "admin" | "moderator";
    preferredLanguage?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid email or password.");
        }

        await connectDB();

        const user = await User.findOne({
          email: (credentials.email as string).toLowerCase().trim(),
        }).select("+passwordHash");

        if (!user || !user.passwordHash) {
          throw new Error("No user found with this email.");
        }

        if (!user.isActive) {
          throw new Error("Your account has been deactivated.");
        }

        const isPasswordMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isPasswordMatch) {
          throw new Error("Invalid password.");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role || "user",
          preferredLanguage: user.preferredLanguage || "en",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.preferredLanguage = user.preferredLanguage;
      }

      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.role) token.role = session.role;
        if (session.preferredLanguage) token.preferredLanguage = session.preferredLanguage;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "user" | "admin" | "moderator") || "user";
        session.user.preferredLanguage = (token.preferredLanguage as string) || "en";
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/sign-in",
  },
  secret: process.env.NEXTAUTH_SECRET || "super-secret-lost-and-found-key-change-in-prod",
});
