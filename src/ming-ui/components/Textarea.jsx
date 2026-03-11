import React, { Component } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import './less/Textarea.less';

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
    const $textarea = $(this.textarea);
    const events = this.props.resizeAfterBlur ? 'input keyup blur' : 'input keyup';
    const { chat } = this.props;
    this.adjustHeight($textarea, chat);
    $textarea.on(events, () => {
      this.adjustHeight($textarea, chat);
    });

    if (this.props.isSelect) {
      $textarea.select();
    }

    if (this.props.isFocus) {
      this.textarea.focus({ preventScroll: true });
      this.moveCaretToEnd($textarea[0]);
    }

    setTimeout(() => {
      this.adjustHeight($textarea, chat);
    }, 0);
  }

  // 获取最近的滚动容器
  getScrollParent(element) {
    if (!element) return null;
    let parent = element.parentElement;
    while (parent) {
      const { overflow, overflowY } = window.getComputedStyle(parent);
      if (overflow === 'auto' || overflow === 'scroll' || overflowY === 'auto' || overflowY === 'scroll') {
        return parent;
      }
      parent = parent.parentElement;
    }
    return null;
  }

  // 调整高度时保持滚动位置
  adjustHeight($textarea, chat) {
    if (!this.textarea) return;
    const scrollParent = this.getScrollParent(this.textarea);
    const scrollTop = scrollParent ? scrollParent.scrollTop : 0;

    // 先重置高度为 0，确保 scrollHeight 是基于当前实际 padding 计算的
    $textarea.height(0);

    // 获取当前实际应用的 padding（可能被 CSS 覆盖了）
    const diff = parseInt($textarea.css('paddingBottom'), 10) + parseInt($textarea.css('paddingTop'), 10) || 0;

    const scrollHeight = this.textarea.scrollHeight;

    if (chat) {
      $textarea.height(0).height(scrollHeight - diff);
    } else {
      $textarea.height(scrollHeight - diff);
    }

    // 恢复滚动位置
    if (scrollParent && scrollParent.scrollTop !== scrollTop) {
      scrollParent.scrollTop = scrollTop;
    }
  }

  componentWillReceiveProps(nextProps) {
    const $textarea = $(this.textarea);

    // 处理 isFocus 变化
    if (nextProps.isFocus && !this.props.isFocus) {
      this.textarea.focus({ preventScroll: true });
      this.moveCaretToEnd($textarea[0]);
    }

    this.setState(
      {
        defaultValue: nextProps.defaultValue,
      },
      () => {
        $(this.textarea).trigger('input');
        this.adjustHeight($textarea, this.props.chat);
      },
    );
  }

  moveCaretToEnd(el) {
    if (typeof el.selectionStart === 'number') {
      el.selectionStart = el.selectionEnd = el.value.length;
    } else if (typeof el.createTextRange !== 'undefined') {
      el.focus({ preventScroll: true });
      var range = el.createTextRange();
      range.collapse(false);
      range.select();
    }
  }

  onChange(event) {
    if (this.props.onChange) {
      this.props.onChange(event.target.value, event);
    }
  }

  render() {
    const { minHeight, maxHeight, className, style, value, defaultValue, manualRef, ...rest } = this.props;
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
