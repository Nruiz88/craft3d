import bcrypt from 'bcryptjs';
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';

declare module 'next-auth' {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
  }
}

async function findOrCreateProfile(email: string, fullName?: string | null) {
  // Import diferido: pg solo existe en Node (este módulo se evalúa
  // también en el Edge a través de getServerSession).
  const { db } = await import('./lib/db/client');
  const { profiles } = await import('./lib/db/schema');
  const normalized = email.toLowerCase().trim();
  const rows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.email, normalized))
    .limit(1);
  if (rows[0]) return rows[0];
  const [created] = await db
    .insert(profiles)
    .values({ id: randomUUID(), email: normalized, full_name: fullName ?? '', role: 'customer' })
    .returning();
  return created;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET,
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: '/ingresar' },
  providers: [
    CredentialsProvider({
      name: 'Email y contraseña',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      authorize: async (creds) => {
        const email = String(creds?.email ?? '').toLowerCase().trim();
        const password = String(creds?.password ?? '');
        if (!email || !password) return null;
        const { db } = await import('./lib/db/client');
        const { profiles } = await import('./lib/db/schema');
        const rows = await db
          .select({ id: profiles.id, email: profiles.email, password_hash: profiles.password_hash, role: profiles.role, full_name: profiles.full_name })
          .from(profiles)
          .where(eq(profiles.email, email))
          .limit(1);
        const user = rows[0];
        if (!user?.password_hash) return null;
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.full_name || user.email, role: user.role };
      },
    }),
    // Google solo si hay credenciales configuradas (si no, el provider se omite).
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Primer login con Google: crea el perfil si no existe.
      if (account?.provider === 'google' && user.email) {
        const profile = await findOrCreateProfile(user.email, user.name);
        if (!profile) return false;
        user.id = profile.id;
        user.role = profile.role;
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.role) session.user.role = token.role as string;
      return session;
    },
  },
};

export default NextAuth(authOptions);
