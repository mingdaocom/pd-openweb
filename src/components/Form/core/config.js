import moment from 'moment';
import _ from 'lodash';

export const FORM_ERROR_TYPE = {
  REQUIRED: 'REQUIRED',
  MOBILE_PHONE: 'MOBILE_PHONE',
  TEL_PHONE: 'TEL_PHONE',
  EMAIL: 'EMAIL',
  ID_CARD: 'ID_CARD',
  PASSPORT: 'PASSPORT',
  HK_PASSPORT: 'HK_PASSPORT',
  TW_PASSPORT: 'TW_PASSPORT',
  UNIQUE: 'UNIQUE',
  NUMBER_RANGE: 'NUMBER_RANGE',
  MULTI_SELECT_RANGE: 'MULTI_SELECT_RANGE',
  DATE: 'DATE',
  DATE_TIME: 'DATE_TIME',
  TEXT_RANGE: 'TEXT_RANGE',
  CUSTOM: 'CUSTOM',
  DATE_TIME_RANGE: 'DATE_TIME_RANGE',
  RULE_ERROR: 'RULE_ERROR',
  OTHER_ERROR: 'OTHER_ERROR',
  RULE_REQUIRED: 'RULE_REQUIRED',
  OTHER_REQUIRED: 'OTHER_REQUIRED',
  CHILD_TABLE_ROWS_LIMIT: 'CHILD_TABLE_ROWS_LIMIT',
};

export const FORM_ERROR_TYPE_TEXT = {
  REQUIRED: ({ controlName: label, advancedSetting, type }) => {
    if (type === 36) {
      if (advancedSetting.showtype === '1') {
        return _l('请开启此项');
      } else if (advancedSetting.showtype === '2') {
        const itemNames = safeParse((advancedSetting || {}).itemnames || '[]');
        return _l(
          '请选择%0',
          _.get(
            _.find(itemNames, i => i.key === '1'),
            'value',
          ),
        );
      } else {
        return _l('请勾选此项');
      }
    }
    return `${_l('请填写%0', label)}`;
  },
  REQUIRED_SELECT: ({ controlName: label }) => {
    return `${_l('请选择%0', label)}`;
  },
  MOBILE_PHONE: _l('不是有效的手机号码'),
  TEL_PHONE: _l('不是有效的座机号码'),
  EMAIL: _l('不是有效的邮箱地址'),
  ID_CARD: _l('不是有效的身份证号码'),
  PASSPORT: _l('不是有效的护照号码'),
  HK_PASSPORT: _l('不是有效的港澳通行证号码'),
  TW_PASSPORT: _l('不是有效的台湾通行证号码'),
  OTHER_REQUIRED: ({ options = [] }) => {
    const value = _.get(
      _.find(options, i => i.key === 'other' && !i.isDeleted),
      'value',
    );
    return _l('请填写%0', value || '其他');
  },
  CHILD_TABLE_ROWS_LIMIT: ({ value, advancedSetting }) => {
    const { min, max, enablelimit } = advancedSetting;
    if (String(enablelimit) === '1') {
      const rowsLength = Number(
        (_.get(value, 'rows') && value.rows.filter(row => !(row.rowid || '').startsWith('empty')).length) ||
          (!_.isObject(value) ? value : 0) ||
          0,
      );
      if (_.isNumber(rowsLength) && !_.isNaN(rowsLength)) {
        if (_.isNumber(Number(min)) && !_.isNaN(Number(min)) && rowsLength < Number(min)) {
          return `${_l('请至少输入%0条记录', min)}`;
        } else if (_.isNumber(Number(max)) && !_.isNaN(Number(max)) && rowsLength > Number(max)) {
          return `${_l('最多输入%0条记录', max)}`;
        }
      }
    }
  },
  UNIQUE: () => {
    return _l('不允许重复');
  },
  NUMBER_RANGE: ({ value, advancedSetting }) => {
    const { min, max, numshow } = advancedSetting;
    // 百分比提示时，数值异化
    const showMin = numshow === '1' ? `${Number(min || 0) * 100}%` : min;
    const showMax = numshow === '1' ? `${Number(max || 0) * 100}%` : max;

    if (max === min) return _l('请输入%0', showMin);
    if (max && min) {
      if (+value > +max || +value < +min) return _l('请输入%0到%1之间的数值', showMin, showMax);
    }
    if (min && +value < +min) return _l('请输入大于等于%0的数', showMin);
    if (max && +value > +max) return _l('请输入小于等于%0的数', showMax);
  },
  MULTI_SELECT_RANGE: ({ value, advancedSetting }) => {
    const { min, max } = advancedSetting;
    const selectItemsCount = JSON.parse(value || '[]').length;

    if (max === min) return _l('请选择%0项', min);
    if (max && min) {
      if (selectItemsCount > +max || selectItemsCount < +min) return _l('请选择%0~%1项', min, max);
      return;
    }
    if (min && selectItemsCount < +min) return _l('最少选择%0项', min);
    if (max && selectItemsCount > +max) return _l('最多选择%0项', max);
  },
  DATE: ({ advancedSetting }) => {
    const allowweek = advancedSetting.allowweek || '1234567';
    const FIXED_WEEK = '1234567';
    const TEXT = ['', _l('周一'), _l('周二'), _l('周三'), _l('周四'), _l('周五'), _l('周六'), _l('周日')];

    if (allowweek && _.isArray(allowweek) && allowweek.length <= 4) {
      return _l(
        '请选择%0对应的日期',
        allowweek
          .split('')
          .map(o => TEXT[o])
          .join('、'),
      );
    } else {
      return _l(
        '请选择除%0以外的日期',
        FIXED_WEEK.split('')
          .filter(o => !(allowweek.indexOf(o) > -1))
          .map(o => TEXT[o])
          .join('、'),
      );
    }
  },
  DATE_TIME: ({ advancedSetting }) =>
    _l(
      '请填写（%0 ~ %1）范围内的时间',
      advancedSetting.allowtime.split('-')[0],
      advancedSetting.allowtime.split('-')[1],
    ),
  TEXT_RANGE: ({ value, advancedSetting }) => {
    const { min, max } = advancedSetting;
    const stringSize = (value || '').length;

    if (max === min) return _l('请输入%0个字', min);
    if (max && min) {
      if (stringSize > +max || stringSize < +min) return _l('请输入%0~%1个字', min, max);
      return;
    }
    if (min && stringSize < +min) return _l('最少输入%0个字', min);
    if (max && stringSize > +max) return _l('最多输入%0个字', max);
  },
  DATE_TIME_RANGE: (value, min, max, isTime) => {
    function computerValue(val) {
      const mode = isTime ? 'HH:mm:ss' : 'YYYY-MM-DD HH:mm:ss';
      return moment(val, mode);
    }
    if (max === min) return _l('请填写%0', min);
    if (max && min) {
      if (computerValue(value) > computerValue(max) || computerValue(value) < computerValue(min))
        return _l('请填写%0 ~ %1范围内的时间', min, max);
      return;
    }
    if (min && computerValue(value) < computerValue(min)) return _l('时间不能早于%0', min);
    if (max && computerValue(value) > computerValue(max)) return _l('时间不能晚于%0', max);
  },
};

export const FROM = {
  DEFAULT: 0,
  SHARE: 1,
  NEWRECORD: 2,
  RECORDINFO: 3,
  PUBLIC_ADD: 4, // 公开表单新增
  H5_ADD: 5,
  H5_EDIT: 6,
  WORKFLOW: 7, // 工作流
  CUSTOM_BUTTON: 8, // 自定义动作
  PUBLIC_EDIT: 9, // 公开表单编辑
  DRAFT: 21,
};

export const TIME_UNIT = {
  1: 'm',
  2: 'h',
  3: 'd',
  4: 'M',
  5: 'y',
  6: 's',
};

// 系统字段
export const SYSTEM_ENUM = [
  'uaid',
  'wfname',
  'wfcuaids',
  'wfcaid',
  'wfctime',
  'wfrtime',
  'wfftime',
  'wfstatus',
  'rowid',
  'ownerid',
  'caid',
  'ctime',
  'utime',
  'daid',
];

// 各控件取值id
export const WIDGET_VALUE_ID = {
  26: 'accountId',
  27: 'departmentId',
  29: 'sid',
  35: 'sid',
  48: 'organizeId',
};
