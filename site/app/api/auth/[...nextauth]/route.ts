import NextAuth, { NextAuthOptions } from "next-auth";
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
  async authorize(credentials): Promise<any> {
        try {
          const parsed = credentialsSchema.safeParse(credentials);
          if (!parsed.success) return null;
          const { email, password } = parsed.data;
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return null;
          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) return null;
          return user as any;
        } catch (e) {
          console.error('authorize error', e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).id = (user as any).id;
        (token as any).role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).user.id = (token as any).id;
      (session as any).user.role = (token as any).role;
      return session;
    },
  },
  pages: { signIn: "/login" },
} as const;

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
