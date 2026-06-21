import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      barbershopId: string;
      avatarUrl?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: string;
    barbershopId: string;
    avatarUrl?: string | null;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    role: string;
    barbershopId: string;
    avatarUrl?: string | null;
  }
}
