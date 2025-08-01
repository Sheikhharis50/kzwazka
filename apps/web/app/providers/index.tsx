'use client';
import React, { ReactNode } from 'react';
import { SettingsProvider } from './SettingsProvider';

export const AppContextsProvider = ({ children }: { children: ReactNode }) => {
  return <SettingsProvider>{children}</SettingsProvider>;
};
