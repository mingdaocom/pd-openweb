import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SignWidget from './widget';
import { SignType, Controls } from './data';

const types = [
  SignType.LEAVE, // 请假
  SignType.OVERTIME, // 加班
  SignType.FIELDWORK, // 出差
];

class SignGroup extends Component {
  onChange = (event, data) => {
    if (data[Controls.RANGE] && data[Controls.RANGE].length && data[Controls.LENGTH] && data[Controls.NOTE] && this.props.onChange) {
      this.props.onChange(event, data);
    }
  };

  onError = (error, id, errorData) => {
    if (this.props.onError) {
      this.props.onError(error, id, errorData);
    }
  };

  onValid = (id, errorData) => {
    if (this.props.onValid) {
      let valid = true;
      for (const _id in errorData) {
        if (_id && errorData[_id]) {
          valid = false;
        }
      }

      if (valid) {
        this.props.onValid(id, errorData);
      }
    }
  };

  render() {
    return (
      <div className="mui-signgroup">
        <SignWidget
          type={this.props.type}
          id={this.props.id}
          controls={this.props.data}
          showError={this.props.showError}
          onChange={(event, data) => {
            this.onChange(event, data);
          }}
          onError={(event, id, errorData) => {
            this.onError(event, id, errorData);
          }}
          onValid={(id, errorData) => {
            this.onValid(id, errorData);
          }}
        />
      </div>
    );
  }
}

SignGroup.propTypes = {
  /**
   * controlId
   */
  id: PropTypes.string,
  /**
   * 表单数据
   */
  data: PropTypes.any,
  /**
   * 控件类型
   */
  type: PropTypes.oneOf(types),
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
   * 选项改变回调
   * @param {Event} event - 触发事件
   * @param {any} values - 当前值
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

SignGroup.defaultProps = {
  id: null,
  data: [],
  type: SignType.LEAVE,
  required: false,
  disabled: false,
  showError: false,
  onChange: (event, values) => {
    //
  },
  onError: (error) => {
    //
  },
  onValid: () => {
    //
  },
};

export default SignGroup;
