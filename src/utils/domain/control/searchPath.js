/**
 * 将搜索文本转为安全的正则表达式，避免特殊字符改变匹配语义。
 */
const inputValueReg = (inputValue, regType) => {
  return new RegExp(inputValue.trim().replace(/([,.+?:()*[\]^$|{}\\-])/g, '\\$1'), regType || 'i');
};

/**
 * 按关键字在层级搜索路径中首次出现的位置，对可搜索项进行优先级排序。
 */
export const sortPathsBySearchKeyword = (data, inputValue) => {
  const list = data.filter(item => (safeParse(item.searchPath) || []).length > 0);
  const reg = inputValueReg(inputValue, 'g');

  const formatValue = value => {
    const pathStr = value.searchPath || '[]';
    const pathArr = JSON.parse(pathStr);
    return pathArr.map(path => {
      const index = path.search(reg);
      return index === -1 ? 999 : index;
    });
  };

  return list.sort((a, b) => {
    const aIndexArr = formatValue(a);
    const bIndexArr = formatValue(b);
    const maxCount = Math.max(aIndexArr.length, bIndexArr.length);

    for (let i = 0; i < maxCount; i++) {
      const aValue = aIndexArr[i];
      const bValue = bIndexArr[i];

      if (bValue === undefined || aValue < bValue) return -1;
      if (aValue === undefined || aValue > bValue) return 1;
    }

    return 0;
  });
};
