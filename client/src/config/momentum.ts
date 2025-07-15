
export type MomentumPreset = 'lenient' | 'default' | 'hard';

export interface MomentumParams { 
  σ: number; // slip penalty
  B: number; // baseline drift
  β: number; // decay factor
}

export const MOMENTUM_PRESETS: Record<MomentumPreset, MomentumParams> = {
  lenient: { σ: -0.20, B: -0.40, β: 0.998 },
  default: { σ: -0.25, B: -0.50, β: 0.995 }, // B = σ * 2
  hard: { σ: -0.35, B: -0.70, β: 0.992 }     // B = σ * 2
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
  return import.meta.env.VITE_MOMENTUM_V2 === 'true';
}
