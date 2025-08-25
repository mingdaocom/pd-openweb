import { generate } from '@ant-design/colors';
import { TinyColor } from '@ctrl/tinycolor';
import _, { findLastIndex, get } from 'lodash';
import worksheetAjax from 'src/api/worksheet';
import { getSheetViewRows } from 'worksheet/common/TreeTableHelper';
import { RECORD_COLOR_SHOW_TYPE, VIEW_CONFIG_RECORD_CLICK_ACTION } from 'worksheet/constants/enum';
import { FORM_ERROR_TYPE_TEXT } from 'src/components/newCustomFields/tools/config';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget.js';
import { getAppFeaturesPath } from 'src/utils/app';
import { isLightColor, isRelateRecordTableControl } from 'src/utils/control';
import { renderText as renderCellText } from 'src/utils/control';
import { checkCellIsEmpty, formatAttachmentValue, getTitleTextFromRelateControl } from 'src/utils/control';

export function filterEmptyChildTableRows(rows = []) {
  try {
    return rows.filter(row => !(row.rowid || '').startsWith('empty'));
  } catch (err) {
    console.error(err);
    return [];
  }
}

export function getNewRecordPageUrl({ appId, worksheetId, viewId }) {
  return `${md.global.Config.WebUrl}app/${appId}/newrecord/${worksheetId}/${viewId}/`;
}

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

export const SUMMARY_TYPE = {
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
 * 获取统计方式名称
 */
export function getSummaryNameByType(type) {
  const summary = SUMMARY_LIST.filter(item => item.value === type)[0];
  return summary ? summary.label : '';
}

/**
 * 获取统计默认统计类型
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
 * 记录数据格式化为 关联表控件数据格式
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
      result = _.sum(
        rows.map(row => Number(row[control.controlId])).filter(value => _.isNumber(value) && !_.isNaN(value)),
      );
      break;
    case SUMMARY_TYPE.AVERAGE:
      result =
        _.sum(rows.map(row => Number(row[control.controlId])).filter(value => _.isNumber(value) && !_.isNaN(value))) /
        rows.length;
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

export function copySublistControlValue(control, value) {
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

export function copySublistRow(controls, row) {
  const newRow = {};
  controls.forEach(control => {
    newRow[control.controlId] = copySublistControlValue(control, row[control.controlId]);
  });
  return newRow;
}

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
  const lightColor = activeOption && activeOption.color && generate(activeOption.color)[0];
  return (
    activeOption &&
    activeOption.color && {
      color: activeOption.color,
      lightColor: isLightColor(activeOption.color) ? lightColor : new TinyColor(lightColor).setAlpha(0.8).toRgbString(),
    }
  );
}

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

export function filterRowsByKeywords({ rows, keywords = '', controls }) {
  if (!keywords) {
    return rows;
  }
  return rows.filter(
    row =>
      controls
        .filter(c => c.controlId.length === 24)
        .map(c => renderCellText({ ...c, value: row[c.controlId] || '' }))
        .join('')
        .toLocaleLowerCase()
        .indexOf(keywords.toLocaleLowerCase()) > -1,
  );
}

export const openLinkFromRecord = (linkControlId, record = {}) => {
  if (linkControlId) {
    const link = record[linkControlId];
    if (link && /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(link.replace(/\? /, ''))) {
      window.open(link);
    }
  }
};

export const handleRecordClick = (view, row, openRecord = () => {}) => {
  const clickType = _.get(view, 'advancedSetting.clicktype') || VIEW_CONFIG_RECORD_CLICK_ACTION.OPEN_RECORD;
  if (clickType === VIEW_CONFIG_RECORD_CLICK_ACTION.OPEN_RECORD) {
    openRecord();
  } else if (clickType === VIEW_CONFIG_RECORD_CLICK_ACTION.OPEN_LINK) {
    const linkControlId = _.get(view, 'advancedSetting.clickcid');
    openLinkFromRecord(linkControlId, row);
  }
};

export function handleRecordError(resultCode, control, isNewRecord = false) {
  if (resultCode === 11) {
    alert(_l('编辑失败，%0不允许重复', control ? control.controlName : ''), 2);
  } else if (resultCode === 31) {
    alert(_l('记录提交失败：有必填字段未填写'), 2);
  } else if (resultCode === 22) {
    alert(_l('记录提交失败：子表字段存在重复数据'), 2);
  } else if (resultCode === 72) {
    alert(_l('记录已锁定，无法保存'), 3);
  } else if (resultCode === 4) {
    alert(_l('编辑失败，记录已被删除'), 2);
  } else {
    alert(isNewRecord ? _l('提交失败！') : _l('编辑失败！'), 2);
  }
}

export function getSubListUniqueError({ store, control, badData = [] } = {}) {
  if (badData[0]) {
    const [childTableControlId, controlId, value] = badData[0].split(':');
    const state = store.getState();
    let rows = state.rows;
    if (get(state, 'base.isTreeTableView')) {
      rows = getSheetViewRows(
        { rows: _.filter(rows, r => !/^empty-/.test(r.rowid)) },
        { treeMap: get(state, 'treeTableViewData.treeMap', {}) },
      );
    }
    const badRowIds = filterEmptyChildTableRows(rows)
      .filter(r =>
        value.indexOf('-') > -1 ? (r[controlId] || '').indexOf(value) > -1 : (r[controlId] || '') === value,
      )
      .map(r => r.rowid);
    const lastRowBaIndex = findLastIndex(filterEmptyChildTableRows(rows), r =>
      value.indexOf('-') > -1 ? (r[controlId] || '').indexOf(value) > -1 : (r[controlId] || '') === value,
    );
    if (!badRowIds.length) return {};
    const controlName = _.find(control.relationControls, c => c.controlId === controlId).controlName;
    alert(
      _l('记录提交失败：%0中第%1行记录的%2与已有记录重复', control.controlName, lastRowBaIndex + 1, controlName),
      2,
    );
    return {
      controlId: childTableControlId,
      error: badRowIds
        .map(rowId => ({
          [`${rowId}-${controlId}`]: FORM_ERROR_TYPE_TEXT.UNIQUE(),
        }))
        .reduce((a, b) => ({ ...a, ...b })),
    };
  }
}

export async function getRecordLandUrl({ appId, worksheetId, viewId, recordId }) {
  if (md.global.Account.isPortal) {
    appId = md.global.Account.appId;
  }
  if (!appId) {
    const res = await worksheetAjax.getWorksheetInfo({ worksheetId });
    appId = res.appId;
  }
  const appFeaturesPath = getAppFeaturesPath();
  if (viewId) {
    return `${location.origin}${window.subPath || ''}/app/${appId}/${worksheetId}/${viewId}/row/${recordId}${
      appFeaturesPath ? '?' + appFeaturesPath : ''
    }`;
  } else {
    return `${location.origin}${window.subPath || ''}/app/${appId}/${worksheetId}/row/${recordId}${
      appFeaturesPath ? '?' + appFeaturesPath : ''
    }`;
  }
}

export async function fillRowRelationRows(control, rowId, worksheetId, isRecreate = false) {
  const SYSTEM_FIELD_IDS = [
    'rowid',
    'ownerid',
    'caid',
    'ctime',
    'utime',
    'uaid',
    'wfname',
    'wfcuaids',
    'wfcaid',
    'wfctime',
    'wfrtime',
    'wfftime',
    'wfstatus',
  ];
  let defSource = '';
  let filledControl = _.cloneDeep(control);
  const addPrefixForRowIdOfRows = (rows = [], prefix = '') => {
    const rowIds = rows.map(row => row.rowid);
    return rows.map(row => {
      const newRow = { ...row };
      rowIds.forEach(rowId => {
        Object.keys(newRow).forEach(key => {
          if (_.includes(newRow[key], rowId)) {
            newRow[key] = newRow[key].replace(rowId, prefix + rowId);
          }
        });
      });
      return newRow;
    });
  };

  await worksheetAjax
    .getRowRelationRows({
      controlId: control.controlId,
      rowId,
      worksheetId,
      pageIndex: 1,
      pageSize: 200,
      getWorksheet: true,
    })
    .then(res => {
      if (res.resultCode === 1) {
        const subControls = ((res.template || {}).controls || []).filter(
          c => !_.includes(SYSTEM_FIELD_IDS, c.controlId),
        );
        const staticValue = addPrefixForRowIdOfRows(res.data || [], 'temp-').map(item => {
          let itemValue = {
            rowid: item.rowid,
            pid: item.pid,
            childrenids: item.childrenids,
          };

          subControls.forEach(c => {
            if (isRecreate && c.type === 29 && c.enumDefault === 1 && c.dataSource === worksheetId) {
              itemValue[c.controlId] = undefined;
              return;
            }
            if (isRecreate && c.type === 29 && c.advancedSetting.showtype === '3') {
              let value = safeParse(item[c.controlId], 'array').slice(0, 5);
              itemValue[c.controlId] = JSON.stringify(value);
              return;
            }
            itemValue[c.controlId] =
              c.type === WIDGETS_TO_API_TYPE_ENUM.ATTACHMENT
                ? formatAttachmentValue(item[c.controlId], isRecreate, true)
                : item[c.controlId];
          });
          return itemValue;
        });
        defSource = [{ cid: '', rcid: '', isAsync: false, staticValue: JSON.stringify(staticValue) }];
      }
      filledControl.defsource = JSON.stringify(defSource);
      filledControl.advancedSetting = {
        ...control.advancedSetting,
        defsource: JSON.stringify(defSource),
      };
    });
  return filledControl;
}

export async function handleRowData(props) {
  const { rowId, worksheetId, columns } = props;
  const RE_CREATE_ERROR = {
    4: _l('记录不存在，请刷新视图'),
  };

  const data = await worksheetAjax.getRowDetail({
    checkView: true,
    getType: 1,
    rowId: rowId,
    worksheetId: worksheetId,
  });

  if (data.resultCode === 1) {
    let defaultData = JSON.parse(data.rowData || '{}');

    let subTablePromise = [];
    let defcontrols = _.cloneDeep(columns);
    _.forIn(defaultData, (value, key) => {
      let control = columns.find(l => l.controlId === key);
      if (!control) return;
      else if ([38, 32, 33].includes(control.type) || (control.fieldPermission || '111').split('')[2] === '0') {
        defaultData[key] = null;
      } else if (control.type === 14) {
        defaultData[key] = formatAttachmentValue(value, true);
      } else if (control.type === 34) {
        subTablePromise.push(fillRowRelationRows(control, rowId, worksheetId, true));
      } else if (control.type === 29) {
        defaultData[key] = !['2', '5', '6'].includes(control.advancedSetting.showtype)
          ? JSON.stringify(JSON.parse(value || '[]').slice(0, 5))
          : 0;
      } else if (control.type === 37 && control.dataSource) {
        const sourceId = control.dataSource.substring(1, control.dataSource.length - 1);
        const sourceControl = columns.find(l => l.controlId === sourceId);
        defaultData[key] =
          _.get(sourceControl, 'type') === 29 &&
          ['2', '5', '6'].includes(_.get(sourceControl, 'advancedSetting.showtype'))
            ? undefined
            : value;
      } else {
        defaultData[key] = value;
      }
    });

    const res = await Promise.all(subTablePromise);
    res.forEach(item => {
      const index = _.findIndex(defcontrols, o => {
        return o.controlId == item.controlId;
      });
      ((defaultData[item.controlId] = undefined), index > -1 && (defcontrols[index] = item));
    });

    return { defaultData, defcontrols };
  } else {
    RE_CREATE_ERROR[data.resultCode] && alert(RE_CREATE_ERROR[data.resultCode], 2);
  }
}
