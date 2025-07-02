
export const FEATURE_FLAGS = {
  GOALS_V1: import.meta.env.DEV // Only enabled in development for now
} as const;

export function isFeatureEnabled(flag: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[flag];
}
