import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

// Middleware usa apenas JWT (sem banco de dados — compatível com Edge runtime)
export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
