export const endsWithAny = (text: string, suffixList: string[]): boolean => {
  return (
    suffixList.find((suffix) => {
      return text.endsWith(suffix);
    }) != null
  );
};
