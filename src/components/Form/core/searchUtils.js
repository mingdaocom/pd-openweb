import _ from 'lodash';
import { getDatePickerConfigs } from 'src/pages/widgetConfig/util/setting.js';
import { isEmptyValue } from 'src/util';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

export const getAttachmentData = (control = {}) => {
  let fileData;
  if (control.value && _.isArray(JSON.parse(control.value))) {
    fileData = JSON.parse(control.value);
  } else {
    const data = JSON.parse(control.value || '{}');
    const { attachments = [], attachmentData = [], knowledgeAtts = [] } = data;
    fileData = [...attachmentData, ...attachments, ...knowledgeAtts];
  }
  return fileData;
};

const getRelateValue = control => {
  const value = safeParse(control.value || '[]');
  if (_.isEmpty(value)) return [];
  return value.map(i => {
    return { ...i, ...safeParse(i.sourcevalue) };
  });
};

const getValue = (control = {}, type) => {
  if (!control.value) return '';
  switch (control.type) {
    case 2:
      if (type === 10000007) {
        return (control.value || '').replace(/，/g, ',').split(',');
      }
      return control.value;
    // 单选、多选
    case 9:
    case 10:
    case 11:
      const ids = safeParse(control.value || '[]');
      if (!ids.length) return '';
      const noDelControls = (control.options || []).filter(item => _.includes(ids, item.key) && !item.isDeleted);

      if (type === 6) {
        return noDelControls
          .map(i => i.score)
          .reduce((total, cur) => {
            return total + cur;
          }, 0);
      }
      if (type === 10000007) {
        return noDelControls.map(i => i.value);
      }
      return noDelControls.map(i => i.value).join('、');
    case 14:
      const attachmentData = getAttachmentData(control);
      return attachmentData.map(att => {
        const fileId = _.get(att, 'fileID');
        return /\w{8}(-\w{4}){3}-\w{12}/.test(fileId) ? fileId : JSON.stringify(att);
      });
    case 15:
    case 16:
      const { formatMode } = getDatePickerConfigs(control);
      return control.value ? moment(control.value).format(formatMode) : '';
    // 成员
    case 26:
      if (type === 2) {
        return safeParse(control.value || '[]')
          .map(i => (i.accountId === md.global.Account.accountId ? md.global.Account.fullname : i.fullname))
          .join('、');
      }
      return safeParse(control.value || '[]').map(i => i.accountId);
    // 部门
    case 27:
      if (type === 2) {
        return safeParse(control.value || '[]')
          .map(i => i.departmentName)
          .join('、');
      }
      return safeParse(control.value || '[]').map(i => i.departmentId);
    //地区
    case 19:
    case 23:
    case 24:
      return (safeParse(control.value) || {}).name;
    //关联记录
    case 29:
      const names = safeParse(control.value || '[]').map(i => i.name);
      return type === 2 ? names.join('') : names;
    case 48:
      return safeParse(control.value || '[]')
        .map(i => i.organizeName)
        .join('、');
    default:
      return control.value;
  }
};

const getDynamicValue = (item, formData, keywords) => {
  const tempValues = safeParse(item.defsource || '[]').map(source => {
    // 动态值
    if (source.cid) {
      if (source.cid === 'search-keyword') return keywords;
      const isOcr = _.includes(['ocr-file', 'ocr-file-url'], source.cid);

      if (source.cid === 'ocr-file-url' && item.type === 2) {
        return keywords ? `${_.get(keywords, 'serverName')}${_.get(keywords, 'key')}?imageView2/2/w/1920/q/90` : '';
      }
      if (source.cid === 'ocr-file' && item.type === 14) {
        const fileId = _.get(keywords, 'fileId');
        return keywords ? (/\w{8}(-\w{4}){3}-\w{12}/.test(fileId) ? [fileId] : [JSON.stringify(keywords)]) : '';
      }
      const control = _.find(formData, i => i.controlId === source.cid);
      return getValue(control, item.type);
    }

    // 静态值
    if (source.staticValue) {
      // 文本 | 数值
      if (_.includes([2, 6, 9, 36], item.type)) {
        return source.staticValue;
      }
      // 日期时间
      if (item.type === 16) {
        const { formatMode } = getDatePickerConfigs(item);
        if (!source.staticValue) return '';
        return source.staticValue === '2' ? moment().format(formatMode) : moment(source.staticValue).format(formatMode);
      }

      // 人员
      if (item.type === 26) {
        return _.includes(['user-self'], safeParse(source.staticValue).accountId)
          ? md.global.Account.accountId
          : safeParse(source.staticValue).accountId;
      }

      // 部门
      if (item.type === 27) {
        return safeParse(source.staticValue).departmentId;
      }

      // 组织角色
      if (item.type === 48) {
        return safeParse(source.staticValue).organizeId;
      }

      //普通数组
      if (item.type === 10000007) {
        return (source.staticValue || '').replace(/，/g, ',').split(',');
      }
    }
  });
  if (_.includes([2, 6, 9, 16, 36], item.type)) {
    return tempValues.join('');
  }

  const dealValue = _.flatten(tempValues).filter(i => !isEmptyValue(i));
  return _.isEmpty(dealValue) ? '' : dealValue;
};

export const getParamsByConfigs = (requestMap = [], formData = [], keywords = '') => {
  let params = {};
  requestMap.forEach(item => {
    if (item.pid) return;
    // 对象数组
    if (item.type === 10000008) {
      // 对象数组或子表控件
      const curControl =
        _.find(formData, i => i.controlId === _.get(safeParse(item.defsource || '[]')[0], 'cid')) || {};
      // 对象数组或子表值
      const controlState = curControl.store ? curControl.store.getState() : {};
      const rows = (
        curControl.type === 29
          ? _.get(controlState, 'records') || getRelateValue(curControl)
          : _.get(controlState, 'rows') || []
      ).filter(r => !(r.rowid || '').includes('empty'));

      params[item.id] = '';

      if (rows.length) {
        // 对象数组内部配置
        const childMap = requestMap.filter(r => r.pid === item.id);

        params[item.id] = rows.map((row = {}) => {
          let rowItem = {};
          childMap.map(c => {
            const { cid, rcid } = safeParse(c.defsource || '[]')[0] || {};
            const childControl = _.find(rcid ? curControl.relationControls || [] : formData, r => r.controlId === cid);
            const controlValues = rcid
              ? (curControl.relationControls || []).map(i => {
                  if (i.controlId === cid) {
                    return {
                      ...i,
                      value: _.get(row, [cid]) || '',
                    };
                  }
                  return i;
                })
              : formData;
            rowItem[c.id] = childControl || !cid ? getDynamicValue(c, controlValues, keywords) : '';
          });
          return rowItem;
        });
      }
    } else {
      params[item.id] = getDynamicValue(item, formData, keywords);
    }
  });
  return params;
};

export const getShowValue = (control, value = '') => {
  if (control) {
    let curValue = [];
    if (_.includes([9, 10, 11], control.type)) {
      curValue = safeParse(value || '[]').map(
        i =>
          _.get(
            _.find(control.options || [], op => op.key === i),
            'value',
          ) || '',
      );
    } else if (control.type === 26) {
      curValue = safeParse(value || '[]').map(i => i.fullname);
    } else if (control.type === 27) {
      curValue = safeParse(value || '[]').map(i => i.departmentName);
    } else if (control.type === 48) {
      curValue = safeParse(value || '[]').map(i => i.organizeName);
    } else {
      return clearValue(value);
    }
    return curValue.length > 0 ? curValue.join('') : '';
  }
  return clearValue(value);
};

export const clearValue = (value = '') => {
  let curValue = value;

  if (typeof curValue !== 'string') {
    curValue = `${curValue}`;
  }

  if (_.includes(['{}', '[]', 'null'], curValue)) {
    curValue = '';
  }
  return curValue;
};

// api查询数据处理
export const handleUpdateApi = (props, itemData = {}, isDefault = false, callback) => {
  const { advancedSetting: { responsemap } = {}, formData, onChange } = props;
  const responseMap = safeParse(responsemap || '[]');
  responseMap.map(item => {
    const control = _.find(formData, i => i.controlId === item.cid);
    if (control && !_.isUndefined(itemData[item.cid])) {
      // 子表直接赋值
      if (control.type === 34 && _.includes([10000007, 10000008], item.type)) {
        onChange(
          {
            action: 'clearAndSet',
            isDefault,
            rows: safeParse(itemData[item.cid] || '[]').map(i => {
              return {
                ...i,
                rowid: `temprowid-${uuidv4()}`,
                allowedit: true,
                addTime: new Date().getTime(),
              };
            }),
          },
          control.controlId,
        );
      } else if (!item.subid) {
        // 普通数组特殊处理
        let itemVal = itemData[item.cid];
        if (item.type === 10000007 && itemData[item.cid] && _.isArray(safeParse(itemData[item.cid]))) {
          if (!_.includes([26], control.type)) {
            itemVal = safeParse(itemData[item.cid]).join(',');
          }
        }
        onChange(itemVal, control.controlId, false);
      }
      if (_.isFunction(callback)) {
        callback();
      }
    }
  });
};
