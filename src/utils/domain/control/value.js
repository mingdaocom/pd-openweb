import _ from 'lodash';

// 选择类控件值对象中用于标识选中项的字段名。
export const WIDGET_VALUE_ID = {
  26: 'accountId',
  27: 'departmentId',
  29: 'sid',
  35: 'sid',
  48: 'organizeId',
};

/** 将选择类字段值转换为与选中顺序无关的比较值。 */
export function getControlCompareValue(control, value) {
  if (![26, 27, 29, 48].includes(control.type)) return value;
  const valueId = WIDGET_VALUE_ID[control.type];

  return safeParse(value, 'array')
    .map(item => item[valueId])
    .sort()
    .join('');
}

/** 将唯一值校验中的选择类控件值转换为后端比较值。 */
export function getControlUniqueValue(value, type) {
  if (![26, 27, 29, 48].includes(type)) return value;

  return safeParse(value.startsWith('deleteRowIds') ? '[]' : value || '[]')
    .map(item => item[WIDGET_VALUE_ID[type]])
    .join('');
}

/** 从关联记录（29）字段值中解析出已关联记录的 rowid。 */
export function getRelateRecordRowIds(value) {
  return safeParse(value, 'array')
    .map(item => item[WIDGET_VALUE_ID[29]])
    .filter(Boolean);
}

/**
 * 合并关联记录可选列表的放行名单。
 * 服务端按源记录查询可选记录时会默认剔除「已关联的记录」，keepShowRowIds 里的 rowid
 * 会随 _system_excluderowids 传给服务端要求放行；字段被整体清空后仍需放行原关联的记录，
 * 否则这些原本已选的记录在可选列表里反而找不到。
 */
export function withKeepShowRowIds(ignoreRowIds = [], control = {}) {
  const keepShowRowIds = control.keepShowRowIds || [];
  return keepShowRowIds.length ? _.uniq(ignoreRowIds.concat(keepShowRowIds)) : ignoreRowIds;
}

// 控件规则匹配：未保存控件匹配 uuid，已保存控件形如 $5e047c2ab2bfdd0001e9b8f9$
export const FIELD_REG_EXP =
  /\$((\w{8}(-\w{4}){3}-\w{12})|(\w{24}|caid|ownerid|utime|ctime|userId|phone|email|language|projectId|appId|groupId|worksheetId|viewId|recordId|ua|timestamp|search-keyword|ocr-file|ocr-file-url|current-location|empty|user-self|current-time|wfname|wfcuaids|wfcaid|wfctime|wfrtime|wfftime|wfstatus|rowid|uaid|codeResult|triggerTime|triggerUser|triggerDepartment|triggerOrg|user|time|address|xy|temp-name|print-time)?)(~((\w{8}(-\w{4}){3}-\w{12})|(\w{24}|caid|ownerid|utime|ctime|userId|phone|email|language|projectId|appId|groupId|worksheetId|viewId|recordId|ua|timestamp|search-keyword|ocr-file|ocr-file-url|current-location|empty|user-self|current-time|wfname|wfcuaids|wfcaid|wfctime|wfrtime|wfftime|wfstatus|rowid|uaid|codeResult|triggerTime|triggerUser|triggerDepartment|triggerOrg|user|time|address|xy|temp-name|print-time)?))?\$/g;

/**
 * 将包含控件字段占位符的默认值拆分为动态来源与静态文本片段。
 */
export const transferValue = (value = '') => {
  const controlFields = value.match(FIELD_REG_EXP) || [];
  const defaultValue = _.filter(value.split('$'), v => !_.isEmpty(v));
  const defsource = defaultValue.map(item => {
    const defaultData = { cid: '', rcid: '', staticValue: '' };

    if (_.includes(controlFields, `$${item}$`)) {
      const [cid = '', rcid = ''] = item.split('~');
      return { ...defaultData, cid, rcid };
    }

    return { ...defaultData, staticValue: item };
  });

  return defsource;
};

/**
 * 判断字段值是否为未定义、空串、空数组序列或空时间段序列。
 * @param value
 */
export function checkCellIsEmpty(value) {
  return typeof value === 'undefined' || value === '' || value === '[]' || value === '["",""]' || value === null;
}

/**
 * 将选项控件值拆分为普通选项 ID 与“其他”文本。
 */
export const getCheckAndOther = value => {
  const checkIds = [];
  let otherValue = '';

  if (/^\[.*\]$/.test(value)) {
    safeParse(value, 'array').forEach(item => {
      if ((item || '').toString().includes('other:')) {
        otherValue = _.replace(item, 'other:', '');
        checkIds.push('other');
      } else {
        checkIds.push(item);
      }
    });
  }

  return { checkIds, otherValue };
};

/**
 * 将人员控件的数组或 JSON 字符串值统一转换为已过滤空项的数组。
 */
export const getUserValue = value => {
  if (!value) return [];
  if (_.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    const parsedValue = safeParse(value, 'array');
    return _.isArray(parsedValue) ? parsedValue.filter(Boolean) : [parsedValue].filter(Boolean);
  }

  return [];
};
