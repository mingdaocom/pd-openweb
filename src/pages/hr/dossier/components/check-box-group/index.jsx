import PropTypes from 'prop-types';
import React, { Component } from 'react';

import './style.less';

import CheckBox from '../check-box';

import { FormError } from '../lib';

class CheckBoxGroup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      /**
       * current value
       */
      values: this.props.value || {},
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
    this.checkValue(this.state.values, false);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      // apply props.values update
      this.setState({
        values: nextProps.value,
      });
    }
    // showError changed
    if (nextProps.showError !== this.props.showError) {
      this.setState({
        showError: this.state.dirty || nextProps.showError,
      });
    }
  }

  // item onChange
  itemOnChange = (event, item, checked) => {
    if (!this.props.disabled) {
      const values = Object.assign({}, this.state.values);
      values[item.value] = checked;

      this.checkValue(values, true);

      // update state.values
      this.setState({
        values,
      });

      // fire callback
      if (this.props.onChange) {
        this.props.onChange(event, values, {
          item,
          prevValues: this.state.values,
        });
      }
    }
  };

  /**
   * check values
   * @param {object} values - current values
   * @param {bool} dirty - values ever changed
   */
  checkValue = (values, dirty) => {
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
        if (values && values[item.value]) {
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
        const checked = this.state.values && this.state.values[item.value];
        if (!item.isDeleted) {
          return (
            <CheckBox
              key={item.value}
              checked={checked}
              color={this.props.colored && item.color}
              label={item.label}
              disabled={this.props.disabled || item.disabled}
              onChange={(event, _checked) => {
                this.itemOnChange(event, item, _checked);
              }}
            />
          );
        }
      });
    }

    const classList = ['mui-checkboxgroup'];
    // display
    if (this.props.display === 'grid') {
      let itemsInSingleRow = this.props.itemsInSingleRow;
      if (itemsInSingleRow < 1) {
        itemsInSingleRow = 1;
      } else if (itemsInSingleRow > 10) {
        itemsInSingleRow = 10;
      }

      classList.push(`mui-checkboxgroup-grid-${itemsInSingleRow}`);
    }

    const classNames = classList.join(' ');

    return <div className={classNames}>{radios}</div>;
  }
}

CheckBoxGroup.propTypes = {
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
      /**
       * 是否禁用
       */
      disabled: PropTypes.bool,
    })
  ),
  /**
   * 当前全部值
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
   * @param {object} values - 所有值
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
};

CheckBoxGroup.defaultProps = {
  data: [],
  values: {},
  required: false,
  disabled: false,
  display: 'auto',
  itemsInSingleRow: 1,
  showError: false,
  onChange: (event, values, data) => {
    //
  },
  onError: (error) => {
    //
  },
  onValid: () => {
    //
  },
};

export default CheckBoxGroup;
