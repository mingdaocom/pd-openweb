import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import '../less/Progress.less';

class LineProgress extends Component {
  static propTypes = {
    /**
     * 进度条类名
     */
    className: PropTypes.string,
    /**
     * 进度条的主题风格
     */
    theme: PropTypes.oneOf(['success', 'warning', 'danger', 'primary']),
    /**
     * 进度百分比
     */
    percent: PropTypes.number,
    /**
     * 是否启动动画
     */
    active: PropTypes.bool,
  };

  static defaultProps = {
    percent: 0,
    active: false,
    theme: 'primary',
  };

  render() {
    const { className, theme, percent, active, ...other } = this.props;

    const progressCls = classNames(
      'ming Progress',
      {
        'Progress--line': true,
        'Progress--active': active,
        [`Progress--${theme}`]: theme,
      },
      className
    );

    return (
      <div {...other} className={progressCls}>
        <div className="Progress--line-outer">
          <div className="Progress--line-inner">
            <div style={{ width: `${percent >= 100 ? 100 : percent}%` }} className="Progress--line-bg" />
          </div>
        </div>
      </div>
    );
  }
}

export default LineProgress;
