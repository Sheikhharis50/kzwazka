'use client';
import { IChild, IUserWithPermissions } from 'api/type';
import React, { createContext, ReactNode } from 'react';
import * as api from 'api';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useAuth } from '@/hooks/useAuth';

export interface UserContextType {
  user: IUserWithPermissions | null | undefined;
  child: IChild | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const isLoading = React.useRef(true);
  const { token } = useAuth();

  const { data, isError, refetch } = useQuery({
    queryKey: ['me', token],
    queryFn: async () => {
      const res = await api.user.me();
      isLoading.current = false;
      return res.data;
    },
    retry: (failureCount, error: AxiosError) => {
      // Don't retry on 401 errors (unauthorized)
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });

  return (
    <UserContext.Provider
      value={{
        user: data?.user ?? null,
        child: data?.children ?? null,
        isLoading: isLoading.current,
        isError,
        refetch,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
