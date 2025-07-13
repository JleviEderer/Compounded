
export const FEATURE_FLAGS = {
  // Goals v1 is now permanently enabled
} as const;

export function isFeatureEnabled(flag: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[flag];
}
