export function percentDifference(a: number, b: number): number {
  return (b / a) * 100 - 100 || 0;
}

export const percentage = (
  partialValue?: number,
  totalValue?: number
): number => {
  if (!partialValue || !totalValue) {
    return 0;
  }
  return (100 * partialValue) / totalValue;
};

export const getROI = (cost: number, profit: number) => {
  if (cost === 0) {
    return 100;
  }
  return ((profit - cost) / cost) * 100;
};

export const roundOffTo = (num: number, factor = 1): number => {
  const quotient = num / factor;
  const res = Math.round(quotient) * factor;
  return res;
};
