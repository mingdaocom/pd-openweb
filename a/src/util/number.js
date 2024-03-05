const NumberUtil = {};

// 是数值
NumberUtil.isNumber = value => {
  return typeof value === 'number' && !isNaN(value);
};

// 是数值字符串
NumberUtil.isNumberStr = value => {
  return value !== '' && NumberUtil.isNumber(+value);
};

// 尝试将值解析为浮点数
NumberUtil.parseFloat = (value, defaultValue) => {
  const result = parseFloat(value);

  // 检查解析结果是否为 NaN，或者值为空字符串或未定义
  if (isNaN(result) || value === '' || typeof value === 'undefined') {
    return defaultValue;
  }

  // 返回解析结果
  return result;
};

export default NumberUtil;
