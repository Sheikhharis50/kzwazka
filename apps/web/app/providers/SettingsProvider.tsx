'use client';
import React, { createContext, useState, ReactNode } from 'react';

export interface SettingsContextType {
  isSidebarVisible: boolean;
  showSidebar: () => void;
  hideSidebar: () => void;
  toggleSidebar: () => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const showSidebar = () => setIsSidebarVisible(true);
  const hideSidebar = () => setIsSidebarVisible(false);
  const toggleSidebar = () => setIsSidebarVisible((prev) => !prev);

  return (
    <SettingsContext.Provider
      value={{ isSidebarVisible, showSidebar, hideSidebar, toggleSidebar }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
