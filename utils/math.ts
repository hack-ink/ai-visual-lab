import { TokenCandidate } from '../types';

/**
 * Calculates the softmax distribution given logits and temperature.
 * 
 * Formula: P_i = exp(z_i / T) / sum(exp(z_j / T))
 */
export const calculateProbabilities = (
  candidates: TokenCandidate[],
  temperature: number
): { id: number; probability: number }[] => {
  // Avoid division by zero. If temp is 0, we treat it as extremely close to 0 (argmax behavior)
  const t = Math.max(temperature, 0.01);

  const adjustedLogits = candidates.map(c => ({
    id: c.id,
    val: c.baseLogit / t
  }));

  // For numerical stability, subtract max logit
  const maxLogit = Math.max(...adjustedLogits.map(x => x.val));
  
  const exps = adjustedLogits.map(x => ({
    id: x.id,
    exp: Math.exp(x.val - maxLogit)
  }));

  const sumExps = exps.reduce((acc, curr) => acc + curr.exp, 0);

  return exps.map(x => ({
    id: x.id,
    probability: x.exp / sumExps
  }));
};
