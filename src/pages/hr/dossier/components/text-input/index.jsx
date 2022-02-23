import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import { Linkify } from 'ming-ui';
import Textarea from 'ming-ui/components/Textarea';
import { FormError, Validator } from '../lib';
import { checkControlUnique } from '../../util';
import './style.less';

class TextInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // current value
      value: this.props.value || '',
      // value error
      error: false,
      // dirty
      dirty: false,
      // show error
      showError: false,
      isEditing: false,
    };
  }

  componentDidMount() {
    // check init value
    this.checkValue(this.state.value, false);
  }

  componentWillReceiveProps(nextProps) {
    // value changed[outer value]
    if (nextProps.value !== this.state.value) {
      this.setState({
        value: nextProps.value,
      });
      if (this.number) {
        this.number.value = nextProps.value;
      }
    }
    // showError changed
    if (nextProps.showError !== this.props.showError) {
      this.setState({
        showError: this.state.dirty || nextProps.showError,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.value !== this.state.value) {
      this.checkValue(this.state.value, true);
    }
    if (!prevState.isEditing && this.state.isEditing) {
      $('.mui-textinput-unit-box input').select();
    }
  }

  // value changed[inside value]
  onChange = event => {
    let value = event.target.value;

    if (this.props.valueType === 'number') {
      value = value
        .replace(/[^-\d.]/g, '')
        .replace(/^\./g, '')
        .replace(/^-/, '$#$')
        .replace(/-/g, '')
        .replace('$#$', '-')
        .replace(/^-\./, '-')
        .replace('.', '$#$')
        .replace(/\./g, '')
        .replace('$#$', '.');

      if (value === '.') {
        value = '';
      }
    }

    this.checkValue(value, true);

    // update state.value
    this.setState({
      value,
      changed: true,
    });

    if (this.props.onChange) {
      // fire onChange callback
      this.props.onChange(event, value, {
        prevValue: this.state.value,
      });
    }
  };

  onBlur(e) {
    const { worksheetId, recordId, control } = this.props;
    if (!this.state.error) {
      let { value } = this.state;
      this.setState({ isEditing: false });

      if (this.props.valueType === 'number') {
        if (value === '-') {
          value = '';
        } else if (value) {
          value = parseFloat(value).toFixed(this.props.dot).toString();
        }

        if (value !== this.state.value) {
          this.setState({ value });
          if (this.props.onChange) {
            this.props.onChange(e, value, { prevValue: value });
          }
        }
      }
      if (
        control &&
        control.unique &&
        this.state.changed &&
        value &&
        (control.type === 2 || // 文本框
          control.type === 5 || // 邮件地址
          control.type === 7) // 证件
      ) {
        checkControlUnique(worksheetId, control.controlId, control.type, value).then(res => {
          if (!res.isSuccess && res.data && res.data.rowId !== recordId) {
            if (this.props.onError) {
              this.props.onError({
                type: FormError.types.UNIQUE,
                dirty: true,
              });
            }
            this.setState({
              error: true,
              showError: true,
            });
          }
        });
      }
      this.props.onSave(e, value);
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
    if (this.props.required && (!value || !value.length || !value.trim().length)) {
      error.type = FormError.types.REQUIRED;
    } else if (this.props.minLength && value.length < this.props.minLength) {
      // minLength
      error.type = FormError.types.MINLENGTH;
    } else if (this.props.maxLength && value.length > this.props.maxLength) {
      // maxLength
      error.type = FormError.types.MAXLENGTH;
    } else if (
      this.props.validate &&
      this.props.valueType === 'mobile-phone' &&
      value &&
      value.length &&
      !Validator.isMobilePhoneNumber(value)
    ) {
      // valueType = 'mobile-phone'
      error.type = FormError.types.MOBILEPHONE;
    } else if (
      this.props.validate &&
      this.props.valueType === 'telephone' &&
      value &&
      value.length &&
      !Validator.isTelehoneNumber(value)
    ) {
      // valueType = 'telephone'
      error.type = FormError.types.TELEPHONE;
    } else if (
      this.props.validate &&
      this.props.valueType === 'email' &&
      value &&
      value.length &&
      !Validator.isEmailAddress(value)
    ) {
      // valueType = 'email'
      error.type = FormError.types.EMAIL;
    } else if (
      this.props.validate &&
      this.props.valueType === 'id-card' &&
      value &&
      value.length &&
      !Validator.isIdCardNumber(value)
    ) {
      // valueType = 'id-card'
      error.type = FormError.types.IDCARD;
    } else if (
      this.props.validate &&
      this.props.valueType === 'passport' &&
      value &&
      value.length &&
      !Validator.isPassportNumber(value)
    ) {
      // valueType = 'passport'
      error.type = FormError.types.PASSPORT;
    } else if (
      this.props.validate &&
      this.props.valueType === 'hk-passport' &&
      value &&
      value.length &&
      !Validator.isHkPassportNumber(value)
    ) {
      // valueType = 'hk-passport'
      error.type = FormError.types.HKPASSPORT;
    } else if (
      this.props.validate &&
      this.props.valueType === 'tw-passport' &&
      value &&
      value.length &&
      !Validator.isTwPassportNumber(value)
    ) {
      // valueType = 'tw-passport'
      error.type = FormError.types.TWPASSPORT;
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

  /**
   * 多行文本进入编辑
   */
  joinTextareaEdit = evt => {
    const { disabled } = this.props;
    const href = evt.target.getAttribute('href');

    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.target = '_blank';
      a.rel = 'nofollow noopener noreferrer';
      a.click();
      evt.preventDefault();
    } else if (!disabled) {
      this.setState({ isEditing: true });
    }
  };

  render() {
    const { enumDefault } = this.props;
    const classList = ['mui-textinput', 'ThemeFocusBorderColor3'];
    // is error
    if (this.state.error && this.state.showError) {
      classList.push('mui-textinput-error');
    }

    const classNames = classList.join(' ');

    // single line = input
    if (!this.props.multipleLine) {
      if (this.props.valueType === 'number') {
        if (!this.state.isEditing) {
          const number = this.state.value ? parseFloat(this.state.value).toFixed(this.props.dot) : '';
          const reg = number.indexOf('.') > -1 ? /(\d{1,3})(?=(?:\d{3})+\.)/g : /(\d{1,3})(?=(?:\d{3})+$)/g;
          const value = number.replace(reg, '$1,');

          return (
            <div
              className={cx('mui-textinput-unit-box Font14 number', {
                placeholder: !value,
                pointer: !this.props.disabled,
              })}
              onClick={() => !this.props.disabled && this.setState({ isEditing: true })}
            >
              {(value || this.props.hint) + (this.state.value !== '' ? this.props.unit : '')}
            </div>
          );
        }
        return (
          <div className="mui-textinput-unit-box">
            <input
              type={this.props.valueType === 'password' ? 'password' : 'text'}
              ref={number => {
                this.number = number;
              }}
              className={cx(classNames, this.props.className)}
              placeholder={this.props.hint}
              disabled={this.props.disabled}
              value={this.state.value}
              maxLength={16}
              onBlur={event => {
                this.onBlur(event);
              }}
              onChange={event => {
                this.onChange(event);
              }}
            />
          </div>
        );
      } else {
        return (
          <input
            type={this.props.valueType === 'password' ? 'password' : 'text'}
            className={cx(classNames, this.props.className)}
            placeholder={this.props.hint}
            disabled={this.props.disabled}
            value={this.state.value}
            onBlur={event => {
              this.onBlur(event);
            }}
            onChange={event => {
              this.onChange(event);
            }}
          />
        );
      }
    } else {
      if (!this.state.isEditing) {
        return (
          <div
            style={{ minHeight: enumDefault === 1 ? '90px' : '36px' }}
            className={cx('mui-textinput-content', { Gray_bd: !this.state.value.trim() })}
            onClick={this.joinTextareaEdit}
          >
            <Linkify properties={{ target: '_blank' }} className={cx(!this.state.value && 'placeholder')}>
              {this.state.value || this.props.hint}
            </Linkify>
            {!this.props.disabled && (
              <input type="text" className="smallInput" onFocus={() => this.setState({ isEditing: true })} />
            )}
          </div>
        );
      }
      return (
        <Textarea
          isFocus
          className={cx(classNames, this.props.className)}
          minHeight={enumDefault === 1 ? 90 : 36}
          maxHeight={200}
          value={this.state.value}
          placeholder={this.props.hint}
          spellCheck={false}
          onChange={(value, event) => {
            this.onChange(event);
          }}
          onBlur={(value, event) => {
            this.onBlur(event);
            this.setState({ isEditing: false });
          }}
        />
      );
    }
  }
}

TextInput.propTypes = {
  /*
   * 引导文字
   * */
  hint: PropTypes.string,
  /**
   * 当前值
   */
  value: PropTypes.string,
  /**
   * 小数位数
   */
  dot: PropTypes.number,
  /**
   * 内容类型
   */
  valueType: PropTypes.oneOf([
    // 普通文本
    'text',
    // 手机号码
    'mobile-phone',
    // 手机号码
    'telephone',
    // 邮箱地址
    'email',
    // 身份证号码
    'id-card',
    // 护照
    'passport',
    // 港澳通行证
    'hk-passport',
    // 台湾通行证
    'tw-passport',
    // 数字
    'number',
    // 密码
    'password',
  ]),
  /**
   * 是否多行
   */
  multipleLine: PropTypes.bool,
  /**
   * 是否必填
   */
  required: PropTypes.bool,
  /**
   * 最小字符数
   */
  minLength: PropTypes.number,
  /**
   * 最大字符数
   */
  maxLength: PropTypes.number,
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
  /**
   * 失去焦点保存
   */
  onSave: PropTypes.func,
  hint: PropTypes.string,
  className: PropTypes.string,
  unit: PropTypes.string,
  error: PropTypes.object,
};

TextInput.defaultProps = {
  value: '',
  dot: 0,
  valueType: 'text',
  multipleLine: false,
  required: false,
  minLength: 0,
  maxLength: 0,
  disabled: false,
  showError: false,
  unit: '',
  onChange: (event, value, data) => {
    //
  },
  onError: error => {
    //
  },
  onValid: () => {
    //
  },
  onSave: (event, value) => {},
};

export default TextInput;
