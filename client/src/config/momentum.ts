/**
 * Momentum Index Configuration
 * 
 * These parameters control how the momentum index responds to:
 * - Completed habits (positive contribution)
 * - Missed habits (negative penalty via σ)
 * - Days with no logs (baseline drift via B)
 * - Daily decay factor (β)
 * 
 * Formula:
 * R_t = logged ? (S_t - σ * misses) : B
 * M_t = max(0, (1 + R_t) * β * M_{t-1})
 */

export interface MomentumParams {
  /**
   * Slip penalty factor (σ)
   * Applied to missed habits: penalty = σ * misses
   * Default: -0.25 (each miss removes 25% of a habit's weight)
   */
  slipPenalty: number;
  
  /**
   * Baseline drift (B)
   * Daily return when no habits are logged
   * Default: -0.50 (50% negative return for completely unlogged days)
   */
  baselineDrift: number;
  
  /**
   * Decay factor (β)
   * Daily momentum decay: M_t = (1 + R_t) * β * M_{t-1}
   * Default: 0.995 (≈-0.5% per day)
   */
  decayFactor: number;
}

// Preset configurations
export const MOMENTUM_PRESETS = {
  lenient: {
    slipPenalty: -0.15,
    baselineDrift: -0.25,
    decayFactor: 0.998
  },
  default: {
    slipPenalty: -0.25,
    baselineDrift: -0.50,
    decayFactor: 0.995
  },
  hard: {
    slipPenalty: -0.40,
    baselineDrift: -0.75,
    decayFactor: 0.990
  }
} as const;

// Get momentum parameters from environment or use default
export function getMomentumParams(): MomentumParams {
  const preset = import.meta.env.VITE_MOMENTUM_PRESET as keyof typeof MOMENTUM_PRESETS || 'default';
  
  if (preset in MOMENTUM_PRESETS) {
    return MOMENTUM_PRESETS[preset];
  }
  
  // Allow individual parameter overrides
  return {
    slipPenalty: Number(import.meta.env.VITE_MOMENTUM_SLIP_PENALTY) || MOMENTUM_PRESETS.default.slipPenalty,
    baselineDrift: Number(import.meta.env.VITE_MOMENTUM_BASELINE_DRIFT) || MOMENTUM_PRESETS.default.baselineDrift,
    decayFactor: Number(import.meta.env.VITE_MOMENTUM_DECAY_FACTOR) || MOMENTUM_PRESETS.default.decayFactor
  };
}