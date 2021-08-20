export const remove = <T>(arr: T[], predicate: (item: T) => boolean) => {
  const results = arr.filter(predicate);

  for (const result of results) {
    arr.splice(arr.indexOf(result), 1);
  }

  return results;
};
