import { toConcepts } from '@coeng/concept-ml-parser';
import { Interpolation } from '../../types';

export const toVariableDict = (interpolations: Interpolation[]) => {
  return Object.fromEntries(
    interpolations.map(({ key, value }) => [key, toConcepts(value)]),
  );
};

export const batchProcess = async <TItem, TResult>(
  size: number,
  items: TItem[],
  process: (
    batch: TItem[],
    i: number,
    totalBatches: number,
  ) => Promise<TResult>,
) => {
  const results: TResult[] = [];
  const totalBatches = Math.ceil(items.length / size);

  for (let i = 0; i < items.length; i += size) {
    const batch = items.slice(i, i + size);
    const result = await process(batch, i, totalBatches);
    results.push(result);
  }

  return results;
};
