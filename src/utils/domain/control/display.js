// sort-imports-ignore
import _, { find, includes, isEmpty } from 'lodash';
import moment from 'moment';
import { accMul } from 'src/utils/core/arithmetic';
import { RELATION_TYPE_NAME } from 'src/utils/domain/worksheet/relation';
import { domFilterHtmlScript } from 'src/utils/platform/browser/dom';
import { getAppTimeZone } from 'src/utils/platform/runtime/config';
import { dateConvertToUserZone, dateServerZoneToAppZone } from 'src/utils/platform/runtime/timeZone';
import { getDateToEn, getShowFormat, formatFormulaDate, getTimeZoneText } from './date';
import { dealMaskValue } from './mask';
import { formatNumberThousand, formatStrZero, toFixed } from './number';
import { getSelectedOptions } from './optionSelection';
import { getSwitchItemNames } from './options';
import { UNIT_TO_TEXT } from './setting';
import { checkIsTextControl } from './type';

/**
 * 按关联控件显示配置查找标题字段，配置无效时回退到属性字段。
 */
export function getTitleControlId(control = {}) {
  let configuredTitleControlId;

  if (control.type === 29 || (control.type === 51 && control.enumDefault !== 1)) {
    configuredTitleControlId = _.get(control, 'advancedSetting.showtitleid');
  } else if (control.type === 51 && control.enumDefault === 1 && control.showControls?.[0]) {
    configuredTitleControlId = control.showControls[0];
  }

  const matchedTitleControl = find(control.relationControls, { controlId: configuredTitleControlId });
  const attributeTitle = find(control.relationControls, { attribute: 1 });
  return matchedTitleControl?.controlId || attributeTitle?.controlId;
}

/**
 * 从关联控件自身的字段列表中解析标题字段 ID。
 */
export function getTitleControlIdFromRelateControl(control = {}) {
  const configuredTitleControlId = _.get(control, 'advancedSetting.showtitleid');
  const matchedTitleControl = find(control.relationControls, { controlId: configuredTitleControlId });
  const attributeTitle = find(control.relationControls, { attribute: 1 });
  return matchedTitleControl?.controlId || attributeTitle?.controlId;
}

/**
 * 判断文本是否为空 JSON 结构的序列化结果（如成员、部门、关联记录等控件清空后的值）。
 */
function isEmptyStructuredText(value) {
  return _.isString(value) && _.includes(['[]', '{}', '[{}]'], value.trim());
}

/**
 * 渲染文本为空时，标题可回退使用的原始值。
 * 成员、部门、组织角色、关联记录等控件以 JSON 存值，值为空或数据残缺时原始值形如 '[]'、'[{...}]'，
 * 直接回退会把 JSON 当成标题显示（如标题显示成 []），这类值一律按空处理。
 */
function getTitleFallbackValue(control = {}) {
  const { value } = control;

  if (!_.isString(value)) {
    return value;
  }

  return /^\s*[[{]/.test(value) ? '' : value;
}

/**
 * 查找记录标题控件并渲染其文本，空标题统一回退为“未命名”。
 * @param  {} controls 所有控件
 * @param  {} data 控件所在记录数据[可选]
 */
export function getTitleTextFromControls(controls, data, titleSourceControlType, options = {}) {
  let titleControl = _.find(controls, control => control.attribute === 1) || {};

  if (titleSourceControlType) {
    titleControl.sourceControlType = titleSourceControlType;
  }

  if (titleControl && data) {
    titleControl = Object.assign({}, titleControl, { value: data[titleControl.controlId] || data.titleValue });
  }

  if (titleControl && _.includes([9, 10, 11, 40], titleControl.type)) {
    return renderText(titleControl, options) || _l('未命名');
  }

  return titleControl
    ? renderText(titleControl, options) || getTitleFallbackValue(titleControl) || _l('未命名')
    : _l('未命名');
}

/**
 * 按关联控件的标题显示配置解析关联记录标题，必要时补充选项数据。
 * @param  {} control 关联记录控件
 * @param  {} data 控件所在记录数据[可选]
 */
export function getTitleTextFromRelateControl(control = {}, data, options = {}) {
  const newTitleControlId = getTitleControlId(control);

  const matchedTitleControl = find(control.relationControls, { controlId: newTitleControlId });

  if (newTitleControlId && matchedTitleControl) {
    control = {
      ...control,
      ...(newTitleControlId
        ? {
            relationControls: control.relationControls.map(c => ({
              ...c,
              attribute: newTitleControlId === c.controlId ? 1 : 0,
            })),
          }
        : {}),
    };
  }

  // 关联记录的 name 由调用方按标题控件原始值拼装，成员、部门等控件清空后会拿到 '[]'，不能直接当标题
  if (data && data.name && !isEmptyStructuredText(data.name)) {
    return data.name;
  }

  // relationControls返回的选项没有options，在这里赋进去
  if (_.includes([9, 10, 11], control.sourceControlType)) {
    if (!_.isEmpty(control.options)) {
      control.relationControls.forEach(c => {
        if (c.attribute === 1 && isEmpty(c.options)) {
          c.options = control.options;
        }
      });
    }
  }

  return getTitleTextFromControls(control.relationControls, data, control.sourceControlType, options);
}

/**
 * 将各类控件原始值转换为适合界面展示的文本。
 */
export function renderText(cell, options = {}) {
  try {
    if (!cell) {
      return '';
    }

    if (cell.controlId === 'rowid' && /^(temp|empty|default|public-temp|deleterowids)/.test(cell.value)) {
      return '';
    }

    let { type, value = '', unit, advancedSetting = {} } = cell;
    let { suffix = '', prefix = '', thousandth } = advancedSetting;
    let selectedOptions = [];
    let parsedData;

    // 公式函数
    if (type === 53) {
      type = cell.enumDefault2;
    }

    if (type === 8 && _.includes(['1', '2'], advancedSetting.showformat)) {
      const { currencycode, symbol } = safeParse(advancedSetting.currency || '{}');
      suffix = '';
      prefix = advancedSetting.showformat === '1' ? symbol : currencycode;
    }

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

    if (_.includes([6, 31, 37], type) && cell.advancedSetting && cell.advancedSetting.numshow === '1' && value) {
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
      case 37: // SUBTOTAL 汇总
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
          console.log(err);
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
            value = formatNumberThousand(value);
          }
        }

        // 兼容百分比进度没有百分比符号
        if ((cell.advancedSetting || {}).numshow === '1') {
          suffix = '%';
        }

        if (!options.noMask && _.includes([6, 8], type) && _.get(cell, 'advancedSetting.datamask') === '1') {
          value = dealMaskValue({ ...cell, value }) || value;
        }

        value = (prefix ? `${prefix} ` : '') + value + (unit ? ` ${unit}` : suffix ? ` ${suffix}` : '');
        break;
      case 15: // DATE_INPUT 日期
      case 16: // DATE_INPUT 日期时间
        if (_.isEmpty(value)) {
          value = '';
        }

        const showFormat = _.includes(['ctime', 'utime', 'dtime'], cell.controlId)
          ? 'YYYY-MM-DD HH:mm:ss'
          : getShowFormat(cell);

        let dateTime = cell.value;

        if (type === 16 && !options.doNotHandleTimeZone) {
          dateTime =
            advancedSetting.timezonetype === '1'
              ? dateServerZoneToAppZone(cell.value, getAppTimeZone(options.appId))
              : dateConvertToUserZone(cell.value);
        }

        value = ['partal_regtime', 'dtime'].includes(cell.controlId)
          ? createTimeSpan(dateTime)
          : getDateToEn(showFormat, dateTime, advancedSetting.showformat);

        value = advancedSetting.showtimezone === '1' ? value + ' ' + getTimeZoneText(cell, options.appId) : value;
        break;
      case 46: // TIME 时间
        if (_.isEmpty(value)) {
          value = '';
        }

        const mode = cell.unit === '6' || cell.unit === '9' ? 'HH:mm:ss' : 'HH:mm';
        const tempValue = moment(value).year() ? moment(value).format(mode) : cell.value;
        value = moment(tempValue, 'HH:mm:ss').format(mode);
        break;
      case 38: // 日期公式
        if (_.isEmpty(value)) {
          value = '';
        }

        if (cell.enumDefault === 2) {
          const showFormat = getShowFormat({ advancedSetting: { ...advancedSetting, showtype: cell.unit || '1' } });
          const convertedTime = includes(showFormat, ':')
            ? dateConvertToUserZone(moment(cell.value, value.indexOf('-') > -1 ? undefined : showFormat))
            : moment(cell.value, value.indexOf('-') > -1 ? undefined : showFormat);
          value = moment(convertedTime).format(showFormat);
        } else {
          if (cell.advancedSetting.autocarry === '1') {
            value = (prefix ? `${prefix} ` : '') + formatFormulaDate({ value: cell.value, unit, dot: cell.dot });
          } else {
            const suffixValue = suffix || UNIT_TO_TEXT[unit] || '';
            value =
              (prefix ? `${prefix} ` : '') +
              toFixed(value, cell.dot) +
              (prefix ? '' : suffixValue ? ` ${suffixValue}` : '');
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
          console.log(err);
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
          console.log(err);
          value = '';
        }

        value =
          _.isObject(parsedData) && (parsedData.title || parsedData.address)
            ? `${parsedData.title || ''} ${parsedData.address || ''}`
            : '';
        break;
      // 组件
      case 9: // OPTIONS 单选 平铺
      case 10: // MULTI_SELECT 多选
      case 11: // OPTIONS 单选 下拉
        selectedOptions = getSelectedOptions(cell.options, cell.value, cell);
        value = selectedOptions
          .map(option => {
            if (option.key === 'other') {
              const otherValue = _.find(JSON.parse(cell.value || '[]'), i => i.includes(option.key));
              return otherValue === 'other' ? option.value : _.replace(otherValue, 'other:', '') || option.value;
            }

            return option.value;
          })
          .join(', ');
        break;
      case 26: // USER_PICKER 成员
        try {
          parsedData = JSON.parse(value);
        } catch (err) {
          console.log(err);
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
          console.log(err);
          value = '';
        }

        value = parsedData
          .map(department => (department.departmentName ? department.departmentName : _l('该部门已删除')))
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
          console.log(err);
          value = '';
        }

        value = parsedData.map(attachment => `${attachment.originalFilename + attachment.ext}`).join('、');
        break;
      case 35: // CASCADER 级联
        try {
          parsedData = JSON.parse(value);
        } catch (err) {
          console.log(err);
          parsedData = [];
        }

        if (!_.isArray(parsedData)) {
          parsedData = [];
        }

        value = parsedData.length ? parsedData.map(item => item.name || _l('未命名')).join(',') : '';
        break;
      case 29: // RELATESHEET 关联表
        try {
          parsedData = JSON.parse(value);
        } catch (err) {
          console.log(err);
          parsedData = [];
        }

        if (!_.isArray(parsedData)) {
          parsedData = [];
        }

        if (cell.enumDefault === 1 || _.get(cell, 'sourceControl.controlId')) {
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
          // 关联记录标题统一取每条记录的 name（与上面 enumDefault===1 分支一致）。
          // 标题控件按 sourceControlId → sourceTitleControlId（关联他表标题控件 ID）→ 标题属性控件 依次匹配，
          // 仅用于决定标题文本的类型格式化；即便匹配不到也照常渲染 name，避免把原始关联值 JSON 直接吐出来
          //（如把关联字段设为关联记录卡片显示字段时，sourceControlId 指向的控件不在 relationControls 里）。
          const titleControl =
            _.find(cell.relationControls, { controlId: cell.sourceControlId }) ||
            _.find(cell.relationControls, { controlId: cell.sourceTitleControlId }) ||
            _.find(cell.relationControls, { attribute: 1 });

          value = parsedData
            .map(
              record =>
                renderText(
                  _.assign({}, cell, {
                    type: (titleControl && titleControl.sourceControlType) || 2,
                    value: record.name,
                  }),
                  options,
                ) || _l('未命名'),
            )
            .join('、');
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
          console.log(err);
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
          console.log(err);
          value = '';
        }

        value = parsedData
          .map(organize => (organize.organizeName ? organize.organizeName : _l('该组织角色已删除')))
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
      ((type === 2 && cell.enumDefault === 2) || _.includes([3, 4, 5, 7], type)) &&
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
