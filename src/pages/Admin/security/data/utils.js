export const arrayToObject = (array = []) => {
  if (!array || !array.length) return {};

  return array.reduce((res, item) => {
    res[`"${item.key}"`] = item.value;
    return res;
  }, {});
};

export const objectToArray = (object = {}) => {
  if (!object || !Object.keys(object).length) return [];

  return Object.entries(object).map(([key, value], index) => {
    return {
      index,
      key: key.replace(/^"([^"]*)"$/, '$1'),
      value,
    };
  });
};
