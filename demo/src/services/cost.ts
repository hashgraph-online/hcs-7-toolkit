import { getHBARPrice } from '../hooks/useHBARPrice';

const BASE_TOPIC_COST_USD = 0.02;

/**
 * Estimates inscription cost based on messages.
 * Actual cost may vary.
 * @param totalMessages
 * @param files
 * @returns
 */
export const calculateTieredPricing = async (
  totalMessages: number,
  files: number = 0
) => {
  const firstTierLimit = 500;
  const secondTierLimit = 1000;
  const thirdTierLimit = 2000;
  const fourthTierLimit = 5000;
  const fifthTierLimit = 20000;
  let firstTierRate = 0.01;
  let secondTierRate = 0.006;
  let thirdTierRate = 0.003;
  let fourthTierRate = 0.001;
  let fifthTierRate = 0.0004;
  let sixthTierRate = 0.0003;

  const hbarPrice = await getHBARPrice(new Date());

  if (!hbarPrice) {
    console.error('Could not get price of HBAR - try again');
    throw new Error('Could not get price of HBAR - try again');
  }

  let cost = 0;

  if (totalMessages > fifthTierLimit) {
    cost += (totalMessages - fifthTierLimit) * sixthTierRate;
    totalMessages = fifthTierLimit;
  }

  if (totalMessages > fourthTierLimit) {
    cost += (totalMessages - fourthTierLimit) * fifthTierRate;
    totalMessages = fourthTierLimit;
  }

  if (totalMessages > thirdTierLimit) {
    cost += (totalMessages - thirdTierLimit) * fourthTierRate;
    totalMessages = thirdTierLimit;
  }

  if (totalMessages > secondTierLimit) {
    cost += (totalMessages - secondTierLimit) * thirdTierRate;
    totalMessages = secondTierLimit;
  }

  if (totalMessages > firstTierLimit) {
    cost += (totalMessages - firstTierLimit) * secondTierRate;
    totalMessages = firstTierLimit;
  }

  cost += totalMessages * firstTierRate;

  cost += files * BASE_TOPIC_COST_USD;

  const costInHBAR = cost / hbarPrice;

  return costInHBAR;
};
