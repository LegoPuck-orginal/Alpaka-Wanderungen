import NextAuth, { NextAuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" as const, maxAge: 60 * 60 * 24 * 7 },
  jwt: {
    maxAge: 60 * 60 * 24 * 7,
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
  async authorize(credentials): Promise<{ id: string; name: string | null; email: string; role: "admin" | "user" } | null> {
        try {
          const parsed = credentialsSchema.safeParse(credentials);
          if (!parsed.success) return null;
          const { email, password } = parsed.data;
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return null;
          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) return null;
          return { id: user.id, name: user.name, email: user.email, role: user.role as "admin" | "user" };
        } catch (e) {
          console.error('authorize error', e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      type AppJWT = JWT & { id?: string; role?: string };
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
      const s = session as Session & { user: { id?: string; role?: string } };
      if (s.user) {
        s.user.id = t.id;
        s.user.role = t.role;
      }
      return s;
    },
  },
  pages: { signIn: "/login" },
} as const;

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
