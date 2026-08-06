import _ from 'lodash';
import DataFormat from 'src/components/Form/core/DataFormat';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { checkCellIsEmpty, controlState } from 'src/utils/control';
import { filterEmptyChildTableRows } from 'src/utils/record';
import { checkRulesErrorOfRow } from 'src/utils/rule';
import { FORM_ERROR_TYPE, FORM_ERROR_TYPE_TEXT, FROM } from '../../../core/config';
import { checkRuleLocked } from '../../../core/formUtils';
import { checkValueByFilterRegex } from '../../../core/formUtils';

function getControlCompareValue(c, value) {
  if (c.type === 26) {
    return safeParse(value, 'array')
      .map(u => u.accountId)
      .sort()
      .join('');
  } else if (c.type === 29) {
    return safeParse(value, 'array')
      .map(u => u.sid)
      .sort()
      .join('');
  } else if (c.type === 27) {
    return safeParse(value, 'array')
      .map(u => u.departmentId)
      .sort()
      .join('');
  } else if (c.type === 48) {
    return safeParse(value, 'array')
      .map(u => u.organizeId)
      .sort()
      .join('');
  } else {
    return value;
  }
}

/**
 * 记录数据格式化为 关联表控件数据格式
 * @param  {} controls
 * @param  {} data
 */

export function getSubListError({ rows, rules }, controls = [], showControls = [], from = 3, masterData) {
  const result = {};

  try {
    filterEmptyChildTableRows(rows).forEach(async row => {
      const rulesResult = checkRulesErrorOfRow({
        from,
        rules,
        controls: controls.filter(
          c =>
            _.find(showControls, id => id === c.controlId) ||
            _.find(rules, rule => JSON.stringify(rule.filters).indexOf(c.controlId) > -1),
        ),
        row,
      });
      const rulesErrors = rulesResult.errors;
      const controldata = rulesResult.formData.filter(
        c => _.find(showControls, id => id === c.controlId) && controlState(c).visible && controlState(c).editable,
      );
      const isLock = checkRuleLocked(
        rules,
        rulesResult.formData.filter(c => _.find(showControls, id => id === c.controlId) && controlState(c).visible),
        row.rowid,
      );

      if (isLock) {
        return;
      }

      const formdata = new DataFormat({
        data: controldata.map(c => ({ ...c, isSubList: true })),
        from: FROM.NEWRECORD,
        masterData,
      });
      let errorItems = formdata.getErrorControls();
      rulesErrors.forEach(errorItem => {
        if (_.includes(showControls, errorItem.controlId)) {
          result[row.rowid + '-' + errorItem.controlId] = errorItem.errorMessage;
        }
      });
      errorItems.forEach(errorItem => {
        const errorControl = _.find(controldata, c => c.controlId === errorItem.controlId);
        result[row.rowid + '-' + errorItem.controlId] =
          errorItem.errorType === FORM_ERROR_TYPE.CUSTOM
            ? checkValueByFilterRegex(errorControl, _.get(errorControl, 'value'), controldata)
            : typeof FORM_ERROR_TYPE_TEXT[errorItem.errorType] === 'string'
              ? FORM_ERROR_TYPE_TEXT[errorItem.errorType]
              : FORM_ERROR_TYPE_TEXT[errorItem.errorType](errorControl);
      });
    });
    const uniqueControls = controls.filter(
      c => _.find(showControls, id => id === c.controlId) && (c.unique || c.uniqueInRecord),
    );
    uniqueControls.forEach(c => {
      const hadValueRows = rows.filter(
        row =>
          typeof row[c.controlId] !== 'undefined' &&
          !checkCellIsEmpty(row[c.controlId]) &&
          !row[c.controlId].startsWith('deleteRowIds'),
      );
      const uniqueValueRows = _.uniqBy(hadValueRows, row => getControlCompareValue(c, row[c.controlId]));

      if (hadValueRows.length !== uniqueValueRows.length) {
        const duplicateValueRows = hadValueRows.filter(vr => !_.find(uniqueValueRows, r => r.rowid === vr.rowid));
        duplicateValueRows.forEach(row => {
          const sameValueRows = hadValueRows.filter(
            r => getControlCompareValue(c, r[c.controlId]) === getControlCompareValue(c, row[c.controlId]),
          );

          if (sameValueRows.length > 1) {
            sameValueRows.forEach(r => {
              result[r.rowid + '-' + c.controlId] = FORM_ERROR_TYPE_TEXT.UNIQUE(c, true);
            });
          }
        });
      }
    });
    return result;
  } catch (err) {
    alert(_l('失败'), 3);
    console.log(err);
    throw err;
  }
}

export const addWidthToColumns = (columns, dataSource) => {
  // 创建一个隐藏的 div 用来计算文字宽度
  const wrapper = document.createElement('div');
  wrapper.style.position = 'absolute';
  wrapper.style.visibility = 'hidden';
  wrapper.style.whiteSpace = 'nowrap';
  wrapper.style.fontSize = '16px';
  document.body.appendChild(wrapper);

  const tempDiv = document.createElement('div');
  tempDiv.style.fontSize = '1em';
  wrapper.appendChild(tempDiv);

  const MIN_WIDTH = 80;
  const MAX_WIDTH = 200;
  const PADDING = 20; // 左右各 10
  const TOLERANCE = 10; // 预留10像素容错，避免计算误差

  const newColumns = columns.map(col => {
    if (col.controlId === 'delete') {
      return col;
    }

    // 获取该列的所有值（加上列标题）
    const values = [col.controlName, ...dataSource.map(row => row[col.controlId] ?? '')];
    // 计算最大宽度
    let maxTextWidth = 0;
    values.forEach(value => {
      tempDiv.innerText = String(value);
      maxTextWidth = Math.max(maxTextWidth, tempDiv.offsetWidth);
    });

    // 加上 padding + 容错
    let finalWidth = maxTextWidth + PADDING + TOLERANCE;
    // 限制范围
    if (finalWidth < MIN_WIDTH) finalWidth = MIN_WIDTH;
    if (finalWidth > MAX_WIDTH) finalWidth = MAX_WIDTH;

    return {
      ...col,
      width: finalWidth,
    };
  });

  document.body.removeChild(wrapper);

  return newColumns;
};

// 关联类型字段的 dataType 列表，其 values 可能包含对象格式，需转换为纯 ID
const RELATION_FILTER_TYPES = [
  WIDGETS_TO_API_TYPE_ENUM.USER_PICKER,
  WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT,
  WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET,
  WIDGETS_TO_API_TYPE_ENUM.CASCADER,
  WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE,
  WIDGETS_TO_API_TYPE_ENUM.AREA_CITY,
  WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY,
  WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE,
];

function normalizeSDKFilterValueItem(v) {
  if (typeof v === 'object' && v !== null) {
    return v.accountId || v.id || v.departmentId || v.organizeId || v.rowid;
  }

  if (typeof v === 'string' && v.startsWith('{')) {
    const parsed = safeParse(v);

    if (parsed && typeof parsed === 'object') {
      return parsed.id || parsed.accountId;
    }
  }

  return v;
}

// 将单条 SDK 筛选条件规范化为与 PC 端 formatConditionForSave 输出一致的格式
function normalizeSDKCondition(fc) {
  const result = {
    controlId: fc.controlId,
    dataType: fc.dataType,
    spliceType: fc.spliceType || 1,
    filterType: fc.filterType,
    dateRange: fc.dateRange,
    dateRangeType: fc.dateRangeType,
    maxValue: fc.maxValue,
    minValue: fc.minValue,
    isDynamicsource: fc.isDynamicsource,
    dynamicSource: fc.dynamicSource || [],
    value: fc.value,
    values: fc.values || [],
  };

  Object.keys(result).forEach(k => result[k] === undefined && delete result[k]);

  // SDK 会传空字符串，PC 端不传此字段时直接省略
  if (result.maxValue === '') delete result.maxValue;
  if (result.minValue === '') delete result.minValue;

  // 日期/日期时间字段（type 15/16）指定日期时间（dateRange=18）场景：
  // SDK 使用 filterType=17（DATEENUM）+ dateRangeType=3（DAY），
  // PC 使用 filterType=37（DATE_EQ）+ dateRangeType=1（MINUTE），需对齐
  if (_.includes([15, 16], result.dataType) && result.filterType === 17 && result.dateRange === 18) {
    result.filterType = 37;
    result.dateRangeType = 1;
  }

  if (_.includes(RELATION_FILTER_TYPES, result.dataType) && result.values && result.values.length) {
    result.values = result.values.map(normalizeSDKFilterValueItem).filter(Boolean);
  }

  return result;
}

// SDK 返回扁平条件数组，API 要求分组格式 [{isGroup: true, groupFilters: [...]}]，此函数完成转换并规范化字段
export function normalizeSDKFilterControls(filterControls) {
  if (!filterControls || !filterControls.length) return filterControls;

  if (filterControls.some(fc => fc.isGroup && fc.groupFilters)) {
    return filterControls.map(fc => {
      if (fc.isGroup && fc.groupFilters) {
        return { ...fc, groupFilters: fc.groupFilters.map(normalizeSDKCondition) };
      }

      return normalizeSDKCondition(fc);
    });
  }

  const normalizedConditions = filterControls.map(normalizeSDKCondition);
  const spliceType = (normalizedConditions[0] && normalizedConditions[0].spliceType) || 1;

  return [{ isGroup: true, spliceType, groupFilters: normalizedConditions }];
}
