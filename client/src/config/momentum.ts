
export type MomentumPreset = 'lenient' | 'default' | 'hard';

export interface MomentumParams { 
  σ: number; // slip penalty
  B: number; // baseline drift
  β: number; // decay factor
}

// Global floor to prevent zero-trap: when momentum hits 0 but daily return > 0
export const MIN_MOMENTUM = 1.0; // 1.0 - reset to baseline when escaping zero-trap

export const MOMENTUM_PRESETS: Record<MomentumPreset, MomentumParams> = {
  lenient: { σ: -0.00, B: 0.001, β: 0.99999 },
  default: { σ: -0.25, B: -0.25 * 2, β: 0.995 }, // B computed from σ
  hard: { σ: -0.35, B: -0.35 * 2, β: 0.992 }     // B computed from σ
};

/**
 * Get momentum parameters from environment or defaults
 * Reads VITE_MOMENTUM_PRESET (fallback 'default')
 * Resolves functional B if provided (B = fn(σ))
 */
export function getMomentumParams(): MomentumParams {
  const presetName = (import.meta.env.VITE_MOMENTUM_PRESET || 'default') as MomentumPreset;
  const preset = MOMENTUM_PRESETS[presetName] || MOMENTUM_PRESETS.default;
  
  return {
    σ: preset.σ,
    B: preset.B,
    β: preset.β
  };
}

/**
 * Check if Momentum v2 (decay model) is enabled
 */
export function isMomentumV2Enabled(): boolean {
  return String(import.meta.env.VITE_MOMENTUM_V2) === 'true';
}
