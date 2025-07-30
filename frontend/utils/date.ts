// utils/date.ts

/**
 * Format a JavaScript Date object as a local date string in "YYYY-MM-DD" format.
 * This avoids timezone-related issues (e.g., with toISOString) when sending dates to the backend.
 */
export function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = (`0${date.getMonth() + 1}`).slice(-2);
  const day = (`0${date.getDate()}`).slice(-2);
  return `${year}-${month}-${day}`;
}
