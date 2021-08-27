import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { FormError } from '../lib';

import Star from './star';
import Bar from './bar';

import './style.less';

class Range extends Component {
  constructor(props) {
    super(props);

    this.state = {
      /**
       * 已选中的值
       */
      value: this.props.value,
      /**
       * 临时值
       */
      tmpValue: this.props.value,
      /**
       * 值列表
       */
      list: this.getList(props),
    };
  }

  componentDidMount() {
    // check init value
    this.checkValue(this.state.value, false);
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.value !== this.state.value) {
      this.setState({
        value: nextProps.value,
        tmpValue: nextProps.value,
      });
    }
  }

  getList = (props) => {
    const list = [];

    let value = props.min;
    while (value <= props.max) {
      list.push({
        value,
        label: value.toString(),
      });

      value = value + props.step;
    }

    return list;
  };

  /**
   * check value
   * @param {any} value - current value
   * @param {bool} dirty - value ever changed
   */
  checkValue = (value, dirty) => {
    const error = {
      type: '',
      message: '',
      dirty,
    };
    // required
    if (this.props.required) {
      // has match item.value
      let match = false;
      this.state.list.map((item, i, list) => {
        if (value === item.value) {
          match = true;
        }
        return null;
      });

      // not match
      if (!match) {
        error.type = FormError.types.REQUIRED;
      }
    }

    if (error.type) {
      // fire onError callback
      if (this.props.onError) {
        this.props.onError(error);
      }
    } else if (this.props.onValid) {
      // fire onValid callback
      this.props.onValid();
    }

    // update state.error
    this.setState({
      error: !!error.type,
      dirty,
      showError: dirty || this.props.showError,
    });
  };

  itemOnMouseEnter = (event, value) => {
    this.setState({
      tmpValue: value,
    });
  };

  itemOnMouseLeave = (event, value) => {
    this.setState({
      tmpValue: this.state.value,
    });
  };

  itemOnClick = (event, value) => {
    let target = value;
    if (value === this.state.value) {
      target = 0;
    }

    this.checkValue(target, true);

    this.setState({
      value: target,
    });

    if (this.props.onChange && !this.props.disabled) {
      // fire onChange callback
      this.props.onChange(event, target, {
        prevValue: this.state.value,
      });
    }
  };

  render() {
    const list = this.state.list.map((item) => {
      if (this.props.type === 'star') {
        return (
          <Star
            key={item.value}
            checked={item.value <= this.state.tmpValue}
            label={item.label}
            disabled={this.props.disabled}
            onMouseEnter={(event) => {
              this.itemOnMouseEnter(event, item.value);
            }}
            onMouseLeave={(event) => {
              this.itemOnMouseLeave(event, item.value);
            }}
            onClick={(event) => {
              this.itemOnClick(event, item.value);
            }}
          />
        );
      } else if (this.props.type === 'bar') {
        return (
          <Bar
            key={item.value}
            checked={item.value <= this.state.tmpValue}
            label={item.label}
            disabled={this.props.disabled}
            onMouseEnter={(event) => {
              this.itemOnMouseEnter(event, item.value);
            }}
            onMouseLeave={(event) => {
              this.itemOnMouseLeave(event, item.value);
            }}
            onClick={(event) => {
              this.itemOnClick(event, item.value);
            }}
          />
        );
      }

      return null;
    });

    let content = list;
    if (this.props.type === 'bar') {
      content = (
        <div className="mui-range-container">
          <div className="text">{`${this.state.value || '0'}/${this.props.max}`}</div>
          <div className="mui-range-bars">{list}</div>
        </div>
      );
    }

    return <div className="mui-range">{content}</div>;
  }
}

Range.propTypes = {
  /**
   * 当前选中的值
   */
  value: PropTypes.number,
  /**
   * 最小值
   */
  min: PropTypes.number,
  /**
   * 最大值
   */
  max: PropTypes.number,
  /**
   * 步进值
   */
  step: PropTypes.number,
  /**
   * 类型
   */
  type: PropTypes.oneOf([
    'star', // 星
    'bar', // 横线
  ]),
  /**
   * 是否必填
   */
  required: PropTypes.bool,
  /**
   * 是否禁用
   */
  disabled: PropTypes.bool,
  /**
   * 显示错误（忽略 error.dirty）
   */
  showError: PropTypes.bool,
  /**
   * 【回调】内容发生改变
   * @param {Event} event - 触发事件
   * @param {string} value - 当前值
   * @param {object} data - 其他数据
   * data.prevValue - 之前的值
   */
  onChange: PropTypes.func,
  /**
   * 【回调】发生错误
   * @param {Error} error - 错误
   * error.type - 错误类型
   * error.dirty - 值是否发生过改变
   */
  onError: PropTypes.func,
  /**
   * 【回调】值有效（与 onError 相反）
   */
  onValid: PropTypes.func,
};

Range.defaultProps = {
  value: null,
  min: 1,
  max: 5,
  step: 1,
  type: 'star',
  required: false,
  disabled: false,
  showError: false,
  unit: '',
  onChange: (event, value, data) => {
    //
  },
  onError: (error) => {
    //
  },
  onValid: () => {
    //
  },
};

export default Range;
