import { UserContext, UserContextType } from 'providers/UserProvider';
import { useContext } from 'react';

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
