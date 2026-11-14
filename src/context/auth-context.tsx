'use client';

import React from 'react';
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react';

export { useSession, signIn, signOut };

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}

export default AuthProvider;
