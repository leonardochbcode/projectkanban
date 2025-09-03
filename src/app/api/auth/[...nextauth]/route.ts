import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getParticipantByEmail } from '@/lib/queries';
import bcrypt from 'bcrypt';
import { CustomAdapter } from '@/lib/next-auth-adapter';
import pool from '@/lib/db';

export const authOptions: AuthOptions = {
  // Use a custom adapter
  adapter: CustomAdapter(pool),

  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await getParticipantByEmail(credentials.email);

        if (!user || !user.password_hash) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );

        if (!isPasswordValid) {
          return null;
        }

        // Return the user object without the password hash
        const { password_hash, ...userPayload } = user;
        return userPayload;
      },
    }),
  ],

  // Use JWT for session management
  session: {
    strategy: 'jwt',
  },

  // Callbacks are used to control what happens when an action is performed
  callbacks: {
    async signIn({ user, account }) {
      // Allow sign in for credentials provider
      if (account?.provider === 'credentials') {
        return true;
      }

      // For OAuth providers, check for existing user and link accounts
      if (user.email) {
        const existingUser = await getParticipantByEmail(user.email);
        if (existingUser && !existingUser.google_id) {
          // This is a user who signed up with email/password before.
          // Link their new Google account.
          if (account?.provider === 'google' && account.providerAccountId) {
            await linkGoogleAccount(existingUser.id, account.providerAccountId);
          }
        }
      }
      return true; // Continue the sign-in process
    },
    async jwt({ token, user, account }) {
      // Persist the user's id, role, and provider to the token
      if (user) {
        token.id = user.id;
        token.roleId = (user as any).roleId; // Casting to any to access roleId
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a provider.
      if (session.user) {
        session.user.id = token.id as string;
        session.user.roleId = token.roleId as string;
        session.user.provider = token.provider as string;
      }
      return session;
    },
  },

  // Secret for signing the JWT
  secret: process.env.NEXTAUTH_SECRET,

  // Custom pages
  pages: {
    signIn: '/login',
    // error: '/auth/error', // (optional)
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
