import React, { Component } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import './less/Switch.less';

class Switch extends Component {
  static propTypes = {
    /**
     * 点击事件,参数(checked, value)
     */
    onClick: PropTypes.func,
    /**
     * 是否禁用
     */
    disabled: PropTypes.bool,
    /**
     * 默认checked
     */
    defaultChecked: PropTypes.bool,
    /**
     * checked
     */
    checked: PropTypes.bool,
    /**
     * value
     */
    value: PropTypes.string,
    /**
     * 表单item名字
     */
    name: PropTypes.string,
    /**
     * 类名
     */
    className: PropTypes.string,
    /**
     * text
     */
    text: PropTypes.string,
    size: PropTypes.string,
    primaryColor: PropTypes.string,
  };

  static defaultProps = {
    onClick: () => {},
    text: '',
  };

  constructor(props) {
    super(props);
    const checked = props.checked || props.defaultChecked || false;
    this.state = {
      checked,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.checked !== undefined) {
      this.setState({
        checked: nextProps.checked,
      });
    }
  }

  handleClick() {
    if (this.props.disabled) return false;
    this.setState(
      {
        needAnimate: true,
      },
      () => {
        setTimeout(() => {
          this.setState({
            needAnimate: false,
          });
        }, 200);
      },
    );
    if (this.props.checked !== undefined) {
      this.props.onClick(this.props.checked, this.props.value);
    } else {
      const checked = !this.state.checked;
      this.setState({
        checked,
      });
      this.props.onClick(checked, this.props.value);
    }
  }

  render() {
    const { disabled, text, size, primaryColor } = this.props;
    const { checked, needAnimate } = this.state;
    return (
      <label
        className={cx(
          'ming Switch',
          checked ? 'Switch--on' : 'Switch--off',
          size || '',
          { hasText: text },
          this.props.className,
          {
            'Switch--disabled': disabled,
            animate: needAnimate,
          },
        )}
        onClick={e => {
          e.stopPropagation();
          this.handleClick();
        }}
        checked={this.state.checked}
        style={primaryColor && { background: checked && primaryColor }}
      >
        <span className="txt ellipsis">{text}</span>
        <span className="dot" />
      </label>
    );
  }
}

export default Switch;
