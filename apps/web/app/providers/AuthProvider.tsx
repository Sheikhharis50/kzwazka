'use client';
import { LoginFormData } from '@/(authentication)/login/schema';
import { useLoginMutation } from '@/hooks/useLoginMutation';
import { useRegisterMutation } from '@/hooks/useRegisterMutation';
import { useResendOtpMutation } from '@/hooks/useResendOtpMutation';
import { useUpdateProfileMutation } from '@/hooks/useUpdateProfileMutation';
import { useVerifyEmailMutation } from '@/hooks/useVerifyEmailMutation';
import { useQueryClient } from '@tanstack/react-query';
import { RegisterPayload, UpdateProfilePayload } from 'api/type';
import { redirect } from 'next/navigation';
import React, { createContext, ReactNode, useEffect, useState } from 'react';

export interface AuthContextType {
  isLoading: boolean;
  token: string | null;
  hasToken: boolean;
  login: (credentials: LoginFormData) => void;
  logout: () => void;
  register: (credentials: RegisterPayload) => void;
  verifyOtp: ({ otp }: { otp: string }) => void;
  resendOtp: () => void;
  updateProfile: (credentials: UpdateProfilePayload) => void;
  //   forgotPassword: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const registerMutation = useRegisterMutation();
  const verifyOtpMutation = useVerifyEmailMutation();
  const loginMutation = useLoginMutation();
  const updateMutation = useUpdateProfileMutation();
  const resendOtpMutation = useResendOtpMutation();
  const queryClient = useQueryClient();

  const register = async (credentials: RegisterPayload) => {
    await registerMutation.mutateAsync(credentials);
  };

  const verifyOtp = async ({ otp }: { otp: string }) => {
    await verifyOtpMutation.mutateAsync({ otp });
  };

  const login = async (credentials: LoginFormData) => {
    await loginMutation.mutateAsync(credentials);
  };

  const logout = () => {
    queryClient.clear();
    localStorage.removeItem('token');
    redirect('/login');
  };

  const resendOtp = async () => {
    await resendOtpMutation.mutateAsync();
  };

  const updateProfile = async (credentials: UpdateProfilePayload) => {
    await updateMutation.mutateAsync(credentials);
  };

  useEffect(() => {
    const handleTokenChange = () => {
      const newToken = localStorage.getItem('token');
      setToken(newToken);
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token') {
        handleTokenChange();
      }
    };
    window.addEventListener('storage', onStorage);

    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    const originalClear = localStorage.clear;

    localStorage.setItem = function (key, value) {
      originalSetItem.apply(this, [key, value]);
      if (key === 'token') handleTokenChange();
    };

    localStorage.removeItem = function (key) {
      originalRemoveItem.apply(this, [key]);
      if (key === 'token') handleTokenChange();
    };

    localStorage.clear = function () {
      originalClear.apply(this);
      handleTokenChange();
    };

    handleTokenChange();

    return () => {
      window.removeEventListener('storage', onStorage);
      localStorage.setItem = originalSetItem;
      localStorage.removeItem = originalRemoveItem;
      localStorage.clear = originalClear;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoading:
          registerMutation.isPending ||
          verifyOtpMutation.isPending ||
          loginMutation.isPending ||
          updateMutation.isPending,
        token,
        hasToken: !!token,
        register,
        verifyOtp,
        login,
        logout,
        resendOtp,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
