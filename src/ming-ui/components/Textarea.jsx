import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import formControl from 'ming-ui/decorators/formControl';
import './less/Textarea.less';

@formControl
class Textarea extends Component {
  static propTypes = {
    minHeight: PropTypes.number,
    maxHeight: PropTypes.number,
    maxLength: PropTypes.number,
    className: PropTypes.string,
    defaultValue: PropTypes.string,
    placeholder: PropTypes.string,
    isSelect: PropTypes.bool,
    isFocus: PropTypes.bool,
    onChange: PropTypes.func,
    onKeyDown: PropTypes.func,
    onBlur: PropTypes.func,
    resizeAfterBlur: PropTypes.bool,
    name: PropTypes.string, // 表单item名字
    $formDataChange: PropTypes.func, // 给withChildren��
    manualRef: PropTypes.func,
    chat: PropTypes.bool,
  };

  static defaultProps = {
    minHeight: 100,
    maxHeight: 10000,
    defaultValue: '',
    resizeAfterBlur: false,
    chat: false,
    manualRef: () => {},
  };

  componentDidMount() {
    this.props.$formDataChange(this.props.defaultValue);
    const $textarea = $(this.textarea);
    const diff = parseInt($textarea.css('paddingBottom'), 10) + parseInt($textarea.css('paddingTop'), 10) || 0;
    const events = this.props.resizeAfterBlur ? 'input keyup blur' : 'input keyup';
    const { chat } = this.props;
    $textarea.height(0).height(this.textarea.scrollHeight - diff);
    $textarea.on(events, function(event) {
      if (chat) {
        $(this)
          .height(0)
          .height(this.scrollHeight - diff);
      } else {
        $(this).height(this.scrollHeight - diff);
      }
    });

    if (this.props.isSelect) {
      $textarea.select();
    }

    if (this.props.isFocus) {
      $textarea.focus();
      this.moveCaretToEnd($textarea[0]);
    }

    setTimeout(() => {
      $textarea.height(this.textarea ? this.textarea.scrollHeight - diff : 0);
    }, 0);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(
      {
        defaultValue: nextProps.defaultValue,
      },
      () => {
        $(this.textarea).trigger('input');
      },
    );
    this.props.$formDataChange(nextProps.defaultValue);
  }

  moveCaretToEnd(el) {
    if (typeof el.selectionStart === 'number') {
      el.selectionStart = el.selectionEnd = el.value.length;
    } else if (typeof el.createTextRange !== 'undefined') {
      el.focus();
      var range = el.createTextRange();
      range.collapse(false);
      range.select();
    }
  }

  onChange(event) {
    this.props.$formDataChange(event.target.value);

    if (this.props.onChange) {
      this.props.onChange(event.target.value, event);
    }
  }

  render() {
    const {
      minHeight,
      maxHeight,
      className,
      style,
      isSelect,
      isFocus,
      resizeAfterBlur,
      name,
      $formDataChange,
      value,
      defaultValue,
      manualRef,
      ...rest
    } = this.props;
    const obj = value !== undefined ? { value } : { defaultValue };

    return (
      <textarea
        {...rest}
        {...obj}
        className={cx('ming Textarea', className)}
        ref={textarea => {
          this.textarea = textarea;
          manualRef(textarea);
        }}
        onChange={event => this.onChange(event)}
        style={{
          minHeight,
          maxHeight,
          ...style,
        }}
      />
    );
  }
}

export default Textarea;
