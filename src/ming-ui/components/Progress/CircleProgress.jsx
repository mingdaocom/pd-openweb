import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import '../less/Progress.less';

class CircleProgress extends Component {
  static propTypes = {
    /**
     * 进度条类名
     */
    className: PropTypes.string,
    /**
     * 圆形进度条的直径长度
     */
    diameter: PropTypes.number,
    /**
     * 圆形进度条的线宽
     */
    strokeWidth: PropTypes.number,
    /**
     * 进度条的主题风格
     */
    theme: PropTypes.oneOf(['success', 'warning', 'danger', 'primary']),
    /**
     * 进度百分比
     */
    percent: PropTypes.number,
    /**
     * 格式化进度条的内容，接受percent为参数
     */
    format: PropTypes.func,
    /**
     * 前景色
     */
    foregroundColor: PropTypes.string,
    /**
     * 背景色
     */
    backgroundColor: PropTypes.string,
    /**
     * 前景色轮廓是否是圆角
     */
    isRound: PropTypes.bool,
    /**
     * 是否需要动画
     */
    isAnimation: PropTypes.bool,
  };

  static defaultProps = {
    percent: 0,
    theme: 'primary',
    strokeWidth: 6,
    diameter: 132,
    isRound: true,
    isAnimation: true,
  };

  componentDidMount() {
    this.setStrokeDashoffset();
  }

  componentDidUpdate() {
    this.setStrokeDashoffset();
  }

  setStrokeDashoffset() {
    setTimeout(() => {
      const { diameter, percent } = this.props;
      const len = Math.PI * diameter;
      if (this._circlePath && this._circlePath.style) {
        this._circlePath.style.strokeDashoffset = `${len - percent / 100 * len}px`;
      }
    }, 1000);
  }

  getStrokePathStyle = () => {
    const { diameter, isAnimation } = this.props;
    const len = Math.PI * diameter;
    return {
      strokeDasharray: `${len}px`,
      strokeDashoffset: `${len}px`,
      transition: isAnimation ? 'stroke-dashoffset 1200ms cubic-bezier(.99,.01,.62,.94)' : '0',
    };
  };

  render() {
    const { className, diameter, theme, percent, format, strokeWidth, foregroundColor, backgroundColor, isRound, isAnimation, ...other } = this.props;

    const isTheme = foregroundColor && backgroundColor ? 0 : 1;

    const progressCls = classNames(
      'ming Progress',
      {
        'Progress--circle': true,
        'Progress--circle-zero': percent === 0,
        [`Progress--${theme}`]: !!isTheme,
      },
      className
    );

    const fontSize = `${parseInt(diameter * 0.16, 10)}px`;

    const foregroundStyle = {
      stroke: foregroundColor,
    };

    const backgroundStyle = {
      stroke: backgroundColor,
    };

    return (
      <div {...other} className={progressCls}>
        <div style={{ width: diameter, height: diameter }} className="Progress--circle-inner">
          <svg width={diameter} height={diameter}>
            <circle
              style={backgroundStyle}
              r={(diameter - strokeWidth) / 2}
              cy={diameter / 2}
              cx={diameter / 2}
              fill="none"
              className="Progress--circle-trail"
              strokeWidth={strokeWidth}
            />
            <circle
              ref={circlePath => (this._circlePath = circlePath)}
              r={(diameter - strokeWidth) / 2}
              cy={diameter / 2}
              cx={diameter / 2}
              fill="none"
              strokeLinejoin={isRound ? 'round' : 'initial'}
              strokeLinecap={isRound ? 'round' : 'initial'}
              style={{ ...this.getStrokePathStyle(), ...foregroundStyle }}
              className="Progress--circle-path"
              strokeWidth={strokeWidth}
            />
          </svg>
          <span style={{ fontSize }} className="Progress--circle-content">
            {format ? format(percent) : `${percent}%`}
          </span>
        </div>
      </div>
    );
  }
}

export default CircleProgress;
