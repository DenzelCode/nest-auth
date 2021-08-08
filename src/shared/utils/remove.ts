export const remove = <T>(arr: T[], predicate: (item: T) => boolean) => {
  const index = arr.findIndex(predicate);

  return arr.splice(index, 1);
};
