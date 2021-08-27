import moment from 'moment';
import _ from 'lodash';

import { ACCOUNT_FIELD } from '../../../constants';

/**
 * 日期时间格式化字符串
 */
const TimeFormat = {
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm',
};

/**
 * 转换 API 数据到表单数据
 */
class FormAdapter {
  /**
   * 禁用的控件
   */
  disabled = {};
  /**
   * 转换
   * @param {Array} data - 控件列表
   * @param {boolean} autoRow - 是否自动排列 row
   */
  convert = (data, autoRow, configs) => {
    let formData = [];

    const _autoRow = (configs && configs.autoRow) || autoRow;

    if (data && data.length) {
      formData = data.map((item, i, list) => {
        const control = this.convertControl(item, _autoRow, i, configs);

        return control;
      });
    }

    return formData;
  };

  /**
   * 转换控件数据
   * @param {Object} control - 控件
   * @param {number} autoRow - 是否自动排列 row
   * 1 - 每行一个
   * 2 - 每行两个
   * @param {number} i - 控件序号
   * @param {object} - 控件额外参数
   */
  convertControl = (control, autoRow, i, configs) => {
    // divider
    if (control.type === 22) {
      return {
        id: control.controlId,
        type: 'DIVIDER',
        label: control.controlName || '',
      };
    }

    let controlData = {
      type: 'TEXTVIEW',
      size: control.half ? 2 : 1,
      value: control.value,
      valueText: control.value,
      data: [],
      config: {},
      hint: '',
      disabled: control.disabled || false,
      validate: control.validate === undefined || control.validate,
    };

    const type = control.type;
    switch (type) {
      // FormGroup
      case 0: {
        controlData = this.convertToFormGroup(control);
        break;
      }
      // TextInput
      case 1:
      case 2:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8: {
        controlData = this.convertToTextInput(control);
        break;
      }
      // PhoneNumber
      case 3: {
        controlData = this.convertToPhoneNumber(control);
        break;
      }
      // RadioGroup
      case 9: {
        controlData = this.convertToRadioGroup(control);
        break;
      }
      // CheckBoxGroup
      case 10: {
        controlData = this.convertToCheckBoxGroup(control);
        break;
      }
      // Dropdown
      case 11: {
        controlData = this.convertToDropdown(control);
        break;
      }
      // FileAttachment
      case 14: {
        controlData = this.convertToFileAttachment(control);
        break;
      }
      // DateTime
      case 15:
      case 16: {
        controlData = this.convertToDateTime(control);
        break;
      }
      // DateTimeRange
      case 17:
      case 18: {
        controlData = this.convertToDateTimeRange(control);
        break;
      }
      // AreaPicker
      case 19:
      case 23:
      case 24: {
        controlData = this.convertToAreaPicker(control);
        break;
      }
      // TextView
      case 20:
      case 25:
      case 31:
      case 32:
      case 10001:
      case 10002:
      case 10003:
      case 10004:
      case 10005:
      case 10006:
      case 10007:
      case 10008:
      case 10009:
      case 10010: {
        controlData = this.convertToTextView(control);
        break;
      }
      // LinkPicker
      case 21: {
        controlData = this.convertToLinkPicker(control);
        break;
      }
      // UserPicker
      case 26: {
        controlData = this.convertToUserPicker(control, configs);
        break;
      }
      // DepartmentPicker
      case 27: {
        controlData = this.convertToDepartmentPicker(control);
        break;
      }
      // Range
      case 28: {
        controlData = this.convertToRange(control);
        break;
      }
      // RelateSheet
      case 29: {
        controlData = this.convertToRelateSheet(control);
        break;
      }
      // sheetField
      case 30: {
        controlData = this.convertToSheetField(control);
        break;
      }
      // autoid
      case 33: {
        if (!controlData.value) {
          controlData.valueText = _l('自动生成无需填写');
          controlData.value = _l('自动生成无需填写');
        }
        break;
      }
      // switch
      case 36: {
        controlData = this.convertToSwitch(control);
        break;
      }
      default: {
        //
      }
    }

    const controlId = control.controlId;
    switch (controlId) {
      // 职位
      // 职级
      // 合同公司
      // 工作地点
      case ACCOUNT_FIELD.POSITION:
      case ACCOUNT_FIELD.RANK:
      case ACCOUNT_FIELD.CONTRACT_COMPANY:
      case ACCOUNT_FIELD.WORK_SPACE: {
        controlData = this.convertToCompanyPicker(control);
        break;
      }
      default: {
        //
      }
    }

    let row = control.row;
    let col = control.col;
    let size = controlData.size;
    // 自动排列
    if (autoRow) {
      row = parseInt(i / autoRow, 10);
      col = i % autoRow;
      size = autoRow;
    }

    /**
     * 控件只读
     */
    if (control.editable === false) {
      controlData.disabled = true;
    }

    if (configs && configs[control.controlId]) {
      controlData.config = Object.assign({}, controlData.config, configs[control.controlId]);
    }

    // 工作性质
    if (control.controlId === ACCOUNT_FIELD.JOB_NATURE) {
      if (controlData.value !== '1') {
        // 设置试用期为空
        this.disabled[ACCOUNT_FIELD.PROBATIONARY_PERIO] = true;
      } else {
        this.disabled[ACCOUNT_FIELD.PROBATIONARY_PERIO] = false;
      }
    }
    // 试用期
    if (control.controlId === ACCOUNT_FIELD.PROBATIONARY_PERIO && this.disabled[control.controlId]) {
      controlData.value = '1';
      controlData.config.label = _l('无试用期');
      controlData.disabled = true;
    }

    const id =
      control.type === 0 // 明细
        ? control.formId
        : control.controlId;

    // 明细统计
    if (control.needEvaluate) {
      controlData.config.sum = true;
    }
    const newControlData = {
      id,
      label: control.controlName,
      row,
      col,
      attribute: control.attribute,
      required: control.required && !controlData.disabled,
      type: controlData.type,
      size,
      value: controlData.value,
      colored: controlData.colored,
      valueText: controlData.valueText,
      data: controlData.data,
      dataSource: controlData.dataSource,
      config: controlData.config,
      hint: controlData.hint,
      disabled: controlData.disabled,
      validate: controlData.validate,
      multipleLine: controlData.multipleLine,
      enumDefault: controlData.enumDefault,
      control,
    };
    if (control.type === 26) {
      newControlData.selectType = controlData.selectType;
    }
    if (control.type === 29 || control.type === 30) {
      newControlData.sourceControlId = controlData.sourceControlId;
    }
    if (control.type === 30) {
      newControlData.sourceControlType = controlData.sourceControlType;
      newControlData.options = controlData.options;
      newControlData.unit = controlData.unit;
    }
    if (control.workflowModifiedHighlight) {
      newControlData.workflowModifiedHighlight = true
    }
    newControlData.originType = type;
    return newControlData;
  };

  /**
   * 转换为 FormGroup，支持类型：
   * 0 - 明细
   */
  convertToFormGroup = (control) => {
    const controlData = {
      type: 'FORMGROUP',
      size: control.half ? 2 : 1,
      value: control.value || [],
      valueText: control.value || '',
      data: [],
      config: {
        values: [],
      },
      hint: control.hint || '',
      disabled: control.disabled || false,
    };

    if (control.type === 0) {
      controlData.config.label = control.controlName;

      if (control.data) {
        const data = control.data;
        // 获取明细数据
        if (data.controls) {
          const list = [];
          const valueList = [];

          data.controls.map((controls) => {
            const values = {};
            const valueData = {};
            const _controls = this.convert(controls);

            _controls.map((_control) => {
              values[_control.id] = _control.value;
              valueData[_control.id] = {
                value: _control.value,
                valueText: _control.valueText,
              };

              return null;
            });

            list.push(values);
            valueList.push(valueData);

            return null;
          });

          controlData.value = list;
          controlData.config.values = valueList;
        }

        // 获取明细表单
        if (data.tempControls) {
          controlData.data = this.convert(data.tempControls, 1);
        }
      }
    }

    return controlData;
  };

  /**
   * 转换为 TextInput，支持类型：
   * 2 - 文本框
   * 4 - 座机号码
   * 5 - 邮箱地址
   * 6 - 数值
   * 7 - 身份证、护照、港澳台通行证
   * 8 - 金额
   */
  convertToTextInput = (control) => {
    const controlData = {
      type: 'TEXTINPUT',
      size: control.half ? 2 : 1,
      value: control.value || '',
      valueText: control.value || '',
      data: [],
      config: {},
      hint: control.hint || '',
      disabled: control.disabled || false,
      attribute: control.attribute,
      validate: control.validate === undefined || control.validate,
      enumDefault: control.enumDefault,
      unique: control.unique,
    };

    if (control.type === 2) {
      controlData.multipleLine = true;
    } else if (control.type === 4) {
      // 4 - 座机号码
      controlData.config.valueType = 'telephone';
      controlData.size = 2;
    } else if (control.type === 5) {
      // 5 - 邮箱地址
      controlData.config.valueType = 'email';
      controlData.size = 2;
    } else if (
      control.type === 6 || // 6 - 数值
      control.type === 8
    ) {
      // 8 - 金额
      controlData.config.valueType = 'number';
      controlData.config.dot = control.dot;
      controlData.size = 2;

      if (control.unit) {
        controlData.config.unit = control.unit;

        controlData.valueText = `${controlData.value} ${controlData.config.unit}`;
      }
    } else if (control.type === 7) {
      // 7 - 身份证、护照、港澳台通行证
      controlData.size = 2;

      const valueTypes = [
        'id-card', // 1
        'passport', // 2
        'hk-passport', // 3
        'tw-passport', // 4
      ];

      if (control.enumDefault) {
        controlData.config.valueType = valueTypes[control.enumDefault - 1];
      }
    }

    return controlData;
  };

  /**
   * 转换为 PhoneNumber，支持类型：
   * 3 - 手机号码
   */
  convertToPhoneNumber = (control) => {
    const controlData = {
      type: 'PHONENUMBER',
      size: control.half ? 2 : 1,
      value: control.value || '',
      valueText: control.value || '',
      hint: control.hint || '',
      disabled: control.disabled || false,
      validate: control.validate === undefined || control.validate,
    };

    if (control.type === 3) {
      controlData.size = 2;
    }

    return controlData;
  };

  /**
   * 转换为 RadioGroup，支持类型：
   * 9 - 单选
   */
  convertToRadioGroup = (control) => {
    let value = '';
    if (control.value) {
      value = control.value;
    }
    // else if (control.default) {
    //   value = control.default;
    // }

    const controlData = {
      type: 'RADIOGROUP',
      size: control.half ? 2 : 1,
      value,
      valueText: '',
      data: [],
      config: {},
      hint: control.hint || '',
      colored: control.enumDefault2 === 1,
      disabled: control.disabled || false,
    };

    // options and valueText/config.label
    if (control.options && control.options.length) {
      controlData.data = control.options.map((item, i, list) => {
        const option = {
          value: item.key,
          label: item.value,
          isDeleted: item.isDeleted,
          color: item.color,
        };

        if (value === option.value) {
          controlData.valueText = option.label;
          controlData.config.label = controlData.valueText;
        }

        return option;
      });
    }

    return controlData;
  };

  /**
   * 转换为 CheckBoxGroup，支持类型：
   * 10 - 多选
   */
  convertToCheckBoxGroup = (control) => {
    let value = '';
    if (control.value) {
      value = control.value;
    }
    // else if (control.default) {
    //   value = control.default;
    // }

    // convert value
    const data = {};
    const length = value.length;
    for (let i = 0; i < length; i++) {
      if (value[i] === '1') {
        const key = ['1'];
        while (key.length < length - i) {
          key.push('0');
        }

        data[key.join('')] = true;
      }
    }

    const controlData = {
      type: 'CHECKBOXGROUP',
      size: control.half ? 2 : 1,
      value: data,
      valueText: '',
      data: [],
      config: {},
      hint: control.hint || '',
      colored: control.enumDefault2 === 1,
      disabled: control.disabled || false,
    };

    // options and valueText/config.label
    if (control.options && control.options.length) {
      const labels = [];

      controlData.data = control.options.map((item, i, list) => {
        const option = {
          value: item.key,
          label: item.value,
          isDeleted: item.isDeleted,
          color: item.color,
        };

        if (data[option.value]) {
          labels.push(option.label);
        }

        return option;
      });

      controlData.valueText = labels.join(', ');
      controlData.config.label = controlData.valueText;
    }

    return controlData;
  };

  /**
   * 转换为 Dropdown，支持类型：
   * 11 - 单选下拉菜单
   */
  convertToDropdown = (control) => {
    const controlData = {
      type: 'DROPDOWN',
      size: control.half ? 2 : 1,
      value: null,
      valueText: '',
      data: [],
      config: {
        dataSource: '',
        label: '',
      },
      hint: control.hint || '',
      colored: control.enumDefault2 === 1,
      disabled: control.disabled,
    };

    if (control.type === 11) {
      controlData.size = 2;
    }

    // 数据源
    if (control.dataSource) {
      controlData.config.dataSource = control.dataSource;

      // value/valueText/config.label
      if (control.value) {
        controlData.value = control.value;

        try {
          const data = JSON.parse(control.value);
          data.label = JSON.parse(data.label);

          if (data.label && data.label.length) {
            controlData.valueText = data.label.join('/');
            controlData.config.label = controlData.valueText;
          }
        } catch (e) {
          //
        }
      }
    } else {
      const value = control.value;
      // if (control.value) {
      //   value = control.value;
      // } else if (control.default) {
      //   value = control.default;
      // }

      controlData.value = value;

      // options and valueText/config.label
      if (control.options && control.options.length) {
        controlData.data = control.options.map((item, i, list) => {
          const option = {
            value: item.key,
            label: item.value,
            disabled: item.disabled,
            isDeleted: item.isDeleted,
            color: item.color,
          };

          // unitType 请假类型的时间单位
          if (item.unitType !== undefined) {
            option.unitType = item.unitType;
          }

          if (value === option.value) {
            controlData.valueText = option.label;
            controlData.config.label = controlData.valueText;
          }

          return option;
        });
      }
    }

    return controlData;
  };

  /**
   * 转换为 FileAttachment，支持类型：
   * 14 - 附件
   */
  convertToFileAttachment = (control) => {
    const controlData = {
      type: 'FILEATTACHMENT',
      size: control.half ? 2 : 1,
      value: null,
      valueText: '',
      data: [],
      config: {},
      hint: control.hint || '',
      disabled: control.disabled || false,
    };

    if (control.value && _.isString(control.value)) {
      try {
        const data = JSON.parse(control.value);

        controlData.value = data;
      } catch (e) {
        //
      }
    } else {
      controlData.value = control.value;
    }

    return controlData;
  };

  /**
   * 转换为 DateTime，支持类型：
   * 15 - 日期
   * 16 - 日期时间
   */
  convertToDateTime = (control) => {
    const controlData = {
      type: 'DATETIME',
      size: control.half ? 2 : 1,
      value: null,
      valueText: '',
      data: [],
      config: {
        type: 'date',
        label: '',
      },
      hint: control.hint || '',
      disabled: control.disabled || false,
    };

    if (control.type === 15 || control.type === 16) {
      controlData.size = 2;
    }

    if (control.type === 16) {
      controlData.config.type = 'datetime';
    }

    if (control.value) {
      if (_.isString(control.value)) {
        controlData.value = new Date(control.value.replace(/-/g, '/')).getTime();
      } else if (_.isNumber(control.value)) {
        controlData.value = control.value;
      }
    }

    // valueText/config.label
    if (controlData.value) {
      try {
        controlData.value = parseInt(controlData.value, 10);

        let format = TimeFormat.DATE;
        if (controlData.config.type && controlData.config.type === 'datetime') {
          format = TimeFormat.DATETIME;
        }

        const time = new Date(controlData.value);
        controlData.valueText = moment(time).format(format);

        controlData.config.label = controlData.valueText;
      } catch (e) {
        //
      }
    }

    return controlData;
  };

  /**
   * 转换为 DateTimeRange，支持类型：
   * 17 - 日期
   * 18 - 日期时间
   */
  convertToDateTimeRange = (control) => {
    const controlData = {
      type: 'DATETIMERANGE',
      size: control.half ? 2 : 1,
      value: null,
      valueText: '',
      data: [],
      config: {
        type: 'date',
        label: '',
        length: false, // 显示时长
      },
      hint: control.hint || '',
      disabled: control.disabled || false,
    };

    const SignType = {
      DATETIMERANGE: '0', // 日期时间段
      LEAVE: '1', // 请假
      OVERTIME: '4', // 加班
      FIELDWORK: '5', // 出差
    };

    if (!control.dataSource || control.dataSource === SignType.DATETIMERANGE || _.isString(control.value)) {
      // DATETIMERANGE
      if (control.type === 18) {
        controlData.config.type = 'datetime';
      }

      if (control.value) {
        if (control.value.split) {
          controlData.value = control.value.split(',');
        } else {
          controlData.value = control.value;
        }
      }

      if (controlData.value && controlData.value.length === 4) {
        controlData.config.type = 'datehalf';
      }

      if (control.enumDefault2) {
        controlData.config.length = true;
      }

      // valueText/config.label
      if (controlData.value && controlData.value.length) {
        try {
          const value = [controlData.value[0] ? new Date(parseInt(controlData.value[0], 10)) : '', controlData.value[1] ? new Date(parseInt(controlData.value[1], 10)) : ''];
          if (controlData.value.length === 4) {
            value.push(controlData.value[2]);
            value.push(controlData.value[3]);
          }
          controlData.value = value;

          let format = TimeFormat.DATE;
          if (controlData.config.type && controlData.config.type === 'datetime') {
            format = TimeFormat.DATETIME;
          }

          // length
          let lengthText = '';
          if (controlData.config.length && controlData.value.length >= 2) {
            const start = moment(controlData.value[0]);
            const end = moment(controlData.value[1]);

            const unit = _l('天');
            const length = end.diff(start, 'days') + 1;
            lengthText = ` ${_l('时长')}: ${controlData.value[0] && controlData.value[1] ? length : '—'} ${unit}`;
            if (controlData.config.type === 'datetime') {
              const time = (new Date(value[1]).getTime() - new Date(value[0]).getTime());
              // 计算出相差天数
              const days = Math.floor(time / (24 * 3600 * 1000));
              // 计算出小时数
              const leave1 = time % (24 * 3600 * 1000)
              // 计算天数后剩余的毫秒数
              const hours = Math.floor(leave1 / (3600 * 1000));
              // 计算相差分钟数
              const leave2 = leave1 % (3600 * 1000);
              // 计算小时数后剩余的毫秒数
              const minutes = Math.floor(leave2 / (60 * 1000));
              // 计算相差秒数
              const leave3 = leave2 % (60 * 1000);
              // 计算分钟数后剩余的毫秒数
              const seconds = Math.round(leave3 / 1000);

              lengthText = ` ${_l('时长')}: ${days > 0 ? _l('%0天', days) : ''} ${hours > 0 ? _l('%0小时', hours) : ''} ${minutes > 0 ? _l('%0分钟', minutes) : ''} `;
              // alert(" 相差 "+days+"天 "+hours+"小时 "+minutes+" 分钟")
            }
          }

          const startTime = controlData.value[0] ? moment(new Date(controlData.value[0])).format(format) : '—';
          const endTime = controlData.value[1] ? moment(new Date(controlData.value[1])).format(format) : '—';
          if (controlData.config.type === 'datehalf' && value.length === 4) {
            controlData.config.label = `${startTime} ${controlData.value[2]} ~ ${endTime} ${controlData.value[3]}`;
          } else {
            controlData.config.label = `${startTime} ~ ${endTime}${lengthText}`;
          }
          controlData.valueText = controlData.config.label;
        } catch (e) {
          //
        }
      }
    } else {
      // SIGNGROUP
      controlData.type = 'SIGNGROUP';
      controlData.size = 1;
      controlData.config.id = control.controlId;
      controlData.config.type = control.dataSource;

      let controls = [];
      const values = {};
      if (control.value && control.value.length) {
        controls = this.convert(control.value, 1);

        controls.map((item) => {
          if (item.id) {
            values[item.id] = item.value;
          }
          return null;
        });
      }

      controlData.data = controls;
      controlData.value = values;
    }

    return controlData;
  };

  /**
   * 转换为 AreaPicker，支持类型：
   * 19 - 省
   * 23 - 省-市
   * 24 - 省-市-县区
   */
  convertToAreaPicker = (control) => {
    const controlData = {
      type: 'AREAPICKER',
      size: control.half ? 2 : 1,
      value: '',
      valueText: '',
      config: {
        type: 'district',
        label: '',
      },
      hint: control.type === 19 ? _l('省') : control.type === 23 ? _l('省-市') : _l('省-市-县') || '',
      disabled: control.disabled || false,
    };

    if (control.type === 19 || control.type === 23 || control.type === 24) {
      controlData.size = 2;
    }

    if (control.type === 19) {
      controlData.config.type = 'province';
    } else if (control.type === 23) {
      controlData.config.type = 'city';
    }

    if (control.value) {
      if (control.value.split) {
        controlData.value = control.value.split('/').join(' / ');
        controlData.valueText = controlData.value;
        controlData.config.label = controlData.value;
      } else if (_.isArray(control.value)) {
        controlData.value = control.value;

        const list = control.value.map((item) => {
          return item.name;
        });

        controlData.valueText = list.join(' / ');
        controlData.config.label = list.join(' / ');
      }
    }

    return controlData;
  };

  /**
   * 转换为 TextView，支持类型：
   * 20 - 公式
   * 25 - 大写金额
   * 10001 ~ 10009 - 只读
   * 10010 - 备注
   */
  convertToTextView = (control) => {
    const controlData = {
      type: 'TEXTVIEW',
      size: control.half ? 2 : 1,
      value: control.type === 10010 ? control.dataSource || control.value : control.value || '',
      valueText: control.value || '',
      config: {
        prefix: '',
        suffix: '',
      },
    };

    // 只读控件
    const disabledTypes = [10001, 10002, 10003, 10004, 10005, 10006, 10007, 10008, 10009];

    if (control.type === 20) {
      controlData.size = 2;
      controlData.config.suffix = control.unit ? ` ${control.unit}` : '';
      controlData.config.formula = control.dataSource || '';

      controlData.valueText = `${controlData.value}${controlData.config.suffix}`;
    } else if (control.type === 25) {
      controlData.size = 2;
      controlData.hint = control.hint || '';

      if (control.dataSource) {
        controlData.config.moneyId = control.dataSource.replace(/\$/g, '');
      }
    } else if (control.type === 10010) {
      controlData.size = 1;
    } else if (disabledTypes.indexOf(control.type) >= 0) {
      controlData.size = 2;
    } else if (control.type === 30) {
      controlData.dataSource = control.dataSource;
    } else if (control.type === 31) {
      controlData.config.unit = control.unit;
      controlData.config.suffix = control.unit;
      controlData.config.dot = control.dot;
      controlData.config.formulaStr = control.dataSource;
      controlData.valueText = `${controlData.value} ${controlData.config.unit}`;
    } else if (control.type === 32) {
      controlData.config.concatnateTpl = control.dataSource;
    }

    return controlData;
  };

  /**
   * 转换为 LinkPicker，支持类型：
   * 21 - 关联
   */
  convertToLinkPicker = (control) => {
    const controlData = {
      type: 'LINKPICKER',
      size: control.half ? 2 : 1,
      value: control.value || [],
      valueText: '',
      config: {
        type: [],
        max: 100,
      },
      hint: control.hint || '',
      disabled: control.disabled || false,
    };

    if (control.type === 21) {
      if (control.enumDefault) {
        controlData.config.type = [control.enumDefault];
      }
    }

    return controlData;
  };

  /**
   * 转换为 UserPicker，支持类型：
   * 26 - 人员选择
   */
  convertToUserPicker = (control, configs = {}) => {
    const controlData = {
      type: 'USERPICKER',
      size: control.half ? 2 : 1,
      value: control.value || '',
      valueText: '',
      config: {
        label: '',
        type: 'default',
      },
      selectType: control.enumDefault,
      hint: control.hint || '',
      disabled: control.disabled || false,
    };
    if (configs.isAdd && !control.value && control.defaultMen && control.defaultMen.length) {
        control.value = control.defaultMen.map((user) => {
          const userData = JSON.parse(user);
          return {
            accountId: userData.accountId,
            avatar: userData.avatar,
            fullname: userData.name,
          };
        });
        controlData.value = control.value;
    }
    if (control.value) {
      if (_.isString(control.value)) {
        try {
          const data = JSON.parse(control.value);
          if (data.fullname) {
            controlData.valueText = data.fullname;
          }
        } catch (e) {
          //
        }
      } else if (_.isObject(control.value) && control.value.fullname) {
        controlData.valueText = control.value.fullname;
      } else if (_.isArray(control.value)) {
        const nameArr = control.value.map(item => item.fullname);
        controlData.valueText = nameArr.join('、');
      }
      controlData.config.label = controlData.valueText;
    }

    if (control.controlId === ACCOUNT_FIELD.IMMEDIATE_SUPERIOR) {
      controlData.config.type = 'leader';
    }

    return controlData;
  };

  /**
   * 转换为 DepartmentPicker，支持类型：
   * 27 - 部门选择
   */
  convertToDepartmentPicker = (control) => {
    const controlData = {
      type: 'DEPARTMENTPICKER',
      size: control.half ? 2 : 1,
      value: control.value || '',
      valueText: '',
      config: {
        label: '',
      },
      hint: control.hint || '',
      disabled: control.disabled || false,
    };

    if (control.type === 27) {
      controlData.size = 2;
    }

    if (control.value) {
      if (_.isString(control.value)) {
        try {
          const data = JSON.parse(control.value);
          if (data.departmentName) {
            controlData.valueText = data.departmentName;
          }
        } catch (e) {
          //
        }
      } else if (_.isObject(control.value) && control.value.departmentName) {
        controlData.valueText = control.value.departmentName;
      }
      controlData.config.label = controlData.valueText;
    }

    return controlData;
  };

  /**
   * 转换为 CompanyPicker，支持类型：
   * 职位
   * 职级
   * 合同公司
   */
  convertToCompanyPicker = (control) => {
    let type = 'job';
    if (control.controlId === ACCOUNT_FIELD.RANK) {
      type = 'jobGrade';
    } else if (control.controlId === ACCOUNT_FIELD.CONTRACT_COMPANY) {
      type = 'company';
    } else if (control.controlId === ACCOUNT_FIELD.WORK_SPACE) {
      type = 'workSpace';
    }

    const controlData = {
      type: 'COMPANYPICKER',
      size: control.half ? 2 : 1,
      value: control.value || '',
      valueText: '',
      config: {
        label: '',
        type,
      },
      hint: control.hint || '',
      disabled: control.disabled || false,
    };

    if (control.value) {
      controlData.valueText = control.value.name;
      controlData.config.label = control.value.name;
    }

    return controlData;
  };

  /**
   * 转换为 Range，支持类型：
   * 28 - 等级
   */
  convertToRange = (control) => {
    const controlData = {
      type: 'RANGE',
      size: 1,
      value: control.value || null,
      config: {
        min: 1,
        max: 5,
        step: 1,
        type: 'star', // star|bar
      },
      disabled: control.disabled || false,
    };

    if (control.type === 28) {
      controlData.value = parseInt(control.value, 10);

      if (control.enumDefault === 2) {
        controlData.config.max = 10;
        controlData.config.type = 'bar';
      }
    }

    return controlData;
  };
  /**
   * 转换为 RelateSheet，支持类型：
   * 29 - 关联他表
   */
  convertToRelateSheet = (control) => {
    const controlData = {
      type: 'RELATESHEET',
      size: control.half ? 2 : 1,
      value: control.value || [],
      valueText: '',
      config: {
        label: '',
      },
      hint: control.hint || '',
      disabled: control.disabled || false,
      enumDefault: control.enumDefault,
      dataSource: control.dataSource,
      sourceControlId: control.sourceControlId,
    };

    return controlData;
  };
  /**
   * 转换为 SheetField，支持类型：
   * 30 - 他表字段
   */
  convertToSheetField = (control) => {
    const controlData = {
      type: 'SHEETFIELD',
      size: control.half ? 2 : 1,
      value: control.value || '',
      hint: control.hint || '',
      disabled: true,
      unit: control.unit,
      dataSource: control.dataSource,
      enumDefault: control.enumDefault,
      sourceControlId: control.sourceControlId,
      sourceControlType: control.sourceControlType,
      options: control.options,
    };

    return controlData;
  };
    /**
   * 转换为 Switch，支持类型：
   * 36 - Switch字段
   */
  convertToSwitch = (control) => {
    const controlData = {
      type: 'SWITCH',
      size: control.half ? 2 : 1,
      value: control.value || '',
      disabled: control.disabled || false,
    };

    return controlData;
  };
}

export default new FormAdapter();
