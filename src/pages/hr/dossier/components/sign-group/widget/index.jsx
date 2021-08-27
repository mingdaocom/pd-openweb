import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'lodash';

import { SignType, Controls } from '../data';
import { FormAdapter } from '../../lib/data-adapter';
import FormControl from '../../form-control';
import Divider from '../../divider';
import FormItem from '../../form-item';
import { TextInput, Dropdown, DateTimeRange, TextView } from '../../components';

import AjaxCheck from '../../../../approval/api/check';

/**
 * 日期时间格式化字符串
 */
const TimeFormat = {
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm',
};

/**
 * 时间单位
 */
const LengthUnit = {
  HOUR: 2,
  DAY: 3,
};

class SignWidget extends Component {
  constructor(props) {
    super(props);

    // type options
    this.typeOptions = {};
    // controls' value
    this.values = {};

    this.state = {
      /**
       * form controls
       */
      controls: this.generateControls(props),
    };
    // errorData
    this.errorData = {};
  }

  /**
   * 生成控件数据
   */
  generateControls = (props) => {
    let typeValue = null;

    const controls = props.controls.map((item, i, list) => {
      if (item.id === Controls.TYPE) {
        typeValue = item.value;
      }

      if (item.id === Controls.TYPE && item.data && item.data.length) {
        item.data.map((_item, j, _list) => {
          this.typeOptions[_item.value] = {
            label: _item.label,
            unitType: _item.unitType,
          };

          return null;
        });
      }

      const _item = _.cloneDeep(item);
      // convert control.type
      if (_item.id === Controls.LENGTH) {
        _item.type = 'TEXTVIEW';
      } else if (_item.id === Controls.NOTE) {
        _item.type = 'TEXTINPUT';
      }

      // set required
      _item.required = true;

      // remove hint
      _item.hint = '';

      return _item;
    });

    controls.map((item, i, list) => {
      if (item.id === Controls.LENGTH) {
        if (item.value) {
          item.config.suffix = ' 小时';

          if (typeValue) {
            const type = this.typeOptions[typeValue];
            if (type && type.unitType === LengthUnit.DAY) {
              item.config.suffix = ' 天';
            }
          }
        } else {
          item.config.suffix = '';
        }
      }

      if (item.id === Controls.RANGE) {
        if (typeValue && item.value && item.value.length) {
          const type = this.typeOptions[typeValue];

          if (type && type.unitType === LengthUnit.DAY) {
            item.config.type = 'datehalf';
          } else {
            item.config.type = 'datetime';
          }

          // update item.config.label
          item.config.label = this.updateDateTimeRangeLabel(item, item.value);
        }
      }

      return null;
    });

    controls.map((item, i, list) => {
      if (item.id) {
        this.values[item.id] = item.value;
      }

      return null;
    });

    return controls;
  };

  // update DateTimeRange.config.label
  updateDateTimeRangeLabel = (_item, value) => {
    let label = '';
    // update label
    if (value && value.length) {
      let format = TimeFormat.DATE;
      if (_item.config.type && _item.config.type === 'datetime') {
        format = TimeFormat.DATETIME;
      }

      const startTime = moment(new Date(value[0])).format(format);
      const endTime = moment(new Date(value[1])).format(format);

      if (_item.config.type === 'datehalf') {
        const am = value[2] || this.getHalf(value[0]);
        const pm = value[3] || this.getHalf(value[1]);
        label = `${startTime} ${am} ~ ${endTime} ${pm}`;
      } else {
        label = `${startTime} ~ ${endTime}`;
      }
    }

    return label;
  };

  getHalf = (value) => {
    const time = new Date(value);
    const hour = time.getHours();
    return hour < 12 ? 'AM' : 'PM';
  };

  // input value changed
  inputOnChange = (event, id, value, data) => {
    const newData = [];

    this.state.controls.map((item, i, list) => {
      const _item = _.cloneDeep(item);

      if (_item.id === id) {
        this.values[_item.id] = value;

        _item.value = value;

        if (!_item.config) {
          _item.config = {};
        }

        // get item.config.label
        if (_item.type === 'DROPDOWN') {
          // Dropdown
          if (_item.config && _item.config.multipleSelect) {
            _item.config.label = data.label.join(' / ');
          } else {
            _item.config.label = data.label;
          }
        } else if (_item.type === 'DATETIMERANGE') {
          // DateTimeRange
          // update label
          _item.config.label = this.updateDateTimeRangeLabel(_item, value);
        }
      }

      // reset RANGE/LENGTH
      if (this.props.type === SignType.LEAVE && id === Controls.TYPE) {
        if (_item.id === Controls.RANGE) {
          const type = this.typeOptions[this.values[Controls.TYPE]];

          if (type && type.unitType === LengthUnit.DAY) {
            _item.config.type = 'datehalf';
          } else {
            _item.config.type = 'datetime';
          }

          this.values[Controls.RANGE] = null;
          _item.value = null;

          // update _item.config.label
          _item.config.label = this.updateDateTimeRangeLabel(_item, null);
        } else if (_item.id === Controls.LENGTH) {
          _item.value = '';
          _item.config.suffix = '';
          this.values[Controls.RANGE] = null;
        }
      }

      // reset LENGTH
      if (id === Controls.RANGE && (!value || !value.length)) {
        if (_item.id === Controls.LENGTH) {
          _item.value = '';
          _item.config.suffix = '';
          this.values[Controls.RANGE] = null;
        }
      }

      newData.push(_item);

      return null;
    });
    // update state.data
    this.setState({
      controls: newData,
    });

    // TYPE and RANGE should exist
    if (
      ((this.props.type === SignType.LEAVE && this.values[Controls.TYPE]) || this.props.type !== SignType.LEAVE) &&
      this.values[Controls.RANGE] &&
      this.values[Controls.RANGE].length &&
      id !== Controls.NOTE
    ) {
      const checkData = {
        controlId: this.props.id,
        value: [],
      };

      for (const key in this.values) {
        if (this.values[key]) {
          const _data = {};
          const _value = key === Controls.RANGE ? this.values[key].join(',') : this.values[key];
          _data[key] = _value;
          checkData.value.push(_data);
        }
      }

      // get effective length
      AjaxCheck.getEffectiveTime(checkData, {}).then((res) => {
        // update length value
        this.updateLength(res);
      });
    }

    this.postOnChange();
  };

  /**
   * 更新有效时长
   */
  updateLength = (data) => {
    let length = 0;
    let unit = '小时';
    const type = this.typeOptions[this.values[Controls.TYPE]];
    if (this.props.type === SignType.LEAVE && type && type.unitType === LengthUnit.DAY) {
      length = data.effectiveDays || 0;
      unit = '天';
    } else {
      length = data.effectiveHours || 0;
    }

    this.values[Controls.LENGTH] = length;

    // error msg
    let msg = '';
    if (data.status !== 1) {
      msg = data.msg || '';
      if (data.url) {
        if (msg) {
          msg += '，';
        }
        msg += `<a href="${data.url}" target="_blank">查看详情</a>`;
      }

      if(this.props.type === SignType.LEAVE){
        this.inputOnError(
          {
            type: 'ERROR',
            message: msg,
          },
          Controls.LENGTH
        );
      }
    } else {
        this.inputOnValid(Controls.LENGTH);
    }

    let showMsg = '';
    if (msg) {
      showMsg = ` <span class="text-error">（${msg}）</span>`;
    }

    const newData = [];

    this.state.controls.map((item, i, list) => {
      const _item = _.cloneDeep(item);

      if (_item.id === Controls.LENGTH) {
        _item.value = length;
        _item.config.suffix = ` ${unit} ${showMsg}`;
      }

      newData.push(_item);

      return null;
    });

    this.setState({
      controls: newData,
    });

    this.postOnChange();
  };

  postOnChange = () => {
    if (this.props.onChange) {
      this.props.onChange(null, this.values);
    }
  };

  // input value error
  inputOnError = (error, id) => {
    this.errorData[id] = error;

    if (this.props.onError) {
      this.props.onError(error, id, this.errorData);
    }
  };

  // input value valid
  inputOnValid = (id) => {
    this.errorData[id] = null;

    if (this.props.onValid) {
      this.props.onValid(id, this.errorData);
    }
  };

  /**
   * 渲染表单
   */
  renderForm = () => {
    const formList = [];

    if (this.state.controls && this.state.controls.length) {
      // 前一个 row
      let prevRow = 0;
      // 前一个 col
      let prevCol = 0;

      this.state.controls.map((item, i, list) => {
        // divider
        if (item.type === 'DIVIDER') {
          formList.push(<Divider key={`divider-${i}`} label={item.label} />);
        } else {
          // add clearfix for different row
          if (item.row !== prevRow) {
            formList.push(<div className="mui-clearfix" key={`clearfix-${item.row}`} />);
          }

          // form item
          formList.push(
            <FormItem
              key={`item-${item.row}-${item.col}`}
              {...item}
              showError={this.props.showError}
              onChange={(event, value, data) => {
                this.inputOnChange(event, item.id, value, data);
              }}
              onError={(error) => {
                this.inputOnError(error, item.id);
              }}
              onValid={() => {
                this.inputOnValid(item.id);
              }}
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
    let content = [];
    if (this.state.controls && this.state.controls.length) {
      content = this.renderForm();
    }

    return <div className="mui-signgroup-widget">{content}</div>;
  }
}

SignWidget.propTypes = {
  /**
   * 控件类型
   */
  type: PropTypes.oneOf([
    /**
     * 请假
     */
    SignType.LEAVE,
    /**
     * 加班
     */
    SignType.OVERTIME,
    /**
     * 外出
     */
    SignType.FIELDWORK,
    /**
     * 出差
     */
    SignType.OUTWORK,
  ]),
  /**
   * 控件 ID
   */
  id: PropTypes.string,
  /**
   * 控件列表
   */
  controls: PropTypes.any,
  /**
   * 错误信息
   */
  showError: PropTypes.bool,
  /**
   * 【回调】数据改变
   */
  onChange: PropTypes.func,
  /**
   * 【回调】控件错误
   */
  onError: PropTypes.func,
  /**
   * 【回调】控件正常
   */
  onValid: PropTypes.func,
};

SignWidget.defaultProps = {
  type: SignType.LEAVE,
  id: '',
  controls: [],
  showError: false,
  onChange: (event, data) => {
    //
  },
  onError: (error, id, data) => {
    //
  },
  onValid: (id, data) => {
    //
  },
};

SignWidget.Controls = Controls;

export default SignWidget;
