import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import { getCursortPosition, getSelectText, KEYCODE } from './utils';

class InputBase extends Component {
  static defaultProps = {
    onChange: () => {},
  };
  static propTypes = {
    keys: PropTypes.array,
    readOnly: PropTypes.bool,
    index: PropTypes.number,
    iptLength: PropTypes.number,
    inpWidth: PropTypes.number,
    uppercase: PropTypes.bool,
    validator: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    onPaste: PropTypes.func,
    onNextFocus: PropTypes.func,
    onPrevFocus: PropTypes.func,
    onChange: PropTypes.func,
  };
  handleDelete = event => {
    let newKeys;
    const { onChange, index, onPrevFocus, keys } = this.props;
    const target = event.target;
    const pos = getCursortPosition(target);
    const selectText = getSelectText(target);

    if (selectText.length) {
      // 选中文本
      newKeys = [].concat(keys.slice(0, pos), keys.slice(pos + selectText.length));
    } else if (pos === event.target.value.length) {
      // 末尾 未选中文本
      newKeys = keys.slice(0, pos - 1);
    } else {
      newKeys = [].concat(keys.slice(0, pos), keys.slice(pos + 1));
    }

    onChange(newKeys, index);
  };
  handleInput = key => {
    let editable = false;
    const props = this.props;
    const { index, validator, iptLength, keys } = props;
    key = /[a-z]/.test(key) && props.uppercase ? key.toUpperCase() : key; // 转化成大写

    if (typeof validator === 'function') {
      // validator 是func
      editable = validator(key);
    } else if (typeof validator === 'string') {
      // validator 是string， 采用正则
      try {
        const reg = new RegExp(validator);
        if (reg.test(key)) {
          editable = true;
        }
      } catch (error) {
        // error
      }
    }
    if (editable && keys.length < iptLength) {
      keys.push(key);
      props.onChange(keys, index, 'input');
    }
  };
  handlePaste = event => {
    this.props.onPaste(event, this.props.index);
  };
  handleKeyDown = event => {
    const { index, onPrevFocus, onNextFocus, readOnly } = this.props;
    if (readOnly) {
      return;
    }
    const target = event.target;
    const keynum = event.keyCode; // 字母d,keynum=100
    const keychar = String.fromCharCode(keynum).toLowerCase(); // 将keynum转换成字符d
    const cursortPos = getCursortPosition(target); // 光标所在的位置
    if (keynum === KEYCODE.BACKSPACE) {
      // 删除
      this.handleDelete(event);
      return;
    }
    if (keynum === KEYCODE.LEFT && cursortPos === 0) {
      onPrevFocus(index);
      return;
    }
    if (keynum === KEYCODE.RIGHT && cursortPos === target.value.length) {
      onNextFocus(index);
      return;
    }
    this.handleInput(keychar);
  };
  render() {
    const { readOnly } = this.props;
    return (
      <input
        className={cx({
          disable: readOnly,
        })}
        onChange={() => {}}
        onPaste={this.handlePaste}
        style={{ width: this.props.inpWidth }}
        ref={ipt => (this._ipt = ipt)}
        value={this.props.keys.join('')}
        onKeyDown={this.handleKeyDown}
        readOnly={readOnly}
      />
    );
  }
}

export default InputBase;
