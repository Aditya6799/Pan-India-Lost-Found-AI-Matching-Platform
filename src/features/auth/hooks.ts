'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';

export { useSession, signIn, signOut };

export interface CurrentUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: 'user' | 'admin' | 'moderator';
  preferredLanguage?: string;
  image?: string | null;
}

export function useCurrentUser(): {
  user: CurrentUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
} {
  const { data: session, status } = useSession();

  const user = session?.user
    ? {
        id: (session.user as any).id || '',
        name: session.user.name,
        email: session.user.email,
        role: ((session.user as any).role as 'user' | 'admin' | 'moderator') || 'user',
        preferredLanguage: (session.user as any).preferredLanguage || 'en',
        image: session.user.image,
      }
    : null;

  return {
    user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };
}

export function useIsAdmin(): boolean {
  const { user } = useCurrentUser();
  return user?.role === 'admin';
}

export function useRequireAuth(redirectTo?: string) {
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  useEffect(() => {
    if (!isLoading && !user) {
      const destination = redirectTo || `/${locale}/auth/sign-in`;
      router.push(destination);
    }
  }, [user, isLoading, router, locale, redirectTo]);

  return { user, isLoading };
}
