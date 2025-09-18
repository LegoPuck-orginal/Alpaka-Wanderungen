import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export const authOptions = {
  session: { strategy: "jwt" as const, maxAge: 60 * 60 * 24 * 7 },
  jwt: {
    maxAge: 60 * 60 * 24 * 7,
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        // Nur für dev: akzeptiere placeholder, sonst bcrypt-Check
        if (user.passwordHash === "dev-placeholder") return user;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }: any) {
      (session as any).user.id = token.id;
      (session as any).user.role = token.role;
      return session;
    },
  },
  pages: { signIn: "/login" },
} as const;

const handler = NextAuth(authOptions as any);
export { handler as GET, handler as POST };
