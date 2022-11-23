import PropTypes from 'prop-types';
import React, { Component } from 'react';
import moment from 'moment';
import _ from 'lodash';
import nzh from 'nzh';
import cx from 'classnames';
import { Parser } from 'hot-formula-parser';

import './style.less';

// import AjaxRequest from 'src/api/form.js';
import FormControl from '../form-control';
import Divider from '../divider';
import FormItem from '../form-item';
import { Birthday, Calc, parseColumnToText } from '../lib';

import { ACCOUNT_FIELD } from '../../constants';

const nzhCn = nzh.cn;

const TYPES = ['workSheet', 'workflow', 'task'];

const ControlTypes = FormControl.types.concat(['DIVIDER']);

/**
 * 日期时间格式化字符串
 */
const TimeFormat = {
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm',
};

class FormContainer extends Component {
  constructor(props) {
    super(props);

    const calcData = this.parseCalc(this.props.data);

    this.state = {
      /**
       * 表单数据
       */
      data: this.props.data || null,
      /**
       * 公式 ID
       */
      calcId: calcData.calcId,
      /**
       * 公式关联 ID
       */
      calcRelId: calcData.calcRelId,
      /**
       * 大写金额 ID
       */
      moneyCnId: calcData.moneyCnId,
      /**
       * 大写金额关联 ID
       */
      moneyCnRelId: calcData.moneyCnRelId,
    };

    // 表单值
    this.values = {};

    // 错误列表
    this.errorData = {};
  }

  componentDidMount() {
    if (this.state.moneyCnRelId && this.state.moneyCnRelId.length) {
      this.runMoneyCn(this.state.data);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (_.includes(TYPES, nextProps.moduleType)) {
      this.setState({ data: nextProps.data });
    } else {
      if (nextProps.data && Array.isArray(nextProps.data)) {
        const components = nextProps.data.filter(item => item.type === FormControl.type.COMPONENT);
        if (components.length) {
          const ids = components.map(item => item.id);
          const data = this.state.data.map((item) => {
            const index = ids.indexOf(item.id);
            if (index >= 0) {
              return components[index];
            }
            return item;
          });

          this.setState({
            data,
          });
        }
      }
    }
  }

  parseCalc = (list) => {
    const calcId = {};
    let calcRelId = [];

    const moneyCnId = {};
    let moneyCnRelId = [];

    list.map((item, i) => {
      // 公式
      if (item.type === FormControl.type.TEXTVIEW && item.config && item.config.formula) {
        const ids = this.parseFormula(item.config.formula);

        calcId[item.id] = {
          formula: item.config.formula,
          ids,
        };

        calcRelId = calcRelId.concat(ids);
      }
      // 大写金额
      if (item.type === FormControl.type.TEXTVIEW && item.config && item.config.moneyId) {
        moneyCnId[item.id] = item.config.moneyId;

        moneyCnRelId = moneyCnRelId.concat(item.config.moneyId);
      }

      return null;
    });

    return {
      calcId,
      calcRelId,
      moneyCnId,
      moneyCnRelId,
    };
  };

  parseFormula = (str) => {
    const ids = {};

    let index = str.indexOf('$');
    if (str.length >= 2) {
      str = str.substring(index + 1);
    }

    while (index >= 0) {
      const next = str.indexOf('$');

      const id = str.substring(0, next);
      if (!ids[id]) {
        ids[id] = true;
      }

      index = str.indexOf('$', next + 1);
      str = str.substring(index + 1);
    }

    const list = [];
    for (const key in ids) {
      if (key) {
        list.push(key);
      }
    }

    return list;
  };

  runCalc = (list, id, value) => {
    const values = {};

    list.map((item) => {
      if (item.id) {
        values[item.id] = item.value;
      }

      return null;
    });

    if (id) {
      values[id] = value;
    }

    // 全部关联控件的值
    const _values = this.calc(values, Object.keys(this.state.calcId));

    // 更新指定控件的值
    const newList = [];
    list.map((item) => {
      const _item = _.cloneDeep(item);

      // 公式
      if (_item.type === FormControl.type.TEXTVIEW && _item.config && _item.config.formula) {
        if (_item.id && _values[_item.id]) {
          _item.value = _values[_item.id].toString();

          this.values[_item.id] = _values[_item.id].toString();
        } else {
          _item.value = '';

          this.values[_item.id] = '';
        }

        if (this.props.onChange) {
          this.props.onChange(null, _item.id, this.values, {});
        }
      }

      newList.push(_item);

      return null;
    });

    this.setState({
      data: newList,
    });
  };

  /**
   * 递归计算公式
   * @param {Object} values - 上一轮计算后的控件值
   * @param {Array} ids - 待计算的公式控件 ID 列表
   */
  calc = (values, ids) => {
    // 计算后的控件值
    const _values = _.cloneDeep(values);
    // 下一轮公式控件 ID 列表
    const _ids = [];

    for (const id in this.state.calcId) {
      if (id) {
        const item = this.state.calcId[id];

        // 计算 ids 列表对应的公式
        if (ids.indexOf(id) >= 0) {
          // 计算公式
          let formula = item.formula;
          item.ids.map((_id) => {
            const reg = new RegExp(`\\$${_id}\\$`, 'g');

            formula = formula.replace(/\n|\s/g, '').replace(reg, values[_id] || 'null');

            return null;
          });

          value = null;
          _values[id] = value;
        }

        // 获取关联公式 ID
        let match = false;
        item.ids.map((_id) => {
          if (ids.indexOf(_id) >= 0) {
            match = true;
          }

          return null;
        });

        if (match) {
          _ids.push(id);
        }
      }
    }

    if (ids.length) {
      return this.calc(_values, _ids);
    }

    return _values;
  };

  runMoneyCn = (list, id, value) => {
    if ((id && this.state.moneyCnRelId.indexOf(id) < 0) || !this.state.moneyCnRelId.length) {
      return {};
    }

    const values = {};

    list.map((item) => {
      if (item.id) {
        values[item.id] = item.value;
      }

      return null;
    });

    if (id) {
      values[id] = value;
    }

    const data = {};
    for (const key in this.state.moneyCnId) {
      if (this.state.moneyCnId[key]) {
        const target = this.state.moneyCnId[key];

        if (values[target]) {
          data[key] = nzhCn.toMoney(values[target]).substring(3);
        }
      }
    }

    return data;
  };

  formItemOnChange = (event, id, value, data) => {
    // apply changes
    const newData = [];
    const formData = {};
    const { moduleType } = this.props;

    this.state.data.map((item, i, list) => {
      const _item = _.cloneDeep(item);

      if (_item.id === id) {
        this.values[_item.id] = value;
        if (_item.type !== 'PHONENUMBER') {
          _item.value = value;
        }

        if (!_item.config) {
          _item.config = {};
        }

        // get item.config.label
        if (_item.type === FormControl.type.DROPDOWN) {
          // Dropdown
          if (_item.config && _item.config.multipleSelect) {
            _item.config.label = data.label.join(' / ');
          } else {
            _item.config.label = data.label;
          }
        } else if (_item.type === FormControl.type.DATETIME) {
          // DateTime
          if (!value) {
            _item.config.label = '';
          } else {
            let format = TimeFormat.DATE;
            if (_item.config.type && _item.config.type === 'datetime') {
              format = TimeFormat.DATETIME;
            }

            _item.config.label = moment(value).format(format);
          }
        } else if (_item.type === FormControl.type.DATETIMERANGE) {
          // DateTimeRange
          if (!value || value.length !== 2) {
            _item.config.label = '';
          } else {
            let format = TimeFormat.DATE;
            if (_item.config.type && _item.config.type === 'datetime') {
              format = TimeFormat.DATETIME;
            }

            // length
            let lengthText = '';
            if (item.config.length && value.length >= 2) {
              const start = moment(new Date(value[0]));
              const end = moment(new Date(value[1]));

              const unit = _l('天');
              const length = end.diff(start, 'days') + 1;
              lengthText = ` ${_l('时长')}: ${length} ${unit}`;
              if (item.config.type === 'datetime') {
                const time = new Date(value[1]).getTime() - new Date(value[0]).getTime();
                // 计算出相差天数
                const days = Math.floor(time / (24 * 3600 * 1000));
                // 计算出小时数
                const leave1 = time % (24 * 3600 * 1000);
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

                lengthText = ` ${_l('时长')}: ${days > 0 ? _l('%0天', days) : ''} ${hours > 0 ? _l('%0小时', hours) : ''} ${
                  minutes > 0 ? _l('%0分钟', minutes) : ''
                } `;
                // alert(" 相差 "+days+"天 "+hours+"小时 "+minutes+" 分钟")
              }
            }

            _item.config.label = `${moment(value[0]).format(format)} ~ ${moment(value[1]).format(format)}${lengthText}`;
          }
        } else if (_item.type === FormControl.type.USERPICKER) {
          // UserPicker
          if (value) {
            if (_.includes(['workflow', 'workSheet'], moduleType)) {
              _item.config.label = value.map(item => item.fullname).join('、');
            } else {
              _item.config.label = value.fullname;
            }
          } else {
            _item.config.label = '';
          }
        } else if (_item.type === FormControl.type.DEPARTMENTPICKER) {
          // DepartmentPicker
          if (value) {
            _item.config.label = value.departmentName;
          } else {
            _item.config.label = '';
          }
        } else if (_item.type === FormControl.type.COMPANYPICKER) {
          // CompanyPicker
          if (value) {
            _item.config.label = value.name;
          } else {
            _item.config.label = '';
          }
        } else if (_item.type === FormControl.type.AREAPICKER) {
          // AreaPicker
          if (value && value.length) {
            const names = value.map((area, j, areas) => {
              return area.name ? area.name : '';
            });

            _item.config.label = names.join(' / ');
          } else {
            _item.config.label = '';
          }
        } else if (_item.type === FormControl.type.TEXTINPUT) {
          _item.value = value;
          _item.valueText = value;
        }

        // 生日
        if (_item.id === ACCOUNT_FIELD.BIRTH) {
          const age = Birthday.getAge(value).toString();
          this.values[ACCOUNT_FIELD.AGE] = age;
          formData[ACCOUNT_FIELD.AGE] = {
            value: age,
            valueText: age,
            configLabel: age,
          };

          const sign = Birthday.getSign(value);
          this.values[ACCOUNT_FIELD.SIGN] = sign;
          formData[ACCOUNT_FIELD.SIGN] = {
            value: sign,
            valueText: sign,
            configLabel: sign,
          };
        }

        // 工作性质
        if (_item.id === ACCOUNT_FIELD.JOB_NATURE) {
          if (this.values[_item.id] && this.values[_item.id] !== '1') {
            // 设置试用期为空
            this.values[ACCOUNT_FIELD.PROBATIONARY_PERIO] = '1';
          }
        }

        let label = '';
        if (_item.type === FormControl.type.TEXTINPUT || _item.type === FormControl.type.PHONENUMBER) {
          label = value;
        } else if (_item.config.label && _item.config.label) {
          label = _item.config.label;
        }

        formData[id] = {
          value,
          valueText: label,
          configLabel: label,
        };
      }

      if (
        (_item.id === ACCOUNT_FIELD.SIGN || // 星座
          _item.id === ACCOUNT_FIELD.AGE) && // 年龄
        this.values[_item.id] !== undefined
      ) {
        _item.value = this.values[_item.id];
      }
      if (_item.id === ACCOUNT_FIELD.PROBATIONARY_PERIO) {
        // 试用期
        if (this.values[ACCOUNT_FIELD.JOB_NATURE] && this.values[ACCOUNT_FIELD.JOB_NATURE] !== '1') {
          _item.disabled = true;
          _item.value = '1';
          _item.config.label = '无试用期';
        } else {
          _item.disabled = false;

          if (!this.values[ACCOUNT_FIELD.JOB_NATURE]) {
            newData.map((data) => {
              if (data.id === ACCOUNT_FIELD.JOB_NATURE) {
                if (data.value !== '1') {
                  _item.disabled = true;
                  _item.value = '1';
                  _item.config.label = '无试用期';
                }
              }
            });
          }
        }
      }

      newData.push(_item);

      return null;
    });

    const moneyCnData = this.runMoneyCn(newData, id, value);

    const newList = [];

    newData.map((item) => {
      const _item = _.cloneDeep(item);
      // 大写金额更改触发onChange
      if (_item.type === FormControl.type.TEXTVIEW && _item.config) {
        // 大写金额
        if (_item.config.moneyId) {
          if (moneyCnData[_item.id] !== undefined) {
            _item.value = moneyCnData[_item.id];
            _item.valueText = moneyCnData[_item.id];
            formData[_item.id] = { value: _item.value, valueText: _item.valueText };
            if (this.props.onChange) {
              this.props.onChange(null, _item.id, this.values, formData);
            }
          }
        }
      }

      newList.push(_item);

      return null;
    });

    // 文本控件和公式实时计算数据
    newList.forEach((item) => {
      const _item = _.cloneDeep(item);
      const formulaStr = _item.config ? _item.config.formulaStr : '';
      // 文本控件
      if (_item.type === FormControl.type.TEXTVIEW && _item.config && _item.config.concatnateTpl) {
        const text = _item.config.concatnateTpl.replace(/\$.+?\$/g, (matched) => {
          const controlId = matched.match(/\$(.+?)\$/)[1];
          const column = _.find(newList.concat(this.props.recordInfo || []), c => c.id === controlId);
          if (!column) {
            return '';
          }
          if (column.config && column.config.formulaStr) {
            const formulaResult = this.parseNewFormula(column.config.formulaStr, newList);
            if (formulaResult.columnIsUndefined) {
              return '';
            }
            return formulaResult.error ? _l('计算结果出错') : `${formulaResult.result.toFixed(column.config.dot)}${column.config.suffix}`;
          }
          return parseColumnToText(column, formData);
        });
        formData[_item.id] = { value: text, valueText: text };
        if (this.props.onChange) {
          this.props.onChange(null, _item.id, this.values, formData);
        }
      }
      // 公式控件
      if (_item.type === FormControl.type.TEXTVIEW && _item.config && formulaStr) {
        const result = this.parseNewFormula(formulaStr, newList);
        if (result.columnIsUndefined) {
          formData[_item.id] = { value: '', valueText: '' };
        } else if (!result.error) {
          const resultText = `${result.result.toFixed(_item.config.dot)} ${_item.config.unit}`;
          formData[_item.id] = { value: `${result.result.toFixed(_item.config.dot)}`, valueText: resultText };
        } else {
          formData[_item.id] = { value: _l('计算结果出错'), valueText: _l('计算结果出错') };
        }
        if (this.props.onChange) {
          this.props.onChange(null, _item.id, this.values, formData);
        }
      }
    });

    // update state.data
    if (this.state.calcRelId.length && this.state.calcRelId.indexOf(id) >= 0) {
      this.runCalc(newList, id, value);
    } else {
      this.setState({
        data: newList,
      });
    }

    // fire onChange callback
    if (this.props.onChange) {
      this.props.onChange(event, id, this.values, formData);
    }
  };

  parseNewFormula(formulaStr, newList) {
    let columnIsUndefined;
    formulaStr = formulaStr
      .replace(/cSUM/gi, 'SUM')
      .replace(/cAVG/gi, 'AVERAGE')
      .replace(/cMIN/gi, 'MIN')
      .replace(/cMAX/gi, 'MAX')
      .replace(/cPRODUCT/gi, 'PRODUCT')
      .replace(/cCOUNTA/gi, 'COUNTA')
      .replace(/cABS/gi, 'ABS')
      .replace(/cINT/gi, 'INT')
      .replace(/cMOD/gi, 'MOD')
      .replace(/cROUND/gi, 'ROUND')
      .replace(/cROUNDUP/gi, 'ROUNDUP')
      .replace(/cROUNDDOWN/gi, 'ROUNDDOWN');
    const expression = formulaStr.replace(/\$.+?\$/g, (matched) => {
      const controlId = matched.match(/\$(.+?)\$/)[1];
      const column = _.find(newList, c => c.id === controlId);
      if (!column) {
        columnIsUndefined = true;
        return undefined;
      }
      if (!column.value) {
        columnIsUndefined = true;
      }
      return column.value;
    });
    const parser = new Parser();
    const result = parser.parse(expression);
    return columnIsUndefined ? { columnIsUndefined } : result;
  }

  formItemOnError = (error, id) => {
    this.errorData[id] = error;

    // fire onError callback
    if (this.props.onError) {
      this.props.onError(error, id, this.errorData);
    }
  };

  formItemOnValid = (id) => {
    this.errorData[id] = null;

    // fire onValid callback
    if (this.props.onValid) {
      this.props.onValid(id, this.errorData);
    }
  };

  /**
   * 渲染表单
   */
  renderForm = () => {
    const formList = [];

    if (this.state.data && this.state.data.length) {
      let prevRow = 0;
      // 前一个 col
      let prevCol = 0;

      this.state.data.map((item, i, list) => {
        // divider
        if (item.type === 'DIVIDER') {
          formList.push(<Divider key={`divider-${i}`} label={item.label} />);
        } else {
          // add clearfix for different row
          if (item.row !== prevRow && i !== 0) {
            formList.push(<div className="mui-clearfix" key={`clearfix-${i}-${item.row}`} />);
          }

          // form item
          formList.push(
            <FormItem
              key={`item-${item.row}-${item.col}`}
              {...item}
              projectId={this.props.projectId}
              recordId={this.props.recordId}
              worksheetId={this.props.worksheetId}
              moduleType={this.props.moduleType}
              showError={this.props.showError}
              onChange={(event, value, data) => {
                this.formItemOnChange(event, item.id, value, data);
              }}
              onError={(error) => {
                this.formItemOnError(error, item.id);
              }}
              onValid={() => {
                this.formItemOnValid(item.id);
              }}
              onSave={value => this.props.onSave(item.id, value)}
            />
          );

          // update row and col
          prevRow = item.row;
          prevCol = item.col;
        }

        return null;
      });
    }
    return formList;
  };

  render() {
    return <div className={cx('mui-formcontainer', this.props.moduleType === 'hr' ? 'hrContainerBox' : 'otherContainerBox')}>{this.renderForm()}</div>;
  }
}

FormContainer.propTypes = {
  /**
   * 表单数据（不接受数据更新）
   */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      /**
       * 控件 ID
       */
      id: PropTypes.any,
      /**
       * 控件类型
       */
      type: PropTypes.oneOf(ControlTypes),
      /**
       * 行
       */
      row: PropTypes.number,
      /**
       * 列
       */
      col: PropTypes.number,
      /**
       * 显示大小
       * 1 - 整行
       * 2 - 半行
       */
      size: PropTypes.number,
      /**
       * 控件名称
       */
      label: PropTypes.string,
      /**
       * 控件值
       */
      value: PropTypes.any,
      /**
       * 值的展示文本
       */
      valueText: PropTypes.string,
      /**
       * 控件附加参数（选项列表等）
       */
      data: PropTypes.any,
      /**
       * 控件配置参数
       */
      cofig: PropTypes.any,
      /**
       * 提示文本
       */
      hint: PropTypes.string,
      /**
       * 是否必填
       */
      required: PropTypes.bool,
      /**
       * 是否禁用
       */
      disabled: PropTypes.bool,
    })
  ),
  /**
   * 显示错误（忽略 error.dirty）
   */
  showError: PropTypes.bool,
  /**
   * 【回调】数据发生改变
   * @param {Event} event - 触发事件
   * @param {string} id - 控件 ID
   * @param {object} values - 表单值
   * @param {object} data - 更新后的表单数据
   */
  onChange: PropTypes.func,
  /**
   * 【回调】发生错误
   * @param {Error} error - 错误
   * error.type - 错误类型
   * error.message - 错误信息
   * error.dirty - 值是否发生过改变
   * @param {string} id - 控件 ID
   * @param {object} errorData - 全部控件错误信息
   */
  onError: PropTypes.func,
  /**
   * 【回调】值有效（与 onError 相反）
   * @param {string} id - 控件 ID
   * @param {object} errorData - 全部控件错误信息
   */
  onValid: PropTypes.func,
  onSave: PropTypes.func,
  // 是否是workSheet
  moduleType: PropTypes.string,
  // worksheet的projectId
  projectId: PropTypes.string,
};

FormContainer.defaultProps = {
  data: [],
  showError: false,
  onChange: (event, id, values, data) => {
    //
  },
  onError: (error, id, errorData) => {
    //
  },
  onValid: (id, errorData) => {
    //
  },
  onSave: (id, value) => {},
  moduleType: 'hr',
};

export default FormContainer;
