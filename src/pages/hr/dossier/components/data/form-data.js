/**
 * 控件参数
 */
/**
 * 控件参数
 */
import React from 'react';

const item = {
  /**
   * 控件 ID
   */
  id: 'id',
  /**
   * 控件类型
   * 'TEXTINPUT' - 文本框
   * 'RADIOGROUP' - 单选按钮组
   * 'DROPDOWN' - 下拉菜单
   * 'DATETIME' - 日期时间
   * 'DATETIMERANGE' - 日期时间段
   * 'USERPICKER' - 用户选择
   */
  type: 'TEXTINPUT',
  /**
   * 行
   */
  row: 0,
  /**
   * 列
   */
  col: 0,
  /**
   * 显示大小
   * 1 - 整行
   * 2 - 半行
   */
  size: 1,
  /**
   * 控件名称
   */
  label: 'label',
  /**
   * 控件值
   */
  value: 'value',
  /**
   * 值的展示文本
   */
  valueText: 'value',
  /**
   * 控件附加参数（选项列表等）
   */
  data: [
    //
  ],
  /**
   * 控件配置参数
   */
  cofig: {
    //
  },
  /**
   * 提示文本
   */
  hint: 'hint',
  /**
   * 是否必填
   */
  required: false,
  /**
   * 是否禁用
   */
  disabled: false,
};

/**
 * 分隔数据
 */
const divider = {
  /**
   * 类型
   */
  type: 'DIVIDER',
  /**
   * 名称
   */
  label: 'label',
};

const FormData = [
  {
    id: '111',
    type: 'TEXTINPUT',
    row: 1,
    col: 0,
    label: 'TEXTINPUT',
    value: 'textinput',
    valueText: 'textinput',
    required: true,
  },
  {
    id: '222',
    type: 'TEXTINPUT',
    row: 2,
    col: 0,
    size: 2,
    label: 'TEXTINPUT',
    value: 'textinput',
    valueText: 'textinput',
    required: true,
    hint: 'hinttext',
  },
  {
    id: '333',
    type: 'TEXTINPUT',
    row: 2,
    col: 1,
    size: 2,
    label: 'TEXTINPUT',
    required: true,
    value: 'textinput',
    valueText: 'textinput',
  },
  {
    type: 'DIVIDER',
    row: 0,
    col: 0,
    label: 'DIVIDER',
  },
  {
    id: '444',
    type: 'RADIOGROUP',
    row: 3,
    col: 0,
    size: 2,
    label: 'RADIOGROUP',
    value: 2,
    valueText: 'BBB',
    data: [
      {
        label: 'AAABBBCCCDDD',
        value: 1,
      },
      {
        label: 'BBB',
        value: 2,
      },
      {
        label: 'CCC',
        value: 3,
      },
      {
        label: 'DDD',
        value: 4,
      },
      {
        label: 'EEE',
        value: 5,
      },
    ],
    config: {
      label: 'BBB',
      display: 'grid',
      itemsInSingleRow: 2,
    },
  },
  {
    id: '555',
    type: 'DROPDOWN',
    row: 3,
    col: 1,
    size: 2,
    label: 'DROPDOWN',
    value: 2,
    valueText: 'BBB',
    data: [
      {
        label: 'AAABBBCCCDDD',
        value: 1,
      },
      {
        label: 'BBB',
        value: 2,
      },
      {
        label: 'CCC',
        value: 3,
      },
      {
        label: 'DDD',
        value: 4,
      },
      {
        label: 'EEE',
        value: 5,
      },
    ],
    config: {
      label: 'BBB',
    },
  },
  {
    id: '666',
    type: 'DATETIME',
    row: 4,
    col: 0,
    size: 2,
    label: 'DATETIME',
    value: new Date('2017-08-04T10:48:00'),
    valueText: '2017-08-04 10:48',
    config: {
      type: 'datetime',
      label: '2017-08-04 10:48',
    },
  },
  {
    id: '777',
    type: 'DATETIMERANGE',
    row: 4,
    col: 1,
    size: 2,
    label: 'DATETIMERANGE',
    value: [new Date('2017-08-04T10:48:00'), new Date('2017-09-04T10:48:00')],
    valueText: '2017-08-04 10:48 ~ 2017-09-04 10:48',
    config: {
      type: 'datetime',
      label: '2017-08-04 10:48 ~ 2017-09-04 10:48',
    },
  },
  {
    id: '888',
    type: 'USERPICKER',
    row: 5,
    col: 0,
    size: 2,
    label: 'USERPICKER',
    value: '',
    valueText: '陈鹏',
    config: {
      label: '陈鹏',
    },
  },
  {
    id: '999',
    type: 'AREAPICKER',
    row: 5,
    col: 1,
    size: 2,
    label: 'AREAPICKER',
    value: '',
    valueText: '北京',
    config: {
      label: '北京',
    },
  },
  {
    id: '010',
    type: 'DEPARTMENTPICKER',
    row: 6,
    col: 0,
    size: 2,
    label: 'DEPARTMENTPICKER',
    value: '',
    valueText: '研发部',
    config: {
      label: '研发部',
    },
  },
  {
    id: '011',
    type: 'PHONENUMBER',
    row: 6,
    col: 1,
    size: 2,
    label: 'PHONENUMBER',
    value: '+8613012341234',
    valueText: '+8613012341234',
  },
  {
    id: '012',
    type: 'COMPONENT',
    row: 7,
    col: 0,
    size: 2,
    label: 'COMPONENT',
    value: <div>COMPONENT</div>,
  },
  {
    id: '013',
    type: 'TEXTVIEW',
    row: 7,
    col: 1,
    size: 2,
    label: 'TEXTVIEW',
    value: 'text',
  },
];

export default FormData;
