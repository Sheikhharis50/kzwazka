/**
 * Date utility functions for common date operations
 */

/**
 * Creates a Date object set to the start of the day (00:00:00.000)
 * @param date - Date string or Date object
 * @returns Date object set to start of day
 */
export function start_of_day_date(date: string | Date): Date {
  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj;
}

/**
 * Creates a Date object set to the end of the day (23:59:59.999)
 * @param date - Date string or Date object
 * @returns Date object set to end of day
 */
export function end_of_day_date(date: string | Date): Date {
  const dateObj = new Date(date);
  dateObj.setHours(23, 59, 59, 999);
  return dateObj;
}
