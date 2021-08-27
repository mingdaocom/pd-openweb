import { formatFormulaDate, domFilterHtmlScript, getSelectedOptions } from '../../util';
import { RELATION_TYPE_NAME } from './enum';

export default function renderText(cell, options = {}) {
  try {
    if (!cell) {
      return '';
    }
    let { type, value = '', unit, advancedSetting = {} } = cell;
    let { suffix = '', prefix = '' } = advancedSetting;
    let selectedOptions = [];
    let parsedData;
    if (options.noUnit) {
      unit = '';
      suffix = '';
      prefix = '';
    }
    if (value === '') {
      return '';
    }
    if (type === 37) {
      if (cell.advancedSetting && cell.advancedSetting.summaryresult === '1') {
        type = 2;
        value = Math.round(parseFloat(cell.value) * 100) + '%';
      } else {
        type = cell.enumDefault2 || 6;
      }
    }
    switch (type) {
      // 纯文本
      case 2: // TEXTAREA_INPUT 文本
      case 4: // 座机
      case 5: // EMAIL_INPUT 邮件地址
      case 7: // CRED_INPUT 身份证
      case 25: // MONEY_CN 大写金额
      case 32: // CONCATENATE 文本组合
      case 33: // AUTOID 自动编号
      case 37: // SUBTOTAL 汇总 TODO
        return cell.enumDefault === 0 || cell.enumDefault === 2 ? (value || '').replace(/\r\n|\n/g, ' ') : value;
      case 3: // PHONE_NUMBER 手机号码
        return cell.enumDefault === 1 ? value.replace(/\+86/, '') : value;
      case 19: // AREA_INPUT 地区
      case 23: // AREA_INPUT 地区
      case 24: // AREA_INPUT 地区
        try {
          parsedData = JSON.parse(value);
        } catch (err) {
          return '';
        }
        return parsedData.name;
      /**
       * 文本 + 单位
       * */
      case 6: // NUMBER_INPUT 数值
      case 8: // MONEY_AMOUNT 金额
      case 31: // NEW_FORMULA 公式
        value = _.isUndefined(cell.dot) ? cell.value : _.round(cell.value, cell.dot).toFixed(cell.dot);
        if (!options.noSplit) {
          if (!(cell.type === 6 && cell.enumDefault === 1)) {
            value = (value || '').replace(
              value.indexOf('.') > -1 ? /(\d{1,3})(?=(?:\d{3})+\.)/g : /(\d{1,3})(?=(?:\d{3})+$)/g,
              '$1,',
            );
          }
        }
        value = (prefix || '') + value + (unit || suffix || '');
        return value;
      case 15: // DATE_INPUT 日期
      case 16: // DATE_INPUT 日期时间
        if (_.isEmpty(value)) {
          return '';
        }
        return cell.type === 15
          ? moment(cell.value).format('YYYY-MM-DD')
          : moment(cell.value).format(
              _.includes(['ctime', 'utime', 'dtime'], cell.controlId) ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD HH:mm',
            );
      case 38: // 日期公式
        if (_.isEmpty(value)) {
          return '';
        }
        if (cell.enumDefault === 2) {
          return moment(cell.value).format(cell.unit === '3' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm');
        } else {
          return prefix + formatFormulaDate(cell.value, unit, suffix || prefix) + suffix;
        }
      case 17: // DATE_TIME_RANGE 时间段
      case 18: // DATE_TIME_RANGE 时间段
        if (value === '' || value === '["",""]') {
          return '';
        }
        try {
          parsedData = JSON.parse(value);
        } catch (err) {
          return '';
        }
        return parsedData
          .map(time => (time ? moment(time).format(cell.type === 17 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm') : ''))
          .join(' - ');
      case 10010: // REMARK 备注
      case 41: // RICH_TEXT 富文本
        return domFilterHtmlScript(cell.value);
      case 40: // LOCATION 定位
        try {
          parsedData = JSON.parse(value) || {};
        } catch (err) {
          return '';
        }
        return _.isObject(parsedData) ? `${parsedData.title || ''} ${parsedData.address || ''}` : '';
      // 组件
      case 9: // OPTIONS 单选 平铺
      case 10: // MULTI_SELECT 多选
      case 11: // OPTIONS 单选 下拉
        selectedOptions = getSelectedOptions(cell.options, cell.value);
        return selectedOptions.map((option, index) => option.value).join('、');
      case 26: // USER_PICKER 成员
        try {
          parsedData = JSON.parse(value);
        } catch (err) {
          return '';
        }
        if (!_.isArray(parsedData)) {
          parsedData = [parsedData];
        }
        return parsedData
          .filter(user => !!user)
          .map(user => user.fullname)
          .join('、');
      case 27: // GROUP_PICKER 部门
        try {
          parsedData = JSON.parse(cell.value);
        } catch (err) {
          return '';
        }
        return parsedData
          .map((department, index) => (department.departmentName ? department.departmentName : _l('该部门已删除')))
          .join('、');
      case 36: // SWITCH 检查框
        return value === '1' || value === 1 ? _l('已选中') : '';
      case 14: // ATTACHMENT 附件
        try {
          parsedData = JSON.parse(value);
        } catch (err) {
          return '';
        }
        return parsedData.map(attachment => `${attachment.originalFilename + attachment.ext}`).join('、');
      case 35: // CASCADER 级联
        try {
          parsedData = JSON.parse(value);
        } catch (err) {
          parsedData = [];
        }
        if (!_.isArray(parsedData)) {
          parsedData = [];
        }
        return parsedData.length ? parsedData[0].name : '';
      case 29: // RELATESHEET 关联表
        try {
          parsedData = JSON.parse(value);
        } catch (err) {
          parsedData = [];
        }
        if (!_.isArray(parsedData)) {
          parsedData = [];
        }
        return parsedData
          .map(
            record =>
              renderText(_.assign({}, cell, { type: cell.sourceControlType || 2, value: record.name }), options) ||
              _l('未命名'),
          )
          .join('、');
      case 30: // SHEETFIELD 他表字段
        return renderText(
          _.assign({}, cell, {
            type: cell.sourceControlType || 2,
            advancedSetting: _.get(cell, 'sourceControl.advancedSetting') || {},
          }),
          options,
        );
      case 21: // RELATION 自由连接
        try {
          parsedData = JSON.parse(value);
        } catch (err) {
          return '';
        }
        return parsedData.map(relation => `[${RELATION_TYPE_NAME[relation.type]}]${relation.name}`).join('、');
      case 28: // SCORE 等级
        if (!cell.value) {
          return '';
        }
        if (options.noUnit) {
          return parseInt(cell.value, 10);
        } else {
          return cell.enumDefault === 1 ? _l('%0星', parseInt(cell.value, 10)) : _l('%0级', parseInt(cell.value, 10));
        }
      // case 42: // SIGNATURE 签名
      // case 43: // CASCADER 多级下拉
      default:
        return '';
    }
  } catch (err) {
    console.log(err);
    return '';
  }
}
