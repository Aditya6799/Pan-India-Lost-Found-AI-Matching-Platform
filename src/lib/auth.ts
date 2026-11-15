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
  trustHost: true,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connectDB();

        const user = await User.findOne({
          email: (credentials.email as string).toLowerCase().trim(),
        }).select("+passwordHash");

        if (!user || !user.passwordHash) {
          return null;
        }

        if (!user.isActive) {
          return null;
        }

        const isPasswordMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isPasswordMatch) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.profileImage || null,
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
        token.image = user.image;
        token.preferredLanguage = user.preferredLanguage;
      }

      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.role) token.role = session.role;
        if (session.image) token.image = session.image;
        if (session.preferredLanguage) token.preferredLanguage = session.preferredLanguage;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        session.user.image = (token.image as string) || session.user.image || null;
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
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "super-secret-lost-and-found-key-change-in-prod",
});
