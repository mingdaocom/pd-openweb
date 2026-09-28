const isCustomOptionKey = key => key.indexOf('other') > -1 || key.indexOf('add_') > -1;

/** 按控件选中键解析有效选项，并兼容自定义选项及按配置顺序返回。 */
export function getSelectedOptions(options = [], value, control) {
  if (!value || value === '[]') {
    return [];
  }

  try {
    const selectedKeys = Array.isArray(value) ? value : JSON.parse(value);
    const optionList = options || [];
    const optionMap = new Map();

    optionList.forEach(option => {
      if (!optionMap.has(option.key)) {
        optionMap.set(option.key, option);
      }
    });

    const selectedKeySet = new Set(selectedKeys.filter(key => !isCustomOptionKey(key)));
    const customSelectedKeys = selectedKeys.filter(isCustomOptionKey);

    const findOptionByKey = key => {
      if (isCustomOptionKey(key)) {
        return optionList.find(option => key.indexOf(option.key) > -1);
      }

      return optionMap.get(key);
    };

    const keys =
      ((control || {}).advancedSetting || {}).checktype === '0'
        ? optionList
            .filter(
              option =>
                (selectedKeySet.has(option.key) ||
                  customSelectedKeys.some(selectedKey => selectedKey.indexOf(option.key) > -1)) &&
                !option.isDeleted,
            )
            .map(option => option.key)
        : selectedKeys;

    return keys.map(findOptionByKey).filter(Boolean);
  } catch (err) {
    console.log(err);
    return [];
  }
}
