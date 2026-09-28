const parseArrayValue = value => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue.startsWith('[')) {
    return undefined;
  }

  const parsedValue = safeParse(trimmedValue);
  return Array.isArray(parsedValue) ? parsedValue : undefined;
};

export const isEmptyArrayValue = value => {
  const parsedValue = parseArrayValue(value);

  return Array.isArray(parsedValue) && parsedValue.length === 0;
};

export const getSheetFieldPersonnelNames = value => {
  const items = parseArrayValue(value);

  if (!Array.isArray(items)) return undefined;

  const isPersonnelValue = items.some(
    item =>
      item &&
      ['fullname', 'departmentName', 'organizeName'].some(key => Object.prototype.hasOwnProperty.call(item, key)),
  );

  return isPersonnelValue
    ? items
        .map(item => item && (item.fullname || item.departmentName || item.organizeName))
        .filter(Boolean)
        .join('、')
    : undefined;
};

export const formatLocationValue = value => {
  const location = typeof value === 'string' ? safeParse(value || '{}') : value;

  if (!location || typeof location !== 'object' || Array.isArray(location)) {
    return '';
  }

  const locationText = [location.title, location.address].filter(Boolean).join(' ');

  if (locationText) {
    return locationText;
  }

  return location.x === null ||
    typeof location.x === 'undefined' ||
    location.y === null ||
    typeof location.y === 'undefined'
    ? ''
    : `${_l('经度：%0', location.x)} ${_l('纬度：%0', location.y)}`;
};

export const getRelationLocationTitles = value => {
  const records = parseArrayValue(value);

  if (!Array.isArray(records)) return undefined;

  const titles = records.map(record => formatLocationValue(record?.name)).filter(Boolean);

  return titles.length ? titles.join('、') : undefined;
};
