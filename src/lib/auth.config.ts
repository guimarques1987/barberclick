import type { NextAuthConfig } from 'next-auth';

// Config leve — sem providers nem imports de banco de dados (Edge-safe)
export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [], // providers são definidos em auth.ts (Node.js only)
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;
      const isAuthPage = pathname.startsWith('/login');
      const isPublicBooking = pathname.startsWith('/b/');
      const isApiAuth = pathname.startsWith('/api/auth');

      if (isApiAuth || isPublicBooking) return true;
      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl));
        return true;
      }
      return isLoggedIn;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.barbershopId = (user as any).barbershopId;
        token.avatarUrl = (user as any).avatarUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).barbershopId = token.barbershopId;
        (session.user as any).avatarUrl = token.avatarUrl;
      }
      return session;
    },
  },
};
