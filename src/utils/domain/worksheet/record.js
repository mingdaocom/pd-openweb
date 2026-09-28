import { generate } from '@ant-design/colors';
import { TinyColor } from '@ctrl/tinycolor';
import _, { get } from 'lodash';
import { filterEmptyChildTableRows } from 'src/utils/core/childTable';
import { getTitleTextFromRelateControl, renderText as renderCellText } from 'src/utils/domain/control/display';
import { getValueStyle, isLightColor } from 'src/utils/domain/control/style';
import { isRelateRecordTableControl } from 'src/utils/domain/control/type';
import { checkCellIsEmpty } from 'src/utils/domain/control/value';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/utils/domain/control/widgetTypes';
import { RECORD_COLOR_SHOW_TYPE } from 'src/utils/domain/worksheet/constants';
import { pathCompletion } from 'src/utils/platform/navigation/path';

/**
 * 生成指定应用、工作表与视图的新建记录页面地址。
 */
export function getNewRecordPageUrl({ appId, worksheetId, viewId }) {
  return pathCompletion(`/app/${appId}/newrecord/${worksheetId}/${viewId}/`);
}

/**
 * 从关联记录值及备用计数中解析当前关联记录数量。
 */
export function getRelateRecordCountFromValue(value, propsCount) {
  let count = 0;

  try {
    let savedCount;
    const parsedData = safeParse(value, 'array');

    if (!_.isUndefined(_.get(parsedData, '0.count'))) {
      savedCount = parsedData[0].count;
    } else if (value === '') {
      savedCount = 0;
    } else if (!_.isUndefined(propsCount)) {
      savedCount = propsCount;
    } else {
      savedCount = parsedData[0]?.count || parsedData.length;
    }

    if (!_.isUndefined(savedCount) && !_.isNaN(Number(savedCount))) {
      count = Number(savedCount);
    }
  } catch (err) {
    console.log(err);
  }

  if (String(value).startsWith('deleteRowIds')) {
    return 0;
  }

  return count;
}

/**
 * 为指向当前主记录的关联控件补充默认值来源。
 */
export function handleUpdateDefsourceOfControl({ recordId, relateRecordControl, masterData, controls = [] } = {}) {
  return controls.map(control => {
    if (
      control.type === 29 &&
      control.sourceControlId === relateRecordControl.controlId &&
      control.dataSource === relateRecordControl.worksheetId
    ) {
      try {
        control.advancedSetting = _.assign({}, control.advancedSetting, {
          defsource: JSON.stringify([
            {
              staticValue: JSON.stringify([
                JSON.stringify({
                  rowid: recordId,
                  ...[{}, ...(get(masterData, 'formData') || []).filter(c => c.type !== 34)].reduce((a = {}, b = {}) =>
                    Object.assign(a, {
                      [b.controlId]:
                        b.type === 29 && _.isObject(b.value) && b.value.records
                          ? JSON.stringify(
                              // 子表使用双向关联字段作为默认值 RELATERECORD_OBJECT
                              b.value.records.map(r => ({ sid: r.rowid, sourcevalue: JSON.stringify(r) })),
                            )
                          : b.value,
                    }),
                  ),
                }),
              ]),
            },
          ]),
        });
        return control;
      } catch (err) {
        console.error(err);
        return control;
      }
    } else {
      return control;
    }
  });
}

const SUMMARY_TYPE = {
  HIDDEN: 0,
  COMPLETED: 1,
  INCOMPLETE: 2,
  SUM: 3,
  AVERAGE: 4,
  MAXIMUM: 5,
  MINIMUM: 6,
};

export const SUMMARY_LIST = [
  { type: 'COMMON', value: SUMMARY_TYPE.HIDDEN, label: _l('不显示') },
  { type: 'COMMON', value: SUMMARY_TYPE.COMPLETED, label: _l('已填写') },
  { type: 'COMMON', value: SUMMARY_TYPE.INCOMPLETE, label: _l('未填写') },
  { type: 'NUMBER', value: SUMMARY_TYPE.SUM, label: _l('求和') },
  { type: 'NUMBER', value: SUMMARY_TYPE.AVERAGE, label: _l('平均值') },
  { type: 'NUMBER', value: SUMMARY_TYPE.MAXIMUM, label: _l('最大值') },
  { type: 'NUMBER', value: SUMMARY_TYPE.MINIMUM, label: _l('最小值') },
];

/**
 * 根据统计类型返回对应的界面文案。
 */
export function getSummaryNameByType(type) {
  const summary = SUMMARY_LIST.filter(item => item.value === type)[0];
  return summary ? summary.label : '';
}

/**
 * 根据控件数据类型返回可用统计方式及默认统计类型。
 */
export function getSummaryInfo(type, control) {
  if (type === 37 || type === 53) {
    type = control.enumDefault2;
  }

  if (type === 6 || type === 8 || type === 31 || type === 28 || (type === 38 && control && control.enumDefault === 1)) {
    return {
      list: SUMMARY_LIST.filter(item => item.type === 'COMMON')
        .concat(undefined)
        .concat(SUMMARY_LIST.filter(item => item.type === 'NUMBER')),
      default: 3,
    };
  } else {
    return {
      list: SUMMARY_LIST.filter(item => item.type === 'COMMON'),
      default: 1,
    };
  }
}

/**
 * 将普通记录列表转换为关联记录控件的选中值结构，并附带增删状态。
 * @param  {} controls
 * @param  {} records
 */
export function formatRecordToRelateRecord(
  controls,
  records = [],
  { addedIds = [], deletedIds = [], needFullUpdate, count = 0, isFromDefault } = {},
) {
  if (!_.isArray(records)) {
    records = [];
  }

  const titleControl = _.find(controls, control => control.attribute === 1);
  const value = records.map((record = {}) => {
    let name = titleControl ? record[titleControl.controlId] : '';

    if (titleControl && titleControl.type === 29 && name) {
      /**
       * 关联[使用他表字段作为标题的表]多层嵌套后，无法获得 souceControl 原始数据，这里异化为当关联表用他表字段作为标题时
       * 他表字段数据里的 name 不再返回字段原始数据，而是返回格式化后的文本
       */
      try {
        const cellData = JSON.parse(record[titleControl.controlId]);
        name = cellData[0].name;
      } catch (err) {
        console.error(err);
        name = '';
      }
    }

    return {
      name,
      sid: record.rowid,
      type: 8,
      sourcevalue: JSON.stringify(record),
      row: record,
      isNew: _.includes(addedIds, record.rowid) || isFromDefault,
      needFullUpdate,
      isFromDefault,
      deletedIds,
      count,
    };
  });
  return value;
}

function checkCellIsFilled(control, value) {
  if (control.type === 36) {
    return value === true || String(value) === '1';
  }

  return !checkCellIsEmpty(value);
}

// 浮点直接累加会积累误差，如 13607.55+13607.55+18143.4+13607.55-65769.82+6803.77 本应为 0，
// 实际得到 -3.637978807091713e-12。这里按最大小数位放大到整数域求和再还原，避免残差；
// 数量级超出安全整数或本身就是科学计数法时退回普通求和。
const sumNumbers = values => {
  const decimals = _.max(values.map(value => (String(value).split('.')[1] || '').length)) || 0;

  if (!decimals || _.some(values, value => /e/i.test(String(value)))) {
    return _.sum(values);
  }

  const multiple = Math.pow(10, decimals);
  const total = values.reduce((sum, value) => sum + Math.round(value * multiple), 0);

  return Number.isSafeInteger(total) ? total / multiple : _.sum(values);
};

const getNumberValues = (rows, control) =>
  rows.map(row => Number(row[control.controlId])).filter(value => _.isNumber(value) && !_.isNaN(value));

/**
 * 按统计类型计算记录字段的填写数、合计、平均值或极值。
 */
export const getSummaryResult = (rows, control, summaryType) => {
  let result;

  switch (summaryType) {
    case SUMMARY_TYPE.COMPLETED:
      result = rows.filter(row => checkCellIsFilled(control, row[control.controlId])).length;
      break;
    case SUMMARY_TYPE.INCOMPLETE:
      result = rows.filter(row => !checkCellIsFilled(control, row[control.controlId])).length;
      break;
    case SUMMARY_TYPE.SUM:
      result = sumNumbers(getNumberValues(rows, control));
      break;
    case SUMMARY_TYPE.AVERAGE:
      result = sumNumbers(getNumberValues(rows, control)) / rows.length;
      break;
    case SUMMARY_TYPE.MAXIMUM:
      result = _.max(
        rows.map(row => Number(row[control.controlId])).filter(value => _.isNumber(value) && !_.isNaN(value)),
      );
      break;
    case SUMMARY_TYPE.MINIMUM:
      result = _.min(
        rows.map(row => Number(row[control.controlId])).filter(value => _.isNumber(value) && !_.isNaN(value)),
      );
      break;
  }

  return result;
};

/**
 * 按控件类型生成适合复制到子表新行的字段值。
 */
function copySublistControlValue(control, value) {
  if (checkCellIsEmpty(value)) {
    return value;
  }

  switch (control.type) {
    case WIDGETS_TO_API_TYPE_ENUM.TEXT: // 文本
    case WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE: // 手机号码
    case WIDGETS_TO_API_TYPE_ENUM.TELEPHONE: // 座机号码
    case WIDGETS_TO_API_TYPE_ENUM.EMAIL: // 邮箱
    case WIDGETS_TO_API_TYPE_ENUM.NUMBER: // 数值
    case WIDGETS_TO_API_TYPE_ENUM.CRED: // 证件
    case WIDGETS_TO_API_TYPE_ENUM.MONEY: // 金额
    case WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU: // 单选
    case WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT: // 多选
    case WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN: // 单选
    case WIDGETS_TO_API_TYPE_ENUM.DATE: // 日期
    case WIDGETS_TO_API_TYPE_ENUM.DATE_TIME: // 日期
    case WIDGETS_TO_API_TYPE_ENUM.RELATION: // 自由连接
    case WIDGETS_TO_API_TYPE_ENUM.MONEY_CN: // 大写金额
    case WIDGETS_TO_API_TYPE_ENUM.USER_PICKER: // 成员
    case WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT: // 部门
    case WIDGETS_TO_API_TYPE_ENUM.SCORE: // 等级
    case WIDGETS_TO_API_TYPE_ENUM.FORMULA_NUMBER: // 公式
    case WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET: // 关联记录
    case WIDGETS_TO_API_TYPE_ENUM.SWITCH: // 检查框
    case WIDGETS_TO_API_TYPE_ENUM.RICH_TEXT: // 富文本
    case WIDGETS_TO_API_TYPE_ENUM.CASCADER: // 级联选择
    case WIDGETS_TO_API_TYPE_ENUM.LOCATION: // 定位
    case WIDGETS_TO_API_TYPE_ENUM.ATTACHMENT: // 附件
    case WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE: // 地区
    case WIDGETS_TO_API_TYPE_ENUM.AREA_CITY: // 地区
    case WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY: // 地区
    case WIDGETS_TO_API_TYPE_ENUM.SHEET_FIELD: // 他表字段
    case WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE: // 组织角色
    case WIDGETS_TO_API_TYPE_ENUM.TIME: // 时间
    case WIDGETS_TO_API_TYPE_ENUM.CONCATENATE: // 时间
    case WIDGETS_TO_API_TYPE_ENUM.SIGNATURE: // 签名
    case WIDGETS_TO_API_TYPE_ENUM.SEARCH: // API 查询
      return value;
    default:
      return;
  }
}

/**
 * 复制一行子表数据，并过滤不支持复制的控件值。
 */
export function copySublistRow(controls, row) {
  const newRow = {};
  controls.forEach(control => {
    newRow[control.controlId] = copySublistControlValue(control, row[control.controlId]);
  });
  return newRow;
}

/**
 * 将表单控件值整理为可暂存的记录数据对象。
 */
export function getRecordTempValue(data = [], relateRecordMultipleData = {}, { updateControlIds } = {}) {
  const results = {};
  data
    .filter(
      c =>
        (updateControlIds ? _.includes(updateControlIds, c.controlId) : !checkCellIsEmpty(c.value)) &&
        c.controlId.length === 24 &&
        !isRelateRecordTableControl(c),
    )
    .forEach(control => {
      if (control.type === WIDGETS_TO_API_TYPE_ENUM.SUB_LIST) {
        if (control.value && control.value.rows && filterEmptyChildTableRows(control.value.rows).length) {
          results[control.controlId] = filterEmptyChildTableRows(control.value.rows).map(r => {
            const newRow = _.pickBy(r, v => !checkCellIsEmpty(v));
            const relateRecordKeys = _.keys(_.pickBy(r, v => typeof v === 'string' && v.indexOf('sourcevalue') > -1));
            relateRecordKeys.forEach(key => {
              try {
                const parsed = JSON.parse([newRow[key]]);
                newRow[key] = JSON.stringify(
                  parsed.map(relateRecord => ({
                    ...relateRecord,
                    sourcevalue: JSON.stringify(
                      _.pickBy(
                        JSON.parse(relateRecord.sourcevalue),
                        v => !checkCellIsEmpty(v) && (typeof v !== 'string' || v.indexOf('sourcevalue') < 0),
                      ),
                    ),
                  })),
                );
              } catch (err) {
                console.error(err);
                delete newRow[key];
              }
            });
            return newRow;
          });
        }
      } else if (control.type === WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET) {
        try {
          if (get(control, 'value', '')[0] === '[') {
            results[control.controlId] = JSON.stringify(
              JSON.parse(control.value).map(r => ({
                type: r.type,
                sid: r.sid,
                name: getTitleTextFromRelateControl(control, r.name ? r : r.row || safeParse(r.sourcevalue)),
              })),
            );
          }
        } catch (err) {
          console.error(err);
        }
      } else if (
        control.type !== WIDGETS_TO_API_TYPE_ENUM.SUB_LIST &&
        _.includes(['string', 'number'], typeof control.value)
      ) {
        results[control.controlId] = control.value;
      }
    });
  Object.keys(relateRecordMultipleData).forEach(controlId => {
    const control = relateRecordMultipleData[controlId];

    if (control) {
      results[control.controlId] = control.value;
    }
  });
  return results;
}

/**
 * 将暂存记录数据还原为表单控件值及关联多选数据。
 */
export function parseRecordTempValue(data = {}, originFormData, defaultRelatedSheet = {}) {
  let formdata = [];
  let relateRecordData = {};

  try {
    formdata = originFormData.map(c => {
      if (c.type === WIDGETS_TO_API_TYPE_ENUM.SUB_LIST && data[c.controlId]) {
        return {
          ...c,
          value: JSON.stringify(data[c.controlId]),
        };
      } else if (c.sourceControlId === defaultRelatedSheet.relateSheetControlId) {
        try {
          return {
            ...c,
            value: JSON.stringify([defaultRelatedSheet.value]),
          };
        } catch (err) {
          console.error(err);
          return { ...c, value: data[c.controlId] };
        }
      } else {
        return { ...c, value: data[c.controlId] };
      }
    });
    originFormData.forEach(c => {
      if (c.type === WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET && c.enumDefault === 2 && data[c.controlId]) {
        relateRecordData[c.controlId] = {
          ...c,
          value: data[c.controlId],
        };
      }
    });
  } catch (err) {
    console.error(err);
  }

  return { formdata, relateRecordData };
}

/**
 * 根据控件值类型和排序方向整理记录行顺序。
 */
export function handleSortRows(rows, control, isAsc) {
  function getControlValueSortType(control) {
    const controlType = control.sourceControlType || control.type;

    if (controlType === 6 || controlType === 8 || controlType === 31 || controlType === 36) {
      return 'NUMBER';
    } else {
      return 'STRING';
    }
  }

  const controlValueType = getControlValueSortType(control);

  if (_.isUndefined(isAsc)) {
    return _.sortBy(rows, 'addTime');
  }

  let newRows = _.sortBy(rows, row =>
    controlValueType === 'NUMBER'
      ? parseFloat(row[control.controlId])
      : renderCellText({ ...control, value: row[control.controlId] }),
  );

  if (!isAsc) {
    newRows = newRows.reverse();
  }

  return newRows;
}

/**
 * 从记录选项字段中解析记录色与低透明度背景色。
 */
export function getRecordColor({ controlId, controls, colorItems, row }) {
  const colorControl = _.find(controls, { controlId });

  if (!colorControl || colorControl.enumDefault2 !== 1) {
    return;
  }

  if (!row[colorControl.controlId]) {
    return;
  }

  let activeKey = safeParse(row[colorControl.controlId])[0];

  if (activeKey && typeof activeKey === 'string' && activeKey.startsWith('other')) {
    activeKey = 'other';
  }

  const activeOption = colorControl.options.find(
    c => c.key === activeKey && (colorItems === '' || _.includes(colorItems, c.key)),
  );
  const lightColor = activeOption && activeOption.color && generate(activeOption.color)[5];
  return (
    activeOption &&
    activeOption.color && {
      color: activeOption.color,
      lightColor: isLightColor(activeOption.color)
        ? new TinyColor(lightColor).setAlpha(0.08).toRgbString()
        : new TinyColor(activeOption.color).setAlpha(0.08).toRgbString(),
    }
  );
}

/**
 * 从视图高级设置中提取记录颜色的字段与展示方式。
 */
export function getRecordColorConfig(view = {}) {
  const controlId = _.get(view, 'advancedSetting.colorid');
  const colorItems = _.get(view, 'advancedSetting.coloritems')
    ? safeParse(_.get(view, 'advancedSetting.coloritems'), 'array')
    : '';
  const colorType = _.get(view, 'advancedSetting.colortype');
  return (
    controlId && {
      controlId,
      colorItems,
      showLine: _.includes([RECORD_COLOR_SHOW_TYPE.LINE, RECORD_COLOR_SHOW_TYPE.LINE_BG], colorType),
      showBg: _.includes([RECORD_COLOR_SHOW_TYPE.BG, RECORD_COLOR_SHOW_TYPE.LINE_BG], colorType),
    }
  );
}

/**
 * 在可搜索控件的渲染文本中按关键字过滤记录行。
 */
export function filterRowsByKeywords({ rows = [], keywords = '', controls = [] }) {
  if (!keywords) {
    return rows;
  }

  const normalizedKeywords = String(keywords).toLocaleLowerCase();
  const searchableControls = controls.filter(control => control.controlId?.length === 24);

  return rows.filter(row => {
    for (const control of searchableControls) {
      const value = renderCellText({ ...control, value: row[control.controlId] ?? '' });

      if (
        String(value ?? '')
          .toLocaleLowerCase()
          .includes(normalizedKeywords)
      ) {
        return true;
      }
    }

    return false;
  });
}

/**
 * 将记录级规则样式转换为按行和控件定位的 CSS 片段。
 */
export function getRecordControlStyles(ruleControlAdvancedSettings) {
  return Object.keys(ruleControlAdvancedSettings).map(key => {
    const [rowId, controlId] = [key.slice(0, key.lastIndexOf('-')), key.slice(key.lastIndexOf('-') + 1)];
    const advancedSetting = ruleControlAdvancedSettings[key];
    const valueStyle = getValueStyle({
      type: 2,
      enumDefault: 1,
      advancedSetting,
      value: '_',
    }).valueStyle;
    return `
      .control-rule-${controlId}-${rowId} {
        > span:not(.editIcon), > a, .worksheetCellPureString, .titleText, &.titleText {
          ${valueStyle}
        }
      }
    `;
  });
}
