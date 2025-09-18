import { useEffect } from 'react';

/**
 * Custom hook to detect clicks/touches outside a referenced element
 * @param {React.RefObject} ref - React ref object pointing to the element
 * @param {Function} callback - Function to call when click/touch occurs outside the element
 * @param {boolean} enabled - Whether the hook should be active (default: true)
 */
export const useClickOutside = (
  ref: React.RefObject<HTMLElement | null>,
  callback: (event: MouseEvent | TouchEvent) => void,
  enabled = true
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback(event);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [ref, callback, enabled]);
};
