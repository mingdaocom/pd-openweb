import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Icon from 'ming-ui/components/Icon';
import FormContainer from '../../form-container';

class SubGroup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      /**
       * current value
       */
      value: this.props.value || null,
      /**
       * group label
       */
      label: this.props.label || null,
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

  onChange = (event, id, values, data) => {
    if (this.props.onChange) {
      this.props.onChange(event, values, data);
    }
  };

  onError = (error, id, errorData) => {
    if (this.props.onError) {
      this.props.onError(errorData);
    }
  };

  onValid = (id, errorData) => {
    if (this.props.onValid) {
      let error = false;
      for (const _id in errorData) {
        if (_id && errorData[_id]) {
          error = true;
        }
      }

      if (!error) {
        this.props.onValid();
      }
    }
  };

  render() {
    let deleteBtn = null;
    if (this.props.allowDelete) {
      deleteBtn = (
        <div
          className="delete ThemeHoverColor3"
          onClick={(event) => {
            this.props.onDelete(event);
          }}
        >
          <Icon icon="task-new-delete" />
          <span>{_l('删除')}</span>
        </div>
      );
    }

    return (
      <section>
        {deleteBtn}
        <h4>{this.props.label}</h4>
        <FormContainer
          data={this.props.data}
          showError={this.props.showError}
          onChange={(event, id, values, data) => {
            this.onChange(event, id, values, data);
          }}
          onError={(error, id, errorData) => {
            this.onError(error, id, errorData);
          }}
          onValid={(id, errorData) => {
            this.onValid(id, errorData);
          }}
        />
      </section>
    );
  }
}

SubGroup.propTypes = {
  /**
   * 分组标题
   */
  label: PropTypes.string,
  /**
   * 表单数据
   */
  data: PropTypes.any,
  /**
   * 是否允许删除
   */
  allowDelete: PropTypes.bool,
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
   * @param {Event} event - 点击事件
   * @param {any} value - 全部值
   * @param {object} data - 其他数据
   * data.prevValue - 之前的值
   */
  onChange: PropTypes.func,
  /**
   * 【回调】发生错误
   */
  onError: PropTypes.func,
  /**
   * 【回调】值有效（与 onError 相反）
   */
  onValid: PropTypes.func,
  /**
   * 【回调】删除当前分组
   * @param {Event} event - 点击事件
   */
  onDelete: PropTypes.func,
};

SubGroup.defaultProps = {
  label: '',
  data: [],
  allowDelete: true,
  disabled: false,
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
  onDelete: (event) => {
    //
  },
};

export default SubGroup;
