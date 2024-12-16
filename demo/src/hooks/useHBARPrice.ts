import { percentDifference } from '@/utils/percents';
import { Timestamp } from '@hashgraph/sdk';
import { subDays } from 'date-fns';
import { useEffect, useRef, useState } from 'react';

export interface TRate {
  cent_equivalent: number;
  expiration_time: number;
  hbar_equivalent: number;
}

export interface HBARPrice {
  current_rate: TRate;
  next_rate: TRate;
  timestamp: string;
}

export const getHBARPrice = async (date: Date) => {
  try {
    const timestamp = Timestamp.fromDate(date).toString();

    const request = await fetch(
      `https://mainnet-public.mirrornode.hedera.com/api/v1/network/exchangerate?timestamp=${timestamp}`
    );
    const response = (await request.json()) as HBARPrice;

    const usdPrice =
      Number(response?.current_rate?.cent_equivalent) /
      Number(response?.current_rate?.hbar_equivalent) /
      100;

    return usdPrice;
  } catch (e) {
    return null;
  }
};

export const useHBARPrice = (date: Date) => {
  const [priceToday, setPriceToday] = useState<number | null>(null);
  const [pricePrevious, setPricePrevious] = useState<number | null>(null);
  const isFetching = useRef(false);

  const difference = percentDifference(pricePrevious || 0, priceToday || 0);

  const direction =
    Number(priceToday) > Number(pricePrevious) ? 'positive' : 'negative';

  const suffix = direction === 'positive' ? 'increase' : 'decrease';

  useEffect(() => {
    const getData = async () => {
      if (priceToday || isFetching.current) {
        return;
      }
      try {
        isFetching.current = true;
        const current = await getHBARPrice(date);
        const previous = await getHBARPrice(subDays(date, 1));

        setPriceToday(current);
        setPricePrevious(previous);
        isFetching.current = false;
      } catch (e) {
        console.log(e);
        isFetching.current = false;
      }
    };
    getData();
  }, [date]);

  return {
    priceToday,
    pricePrevious,
    difference,
    direction,
    suffix,
  };
};
