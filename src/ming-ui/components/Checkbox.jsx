import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import Icon from './Icon';
import './less/Checkbox.less';

export const SIZE_LIST = ['small', 'default'];

class Checkbox extends React.Component {
  static propTypes = {
    /**
     * checkbox显示的元素
     */
    text: PropTypes.any,
    /**
     * 默认是否选中
     */
    defaultChecked: PropTypes.bool,
    /**
     * 选中
     */
    checked: PropTypes.bool,
    /**
     * 回调， onClick(checked, value)
     */
    onClick: PropTypes.func.isRequired,
    /**
     * 在回调中作为第二个参数返回
     */
    value: PropTypes.any,
    /**
     *  大小 默认default
     */
    size: PropTypes.oneOf(['small', 'default']),
    /**
     * 子元素
     */
    children: PropTypes.any,
    /**
     * 是否禁用
     */
    disabled: PropTypes.bool,
    /**
     * 表单item名字
     */
    name: PropTypes.string,
    /**
     * 是否为复选框组
     */
    isGroup: PropTypes.bool,
    /**
     * 多选时，部分选择 中间显示方块
     */
    indeterminate: PropTypes.bool,
    /**
     * 多选时，部分选择 中间显示横线
     */
    clearselected: PropTypes.bool,
    /**
     * 类名
     */
    className: PropTypes.string,
    /**
     * 样式风格
     */
    styleType: PropTypes.oneOf(['light', 'default']),
  };

  static defaultProps = {
    onClick: () => {},
    indeterminate: false,
  };

  constructor(props) {
    super(props);
    const checked = props.checked || props.defaultChecked;
    this.state = {
      checked: !!checked,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.checked !== undefined) {
      this.setState({
        checked: nextProps.checked,
      });
    }
  }

  handleClick(event) {
    if (this.props.disabled) return false;
    if (this.props.checked !== undefined) {
      this.props.onClick(this.props.checked, this.props.value, event);
    } else {
      const checked = !this.state.checked;
      this.setState({
        checked,
      });
      this.props.onClick(checked, this.props.value, event);
    }
  }

  render() {
    const {
      text,
      children,
      disabled,
      className,
      size,
      indeterminate,
      clearselected,
      title,
      style,
      styleType = '',
    } = this.props;
    let icon = null;
    if (!indeterminate && this.state.checked) {
      icon = <Icon icon="ok" />;
    }
    if (clearselected) {
      icon = <Icon icon="minus" />;
    }
    return (
      <label
        style={style}
        checked={this.state.checked}
        className={cx(
          disabled ? 'Checkbox--disabled' : '',
          styleType === 'light' ? 'Checkbox--light' : '',
          'ming Checkbox overflow_ellipsis',
          {
            checked: !indeterminate && this.state.checked,
            indeterminate,
            clearselected,
          },
          className,
        )}
        onClick={event => {
          event.nativeEvent.stopImmediatePropagation();
          this.handleClick(event);
        }}
        title={title}
      >
        <span className={cx(SIZE_LIST.indexOf(size) >= 0 ? 'Checkbox-box--' + size : '', 'Checkbox-box')}>{icon}</span>
        <span className="Font13 Checkbox-text">{text}</span>
        {children}
      </label>
    );
  }
}

export default Checkbox;
