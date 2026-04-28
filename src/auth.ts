import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import PgAdapter from '@auth/pg-adapter';
import { Pool } from 'pg';
import { authConfig } from './auth.config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

import fs from 'fs';

const LOG_FILE = '/tmp/nextauth-debug.log';
function writeLog(line: string) {
  try { fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} ${line}\n`); } catch {}
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  debug: true,
  adapter: PgAdapter(pool),
  logger: {
    error(error) {
      writeLog(`ERROR: ${error.name} ${error.message} :: ${error.stack ?? ''}`);
    },
    warn(code) { writeLog(`WARN: ${code}`); },
    debug(code, metadata) { writeLog(`DEBUG: ${code} ${metadata ? JSON.stringify(metadata) : ''}`); },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    authorized: authConfig.callbacks!.authorized,
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
