import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import './style.less';

import { FormError, Validator } from '../lib';

import FormControl from '../form-control';

import TextInput from '../text-input';
import PhoneNumber from '../phone-number';
import RadioGroup from '../radio-group';
import Dropdown from '../dropdown';
import DateTime from '../date-time';
import DateTimeRange from '../date-time-range';
import UserPicker from '../user-picker';
import DepartmentPicker from '../department-picker';
import CompanyPicker from '../company-picker';
import AreaPicker from '../area-picker';
import TextView from '../text-view';
import SheetField from '../sheetField';
import FileAttachment from '../file-attachment';
import Range from '../range';
import LinkPicker from '../link-picker';
import FormGroup from '../form-group';
import SignGroup from '../sign-group';
import CheckBoxGroup from '../check-box-group';
import RelateSheet from '../relateSheet';
import Switch from '../switch';

class FormItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // value error
      error: false,
      errorMessage: '',
      // message
      message: '',
      // dirty
      dirty: false,
      // show error
      showError: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    // showError changed
    if (nextProps.showError !== this.props.showError) {
      this.setState({
        showError: this.state.dirty || nextProps.showError,
      });
    }
  }

  // input value changed
  inputOnChange = (event, value, data) => {
    // fire onChange callback
    if (this.props.onChange) {
      this.props.onChange(event, value, data);
    }
  };

  // input value error
  inputOnError = (error) => {
    if (this.props.type === FormControl.type.SIGNGROUP) {
      return;
    }

    let errorMessage = '';
    if (error.type === FormError.types.REQUIRED) {
      errorMessage = FormError.messages.REQUIRED_SELECT(this.props.label);
    }

    // TextInput
    if (this.props.type === FormControl.type.TEXTINPUT || this.props.type === FormControl.type.PHONENUMBER) {
      const type = error.type;
      switch (type) {
        case FormError.types.REQUIRED: {
          errorMessage = FormError.messages.REQUIRED(this.props.label);
          break;
        }
        case FormError.types.MINLENGTH: {
          errorMessage = FormError.messages.MINLENGTH(this.props.config.minLength);
          break;
        }
        case FormError.types.MAXLENGTH: {
          errorMessage = FormError.messages.MAXLENGTH(this.props.config.maxLength);
          break;
        }
        case FormError.types.MOBILEPHONE: {
          errorMessage = FormError.messages.MOBILEPHONE;
          break;
        }
        case FormError.types.PHONE: {
          errorMessage = FormError.messages.PHONE;
          break;
        }
        case FormError.types.TELEPHONE: {
          errorMessage = FormError.messages.TELEPHONE;
          break;
        }
        case FormError.types.EMAIL: {
          errorMessage = FormError.messages.EMAIL;
          break;
        }
        case FormError.types.IDCARD: {
          errorMessage = FormError.messages.IDCARD;
          break;
        }
        case FormError.types.PASSPORT: {
          errorMessage = FormError.messages.PASSPORT;
          break;
        }
        case FormError.types.HKPASSPORT: {
          errorMessage = FormError.messages.HKPASSPORT;
          break;
        }
        case FormError.types.TWPASSPORT: {
          errorMessage = FormError.messages.TWPASSPORT;
          break;
        }
        case FormError.types.UNIQUE: {
          errorMessage = FormError.messages.UNIQUE(this.props.label);
          break;
        }
        default: {
          //
        }
      }
    }

    error.message = errorMessage;

    if (error.type) {
      // fire onError callback
      if (this.props.onError) {
        this.props.onError(error);
      }

      // update state.error/.message
      this.setState({
        error: true,
        errorMessage: error.message,
        message: error.message,
        dirty: error.dirty,
        showError: error.dirty || this.props.showError,
      });
    }
  };

  // input value valid
  inputOnValid = () => {
    // fire onValid callback
    if (this.props.onValid) {
      this.props.onValid();
    }

    // update state.error/.message
    this.setState({
      error: false,
      message: '',
    });
  };

  render() {
    // input component
    let input = null;
    const { moduleType } = this.props;
    if (this.props.type === FormControl.type.TEXTINPUT) {
      // TextInput
      input = (
        <TextInput
          {...this.props.config}
          enumDefault={this.props.enumDefault}
          value={this.props.value}
          hint={this.props.hint}
          recordId={this.props.recordId}
          worksheetId={this.props.worksheetId}
          control={this.props.control}
          required={this.props.required}
          disabled={this.props.disabled}
          validate={this.props.validate}
          showError={this.props.showError}
          error={this.props.error}
          multipleLine={this.props.multipleLine}
          attribute={this.props.attribute}
          onChange={(event, value, data) => {
            this.inputOnChange(event, value, data);
          }}
          onError={(error) => {
            this.inputOnError(error);
          }}
          onValid={() => {
            this.inputOnValid();
          }}
          onSave={(e, value) => this.props.onSave(value)}
        />
      );
    } else if (this.props.type === FormControl.type.PHONENUMBER) {
      // PhoneNumber
      input = (
        <PhoneNumber
          {...this.props.config}
          value={this.props.value}
          hint={this.props.hint}
          validate={this.props.validate}
          recordId={this.props.recordId}
          worksheetId={this.props.worksheetId}
          control={this.props.control}
          required={this.props.required}
          disabled={this.props.disabled}
          showError={this.props.showError}
          onChange={(event, value, data) => {
            this.inputOnChange(event, value, data);
          }}
          onError={(error) => {
            this.inputOnError(error);
          }}
          onValid={() => {
            this.inputOnValid();
          }}
          onSave={(e, value) => this.props.onSave(value)}
        />
      );
    } else if (this.props.type === FormControl.type.RADIOGROUP) {
      // RadioGroup
      input = (
        <RadioGroup
          {...this.props.config}
          colored={this.props.colored}
          value={this.props.value}
          data={this.props.data}
          moduleType={this.props.moduleType}
          required={this.props.required}
          disabled={this.props.disabled}
          display={'grid'}
          itemsInSingleRow={4}
          showError={this.props.showError}
          onChange={(event, value, data) => {
            this.inputOnChange(event, value, data);
          }}
          onError={(error) => {
            this.inputOnError(error);
          }}
          onValid={() => {
            this.inputOnValid();
          }}
        />
      );
    } else if (this.props.type === FormControl.type.CHECKBOXGROUP) {
      // CheckBoxGroup
      input = (
        <CheckBoxGroup
          {...this.props.config}
          value={this.props.value}
          colored={this.props.colored}
          data={this.props.data}
          required={this.props.required}
          disabled={this.props.disabled}
          display={'grid'}
          itemsInSingleRow={4}
          showError={this.props.showError}
          onChange={(event, value, data) => {
            this.inputOnChange(event, value, data);
          }}
          onError={(error) => {
            this.inputOnError(error);
          }}
          onValid={() => {
            this.inputOnValid();
          }}
        />
      );
    } else if (this.props.type === FormControl.type.DROPDOWN) {
      // Dropdown
      input = (
        <Dropdown
          {...this.props.config}
          value={this.props.value}
          colored={this.props.colored}
          data={this.props.data}
          hint={this.props.hint}
          required={this.props.required}
          disabled={this.props.disabled}
          showError={this.props.showError}
          moduleType={this.props.moduleType}
          onChange={(event, value, data) => {
            this.inputOnChange(event, value, data);
          }}
          onError={(error) => {
            this.inputOnError(error);
          }}
          onValid={() => {
            this.inputOnValid();
          }}
          emptyHint={this.props.emptyHint}
        />
      );
    } else if (this.props.type === FormControl.type.DATETIME) {
      // DateTime
      input = (
        <DateTime
          {...this.props.config}
          error={this.props.error}
          value={this.props.value}
          hint={this.props.hint}
          required={this.props.required}
          disabled={this.props.disabled}
          showError={this.props.showError}
          onChange={(event, value, data) => {
            this.inputOnChange(event, value, data);
          }}
          onError={(error) => {
            this.inputOnError(error);
          }}
          onValid={() => {
            this.inputOnValid();
          }}
        />
      );
    } else if (this.props.type === FormControl.type.DATETIMERANGE) {
      // DateTimeRange
      input = (
        <DateTimeRange
          {...this.props.config}
          error={this.props.error}
          value={this.props.value}
          hint={this.props.hint}
          required={this.props.required}
          disabled={this.props.disabled}
          showError={this.props.showError}
          onChange={(event, value, data) => {
            this.inputOnChange(event, value, data);
          }}
          onError={(error) => {
            this.inputOnError(error);
          }}
          onValid={() => {
            this.inputOnValid();
          }}
        />
      );
    } else if (this.props.type === FormControl.type.USERPICKER) {
      const { projectId } = this.props;
      // UserPicker
      input = (
        <UserPicker
          {...this.props.config}
          value={this.props.value}
          selectType={this.props.selectType}
          hint={this.props.hint}
          required={this.props.required}
          disabled={this.props.disabled}
          showError={this.props.showError}
          moduleType={this.props.moduleType}
          projectId={projectId}
          onChange={(event, value, data) => {
            this.inputOnChange(event, value, data);
          }}
          onError={(error) => {
            this.inputOnError(error);
          }}
          onValid={() => {
            this.inputOnValid();
          }}
        />
      );
    } else if (this.props.type === FormControl.type.DEPARTMENTPICKER) {
      // DepartmentPicker
      input = (
        <DepartmentPicker
          {...this.props.config}
          projectId={this.props.projectId}
          moduleType={this.props.moduleType}
          value={this.props.value}
          hint={this.props.hint}
          required={this.props.required}
          disabled={this.props.disabled}
          showError={this.props.showError}
          onChange={(event, value, data) => {
            this.inputOnChange(event, value, data);
          }}
          onError={(error) => {
            this.inputOnError(error);
          }}
          onValid={() => {
            this.inputOnValid();
          }}
        />
      );
    } else if (this.props.type === FormControl.type.COMPANYPICKER) {
      const getComponents = (disabled) => {
        return (
          <CompanyPicker
            {...this.props.config}
            value={this.props.value}
            required={this.props.required}
            hint={this.props.hint}
            disabled={disabled}
            showError={this.props.showError}
            onChange={(event, value, data) => {
              this.inputOnChange(event, value, data);
            }}
            onError={(error) => {
              this.inputOnError(error);
            }}
            onValid={() => {
              this.inputOnValid();
            }}
          />
        );
      };

      if (this.props.config.type === 'job') {
        input = <div onClick={() => alert(_l('请到组织后台修改'), 2)}>{getComponents(true)}</div>;
      } else {
        input = getComponents(this.props.disabled);
      }
    } else if (this.props.type === FormControl.type.AREAPICKER) {
      // AreaPicker
      input = (
        <AreaPicker
          {...this.props.config}
          value={this.props.value}
          required={this.props.required}
          hint={this.props.hint}
          disabled={this.props.disabled}
          showError={this.props.showError}
          onChange={(event, value, data) => {
            this.inputOnChange(event, value, data);
          }}
          onError={(error) => {
            this.inputOnError(error);
          }}
          onValid={() => {
            this.inputOnValid();
          }}
          onSave={this.props.onSave}
        />
      );
    } else if (this.props.type === FormControl.type.TEXTVIEW) {
      // TextView
      input = <TextView {...this.props.config} value={this.props.value} />;
    } else if (this.props.type === FormControl.type.FILEATTACHMENT) {
      // FileAttachment
      input = (
        <FileAttachment
          {...this.props.config}
          value={this.props.value}
          moduleType={this.props.moduleType}
          required={this.props.required}
          disabled={this.props.disabled}
          showError={this.props.showError}
          onChange={(event, value, data) => {
            this.inputOnChange(event, value, data);
          }}
          onError={(error) => {
            this.inputOnError(error);
          }}
          onValid={() => {
            this.inputOnValid();
          }}
          onSave={this.props.onSave}
        />
      );
    } else if (this.props.type === FormControl.type.RANGE) {
      // Range
      input = (
        <Range
          {...this.props.config}
          value={this.props.value}
          required={this.props.required}
          disabled={this.props.disabled}
          showError={this.props.showError}
          onChange={(event, value, data) => {
            this.inputOnChange(event, value, data);
          }}
          onError={(error) => {
            this.inputOnError(error);
          }}
          onValid={() => {
            this.inputOnValid();
          }}
        />
      );
    } else if (this.props.type === FormControl.type.LINKPICKER) {
      // LinkPicker
      input = (
        <LinkPicker
          {...this.props.config}
          value={this.props.value}
          moduleType={this.props.moduleType}
          required={this.props.required}
          disabled={this.props.disabled}
          showError={this.props.showError}
          onChange={(event, value, data) => {
            this.inputOnChange(event, value, data);
          }}
          onError={(error) => {
            this.inputOnError(error);
          }}
          onValid={() => {
            this.inputOnValid();
          }}
        />
      );
    } else if (this.props.type === FormControl.type.FORMGROUP) {
      // FormGroup
      input = (
        <FormGroup
          {...this.props.config}
          value={this.props.value}
          data={this.props.data}
          required={this.props.required}
          disabled={this.props.disabled}
          showError={this.props.showError}
          onChange={(event, value) => {
            this.inputOnChange(event, value, null);
          }}
          onError={(error) => {
            this.inputOnError(error);
          }}
          onValid={() => {
            this.inputOnValid();
          }}
        />
      );
    } else if (this.props.type === FormControl.type.SIGNGROUP) {
      // SignGroup
      input = (
        <SignGroup
          {...this.props.config}
          data={this.props.data}
          required={this.props.required}
          disabled={this.props.disabled}
          showError={this.props.showError}
          onChange={(event, value) => {
            this.inputOnChange(event, value, null);
          }}
          onError={(error) => {
            this.inputOnError(error);
          }}
          onValid={() => {
            this.inputOnValid();
          }}
        />
      );
    } else if (this.props.type === FormControl.type.RELATESHEET) {
      // SignGroup
      input = (
        <RelateSheet
          {...this.props.config}
          data={this.props.data}
          worksheetId={this.props.worksheetId}
          recordId={this.props.recordId}
          label={this.props.label}
          control={this.props.control}
          value={this.props.value}
          enumDefault={this.props.enumDefault}
          dataSource={this.props.dataSource}
          required={this.props.required}
          disabled={this.props.disabled}
          showError={this.props.showError}
          onChange={(event, value, preData) => {
            this.inputOnChange(event, value, preData);
          }}
          onError={(error) => {
            this.inputOnError(error);
          }}
          onValid={() => {
            this.inputOnValid();
          }}
        />
      );
    } else if (this.props.type === FormControl.type.SHEETFIELD) {
      input = (
        <SheetField
          data={this.props.data}
          value={this.props.value}
          required={this.props.required}
          disabled={this.props.disabled}
          enumDefault={this.props.enumDefault}
          options={this.props.options}
          unit={this.props.unit}
          sourceControlType={this.props.sourceControlType}
          sourceControlId={this.props.sourceControlId}
          onChange={(event, value, preData) => {
            this.inputOnChange(event, value, preData);
          }}
          onError={(error) => {
            this.inputOnError(error);
          }}
          onValid={() => {
            this.inputOnValid();
          }}
        />
      );
    } else if (this.props.type === 'COMPONENT') {
      input = this.props.value;
    } else if (this.props.type === FormControl.type.SWITCH) {
      input = (
        <Switch
          value={this.props.value}
          disabled={this.props.disabled}
          required={this.props.required}
          onChange={(event, value, data) => {
            this.inputOnChange(event, value, data);
          }}
          onError={(error) => {
            this.inputOnError(error);
          }}
          onValid={() => {
            this.inputOnValid();
          }}
        />
      );
    }

    // message
    let message = null;
    let messageText = '';
    if (this.props.hint && this.props.hint.length) {
      messageText = this.props.hint;
    }
    if (this.state.message && this.state.message.length && this.state.showError) {
      messageText = this.state.message;
    }
    if (moduleType !== 'workSheet' && moduleType !== 'workflow' && moduleType !== 'task' && moduleType !== 'approval' && messageText && messageText.length) {
      message = <span className="mui-formitem-message">{messageText}</span>;
    }
    if (moduleType !== 'hr' && this.state.error && this.state.showError && this.state.errorMessage) {
      message = (
        <div className="errorMessageBox">
          <span className="mui-formitem-message errorMessage">{this.state.errorMessage}</span>
            <i className="ErrorArrow" />
        </div>
      );
    }
    if (this.props.error) {
      message = <span className="mui-formitem-message mui-formitem-errorMessage">{this.props.error.errorMessage}</span>;
    }

    const classList = ['mui-formitem', this.props.className];
    // required
    if (this.props.required) {
      classList.push('mui-formitem-required');
    }
    // error
    if (this.state.error && this.state.showError) {
      classList.push('mui-formitem-error');
    }
    // props error
    if (this.props.error) {
      classList.push('mui-formitem-error');
    }
    // size
    if (this.props.size === 2) {
      classList.push(`mui-formitem-width-${this.props.size}`);
    }

    const classNames = classList.join(' ');

    if (this.props.type === FormControl.type.FILEATTACHMENT || this.props.type === FormControl.type.LINKPICKER) {
      return (
        <div
          className={cx(
            classNames,
            this.props.disabled ? 'formItem-read' : this.props.moduleType === 'workflow' ? 'formItem-workflow-write' : 'formItem-write',
            { workflowModified: this.props.workflowModifiedHighlight }
          )}
        >
          <span className="mui-formitem-label" title={_l(this.props.label)}>
            {_l(this.props.label)}
          </span>
            <div className="mui-formitem-control">{input}</div>
          {message}
        </div>
      );
    } else if (this.props.type === FormControl.type.FORMGROUP || this.props.type === FormControl.type.SIGNGROUP) {
      return input;
    } else {
      return (
        <label
          className={cx(
            classNames,
            this.props.type === FormControl.type.TEXTVIEW || this.props.disabled
              ? 'formItem-read'
              : this.props.moduleType === 'workflow'
              ? 'formItem-workflow-write'
              : 'formItem-write',
            { workflowModified: this.props.workflowModifiedHighlight }
          )}
        >
          <span className="mui-formitem-label" title={this.props.label}>
            {this.props.label}
            {this.props.attribute === 1 && <i className="icon-ic_title mLeft5 Font18 Gray_bd" title={_l('记录名称')} />}
          </span>
            <div className="mui-formitem-control">{input}</div>
          {message}
        </label>
      );
    }
  }
}

FormItem.propTypes = {
  className: PropTypes.string,
  /**
   * 控件单位
   */
  unit: PropTypes.string,
  /**
   * 控件名称
   */
  label: PropTypes.string,
  /**
   * 提示文本
   */
  hint: PropTypes.string,
  /**
   * 显示大小
   * 1 - 整行
   * 2 - 半行
   */
  size: PropTypes.number,
  /**
   * 控件类型
   */
  type: PropTypes.oneOf(FormControl.types),
  /**
   * 控件配置参数
   */
  config: PropTypes.object,
  /**
   * 控件当前值
   */
  value: PropTypes.any,
  /**
   * 控件附加数据（选项列表等）
   */
  data: PropTypes.any,
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
   */
  onChange: PropTypes.func,
  /**
   * 【回调】发生错误
   * @param {Error} error - 错误
   * error.type - 错误类型
   * error.message - 错误信息
   * error.dirty - 值是否发生过改变
   */
  onError: PropTypes.func,
  /**
   * 【回调】值有效（与 onError 相反）
   */
  onValid: PropTypes.func,
  /**
   * 控制显示error
   * {
   *   errMessage: String,
   * }
   */
  onSave: PropTypes.func,
  error: PropTypes.object,
  moduleType: PropTypes.string,
};

FormItem.defaultProps = {
  label: '',
  hint: '',
  size: 1,
  type: FormControl.type.TEXTINPUT,
  config: {},
  value: '',
  data: null,
  required: false,
  disabled: false,
  showError: false,
  onChange: (event, currentValue, data) => {
    //
  },
  onError: (error) => {
    //
  },
  onValid: () => {
    //
  },
  onSave: (value) => {},
  moduleType: 'hr',
};

export default FormItem;
