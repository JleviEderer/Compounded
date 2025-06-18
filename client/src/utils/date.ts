
export function getTodayEpoch(): number {
  const d = new Date(); // local now
  d.setHours(0, 0, 0, 0); // clamp to local midnight
  return d.getTime(); // epoch ms
}

export function getTodayString(): string {
  const d = new Date(); // local now
  d.setHours(0, 0, 0, 0); // clamp to local midnight
  return d.toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
}

// Optional: Console check helper for debugging
export function debugToday(): void {
  /* eslint-disable no-console */
  const todayEpoch = getTodayEpoch();
  console.log('todayEpoch', todayEpoch, new Date(todayEpoch).toString());
}

// Expose debugToday only in dev builds
if (
  typeof window !== 'undefined' &&
  process.env.NODE_ENV !== 'production'
) {
  // @ts-ignore – dev helper
  (window as any).debugToday = debugToday;
}
