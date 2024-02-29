import { formatFormulaDate, domFilterHtmlScript, getSelectedOptions, checkIsTextControl } from '../../util';
import { RELATION_TYPE_NAME } from './enum';
import { accMul, formatStrZero, toFixed } from 'src/util';
import { getSwitchItemNames } from 'src/pages/widgetConfig/util';
import { getShowFormat } from 'src/pages/widgetConfig/util/setting.js';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';
import _ from 'lodash';
import moment from 'moment';
import { validate } from 'uuid';

export default function renderText(cell, options = {}) {
  try {
    if (!cell) {
      return '';
    }
    if (cell.controlId === 'rowid' && !validate(cell.value)) {
      return '';
    }
    let { type, value = '', unit, advancedSetting = {} } = cell;
    let { suffix = '', prefix = '', thousandth } = advancedSetting;
    let selectedOptions = [];
    let parsedData;
    if (options.noUnit) {
      unit = '';
      suffix = '';
      prefix = '';
    }
    if (value === '' || value === null) {
      return '';
    }
    if (!checkIsTextControl(cell) && cell.value === '已删除') {
      // 处理关联已删除，非文本作为标题时卡片标题显示异常问题
      return _l('已删除');
    }
    if (type === 37) {
      if (cell.advancedSetting && cell.advancedSetting.summaryresult === '1') {
        type = 2;
        value = Math.round(parseFloat(cell.value) * 100) + '%';
      } else {
        if (_.includes([15, 16], cell.enumDefault2) && _.includes([2, 3], cell.enumDefault)) {
          cell.advancedSetting = { ...advancedSetting, showtype: cell.unit };
        }
        type = cell.enumDefault2 || 6;
      }
    }
    if (_.includes([6, 31, 37], cell.type) && cell.advancedSetting && cell.advancedSetting.numshow === '1' && value) {
      value = accMul(value, 100);
    }
    if (cell.controlId === 'wfftime') {
      return formatFormulaDate({ value: cell.value, unit: '1' }).replace(/^-/, _l('已超时'));
    }

    switch (type) {
      // 纯文本
      case 2: // TEXTAREA_INPUT 文本
      case 4: // 座机
      case 5: // EMAIL_INPUT 邮件地址
      case 7: // CRED_INPUT 身份证
      case 25: // MONEY_CN 大写金额
      case 33: // AUTOID 自动编号
      case 37: // SUBTOTAL 汇总 TODO
      case 49: // API 查询
      case 50: // API 查询
        value = cell.enumDefault === 0 || cell.enumDefault === 2 ? (value || '').replace(/\r\n|\n/g, ' ') : value;
        break;
      case 3: // PHONE_NUMBER 手机号码
        value = cell.enumDefault === 1 ? value.replace(/\+86/, '') : value;
        break;
      case 19: // AREA_INPUT 地区
      case 23: // AREA_INPUT 地区
      case 24: // AREA_INPUT 地区
        try {
          parsedData = JSON.parse(value);
        } catch (err) {
          value = '';
        }
        value = parsedData.name;
        break;
      /**
       * 文本 + 单位
       * */
      case 6: // NUMBER_INPUT 数值
      case 8: // MONEY_AMOUNT 金额
      case 31: // NEW_FORMULA 公式
        value = _.isUndefined(cell.dot) ? value : toFixed(value, cell.dot);
        if (!options.noSplit) {
          if (
            cell.type !== 6
              ? thousandth !== '1'
              : _.isUndefined(thousandth)
              ? cell.enumDefault !== 1
              : thousandth !== '1'
          ) {
            value = (value || '').replace(
              value.indexOf('.') > -1 ? /(\d{1,3})(?=(?:\d{3})+\.)/g : /(\d{1,3})(?=(?:\d{3})+$)/g,
              '$1,',
            );
          }
        }
        // 兼容百分比进度没有百分比符号
        if ((cell.advancedSetting || {}).numshow === '1') {
          suffix = '%';
        }
        if (!options.noMask && _.includes([6, 8], type) && _.get(cell, 'advancedSetting.datamask') === '1') {
          value = dealMaskValue({ ...cell, value }) || value;
        }
        value = (prefix || '') + value + (unit || suffix || '');
        break;
      case 15: // DATE_INPUT 日期
      case 16: // DATE_INPUT 日期时间
        if (_.isEmpty(value)) {
          value = '';
        }
        const showFormat = getShowFormat(cell);
        value = moment(moment(cell.value), showFormat).format(
          _.includes(['ctime', 'utime', 'dtime'], cell.controlId) ? 'YYYY-MM-DD HH:mm:ss' : showFormat,
        );
        break;
      case 46: // TIME 时间
        if (_.isEmpty(value)) {
          value = '';
        }
        value = moment(cell.value, 'HH:mm:ss').format(cell.unit === '6' || cell.unit === '9' ? 'HH:mm:ss' : 'HH:mm');
        break;
      case 38: // 日期公式
        if (_.isEmpty(value)) {
          value = '';
        }
        if (cell.enumDefault === 2) {
          const showFormat = getShowFormat({ advancedSetting: { ...advancedSetting, showtype: cell.unit || '1' } });
          value = moment(cell.value, value.indexOf('-') > -1 ? undefined : showFormat).format(showFormat);
        } else {
          if (cell.advancedSetting.autocarry === '1') {
            value = (prefix || '') + formatFormulaDate({ value: cell.value, unit, dot: cell.dot });
          } else {
            value =
              (prefix || '') +
              toFixed(value, cell.dot) +
              (suffix ||
                {
                  1: _l('分钟'),
                  2: _l('小时'),
                  3: _l('天'),
                  4: _l('月'),
                  5: _l('年'),
                  6: _l('秒'),
                }[unit]);
          }
        }
        break;
      case 17: // DATE_TIME_RANGE 时间段
      case 18: // DATE_TIME_RANGE 时间段
        if (value === '' || value === '["",""]') {
          value = '';
        }
        try {
          parsedData = JSON.parse(value);
        } catch (err) {
          value = '';
        }
        value = parsedData
          .map(time => (time ? moment(time).format(cell.type === 17 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm') : ''))
          .join(' - ');
        break;
      case 10010: // REMARK 备注
      case 41: // RICH_TEXT 富文本
        value = domFilterHtmlScript(cell.value);
        break;
      case 40: // LOCATION 定位
        try {
          parsedData = JSON.parse(value) || {};
        } catch (err) {
          value = '';
        }
        value = _.isObject(parsedData) ? `${parsedData.title || ''} ${parsedData.address || ''}` : '';
        break;
      // 组件
      case 9: // OPTIONS 单选 平铺
      case 10: // MULTI_SELECT 多选
      case 11: // OPTIONS 单选 下拉
        selectedOptions = getSelectedOptions(cell.options, cell.value);
        value = selectedOptions
          .map((option, index) => {
            if (option.key === 'other') {
              const otherValue = _.find(JSON.parse(cell.value || '[]'), i => i.includes(option.key));
              return otherValue === 'other' ? option.value : _.replace(otherValue, 'other:', '') || option.value;
            }
            return option.value;
          })
          .join('、');
        break;
      case 26: // USER_PICKER 成员
        try {
          parsedData = JSON.parse(value);
        } catch (err) {
          value = '';
        }
        if (!_.isArray(parsedData)) {
          parsedData = [parsedData];
        }
        value = parsedData
          .filter(user => !!user)
          .map(user => user.fullname)
          .join('、');
        break;
      case 27: // GROUP_PICKER 部门
        try {
          parsedData = JSON.parse(cell.value);
        } catch (err) {
          value = '';
        }
        value = parsedData
          .map((department, index) => (department.departmentName ? department.departmentName : _l('该部门已删除')))
          .join('、');
        break;
      case 36: // SWITCH 检查框
        const itemnames = getSwitchItemNames(cell, { needDefault: true });
        const text = _.get(
          _.find(itemnames, i => i.key === value || parseFloat(i.key) === value),
          'value',
        );
        value = value === '1' || value === 1 ? text || _l('已选中') : '';
        break;
      case 14: // ATTACHMENT 附件
        try {
          parsedData = JSON.parse(value);
        } catch (err) {
          value = '';
        }
        value = parsedData.map(attachment => `${attachment.originalFilename + attachment.ext}`).join('、');
        break;
      case 35: // CASCADER 级联
        try {
          parsedData = JSON.parse(value);
        } catch (err) {
          parsedData = [];
        }
        if (!_.isArray(parsedData)) {
          parsedData = [];
        }
        value = parsedData.length ? parsedData[0].name : '';
        break;
      case 29: // RELATESHEET 关联表
        try {
          parsedData = JSON.parse(value);
        } catch (err) {
          parsedData = [];
        }
        if (!_.isArray(parsedData)) {
          parsedData = [];
        }
        if (cell.enumDefault === 1) {
          value = parsedData
            .map(
              record =>
                renderText(_.assign({}, cell, { type: cell.sourceControlType || 2, value: record.name }), options) ||
                _l('未命名'),
            )
            .join('、');
        } else if (_.get(cell, 'advancedSetting.showtype') === '2') {
          value = cell.value;
        } else if (cell.enumDefault === 2 && cell.relationControls.length) {
          const titleControl = _.find(cell.relationControls, { controlId: cell.sourceControlId });
          if (titleControl) {
            value = parsedData
              .map(
                record =>
                  renderText(
                    _.assign({}, cell, { type: titleControl.sourceControlType || 2, value: record.name }),
                    options,
                  ) || _l('未命名'),
              )
              .join('、');
          }
        }
        break;
      case 30: // SHEETFIELD 他表字段
        value = renderText(
          _.assign({}, cell, {
            type: cell.sourceControlType || 2,
            advancedSetting: _.get(cell, 'sourceControl.advancedSetting') || {},
          }),
          options,
        );
        break;
      case 21: // RELATION 自由连接
        try {
          parsedData = JSON.parse(value);
        } catch (err) {
          value = '';
        }
        value = parsedData.map(relation => `[${RELATION_TYPE_NAME[relation.type]}]${relation.name}`).join('、');
        break;
      case 28: // SCORE 等级
        if (!cell.value) {
          value = '';
        }
        const itemNames = JSON.parse((cell.advancedSetting || {}).itemnames || '[]');
        value =
          _.get(
            _.find(itemNames, i => i.key === cell.value),
            'value',
          ) || _l('%0 级', parseInt(cell.value, 10));
        break;
      // case 42: // SIGNATURE 签名
      // case 43: // CASCADER 多级下拉
      case 32: // CONCATENATE 文本组合
        value = cell.value;
        break;
      case 48: // ORGROLE_PICKER 组织角色
        try {
          parsedData = JSON.parse(cell.value);
        } catch (err) {
          value = '';
        }
        value = parsedData
          .map((organize, index) => (organize.organizeName ? organize.organizeName : _l('该组织角色已删除')))
          .join('、');
        break;
      default:
        value = '';
    }
    // 小数点不补零
    if (_.get(cell, 'advancedSetting.dotformat') === '1') {
      value = formatStrZero(value);
    }
    // 走掩码 单行文本、数值、金额、手机、邮箱、证件
    if (
      !options.noMask &&
      ((type === 2 && cell.enumDefault === 2) || _.includes([3, 5, 7], type)) &&
      _.get(cell, 'advancedSetting.datamask') === '1'
    ) {
      return dealMaskValue({ ...cell, value }) || value;
    }
    return value;
  } catch (err) {
    console.log(err);
    return '';
  }
}
