'use client';
import { IChild, IUser } from 'api/type';
import React, { createContext, ReactNode } from 'react';
import * as api from 'api';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useAuth } from '@/hooks/useAuth';

export interface UserContextType {
  user: IUser | null;
  child: IChild | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['me', token],
    queryFn: () => api.user.me().then((res) => res.data),
    retry: (failureCount, error: AxiosError) => {
      // Don't retry on 401 errors (unauthorized)
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
    enabled: !!token,
  });

  return (
    <UserContext.Provider
      value={{
        user: data?.user ?? null,
        child: data?.child ?? null,
        isLoading,
        isError,
        refetch,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
