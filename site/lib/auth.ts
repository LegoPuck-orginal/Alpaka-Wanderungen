import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
  token: z.string().optional(),
});

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  jwt: { maxAge: 60 * 60 * 24 * 7 },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        try {
          const parsed = credentialsSchema.safeParse(credentials);
          if (!parsed.success) return null;
          const { email, password, token } = parsed.data;
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return null;
          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) return null;
          // Wenn 2FA aktiv, muss ein gültiger TOTP-Token mitgeschickt werden
          const u2 = user as typeof user & { twoFactorEnabled?: boolean; twoFactorSecret?: string | null };
          if (u2.twoFactorEnabled) {
            if (!u2.twoFactorSecret) return null;
            if (!token) return null;
            const valid = authenticator.verify({ token, secret: u2.twoFactorSecret });
            if (!valid) return null;
          }
          return { id: user.id, name: user.name, email: user.email, role: user.role as "admin" | "user" };
        } catch (e) {
          console.error("authorize error", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      type AppJWT = typeof token & { id?: string; role?: string };
      const t = token as AppJWT;
      if (user) {
        const u = user as Partial<{ id: string; role: string }>;
        if (u.id) t.id = u.id;
        if (u.role) t.role = u.role;
      }
      return t;
    },
    async session({ session, token }) {
      const t = token as Partial<{ id: string; role: string }>;
      const s = session as typeof session & { user: { id?: string; role?: string } };
      if (s.user) {
        s.user.id = t.id;
        s.user.role = t.role;
      }
      return s;
    },
  },
  pages: { signIn: "/login" },
};
