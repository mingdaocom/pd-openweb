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
  RULE_REQUIRED: 'RULE_REQUIRED',
  OTHER_REQUIRED: 'OTHER_REQUIRED',
};

export const FORM_ERROR_TYPE_TEXT = {
  REQUIRED: ({ controlName: label }) => {
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
  OTHER_REQUIRED: _l('请填写其他'),
  UNIQUE: ({ controlName: label }) => {
    return `${_l('%0不允许重复', label)}`;
  },
  NUMBER_RANGE: ({ value, advancedSetting }) => {
    const { min, max } = advancedSetting;

    if (max === min) return _l('请输入%0', min);
    if (max && min) {
      if (+value > +max || +value < +min) return _l('请输入%0到%1之间的数值', min, max);
    }
    if (min && +value < +min) return _l('请输入大于等于%0的数', min);
    if (max && +value > +max) return _l('请输入小于等于%0的数', max);
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
  CUSTOM: ({ advancedSetting }) => JSON.parse(advancedSetting.regex).err,
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
  PUBLIC: 4, // 公开表单
  H5_ADD: 5,
  H5_EDIT: 6,
  WORKFLOW: 7, // 工作流
  CUSTOM_BUTTON: 8, // 自定义动作
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

//非文本类控件
export const UN_TEXT_TYPE = [9, 10, 11, 15, 16, 19, 23, 24, 26, 27, 28, 29, 34, 35, 36, 45, 46, 47, 48];

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
