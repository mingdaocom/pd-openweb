import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';
import Icon from './Icon';

export const BUTTON_TYPE_LIST = [
  'primary',
  'secondary',
  'success',
  'danger',
  'ghost',
  'link',
  'ghostgray',
  'danger-gray',
];
export const BUTTON_SIZE_LIST = ['tiny', 'small', 'medium', 'large', 'mdnormal', 'mdbig']; // 'mini', 'huge', 'massive'
import './less/Button.less';

export default class Button extends Component {
  static propTypes = {
    /**
     * 按钮子节点
     */
    children: PropTypes.node,
    /**
     * 按钮点击后调用异步action
     */
    action: PropTypes.func,
    /**
     * 是否禁用
     */
    disabled: PropTypes.bool,
    /**
     * 按钮是否处于载入状态
     */
    loading: PropTypes.bool,
    /**
     * 按钮类型
     */
    type: PropTypes.oneOf(BUTTON_TYPE_LIST),
    /**
     * 按钮尺寸大小
     */
    size: PropTypes.oneOf(BUTTON_SIZE_LIST),
    /**
     * 是否撑满容器
     */
    fullWidth: PropTypes.bool,
    /**
     * 按钮类名
     */
    className: PropTypes.string,
    /**
     * 按钮的图标类型
     */
    icon: PropTypes.string,
    /**
     * 点击按钮触发的回调
     */
    onClick: PropTypes.func,
    /**
     * 点击按钮触发的回调
     */
    style: PropTypes.object,
    /**
     * 是否是圆角
     */
    radius: PropTypes.bool,
  };

  static defaultProps = {
    type: 'primary',
    size: 'medium',
    radius: false,
  };

  state = {
    loading: false,
  };

  componentDidMount() {
    if (!this.props.loading && !this.state.loading) {
      setTimeout(() => this.computeWidth(), 0);
    }
    this.mounted = true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.children !== prevProps.children ||
      ((this.props.loading || this.state.loading) && !(prevProps.loading || prevState.loading))
    ) {
      this.computeWidth();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  computeWidth() {
    // loading 的时候保持宽度不变
    if (!(this.button instanceof Element)) return;
    const style = window.getComputedStyle(this.button, null); // eslint-disable-line
    this.width = this.button.getBoundingClientRect().width;
  }

  handleClick(...args) {
    const { action, onClick } = this.props;
    if (action) {
      try {
        this.promise = action.apply(this, args);
        this.setState({ loading: true });
        const stopLoading = () => {
          if (this.mounted) this.setState({ loading: false });
        };
        this.promise && this.promise.then(stopLoading, stopLoading);
      } catch (e) {
        console.error(e); // eslint-disable-line
      }
    }
    if (onClick) onClick.apply(this, args);
  }

  render() {
    const loading = this.props.loading || this.state.loading;
    const {
      disabled,
      type,
      radius,
      size,
      icon,
      fullWidth,
      children,
      className,
      style,
      action,
      loadingClassName,
      ...otherProps
    } = this.props;
    delete otherProps.loading;

    const content = loading ? (
      <div className={cx(loadingClassName, 'Button-loadingCircle')} />
    ) : typeof children === 'string' ? (
      <span>{children}</span>
    ) : (
      children
    );

    const btnCls = cx(
      'ming',
      {
        'Button--disabled': disabled,
        'Button--loading': loading,
        ['Button--' + size]: size,
        ['Button--' + type]: type,
        ['Button--circle']: radius,
      },
      'Button',
      className,
    );

    const btnStyle = Object.assign(
      {},
      {
        width: fullWidth ? '100%' : loading ? this.width : 'auto',
      },
      style,
    );
    const clickHandler = disabled || loading ? undefined : (...args) => this.handleClick(...args);

    return (
      <button
        {...otherProps}
        type="button"
        ref={button => {
          this.button = button;
        }}
        style={btnStyle}
        disabled={disabled || loading}
        className={btnCls}
        onClick={clickHandler}
        onKeyDown={e => {
          e.preventDefault();
        }}
      >
        {!loading && icon && <Icon icon={icon} />}
        {content}
      </button>
    );
  }
}
