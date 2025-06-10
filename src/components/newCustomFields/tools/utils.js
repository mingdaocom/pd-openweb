import _, { find, get, isEmpty } from 'lodash';
import { RELATE_RECORD_SHOW_TYPE } from 'worksheet/constants/enum';
import { getStrBytesLength } from 'src/pages/Role/PortalCon/tabCon/util-pure.js';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget';
import { isCustomWidget, isOldSheetList, isTabSheetList, supportDisplayRow } from 'src/pages/widgetConfig/util';
import { browserIsMobile } from 'src/utils/common';
import { getStringBytes } from 'src/utils/common';
import {
  controlState,
  getTitleTextFromControls,
  getTitleTextFromRelateControl,
  getValueStyle,
} from 'src/utils/control';
import { filterEmptyChildTableRows, getNewRecordPageUrl, getRelateRecordCountFromValue } from 'src/utils/record';
import { FORM_ERROR_TYPE, FORM_ERROR_TYPE_TEXT, FROM, WIDGET_VALUE_ID } from './config';

export function validate(id = '') {
  return /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(id.toLowerCase());
}

export const convertControl = type => {
  switch (type) {
    case 2:
      return 'TEXTAREA'; // 多行文本框

    case 3:
      return 'MOBILE_PHONE'; // 手机

    case 4:
      return 'TEL_PHONE'; // 座机

    case 5:
      return 'EMAIL'; // 邮箱

    case 6:
    case 8:
      return 'NUMBER'; // 数值、金额

    case 7:
      return 'ID'; // 证件

    case 9:
      return 'RADIO'; // 单选

    case 10:
      return 'CHECKBOX'; // 多选

    case 11:
    case 44:
      return 'DROP_DOWN'; // 下拉框

    case 14:
      return 'ATTACHMENT'; // 附件

    case 15:
    case 16:
      return 'DATE'; // 日期、日期时间

    case 17:
    case 18:
      return 'DATE_RANGE'; // 日期段、日期时间段

    case 19:
    case 23:
    case 24:
      return 'AREA'; // 地区

    case 21:
      return 'RELATION'; // 关联

    case 22:
      return 'SplitLine'; // 分割线

    case 25:
    case 31:
    case 32:
    case 33:
      return 'READONLY'; // 只读

    case 26:
      return 'USER_SELECT'; // 人员选择

    case 27:
      return 'DEPARTMENT_SELECT'; // 部门选择

    case 28:
      return 'RANGE'; // 等级

    case 29:
      return 'RELATE_RECORD'; // 关联他表

    case 30:
      return 'SHEET_FIELD'; // 他表字段

    case 34:
      return 'SUBLIST'; // 子表

    case 35:
      return 'Cascader'; // 多级下拉

    case 36:
      return 'CHECK'; // 检查框

    case 37:
      return 'SUBTOTAL'; // 汇总

    case 38:
      return 'DATECALC'; // 日期计算

    case 40:
      return 'LOCATION'; // 定位

    case 41:
    case 10010:
      return 'RICH_TEXT'; // 富文本

    case 42:
      return 'SIGNATURE'; // 签名

    case 43:
      return 'OCR'; // 文字识别

    case 45:
      return 'Embed'; // 嵌入

    case 46:
      return 'Time'; // 时间

    case 47:
      return 'BarCode'; // 嵌入

    case 48:
      return 'OrgRole'; // 组织角色

    case 49:
      return 'Search'; // api查询--按钮

    case 50:
      return 'Search'; // api查询--下拉框

    case 51:
      return 'RelationSearch'; // 查询记录

    case 52:
      return 'Section'; // 分段

    case 53:
      return 'FormulaFunc'; // 函数公式

    default:
      return 'CustomWidgets'; // 自定义组件
  }
};

function formatRowToServer(row, controls = [], { isDraft, isSubList } = {}) {
  controls = controls.filter(c => c.type !== 34);
  return Object.keys(row)
    .map(key => {
      const c = _.find(controls, c => c.controlId === key);
      if (key === 'rowid') {
        return {
          controlId: 'tempRowId',
          value: row.rowid,
        };
      } else if (!c || c.type === 47) {
        return undefined;
      } else {
        return _.pick(
          formatControlToServer(
            { ...c, value: row[key] },
            {
              isSubList,
              isSubListCopy: row.isCopy,
              isDraft,
              isNewRecord: row.rowid && (row.rowid.startsWith('temp') || row.rowid.startsWith('default')),
            },
          ),
          ['controlId', 'value', 'editType'],
        );
      }
    })
    .filter(c => c && c.controlId && !_.isUndefined(c.value));
}

/**
 * 将控件数据格式化成后端需要的数据
 * @param  {} control 控件
 */
export function formatControlToServer(
  control,
  {
    isSubListCopy,
    isDraft,
    isSubList,
    isNewRecord,
    needSourceValue,
    needFullUpdate,
    hasDefaultRelateRecordTableControls = [],
  } = {},
) {
  let result = {
    controlId: control.controlId,
    type: control.type,
    value: control.value,
    controlName: control.controlName,
    dot: control.dot,
  };
  if (_.isUndefined(control.value) && !control.store) {
    return result;
  }
  let parsedValue, childTableControls, isFromDefault, state, rows;
  const isRelateRecordDropdown =
    control.type === 29 &&
    String(_.get(control, 'advancedSetting.showtype')) === String(RELATE_RECORD_SHOW_TYPE.DROPDOWN);
  const isSingleRelateRecord = control.type === 29 && control.enumDefault === 1;
  switch (control.type) {
    case 10:
    case 11:
      let options = JSON.parse(result.value || '[]');

      options.forEach((item, i) => {
        if ((item || '').indexOf('add_') > -1) {
          options[i] = JSON.stringify({
            color: '#2196f3',
            value: item.split('add_')[1],
          });
        }
      });

      result.value = JSON.stringify(options);
      break;
    case 14: // 附件
      let parsed = safeParse(control.value);
      let oldAttachments = [];
      let oldKnowledgeAtts = [];

      if ((isSubListCopy || isDraft) && _.isArray(parsed) && !_.isEmpty(parsed)) {
        result.value = JSON.stringify(parsed.map(a => a.fileID || a.fileId));
        break;
      }

      (parsed.attachmentData || []).forEach(item => {
        item = Object.assign({}, item, { fileExt: item.ext }, { isEdit: true });
        if (item.fileId && !item.fileID) {
          item.fileID = item.fileId;
        }
        if (item.refType || item.refId) {
          oldKnowledgeAtts.push(item);
        } else {
          oldAttachments.push(item);
        }
      });

      result.value = JSON.stringify({
        attachmentData: [],
        attachments: (parsed.attachments || [])
          .map(item => Object.assign({}, item, { isEdit: false }))
          .concat(oldAttachments),
        knowledgeAtts: (parsed.knowledgeAtts || [])
          .map(item => Object.assign({}, item, { isEdit: false }))
          .concat(oldKnowledgeAtts),
      });
      break;
    case 19:
    case 23:
    case 24:
      try {
        parsedValue = JSON.parse(control.value);
        result.value = parsedValue.code;
      } catch (err) {}
      break;
    case 29:
      if (control.editType) {
        result.editType = control.editType;
      }
      if (
        _.includes(
          [
            String(RELATE_RECORD_SHOW_TYPE.LIST),
            String(RELATE_RECORD_SHOW_TYPE.TAB_TABLE),
            String(RELATE_RECORD_SHOW_TYPE.TABLE),
          ],
          control.advancedSetting.showtype,
        ) &&
        control.store
      ) {
        state = control.store.getState();
        if (isDraft && control.advancedSetting.showtype === String(RELATE_RECORD_SHOW_TYPE.TABLE)) {
          result.value = JSON.stringify(
            state.records
              .map(record => ({ sid: record.rowid }))
              .concat(state.changes.addedRecordIds.map(id => ({ sid: id }))),
          );
        } else if (isNewRecord || _.includes(hasDefaultRelateRecordTableControls, control.controlId)) {
          result.value = JSON.stringify(state.records.map(record => ({ sid: record.rowid })));
        } else if (
          get(state, 'changes.isDeleteAll') &&
          control.advancedSetting.showtype === String(RELATE_RECORD_SHOW_TYPE.TABLE)
        ) {
          result.editType = 0;
          result.value = JSON.stringify(state.changes.addedRecordIds.map(id => ({ sid: id })));
        } else if (
          !isEmpty(state.changes) &&
          control.advancedSetting.showtype === String(RELATE_RECORD_SHOW_TYPE.TABLE)
        ) {
          result.editType = 9;
          result.value = JSON.stringify(
            state.changes.addedRecordIds
              .map(id => ({ editType: 1, rowid: id }))
              .concat(state.changes.deletedRecordIds.map(id => ({ editType: 2, rowid: id }))),
          );
        } else {
          result.value = undefined;
        }
      } else {
        parsedValue = safeParse(control.value);
        isFromDefault = !!_.find(parsedValue, { isFromDefault: true });
        if (_.isArray(parsedValue)) {
          if (
            isDraft ||
            isNewRecord ||
            needFullUpdate ||
            (browserIsMobile() && _.includes(hasDefaultRelateRecordTableControls, control.controlId)) ||
            isRelateRecordDropdown ||
            isSingleRelateRecord ||
            isFromDefault ||
            control.editType === 31 ||
            _.get(parsedValue, '0.needFullUpdate')
          ) {
            result.value = _.isArray(parsedValue)
              ? JSON.stringify(
                  parsedValue
                    .map(item => ({
                      name: item.name,
                      sid: item.sid,
                      sourcevalue: needSourceValue && item.sourcevalue,
                    }))
                    .filter(
                      item =>
                        !_.isEmpty(item.sid) &&
                        (isSubList ? validate(_.replace(item.sid, /^(temp|default)-/, '')) : validate(item.sid)),
                    ),
                )
              : '';
          } else {
            result.editType = 9;
            const addedIds = parsedValue.filter(r => r.isNew).map(r => r.sid);
            const deletedIds = (_.get(parsedValue, '0.deletedIds') || []).filter(
              id => !_.find(parsedValue, r => r.sid === id),
            );
            result.value = JSON.stringify(
              addedIds
                .map(id => ({ editType: 1, rowid: id }))
                .concat(deletedIds.map(id => ({ editType: 2, rowid: id }))),
            );
          }
        } else if (
          typeof control.value === 'string' &&
          control.value.startsWith('deleteRowIds') &&
          control.value !== 'deleteRowIds: all'
        ) {
          let deletedIds = [];
          try {
            deletedIds = control.value.replace('deleteRowIds: ', '').split(',').filter(_.identity);
          } catch (err) {
            result.value = undefined;
          }
          result.editType = 9;
          result.value = JSON.stringify(deletedIds.map(id => ({ editType: 2, rowid: id })));
        } else {
          result.value = undefined;
        }
      }
      break;
    case 34: // 子表
      state = control.store.getState();
      childTableControls = get(state, 'base.controls') || [];
      if (_.isEmpty(childTableControls)) {
        console.log('childTableControls is empty');
      }
      childTableControls = childTableControls
        .filter(c => !_.includes(_.get(window, 'shareState.isPublicForm') ? [48] : [], c.type))
        .filter(v => (isDraft ? v.controlId !== 'ownerid' : true));

      if (
        (!result.value || (_.isNumber(Number(result.value)) && !_.isNaN(Number(result.value)))) &&
        (!_.isEmpty(filterEmptyChildTableRows(control.store.getState().rows)) ||
          get(control.store.getState(), 'changes.isDeleteAll'))
      ) {
        result.editType = 9;
        if (isNewRecord) {
          result.value = JSON.stringify(
            filterEmptyChildTableRows(control.store.getState().rows).map(row =>
              formatRowToServer(row, childTableControls || [], { isDraft, isSubList: true }),
            ),
          );
        } else {
          rows = filterEmptyChildTableRows(control.store.getState().rows).map(row => ({
            editType: 0,
            newOldControl: formatRowToServer(row, childTableControls || [], { isDraft, isSubList: true }),
          }));
          if (!_.isEmpty(rows)) {
            result.value = JSON.stringify([
              {
                rowid: 'all',
                editType: 2,
              },
              ...rows,
            ]);
          } else if (get(control.store.getState(), 'changes.isDeleteAll')) {
            result.value = JSON.stringify([
              {
                rowid: 'all',
                editType: 2,
              },
            ]);
          } else {
            result.value = '';
          }
        }
      } else if (_.isUndefined(control.value)) {
        return result;
      } else if (result.value.isAdd) {
        result.value = JSON.stringify(
          filterEmptyChildTableRows(control.store.getState().rows).map(row =>
            formatRowToServer(row, childTableControls || [], { isDraft, isSubList: true }),
          ),
        );
        if (result.value === '[]') {
          result.value = '';
        }
      } else {
        result.editType = 9;
        let resultvalue = [];
        if (!_.isEmpty(result.value.deleted)) {
          resultvalue = resultvalue.concat(
            result.value.deleted.map(rowid => ({
              rowid,
              editType: 2,
            })),
          );
        }
        if (!_.isEmpty(result.value.updated)) {
          resultvalue = resultvalue.concat(
            result.value.updated
              .map(rowid => {
                const isNew = /^(temp|default)/.test(rowid);
                let row = _.find(control.store.getState().rows, r => r.rowid === rowid);
                if (!row) {
                  return undefined;
                }
                if (isNew) {
                  return {
                    editType: 0,
                    newOldControl: formatRowToServer({ ...row, rowid }, childTableControls, { isSubList: true }),
                  };
                } else {
                  if (row && row.updatedControlIds) {
                    row = _.pick(row, row.updatedControlIds);
                    delete row.updatedControlIds;
                  }
                  return {
                    rowid,
                    editType: 0,
                    newOldControl: formatRowToServer({ ...row, rowid }, childTableControls, { isSubList: true }),
                  };
                }
              })
              .filter(_.identity),
          );
        }
        if (get(control.store.getState(), 'changes.isDeleteAll')) {
          resultvalue = resultvalue.concat({
            rowid: 'all',
            editType: 2,
          });
        }
        result.value = JSON.stringify(filterEmptyChildTableRows(resultvalue));
        if (control.store && control.store.dispatch) {
          control.store.dispatch({
            type: 'RESET_CHANGES',
          });
        }
        if (_.isEmpty(resultvalue) && control && typeof control.value === 'string') {
          try {
            const rows = JSON.parse(control.value);
            result.value = JSON.stringify(
              filterEmptyChildTableRows(rows).map(row =>
                Object.keys(row).map(key => ({ controlId: key, value: row[key] })),
              ),
            );
          } catch (err) {}
        }
      }
      break;
  }

  return result;
}

export function getTitleControlId(control = {}) {
  let newTitleControlId;
  if (control.type === 29) {
    newTitleControlId = control.advancedSetting.showtitleid;
  } else if (control.type === 51 && control.enumDefault !== 1) {
    newTitleControlId = control.advancedSetting.showtitleid;
  } else if (control.type === 51 && control.enumDefault === 1 && control.showControls[0]) {
    newTitleControlId = control.showControls[0];
  }
  const attributeTitle = find(control.relationControls, { attribute: 1 });
  const matchedTitleControl = find(control.relationControls, { controlId: newTitleControlId });
  return matchedTitleControl ? matchedTitleControl.controlId : attributeTitle ? attributeTitle.controlId : undefined;
}

export function getTitleControlIdFromRelateControl(control = {}) {
  let newTitleControlId = get(control, 'advancedSetting.showtitleid');
  const attributeTitle = find(control.relationControls, { attribute: 1 });
  const matchedTitleControl = find(control.relationControls, { controlId: newTitleControlId });
  return matchedTitleControl ? matchedTitleControl.controlId : attributeTitle ? attributeTitle.controlId : undefined;
}

const getCodeUrl = ({ appId, worksheetId, viewId, recordId }) => {
  if (recordId) {
    let baseUrl = `${location.origin}${window.subPath || ''}/app/${appId}/${worksheetId}`;
    if (viewId) {
      baseUrl += `/${viewId}`;
    }
    baseUrl += `/row/${recordId}`;
    return baseUrl;
  } else {
    return getNewRecordPageUrl({ appId, worksheetId, viewId });
  }
};

export const getBarCodeValue = ({ data, control, codeInfo }) => {
  const { enumDefault, enumDefault2, dataSource } = control;
  if ((enumDefault === 1 || (enumDefault === 2 && enumDefault2 === 3)) && !dataSource) return '';
  if (dataSource === 'rowid') return codeInfo.recordId;
  if (enumDefault === 2) {
    // 记录内部访问链接
    if (enumDefault2 === 1) {
      return getCodeUrl(codeInfo);
    }
  }
  const selectControl = _.find(data, i => i.controlId === dataSource);
  if (!(selectControl || {}).value) return '';
  if (enumDefault === 1) {
    const repVal = String(selectControl.value).replace(/[^a-zA-Z0-9@#$%&-=_;:,<>?!\/\^\*\(\)\+\[\]\{\}\|\.\s]/g, '');
    return getStringBytes(repVal) <= 128 ? repVal : getStrBytesLength(repVal, 128);
  }
  return String(selectControl.value).substr(0, 300);
};

// 是否需要校验短信验证码
export const checkMobileVerify = (data, smsVerificationFiled) => {
  if (!smsVerificationFiled) return false;
  const selectControl = _.find(data, i => i.controlId === smsVerificationFiled);
  if (!selectControl) return false;
  // 手机号是否是电话 | 手机号只读 ｜ 手机号隐藏
  if (selectControl.type !== 3) return false;
  if (!controlState(selectControl, FROM.PUBLIC_ADD).visible) return false;
  if (!selectControl.value) return false;
  return true;
};

// 选项其他类型处理
export const getCheckAndOther = value => {
  let checkIds = [];
  let otherValue = '';

  if (/^\[.*\]$/.test(value)) {
    safeParse(value, 'array').forEach(item => {
      if ((item || '').toString().indexOf('other:') > -1) {
        otherValue = _.replace(item, 'other:', '');
        checkIds.push('other');
      } else {
        checkIds.push(item);
      }
    });
  }

  return { checkIds, otherValue };
};

// 渲染计数
export const renderCount = item => {
  const { type, enumDefault, value, advancedSetting } = item;
  let count;

  // 人员多选、部门多选、多条卡片
  if (
    (_.includes([26, 27], type) && enumDefault === 1) ||
    (type === 29 && enumDefault === 2 && _.includes(['1', '2'], advancedSetting.showtype))
  ) {
    const recordsCount = getRelateRecordCountFromValue(value, item.count);
    count = _.isUndefined(recordsCount) ? item.count : recordsCount;
  }

  if (type === 29 && advancedSetting.showtype === String(RELATE_RECORD_SHOW_TYPE.TABLE)) {
    const state = item.store.getState();
    count =
      state.loading && /^\d+$/.test(item.value)
        ? item.value
        : typeof state.tableState.countForShow !== 'undefined'
          ? state.tableState.countForShow
          : state.tableState.count;
  }

  // 附件
  if (type === 14) {
    const files = JSON.parse(value || '[]');

    if (_.isArray(files)) {
      count = files.length;
    } else {
      count = files.attachments.length + files.knowledgeAtts.length + files.attachmentData.length;
    }
  }

  // 子表
  if (type === 34) {
    try {
      if (typeof value === 'object') {
        count = value.num || filterEmptyChildTableRows(value.rows || []).length;
      } else if (!_.isNaN(parseInt(item.value, 10))) {
        count = parseInt(item.value, 10);
      } else if (item.store) {
        try {
          count = filterEmptyChildTableRows(item.store.getState().rows).length;
        } catch (err) {}
      }
      if (count > 1000) {
        count = 1000;
      }
    } catch (err) {
      console.log(err);
    }
  }

  return count && count !== '0' ? `(${count})` : null;
};

//控件切换成size情况，兼容老数据
export const halfSwitchSize = (item, from) => {
  const half =
    item.half ||
    (item.type === 28 && item.enumDefault === 1) ||
    (item.type === 29 &&
      item.enumDefault === 1 &&
      parseInt(item.advancedSetting.showtype, 10) === 3 &&
      from !== FROM.H5_ADD &&
      from !== FROM.PUBLIC_ADD);

  return half ? 6 : 12;
};

// 人员控件选择范围处理
export const dealUserRange = (control = {}, data = [], masterData = {}) => {
  if (!JSON.parse(_.get(control, 'advancedSetting.chooserange') || '[]').length) return false;

  let ranges = {};

  function getArrKey(item) {
    let curKey = '';
    const range_types = {
      appointedAccountIds: [1, 26], // 用户
      appointedDepartmentIds: [2, 27], // 部门
      appointedOrganizeIds: [3, 48], // 组织
    };
    Object.keys(range_types).forEach(k => {
      if (_.includes(range_types[k], item.type)) {
        curKey = k;
      }
    });
    return curKey;
  }

  JSON.parse(_.get(control, 'advancedSetting.chooserange') || '[]').map(item => {
    if (item.type === 4) {
      if (item.rcid && item.rcid !== masterData.worksheetId) {
        const parentControl = _.find(data, i => i.controlId === item.rcid) || {};
        const control = safeParse(parentControl.value || '[]', 'array')[0];
        const sourcevalue = control && JSON.parse(control.sourcevalue)[item.cid];
        const curItem = _.find(parentControl.relationControls || [], re => re.controlId === item.cid);
        const sourceVal = sourcevalue && safeParse(sourcevalue);
        if (curItem && _.isArray(sourceVal)) {
          const currentItem = {
            ...curItem,
            type: curItem.type === 30 ? curItem.sourceControlType : curItem.type,
          };
          const arrKey = getArrKey(currentItem);
          ranges[arrKey] = _.uniq(
            (ranges[arrKey] || []).concat(sourceVal.map(s => s[WIDGET_VALUE_ID[currentItem.type]])),
          );
        }
      } else {
        const cidItem =
          _.find(data || [], d => d.controlId === item.cid) ||
          _.find(masterData.formData || [], d => d.controlId === item.cid);
        if (cidItem) {
          const currentItem = { ...cidItem, type: cidItem.type === 30 ? cidItem.sourceControlType : cidItem.type };
          const arrKey = getArrKey(currentItem);
          ranges[arrKey] = _.uniq(
            (ranges[arrKey] || []).concat(
              JSON.parse(currentItem.value || '[]').map(i => i[WIDGET_VALUE_ID[currentItem.type]]),
            ),
          );
        }
      }
    } else {
      const arrKey = getArrKey(item);
      const userInfo = safeParse(item.staticValue || '{}');
      const chooseId = item.type === 1 ? 26 : item.type === 2 ? 27 : 48;
      const chooseValue = _.get(userInfo, [WIDGET_VALUE_ID[chooseId]]);
      if (chooseValue) {
        ranges[arrKey] = _.uniq((ranges[arrKey] || []).concat(chooseValue));
      }
    }
  });
  return ranges;
};

// 加载第三方集成 SDK
export function loadSDK() {
  const { IsLocal } = md.global.Config;
  const isWx = window.isWeiXin && !IsLocal && !window.isWxWork;

  if (window.isDingTalk && !window.dd) {
    $.getScript('https://g.alicdn.com/dingding/dingtalk-jsapi/2.6.41/dingtalk.open.js');
  }
  if (window.isWeLink && !window.HWH5) {
    $.getScript('https://open-doc.welink.huaweicloud.com/docs/jsapi/2.0.4/hwh5-cloudonline.js');
  }
  if (isWx && !window.wx) {
    $.getScript('https://res2.wx.qq.com/open/js/jweixin-1.6.0.js');
  }
  if (window.isWxWork && !window.wx) {
    $.getScript('https://res.wx.qq.com/open/js/jweixin-1.2.0.js');
  }
  if (window.isFeiShu && !window.h5sdk) {
    $.getScript('https://lf1-cdn-tos.bytegoofy.com/goofy/lark/op/h5-js-sdk-1.5.19.js');
  }
}

export const getControlsByTab = (controls = [], widgetStyle = {}, from, ignoreSection = false, otherTabs = []) => {
  // 基础控件
  let commonData = [];
  // 特殊控件
  let tabData = [];
  // 老的关联列表
  let oldRelateList = [];
  const tabPosition = widgetStyle.tabposition || '1';
  const isMobile = browserIsMobile();

  function sortList(list = []) {
    return list.sort((a, b) => {
      if (a.row === b.row) {
        return a.col - b.col;
      }
      return a.row - b.row;
    });
  }

  if (ignoreSection) {
    return { commonData: sortList(controls), tabData: [] };
  }

  controls
    .filter(c => !_.includes(ALL_SYS, c.controlId))
    .forEach(item => {
      if (item.type === 52) {
        item.child = sortList(controls.filter(i => i.sectionId === item.controlId));
        tabData.push(item);
      } else if (isTabSheetList(item)) {
        tabData.push(item);
      } else if (isOldSheetList(item)) {
        oldRelateList.push(item);
      } else if (!item.sectionId) {
        commonData.push(item);
      }
    });

  commonData = sortList(commonData);
  tabData = sortList(tabData).concat(sortList(oldRelateList));

  // h5或者配置在顶部的
  if (isMobile || (isMobile && !_.isEmpty(otherTabs)) || (_.includes(['2', '3', '4'], tabPosition) && !ignoreSection)) {
    const defaultTab = [
      {
        controlId: 'detail',
        controlName: widgetStyle.deftabname || _l('详情'),
        type: 52,
        sectionId: '',
        child: commonData,
        advancedSetting: { icon: widgetStyle.tabicon },
      },
    ];
    const allCommonHide = _.every(commonData, c => !(controlState(c, from).visible && !c.hidden));
    tabData = allCommonHide
      ? isMobile && !_.isEmpty(otherTabs)
        ? defaultTab.concat(tabData)
        : tabData
      : defaultTab.concat(tabData);
    commonData = [];
  }

  tabData = tabData.filter(v => (v.type == 52 ? v.child.length : true));

  if (isMobile) {
    // 将关联列表表格、标签页表格转换为卡片形式
    const updateMobileControls = (control = {}) => {
      if (_.includes([29, 51], control.type)) {
        const showType = _.get(control, 'advancedSetting.showtype');
        return {
          ...control,
          advancedSetting: {
            ...control.advancedSetting,
            showtype: control.type === 51 && showType === '5' ? '1' : _.includes(['5', '6'], showType) ? '2' : showType,
            icon: control.type === 29 && _.includes(['2', '6'], showType) ? 'link_record' : 'Worksheet_query',
          },
          sourceControlType: _.includes(['5', '6'], showType) ? 2 : control.sourceControlType,
        };
      }
      return control;
    };
    tabData = tabData.map(item => {
      return {
        ...updateMobileControls(item),
        child: (item.child || []).map(v => updateMobileControls(v)),
      };
    });
    commonData = commonData.map(v => updateMobileControls(v));
    if (_.isEmpty(commonData) && _.isEmpty(otherTabs) && tabData.length === 1) {
      commonData = tabData[0].child;
      tabData = [];
    }
  }

  return { commonData, tabData };
};

// 部门控件渲染数据处理，后期可能有组织角色
export const dealRenderValue = (value, advancedSetting = {}) => {
  const { showdelete, allpath } = advancedSetting;
  const tempValue = _.isArray(value) ? value : safeParse(value || '[]');
  let deleteCount = 0;
  const result = [];

  tempValue.map(item => {
    if (item.isDelete) {
      deleteCount += 1;
    } else {
      const pathValue = (
        allpath === '1' ? (item.departmentPath || []).sort((a, b) => b.depth - a.depth).map(i => i.departmentName) : []
      ).concat([item.departmentName]);

      result.push({
        ...item,
        departmentName: pathValue.join('  /  '),
      });
    }
  });

  if (showdelete === '1' && !!deleteCount) {
    result.push({
      departmentId: '',
      departmentName: _l('已删除'),
      isDelete: true,
      deleteCount,
    });
  }
  return result;
};

// 标题隐藏按横向排列
export const getHideTitleStyle = (item = {}, data = []) => {
  const rowWidgets = data.filter(i => i.row === item.row);

  return rowWidgets.every(row => _.get(row, 'advancedSetting.hidetitle') === '1' && supportDisplayRow(row))
    ? { displayRow: true, titlewidth_pc: '0' }
    : {};
};

export const getArrBySpliceType = (filters = []) => {
  let num = 0;
  return Object.values(
    filters.reduce((res, item) => {
      res[num] ? res[num].push(item) : (res[num] = [item]);
      if (item.spliceType === 2) {
        num++;
      }
      return res;
    }, {}),
  );
};

// 不允许重复传参格式处理
export const formatControlValue = (value, type) => {
  if (_.includes([26, 27, 29, 48], type)) {
    return safeParse(value.startsWith('deleteRowIds') ? '[]' : value || '[]')
      .map(ac => ac[WIDGET_VALUE_ID[type]])
      .join('');
  }
  return value;
};

//非文本类控件
export const isUnTextWidget = (data = {}) => {
  //200自定义控件
  const UN_TEXT_TYPE = [9, 10, 11, 14, 15, 16, 19, 23, 24, 26, 27, 28, 29, 34, 35, 36, 40, 42, 45, 46, 47, 48, 50, 200];
  if (isCustomWidget(data)) return true;
  if (_.includes(UN_TEXT_TYPE, data.type)) return true;
  if (data.type === 6 && _.includes(['2', '3'], _.get(data, 'advancedSetting.showtype'))) return true;
  if (data.type === 2 && browserIsMobile() && (data.strDefault || '10').split('')[1] === '1') return true;
  return false;
};

export const isPublicLink = () => {
  const {
    isPublicForm,
    isPublicView,
    isPublicPage,
    isPublicRecord,
    isPublicQuery,
    isPublicFormPreview,
    isPublicWorkflowRecord,
  } = _.get(window, 'shareState') || {};
  return (
    _.get(window, 'isPublicWorksheet') ||
    isPublicForm ||
    isPublicView ||
    isPublicPage ||
    isPublicRecord ||
    isPublicQuery ||
    isPublicFormPreview ||
    isPublicWorkflowRecord
  );
};

// 后端接口报错
export const getServiceError = (badData = [], data, from) => {
  const serviceError = [];
  const hideControlErrors = [];
  badData.forEach(controlId => {
    const control = _.find(data, d => d.controlId === controlId);
    const error = {
      controlId,
      errorText: FORM_ERROR_TYPE_TEXT.REQUIRED(control),
      errorType: FORM_ERROR_TYPE.REQUIRED,
      showError: true,
    };
    if (!controlState(control, from).visible) {
      hideControlErrors.push(error.errorText);
    }
    serviceError.push(error);
  });
  return { serviceError, hideControlErrors };
};

export { controlState, getValueStyle, getTitleTextFromControls, getTitleTextFromRelateControl };
