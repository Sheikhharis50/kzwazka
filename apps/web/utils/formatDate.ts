export default function formatDate(isoString: string): string {
  const date = new Date(isoString);

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTo12Hour(time24: string) {
  const [hourStr, minute] = time24.split(':');
  let hour = parseInt(hourStr!, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

export { formatTo12Hour };
