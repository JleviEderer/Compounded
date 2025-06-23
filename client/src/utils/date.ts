export function getTodayEpoch(): number {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const epoch = startOfDay.getTime();
  const isMobile = window.innerWidth < 640 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobile) {
    console.log(`📅 [MOBILE] Today epoch: ${epoch}, Start of day: ${startOfDay.toString()}`);
  }

  return epoch;
}

export function getTodayString(): string {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  const isMobile = window.innerWidth < 640 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobile) {
    console.log(`📅 [MOBILE] Today string: ${todayString}, Raw date: ${today.toString()}`);
  }

  return todayString;
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