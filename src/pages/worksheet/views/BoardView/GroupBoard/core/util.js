import _ from 'lodash';
import { getAdvanceSetting, renderText } from 'src/utils/control';

// 特殊字段map关系
const extraFieldGenerators = {
  26: item => ({ fullname: item.name, accountId: item.id, avatar: item.avatar }),
  27: item => ({ departmentName: item.name, departmentId: item.id }),
  48: item => ({ organizeName: item.name, organizeId: item.id }),
};

const typeRules = {
  26: { idKey: 'accountId', nameKey: 'fullname' },
  27: { idKey: 'departmentId', nameKey: 'departmentName' },
  48: { idKey: 'organizeId', nameKey: 'organizeName' },
  29: { idKey: 'sid', nameKey: 'name' },
};

// 根据等级字段值生成键值对
const generateKeyValuePairs = strNum => {
  const n = parseInt(strNum, 10);
  return Array.from({ length: n }, (_, i) => {
    const val = String(i + 1);
    return { key: val, value: val, name: val, index: i };
  });
};

// 转换等级字段的值，向下取整，小于1的认为是空，大于max的转成max
const processGradeFieldValue = (value, max = '10') => {
  const num = _.toNumber(value);
  const maxNum = _.toNumber(max);

  if (_.isNaN(num) || num < 1) {
    return '';
  }

  if (num <= maxNum) {
    return Math.floor(num).toString();
  }

  return max;
};

// 数据转换
const parseDoubleEncoded = raw => {
  try {
    const arr = safeParse(raw);
    // 如果元素是字符串且像 JSON 字符串（以 { 开头），可能需要再解析
    if (arr.length && typeof arr[0] === 'string' && arr[0].startsWith('{')) {
      return arr.map(item => safeParse(item));
    }
    // 其他情况直接返回
    return arr;
  } catch (error) {
    console.error('解析失败:', error);
    return [];
  }
};

const extractValues = (viewData, controlId, type, relationTitleControl) => {
  const rule = typeRules[type];
  if (!rule) return [];

  const { idKey, nameKey } = rule;

  return _.chain(viewData)
    .flatMap('data')
    .flatMap('formData')
    .filter(f => f.controlId === controlId)
    .map('value')
    .filter(Boolean)
    .map(v => {
      try {
        if (typeof v === 'number') {
          return [];
        }
        const parsed = parseDoubleEncoded(v);
        const parsedArray = _.isArray(parsed) ? parsed : [parsed];

        return parsedArray.map(item => ({
          ...item,
          ...(type === 29 ? {} : { combination: JSON.stringify(item) }), // 每个对象自身的字符串形式
        }));
      } catch (e) {
        console.error('解析异常', e);
        return [];
      }
    })
    .flattenDeep() // 深度扁平化 [[{}], [{}, {}]] → [{}, {}, {}]
    .filter(_.isObject)
    .uniqBy(idKey)
    .map(item => ({
      ...item,
      id: item[idKey],
      key: item[idKey],
      name: item[nameKey],
      ...(type === 29 ? { name: renderText({ ...relationTitleControl, value: item[nameKey] }) || _l('未命名') } : {}),
    }))
    .value();
};

/**
 * 根据options对数据进行分组
 * groupshow：空或者0：全部； 1：有数据的项； 2：指定项；
 * groupfilters：指定项
 */
export const groupByOptionKey = (viewData, view, control, options) => {
  const advanceSetting = getAdvanceSetting(view);
  const type = control.type === 30 ? control.sourceControlType : control.type;
  const isOptionControl = [9, 11].includes(type);
  const isRangeControl = type === 28;
  const isOwneridControl = control.controlId === 'ownerid';
  const { max } = control.advancedSetting || {};
  const { groupshow, groupsetting } = advanceSetting;
  const { controlId } = safeParse(groupsetting)[0] || {};
  const firstGroupKeys = viewData.map(group => group.key);

  const keySet = new Set(options.map(opt => opt.key));
  const groupViewData = {};
  const secondGroupTotal = {};
  for (const key of keySet) {
    groupViewData[key] = {};
    for (const gk of firstGroupKeys) {
      groupViewData[key][gk] = [];
    }
    secondGroupTotal[key] = 0;
  }

  // 遍历 viewData 填充分组数据
  viewData.forEach(({ key: groupKey, data }) => {
    data.forEach((item, index) => {
      let valueStr = '';
      const fd = item.formData.find(f => f.controlId === controlId);
      if (fd) valueStr = fd.value ?? '';

      // 等级字段处理
      if (type === 28) valueStr = processGradeFieldValue(valueStr, max);

      let matched = false;

      // 检查是否包含 options.key
      options
        .filter(opt => opt.key !== '-1')
        .forEach(opt => {
          const key = opt.key;
          if (
            typeof valueStr === 'string' &&
            ((isOptionControl && (safeParse(valueStr) || [])[0] === key) ||
              (isRangeControl && valueStr === key) ||
              (!isOptionControl && !isRangeControl && valueStr.includes(key)))
          ) {
            groupViewData[key][groupKey].push({ ...item, _originIndex: index });
            secondGroupTotal[key] += 1;
            matched = true;
          }
        });

      // 如果没有匹配任何分组
      if (!matched) {
        if (isOwneridControl) {
          // 拥有者字段，放到未指定下
          groupViewData['user-undefined'][groupKey].push({ ...item, _originIndex: index });
          secondGroupTotal['user-undefined'] += 1;
        } else if (groupViewData['-1'] && !matched) {
          // 放入“未指定”
          groupViewData['-1'][groupKey].push({ ...item, _originIndex: index });
          secondGroupTotal['-1'] += 1;
        }
      }
    });
  });

  // 过滤无记录分组
  if (groupshow === '1') {
    const filteredData = {};
    const filteredTotal = {};
    Object.keys(groupViewData).forEach(key => {
      if (secondGroupTotal[key] > 0) {
        filteredData[key] = groupViewData[key];
        filteredTotal[key] = secondGroupTotal[key];
      }
    });
    return { groupViewData: filteredData, secondGroupTotal: filteredTotal };
  }

  // 默认返回全部结果
  return { groupViewData, secondGroupTotal };
};

export const getGroupOpenKeys = (options, view, groupViewData, control) => {
  const { groupopen = '2', groupshow } = getAdvanceSetting(view);
  const { type } = control;
  let openKeys = [];
  switch (groupopen) {
    case '1':
      // 如果二级分组字段为选项、等级，且 groupshow = 1（有数据的项），展开第一项需要判断有数据的第一项
      if (groupshow === '1' && [9, 11, 28].includes(type)) {
        let curKey = _.get(
          _.find(options, item => _.has(groupViewData, item.key)),
          'key',
        );
        if (curKey) openKeys = [curKey];
      } else {
        openKeys = [options[0]?.key];
      }
      break;
    case '2':
      openKeys = options.map(item => item.key);
      break;
    case '3':
      openKeys = [];
      break;
    default:
      openKeys = options.map(item => item.key);
  }
  return openKeys;
};

// 自定义排序（groupcustom: [key1, key2, key3]）
export const sortOptionsByGroupCustom = (options, groupcustom) => {
  const groupCustom = groupcustom ? safeParse(groupcustom) || [] : [];
  const prioritized = groupCustom.map(key => options.find(opt => opt.key === key)).filter(Boolean); // 去除没找到的项（防止 groupCustom 有无效 key）

  const remaining = options.filter(opt => !groupCustom.includes(opt.key));

  return [...prioritized, ...remaining];
};

// 二级分组options处理
export const getGroupOptions = (viewData, view, control, otherParams = {}) => {
  const { groupcustom, groupempty, groupsorts, groupfilters, groupshow, groupsetting } = getAdvanceSetting(view);
  const type = control.type === 30 ? control.sourceControlType : control.type;
  const { enumDefault } = control;
  let options = [];
  // 指定项
  const isGroupFilters = groupshow === '2' && groupfilters !== '';
  // 自定义排序
  const isGroupCustom = !!groupcustom;
  // 成员、部门、组织角色、关联记录
  const isComplexControl = ([26, 27, 48].includes(type) && enumDefault === 0) || (type === 29 && enumDefault === 1);

  // 选项、等级
  if ([9, 11, 28].includes(type)) {
    if (type === 9 || type === 11) {
      options = control.options
        .filter(opt => !opt.isDeleted)
        .map(opt => ({
          ...opt,
          name: opt.value,
        }));
    } else if (type === 28) {
      const { max } = control.advancedSetting;
      options = generateKeyValuePairs(max);
    }
    // 如果有指定项，则按照指定项的顺序展示
    if (isGroupFilters) {
      const groupFilters = safeParse(groupfilters) || [];
      options = groupFilters.map(filterKey => options.find(opt => opt.key === filterKey)).filter(Boolean);
    } else {
      options = _.orderBy(options, ['index'], [groupsorts === '1' ? 'desc' : 'asc']);
      // 自定义排序
      if (isGroupCustom) {
        options = sortOptionsByGroupCustom(options, groupcustom);
      }
    }
  } else {
    if (isComplexControl) {
      const rawOptions =
        isGroupFilters && groupfilters
          ? parseDoubleEncoded(groupfilters)
          : isGroupCustom && groupcustom
            ? parseDoubleEncoded(groupcustom)
            : [];

      options = rawOptions.map(item => {
        const base = { ...item, key: item.id };

        if (type === 29) {
          return { ...base, value: item.name };
        }

        const combination = extraFieldGenerators[type]?.(item) || {};
        return { ...base, combination: JSON.stringify(combination) };
      });

      if (!isGroupFilters) {
        const { controlId } = safeParse(groupsetting)[0] || {};
        const relationTitleControl = type === 29 ? _.find(control.relationControls, item => item.attribute === 1) : {};
        const optionAll = extractValues(viewData, controlId, type, relationTitleControl);
        options = [...options, ..._.differenceBy(optionAll, options, 'id')];
      }
    }
  }

  options = _.filter(options, opt => opt.key !== undefined);

  // 需要按照最初的顺序显示
  const { sortedOptionKeys, updateBoardViewSortedOptionKeys = () => {} } = otherParams;
  if (isComplexControl && !isGroupFilters && sortedOptionKeys) {
    if (sortedOptionKeys.length) {
      options = options.sort((a, b) => {
        const indexA = sortedOptionKeys.indexOf(a.key);
        const indexB = sortedOptionKeys.indexOf(b.key);
        return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
      });
    }
    let curKeys = options.map(item => item.key);
    updateBoardViewSortedOptionKeys(curKeys);
  }

  // 拥有者（成员）字段，不应该有未分组的情况，空的情况处理成未指定
  if (control.controlId === 'ownerid') {
    if (!_.some(options, { key: 'user-undefined' })) {
      options.push({
        accountId: 'user-undefined',
        combination: '{"accountId":"user-undefined","fullname":"未指定"}',
        fullname: '未指定',
        id: 'user-undefined',
        key: 'user-undefined',
        name: '未指定',
      });
    }
  } else if (groupempty === '1') {
    options.push({
      key: '-1',
      name: '未分组',
    });
  }

  return options;
};

// 处理options，用于【移动到】相关参数
export const parseGroupsByOptions = (type, options) => {
  let parseOptions = [];
  switch (type) {
    case 9:
    case 11:
    case 28:
      parseOptions = options.map(item => ({ key: item.key, name: item.value }));
      break;
    case 26:
    case 27:
    case 48:
      parseOptions = options.map(item => ({ key: item.key, name: item.combination }));
      break;
    case 29:
      parseOptions = options;
      break;
  }
  return parseOptions;
};
