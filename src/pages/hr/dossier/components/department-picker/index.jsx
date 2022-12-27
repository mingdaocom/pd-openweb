import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';

import './style.less';

import Icon from 'ming-ui/components/Icon';
import DialogSelectGroups from 'src/components/dialogSelectDept';
import { FormError } from '../lib';
import _ from 'lodash';

class DepartmentPicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      /**
       * current value
       */
      value: this.props.value || null,
      /**
       * button label
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

  componentDidMount() {
    // check init value
    this.checkValue(this.state.value, false);
  }

  componentWillReceiveProps(nextProps) {
    // apply label update
    if (nextProps.label !== this.props.label) {
      const label = nextProps.label && nextProps.label.length ? nextProps.label.toString() : '';

      this.setState({
        label,
      });
    }
    // apply value update
    if (nextProps.value !== this.props.value) {
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
    if (this.props.required && !value) {
      error.type = FormError.types.REQUIRED;
    }

    if (error.type) {
      // fire onError callback
      if (this.props.onError) {
        this.props.onError(error);
      }
    } else {
      // fire onValid callback
      if (this.props.onValid) {
        this.props.onValid();
      }
    }

    // update state.error
    this.setState({
      error: !!error.type,
      dirty,
      showError: dirty || this.props.showError,
    });
  };

  /**
   * 选择部门
   */
  pickDepartment = () => {
    if (this.props.disabled) {
      return;
    }
    if (this.props.moduleType === 'workSheet' && !_.find(md.global.Account.projects, item => item.projectId === this.props.projectId)) {
      alert(_l('您不是该组织成员，无法获取其部门列表，请联系组织管理员'), 3);
      return;
    }
    let projectId = window.localStorage.getItem('plus_projectId') || '';
    if (_.includes(['workSheet', 'workflow'], this.props.moduleType)) {
      projectId = this.props.projectId;
    }
    // open pick modal
    const dislog = new DialogSelectGroups({
      projectId,
      isIncludeRoot: false,
      selectedDepartmentId: this.props.value ? this.props.value.departmentId : '',
      selectFn: (data) => {
        let value = null;
        if (data && data.length) {
          value = data[0];
        }
        if (value !== this.state.value) {
          this.checkValue(value, true);

          // update state.value
          this.setState({
            value,
          });

          // fire onChange callback
          if (this.props.onChange) {
            this.props.onChange(null, value, {
              prevValue: this.state.value,
            });
          }
        }
      },
    });
  };

  render() {
    const buttonClassList = ['mui-forminput', 'ThemeFocusBorderColor3'];
    if (this.state.error && this.state.showError) {
      buttonClassList.push('mui-forminput-error');
    }
    const buttonClassNames = buttonClassList.join(' ');

    if (this.props.accessor) {
      return (
        <div className={this.props.className} onClick={this.pickDepartment}>
          {this.props.accessor(this.state.label)}
        </div>
      );
    }

    return (
      <div className={cx('mui-departmentpicker', this.props.className)}>
        <button type="button" className={buttonClassNames} disabled={this.props.disabled} onClick={this.pickDepartment}>
          <span className="mui-forminput-label">
            {this.state.value && this.state.value.departmentId && !this.state.label ? _l('此部门已删除') : this.state.label}
          </span>
          <Icon icon="group-members" />
        </button>
      </div>
    );
  }
}

DepartmentPicker.propTypes = {
  /**
   * 当前选中的值
   */
  value: PropTypes.any,
  /**
   * Button 显示内容
   */
  label: PropTypes.string,
  /**
   * 是否必填
   */
  required: PropTypes.bool,
  /**
   * 是否禁用
   */
  disabled: PropTypes.bool,
  /**
   * 选项改变回调
   * @param {Event} event - 点击事件
   * @param {any} value - 选中的值
   * @param {object} data - 其他数据
   * data.prevValue - 之前的值
   */
  /**
   * 显示错误（忽略 error.dirty）
   */
  showError: PropTypes.bool,
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
  className: PropTypes.string,
  /**
   * 自定义显示
   */
  accessor: PropTypes.func,
  moduleType: PropTypes.string,
};

DepartmentPicker.defaultProps = {
  value: null,
  label: '',
  required: false,
  disabled: false,
  showError: false,
  onChange: (event, value, item) => {
    //
  },
  onError: (error) => {
    //
  },
  onValid: () => {
    //
  },
};

export default DepartmentPicker;
