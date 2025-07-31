'use client';
import React, { ReactNode } from 'react';
import { AppProvider } from './appContext';

export const AppContextsProvider = ({ children }: { children: ReactNode }) => {
  return <AppProvider>{children}</AppProvider>;
};
