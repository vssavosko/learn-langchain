export const asyncIterableToArray = async <T>(
  asyncIterable: AsyncIterable<T[]>
): Promise<T[]> => {
  const result: T[] = [];

  for await (const batch of asyncIterable) {
    result.push(...batch);
  }

  return result;
};
