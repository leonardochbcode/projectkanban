import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      roleId: string;
      userType: string;
      provider: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    roleId: string;
    user_type: string;
    provider: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    roleId: string;
    id: string;
    userType: string;
    provider: string;
  }
}