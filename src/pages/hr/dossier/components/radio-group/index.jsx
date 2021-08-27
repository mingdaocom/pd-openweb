import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Radio from '../radio';

import { FormError } from '../lib';

import './style.less';

class RadioGroup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      /**
       * current value
       */
      value: this.props.value || null,
      /**
       * value error
       */
      error: false,
      // dirty
      dirty: false,
      // show error
      showError: false,
    };
  }

  componentDidMount() {
    // check init value
    this.checkValue(this.state.value, false);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      // apply props.value update
      this.setState({
        value: nextProps.value,
      });
    }
    // showError changed
    if (nextProps.showError !== this.props.showError) {
      this.setState({
        showError: this.state.dirty || nextProps.showError,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.value !== prevState.value) {
      this.checkValue(this.state.value, true);
    }
  }

  // item on checked
  itemOnChecked = (event, item) => {
    if (!this.props.disabled) {
      this.checkValue(item.value, true);

      // update state.value
      this.setState({
        value: item.value,
      });

      // fire callback
      if (this.props.onChange) {
        this.props.onChange(event, item.value, {
          item,
          prevValue: this.state.value,
        });
      }
    }
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
      this.props.data.map((item, i, list) => {
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

  render() {
    let radios = null;
    if (this.props.data && this.props.data) {
      radios = this.props.data.map((item, i, list) => {
        const checked = item.value === this.state.value;
        if (!item.isDeleted) {
          return (
            <Radio
              key={item.value}
              checked={checked}
              color={this.props.colored && item.color}
              label={item.label}
              disabled={this.props.disabled}
              moduleType={this.props.moduleType}
              onChecked={(event) => {
                this.itemOnChecked(event, item);
              }}
            />
          );
        }
      });
    }

    const classList = ['mui-radiogroup'];
    // display
    if (this.props.display === 'grid') {
      let itemsInSingleRow = this.props.itemsInSingleRow;
      if (itemsInSingleRow < 1) {
        itemsInSingleRow = 1;
      } else if (itemsInSingleRow > 10) {
        itemsInSingleRow = 10;
      }

      classList.push(`mui-radiogroup-grid-${itemsInSingleRow}`);
    }

    const classNames = classList.join(' ');

    return <div className={classNames}>{radios}</div>;
  }
}

RadioGroup.propTypes = {
  /**
   * 选项列表
   */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      /**
       * 选项展示文本
       */
      label: PropTypes.string,
      /**
       * 选项值
       */
      value: PropTypes.any,
    })
  ),
  /**
   * 当前选中的值
   */
  value: PropTypes.any,
  /**
   * 是否必填
   */
  required: PropTypes.bool,
  /**
   * 是否禁用
   */
  disabled: PropTypes.bool,
  /**
   * 排列方式
   */
  display: PropTypes.oneOf([
    /**
     * 自适应宽度
     */
    'auto',
    /**
     * 按网格排列（百分比宽度）
     */
    'grid',
  ]),
  /**
   * 每行选项数量（仅网格模式，1~10）
   */
  itemsInSingleRow: PropTypes.number,
  /**
   * 显示错误（忽略 error.dirty）
   */
  showError: PropTypes.bool,
  /**
   * 选项改变回调
   * @param {Event} event - 点击事件
   * @param {any} value - 选中的值
   * @param {object} data - 其他数据
   * data.item - 选中的项目
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
  moduleType: PropTypes.string,
};

RadioGroup.defaultProps = {
  data: [],
  moduleType: '',
  value: null,
  required: false,
  disabled: false,
  display: 'auto',
  itemsInSingleRow: 1,
  showError: false,
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

export default RadioGroup;
