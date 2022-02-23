export const anti = <T, Index>(predicate: (value: T, i: Index) => boolean) => {
  return (value: T, i: Index) => !predicate(value, i);
};
