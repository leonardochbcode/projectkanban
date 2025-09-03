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
      // For credentials provider, the authorization is handled in the provider's `authorize` function.
      if (account?.provider === 'credentials') {
        return true;
      }

      // For Google OAuth provider
      if (account?.provider === 'google') {
        if (!user.email) {
          // Google authentication should always return an email.
          // If not, something is wrong, so we deny access.
          return false;
        }

        const existingUser = await getParticipantByEmail(user.email);

        if (existingUser) {
          // If the user exists, we allow the sign-in.
          // If they don't have a google_id yet, we link the account.
          if (!existingUser.google_id && account.providerAccountId) {
            await linkGoogleAccount(existingUser.id, account.providerAccountId);
          }
          return true;
        } else {
          // If the user does not exist in our database, we block the sign-in.
          // This prevents new users from registering via Google.
          return '/login?error=AccessDenied';
        }
      }

      // Deny sign-in for any other unhandled providers.
      return false;
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
