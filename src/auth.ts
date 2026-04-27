import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import PgAdapter from '@auth/pg-adapter';
import { Pool } from 'pg';
import { authConfig } from './auth.config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PgAdapter(pool),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    authorized: authConfig.callbacks!.authorized,
    session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
