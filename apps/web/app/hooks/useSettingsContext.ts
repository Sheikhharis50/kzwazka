import { useContext } from 'react';
import {
  SettingsContext,
  SettingsContextType,
} from '@/providers/SettingsProvider';

export const useSettingsContext = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context)
    throw new Error('useSettingsContext must be used inside SettingsProvider');
  return context;
};
