export const renderValue = (formulaValue = '', node = {}) => {
  const arr = formulaValue.match(/\$[^ \r\n]+?\$/g);
  if (arr) {
    arr.forEach(obj => {
      const data = obj
        .replace(/\$/g, '')
        .split(/([a-zA-Z0-9#]{24,32})-/)
        .filter(item => item);
      const { formulaMap = {} } = node;
      formulaValue = formulaValue.replace(
        obj,
        `{${(formulaMap[data[0]] || {}).name || ''}.${(formulaMap[data.join('-')] || {}).name || ''}}`,
      );
    });
  }
  return formulaValue;
};
