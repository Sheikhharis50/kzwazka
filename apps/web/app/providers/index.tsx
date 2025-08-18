'use client';
import React, { ReactNode } from 'react';
import { SettingsProvider } from './SettingsProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './AuthProvider';
import { UserProvider } from './UserProvider';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GoogleOAuthProvider } from './GoogleOAuthProvider';

const queryClient = new QueryClient();

export const AppContextsProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider>
        <AuthProvider>
          <UserProvider>
            <SettingsProvider>{children}</SettingsProvider>
          </UserProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
