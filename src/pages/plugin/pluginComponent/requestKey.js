const normalizeRequestValue = value => {
  if (Array.isArray(value)) return value.map(normalizeRequestValue);
  if (!value || Object.prototype.toString.call(value) !== '[object Object]') return value;

  return Object.keys(value)
    .sort()
    .reduce((result, key) => ({ ...result, [key]: normalizeRequestValue(value[key]) }), {});
};

export const getPluginUpdateRequestKey = updateObj => JSON.stringify(normalizeRequestValue(updateObj));
