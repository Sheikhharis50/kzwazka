'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  isSidebarVisible: boolean;
  showSidebar: () => void;
  hideSidebar: () => void;
  toggleSidebar: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const showSidebar = () => setIsSidebarVisible(true);
  const hideSidebar = () => setIsSidebarVisible(false);
  const toggleSidebar = () => setIsSidebarVisible((prev) => !prev);

  return (
    <AppContext.Provider
      value={{
        isSidebarVisible,
        showSidebar,
        hideSidebar,
        toggleSidebar,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider');
  }
  return context;
};
