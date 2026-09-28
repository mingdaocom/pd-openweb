import update from 'immutability-helper';
import _ from 'lodash';

/** 解析字段高级设置中的动态默认值配置。 */
const getDynamicDefaultValue = data => {
  const value = _.get(data, ['advancedSetting', 'defsource']);

  try {
    const parsedValue = value && JSON.parse(value);
    return parsedValue;
  } catch (error) {
    console.log(error);
  }
};

/** 校正字段最小值和最大值配置，清除无效范围。 */
export function handleExtremeValue(data) {
  const { advancedSetting = {} } = data;
  const { checkrange = '0', min = '', max = '' } = advancedSetting;
  const transferValue = value => (value ? value.toString() : '').replace(/,/g, '');
  const formateMin = parseFloat(transferValue(min));
  const formateMax = parseFloat(transferValue(max));

  // 如果最大最小值都没配 则取消勾选
  if (min === '' && max === '' && checkrange === '1') {
    return update(data, {
      advancedSetting: {
        $set: { ...advancedSetting, checkrange: '0', min: '', max: '' },
      },
    });
  }

  if (isNaN(formateMin) && isNaN(formateMax)) {
    return update(data, {
      advancedSetting: { $set: { ...advancedSetting, min: '', max: '' } },
    });
  }

  if (formateMax < formateMin) {
    return update(data, {
      advancedSetting: { $set: { ...advancedSetting, min: '', max: '' } },
    });
  }

  return data;
}

/** 将关联记录动态默认值统一转换为记录标识。 */
export function dealRelateSheetDefaultValue(data) {
  const dynamicValue = getDynamicDefaultValue(data);
  if (!dynamicValue) return data;
  const newValue = dynamicValue.map(value => {
    return update(value, {
      $apply: item => {
        const { staticValue } = item;
        if (!staticValue) return item;
        try {
          const parsedValue = JSON.parse(staticValue);
          return {
            ..._.omit(item, 'relateSheetName'),
            staticValue: JSON.stringify(
              parsedValue.map(v => {
                return _.get(safeParse(v), 'rowid') || v;
              }),
            ),
          };
        } catch (error) {
          console.log(error);
          return data;
        }
      },
    });
  });
  return update(data, {
    advancedSetting: {
      $apply: item => ({ ...item, defsource: JSON.stringify(newValue) }),
    },
  });
}

const use_ids = {
  26: 'accountId',
  27: 'departmentId',
  48: 'organizeId',
};

/** 将人员、部门或组织角色配置统一转换为对应标识。 */
export function dealUserId(data, key = 'defsource') {
  const value = _.get(data, ['advancedSetting', key]) || '[]';
  let dataType = use_ids[data.type];

  try {
    const settings = value && JSON.parse(value);
    if (_.isEmpty(settings)) return data;
    const newValue = settings.map(setting =>
      update(setting, {
        $apply: item => {
          const { staticValue } = item;

          if (item.type && key === 'chooserange') {
            const chooseId = item.type === 1 ? 26 : item.type === 2 ? 27 : 48;
            dataType = use_ids[chooseId];
          }

          if (staticValue && typeof staticValue === 'string') {
            const accountId = safeParse(staticValue || '{}')[dataType];
            return { ...item, staticValue: accountId || staticValue };
          }

          if (_.get(staticValue, [dataType])) return { ...item, staticValue: staticValue[dataType] };
          return item;
        },
      }),
    );
    return update(data, {
      advancedSetting: {
        $apply: item => ({ ...item, [key]: JSON.stringify(newValue) }),
      },
    });
  } catch (error) {
    console.log(error);
  }

  return data;
}

/** 将级联筛选配置中的对象值转换为标识值。 */
export function dealCascaderId(data) {
  const value = _.get(data, ['advancedSetting', 'topfilters']) || '[]';

  try {
    const settings = value && JSON.parse(value);
    if (_.isEmpty(settings)) return data;
    const newValue = settings.map(setting =>
      update(setting, {
        $apply: item => {
          return safeParse(item || '{}')['id'] || item;
        },
      }),
    );
    return update(data, {
      advancedSetting: {
        $apply: item => ({ ...item, topfilters: JSON.stringify(newValue) }),
      },
    });
  } catch (error) {
    console.log(error);
  }

  return data;
}
