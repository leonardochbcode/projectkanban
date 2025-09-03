import { Pool } from 'pg';
import { Adapter } from 'next-auth/adapters';
import {
  createParticipant,
  getParticipantByEmail,
  getParticipantById,
  getParticipantByGoogleId,
  linkGoogleAccount,
  updateParticipant,
} from './queries';
import { randomBytes } from 'crypto';

export function CustomAdapter(pool: Pool): Adapter {
  return {
    async createUser(user) {
      // This function is called when a user signs up with an OAuth provider.
      const { name, email, image } = user;
      if (!name || !email) {
        throw new Error('User name and email are required');
      }

      // A default role can be assigned here if needed.
      // For now, let's assume a default role 'user' exists or is handled elsewhere.
      // Or we can leave it null and prompt the user to set it up later.
      const newUser = await createParticipant({
        name,
        email,
        avatar: image,
        roleId: 'user', // Assuming a default 'user' role
        provider: 'google',
      });
      return newUser;
    },
    async getUser(id) {
      const user = await getParticipantById(id);
      if (!user) return null;
      // The adapter expects emailVerified to be a Date object or null
      // Our schema stores it as TIMESTAMPTZ, which pg driver might return as a string or Date.
      // We need to ensure it is a Date object if it exists.
      const userFromDb = await pool.query('SELECT * FROM participants WHERE id = $1', [id]);
      const rawUser = userFromDb.rows[0];
      return { ...user, emailVerified: rawUser.email_verified ? new Date(rawUser.email_verified) : null };
    },
    async getUserByEmail(email) {
      const user = await getParticipantByEmail(email);
      if (!user) return null;
      return { ...user, emailVerified: user.email_verified ? new Date(user.email_verified) : null };
    },
    async getUserByAccount({ provider, providerAccountId }) {
      if (provider !== 'google') {
        return null;
      }
      const user = await getParticipantByGoogleId(providerAccountId);
      if (!user) return null;
      const userFromDb = await pool.query('SELECT * FROM participants WHERE id = $1', [user.id]);
      const rawUser = userFromDb.rows[0];
      return { ...user, emailVerified: rawUser.email_verified ? new Date(rawUser.email_verified) : null };
    },
    async updateUser(user) {
      // This is called when a user's profile is updated.
      const { id, ...userData } = user;
      if (!id) {
          throw new Error("User ID is required to update.")
      }
      const updatedUser = await updateParticipant(id, userData);
      if (!updatedUser) {
          throw new Error("Failed to update user.")
      }
      const userFromDb = await pool.query('SELECT * FROM participants WHERE id = $1', [id]);
      const rawUser = userFromDb.rows[0];
      return { ...updatedUser, emailVerified: rawUser.email_verified ? new Date(rawUser.email_verified) : null };
    },
    async linkAccount(account) {
      // This links an OAuth account to an existing user.
      const { userId, provider, providerAccountId } = account;
      if (provider !== 'google') {
        return;
      }
      await linkGoogleAccount(userId, providerAccountId);
      return account;
    },
    // We are using JWT strategy, so these are not needed.
    // However, NextAuth requires them to be present.
    // We can leave them as empty async functions.
    async createSession(session) {
      return session;
    },
    async getSessionAndUser(sessionToken) {
      return null;
    },
    async updateSession(session) {
      return null;
    },
    async deleteSession(sessionToken) {
      return;
    },
    async createVerificationToken(verificationToken) {
        return verificationToken;
    },
    async useVerificationToken(params) {
        return null;
    },
  };
}
