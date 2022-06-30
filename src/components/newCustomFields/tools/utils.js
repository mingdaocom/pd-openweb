import { renderCellText } from 'src/pages/worksheet/components/CellControls';
import { formatValuesOfOriginConditions } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { FROM, FORM_ERROR_TYPE } from './config';
import { isEnableScoreOption } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import { getStringBytes } from 'src/util';
import { getStrBytesLength } from 'src/pages/Roles/Portal/list/util';

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
    case 47:
      return 'BarCode'; // 嵌入
  }
};

const Reg = {
  // 座机号码
  telPhoneNumber: /^[+]?((\d){3,4}([ ]|[-]))?((\d){3,9})(([ ]|[-])(\d){1,12})?$/,
  // 邮箱地址
  emailAddress: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)*\.[\w-]+$/i,
  // 身份证号码
  idCardNumber: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
  // 护照
  passportNumber: /^[a-zA-Z0-9]{5,17}$/,
  // 港澳通行证
  hkPassportNumber: /.*/,
  // 台湾通行证
  twPassportNumber: /.*/,
};

export const Validator = {
  isTelPhoneNumber: str => {
    return Reg.telPhoneNumber.test(str);
  },
  isEmailAddress: str => {
    return Reg.emailAddress.test(str);
  },
  isIdCardNumber: str => {
    return Reg.idCardNumber.test(str);
  },
  isPassportNumber: str => {
    return Reg.passportNumber.test(str);
  },
  isHkPassportNumber: str => {
    return Reg.hkPassportNumber.test(str);
  },
  isTwPassportNumber: str => {
    return Reg.twPassportNumber.test(str);
  },
};

function formatRowToServer(row, controls = []) {
  return Object.keys(row)
    .map(key => {
      const c = _.find(controls, c => c.controlId === key);
      if (!c) {
        return undefined;
      } else {
        if (c.type === 14 && (row[key] || '')[0] === '[') {
          try {
            row[key] = JSON.stringify(JSON.parse(row[key]).map(c => c.fileId));
          } catch (err) {
            console.log(err);
          }
        }
        return _.pick(
          formatControlToServer({ ...c, value: row[key] }, { isSubListCopy: row.isCopy }),
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
export function formatControlToServer(control, { isSubListCopy } = {}) {
  let result = {
    controlId: control.controlId,
    type: control.type,
    value: control.value,
    controlName: control.controlName,
    dot: control.dot,
  };
  if (!control.value) {
    return result;
  }
  let parsedValue;
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
      let parsed = JSON.parse(control.value);
      let oldAttachments = [];
      let oldKnowledgeAtts = [];

      if (isSubListCopy && _.isArray(parsed) && !_.isEmpty(parsed)) {
        result.value = JSON.stringify(parsed.map(a => a.fileID));
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
          .map((item, index) => Object.assign({}, item, { isEdit: false, index }))
          .concat(oldAttachments),
        knowledgeAtts: (parsed.knowledgeAtts || [])
          .map((item, index) => Object.assign({}, item, { isEdit: false, index: parsed.attachments.length + index }))
          .concat(oldKnowledgeAtts),
      });
      break;
    case 19:
    case 23:
    case 24:
      try {
        parsedValue = JSON.parse(control.value);
        result.value = parsedValue.code;
      } catch (err) { }
      break;
    case 29:
      parsedValue = JSON.parse(control.value);
      result.value = _.isArray(parsedValue)
        ? JSON.stringify(
          parsedValue.map(item => ({
            name: item.name,
            sid: item.sid,
          })),
        )
        : '';
      break;
    case 34: // 子表
      if (result.value.isAdd) {
        result.value = JSON.stringify(control.value.rows.map(row => formatRowToServer(row, control.relationControls)));
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
                let row = _.find(control.value.rows, r => r.rowid === rowid);
                if (!row) {
                  return undefined;
                }
                if (isNew) {
                  return {
                    editType: 0,
                    newOldControl: formatRowToServer(row, control.relationControls),
                  };
                } else {
                  if (row && row.updatedControlIds) {
                    row = _.pick(row, row.updatedControlIds);
                    delete row.updatedControlIds;
                  }
                  return {
                    rowid,
                    editType: 0,
                    newOldControl: formatRowToServer(row, control.relationControls),
                  };
                }
              })
              .filter(_.identity),
          );
        }
        result.value = JSON.stringify(resultvalue);
        if (_.isEmpty(resultvalue) && control && typeof control.value === 'string') {
          try {
            const rows = JSON.parse(control.value);
            result.value = JSON.stringify(
              rows.map(row => Object.keys(row).map(key => ({ controlId: key, value: row[key] }))),
            );
          } catch (err) { }
        }
      }
      break;
  }

  return result;
}

/**
 * 获取标题字段文本
 * @param  {} controls 所有控件
 * @param  {} data 控件所在记录数据[可选]
 */
export function getTitleTextFromControls(controls, data, titleSourceControlType) {
  let titleControl = _.find(controls, control => control.attribute === 1) || {};
  if (titleSourceControlType) {
    titleControl.sourceControlType = titleSourceControlType;
  }
  if (titleControl && data) {
    titleControl = Object.assign({}, titleControl, { value: data[titleControl.controlId] || data.titleValue });
  }
  return titleControl ? renderCellText(titleControl) || _l('未命名') : _l('未命名');
}

/**
 * 从关联记录字段获取标题字段文本
 * @param  {} controls 所有控件
 * @param  {} data 控件所在记录数据[可选]
 */
export function getTitleTextFromRelateControl(control = {}, data) {
  return getTitleTextFromControls(control.relationControls, data, control.sourceControlType);
}

// 控件状态
export const controlState = (data, from) => {
  const controlPermissions = data.controlPermissions || '111';
  const fieldPermission = data.fieldPermission || '111';
  let state = {
    visible: true,
    editable: true,
  };

  if (_.includes([FROM.NEWRECORD, FROM.PUBLIC, FROM.H5_ADD], from)) {
    state.visible = fieldPermission[0] === '1' && fieldPermission[2] === '1' && controlPermissions[2] === '1';
    state.editable = fieldPermission[1] === '1';
  } else {
    state.visible = fieldPermission[0] === '1' && controlPermissions[0] === '1';
    state.editable = fieldPermission[1] === '1' && controlPermissions[1] === '1';
  }

  return state;
};

export const getRangeErrorType = ({ type, value, advancedSetting }) => {
  const formatValue = value => parseFloat(value.replace(/,/g, ''));
  const { min, max, checkrange } = advancedSetting;

  if (!value || checkrange !== '1') return '';

  if (type === 2) {
    const stringSize = (value || '').length;
    if ((min && stringSize < +min) || (max && stringSize > +max)) return FORM_ERROR_TYPE.TEXT_RANGE;
  }

  if (
    !isNaN(value) &&
    _.includes([6, 8], type) &&
    ((min && +value < formatValue(min)) || (max && +value > formatValue(max)))
  )
    return FORM_ERROR_TYPE.NUMBER_RANGE;

  if (type === 10) {
    const selectedItemsCount = JSON.parse(value || '[]').length;
    if ((min && selectedItemsCount < +min) || (max && selectedItemsCount > +max))
      return FORM_ERROR_TYPE.MULTI_SELECT_RANGE;
  }

  return '';
};

const FILTER_TYPE = {
  26: 'accountId',
  27: 'departmentId',
  29: 'sid',
  35: 'sid',
};

export const formatFiltersValue = (filters = [], data = [], recordId) => {
  let conditions = formatValuesOfOriginConditions(filters) || [];
  let hasCurrent = false;
  conditions.forEach(item => {
    if (item.dynamicSource && item.dynamicSource.length > 0) {
      const cid = _.get(item.dynamicSource[0] || {}, 'cid');
      if (cid === 'current-rowid' && item.dataType === 29) {
        item.values = [recordId];
        hasCurrent = !recordId;
      }
      const currentControl = _.find(data, da => da.controlId === cid);
      //排除为空、不为空、在范围，不在范围类型
      if (currentControl && currentControl.value && !_.includes([7, 8, 11, 12, 31, 32], item.filterType)) {
        //普通数值类
        if (_.includes([6, 8, 25, 31, 37], currentControl.type)) {
          item.value = currentControl.value;
          return;
        }
        //普通文本
        if (_.includes([2, 3, 5, 7, 28, 32, 33], currentControl.type)) {
          item.values = [currentControl.value];
          return;
        }
        //日期特殊处理
        if (
          _.includes([15, 16], currentControl.type) ||
          (currentControl.type === 38 && currentControl.enumDefault === 2)
        ) {
          item.dateRange = 18;
          item.value = currentControl.value;
          return;
        }
        //单选
        if (_.includes([9, 10, 11], currentControl.type)) {
          item.values = JSON.parse(currentControl.value) || [];
          return;
        }
        //人员、部门、关联表
        if (_.includes([26, 27, 29, 35], currentControl.type)) {
          item.values = JSON.parse(currentControl.value || '[]').map(ac => ac[FILTER_TYPE[currentControl.type]]);
          return;
        }
      }
    } else {
      //数值类型 在范围 ｜ 不在范围处理
      if (_.includes([6, 8, 25, 31, 37], item.dataType) && _.includes([11, 12], item.filterType)) {
        delete item.value;
        delete item.values;
      }
    }
  });
  return hasCurrent ? [] : conditions;
};

// 工作表查询部门、地区、用户赋值特殊处理
export const getCurrentValue = (item, data, control) => {
  if (!item || !control) return data;
  switch (control.type) {
    //当前控件文本
    case 2:
      if (_.includes([6, 31, 37], item.type) && item.advancedSetting && item.advancedSetting.numshow === '1' && data) {
        data = parseFloat(data) * 100;
      }
      switch (item.type) {
        //用户
        case 26:
          return JSON.parse(data || '[]')
            .map(item => (item.accountId === md.global.Account.accountId ? md.global.Account.fullname : item.fullname))
            .join('、');
        //部门
        case 27:
          return JSON.parse(data || '[]')
            .map(item => item.departmentName)
            .join('、');
        //地区
        case 19:
        case 23:
        case 24:
          return JSON.parse(data || '{}').name;
        // 单选、多选
        case 9:
        case 10:
        case 11:
          const ids = JSON.parse(data || '[]');
          return (item.options || [])
            .filter(item => _.includes(ids, item.key) && !item.isDeleted)
            .map(i => i.value)
            .join('、');
        //关联记录单条
        case 29:
          const formatData = JSON.parse(data || '[]')[0] || {};
          return formatData.name;
        //公式
        case 31:
          const dot = item.dot || 0;
          return Number(data || 0).toFixed(dot);
        default:
          return data;
      }
    //控件为数值、金额、等级
    case 6:
    case 8:
    case 28:
      //选项赋分值
      if (isEnableScoreOption(item)) {
        const selectOptions = (item.options || []).filter(item => _.includes(JSON.parse(data || '[]'), item.key));
        if (!selectOptions.length) return '';
        return selectOptions.reduce((total, cur) => {
          return total + Number(cur.score || 0);
        }, 0);
      } else {
        return data;
      }
    default:
      return data;
  }
};

// 特殊手机号验证是否合法
export const specialTelVerify = value => {
  return /\+8526262\d{4}$|\+8526660\d{4}$|\+86146\d{8}$|\+86148\d{8}$|\+5551\d{8}$|\+8536855\d{4}$|\+8536856\d{4}$|\+8536857\d{4}$|\+8536858\d{4}$|\+8536859\d{4}$/.test(
    value || '',
  );
};

export const compareWithTime = (start, end, type) => {
  const startTime = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1]);
  const endTime = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1]);
  switch (type) {
    case 'isBefore':
      return startTime < endTime;
    case 'isSameAndBefore':
      return startTime <= endTime;
    case 'isAfter':
      return startTime > endTime;
    case 'isSameAndAfter':
      return startTime >= endTime;
  }
};

export const getEmbedValue = (embedData = {}, id) => {
  switch (id) {
    case 'userId':
      return md.global.Account.accountId;
    case 'phone':
      return md.global.Account.mobilePhone;
    case 'email':
      return md.global.Account.email;
    case 'ua':
      return window.navigator.userAgent;
    case 'timestamp':
      return new Date().getTime();
    default:
      return embedData[id] || '';
  }
};

export const getBarCodeValue = ({ data, control, codeInfo }) => {
  const { enumDefault, enumDefault2, dataSource } = control;
  const { appId, worksheetId, viewId, recordId } = codeInfo;
  if ((enumDefault === 1 || (enumDefault === 2 && enumDefault2 === 3)) && !dataSource) return '';
  if (dataSource === 'rowid') return recordId;
  if (enumDefault === 2) {
    // 记录内部访问链接
    if (enumDefault2 === 1) {
      return recordId
        ? `${location.origin}/app/${appId}/${worksheetId}/${viewId}/row/${recordId}`
        : `${md.global.Config.WebUrl}app/${appId}/newrecord/${worksheetId}/${viewId}/`;
    }
  }
  const selectControl = _.find(data, i => i.controlId === dataSource);
  if (!(selectControl || {}).value) return '';
  if (enumDefault === 1) {
    const repVal = String(selectControl.value).replace(/[\u4e00-\u9fa5]/g, '');
    return getStringBytes(repVal) <= 128 ? repVal : getStrBytesLength(repVal, 128);
  }
  return String(selectControl.value).substr(0, 150);
};
