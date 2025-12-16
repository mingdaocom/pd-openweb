import React, { Component } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { Tooltip } from 'ming-ui/antd-components';
import './less/Score.less';

class Score extends Component {
  static propTypes = {
    /**
     * 类型
     */
    type: PropTypes.string,
    /**
     * 已选择的背景色
     */
    foregroundColor: PropTypes.string,
    /**
     * 未选择的背景色
     */
    backgroundColor: PropTypes.string,
    /**
     * 评分的总数
     */
    count: PropTypes.number,
    /**
     * 评分数
     */
    score: PropTypes.number,
    /**
     * 回调函数
     */
    callback: PropTypes.func,
    /**
     * 是否禁用
     */
    disabled: PropTypes.bool,
    /**
     * hover 上的回调函数
     */
    hover: PropTypes.func,
    /**
     * 不显示 tip
     */
    hideTip: PropTypes.bool,
  };
  static defaultProps = {
    type: 'line',
    count: 5,
    score: 0,
    foregroundColor: '#0085e4',
    backgroundColor: '#e0e0e0',
    callback: () => {},
    disabled: false,
    hover: () => false,
  };
  constructor(props) {
    super(props);
    this.state = {
      lastColor: this.props.foregroundColor,
      foregroundColor: this.props.foregroundColor,
      score: this.props.score,
      lastScore: this.props.score,
    };

    if (this.props.disabled) {
      this.onSelect = () => {};
      this.onMouseEnter = () => {};
      this.onMouseLeave = () => {};
    } else {
      this.onSelect = this.onSelect.bind(this);
      this.onMouseEnter = this.onMouseEnter.bind(this);
      this.onMouseLeave = this.onMouseLeave.bind(this);
    }
  }
  componentWillReceiveProps(nextProps) {
    if ('score' in nextProps) {
      this.setState({
        foregroundColor: nextProps.foregroundColor,
        lastColor: nextProps.foregroundColor,
        score: nextProps.score,
        lastScore: nextProps.score,
      });
    }
  }
  onSelect(index, event) {
    event.stopPropagation();
    if (index === this.state.lastScore) {
      index = 0;
    }
    this.setState({
      lastScore: index,
      score: index,
    });
    this.props.callback(index, event);
  }
  onMouseEnter(index, event) {
    const color = this.props.hover(index, event) || this.props.foregroundColor;
    this.setState({
      foregroundColor: color,
      score: index,
    });
  }
  onMouseLeave() {
    const { lastScore, lastColor } = this.state;
    this.setState({
      foregroundColor: lastColor,
      score: lastScore,
    });
  }
  renderLine(index) {
    const { score, foregroundColor } = this.state;
    const { backgroundColor, hideTip } = this.props;

    const defaultStyle = {
      backgroundColor,
    };
    const selectStyle = {
      backgroundColor: foregroundColor,
    };

    return (
      <Tooltip title={this.props.disabled || hideTip ? '' : index + 1}>
        <div
          key={index}
          onClick={event => this.onSelect(index + 1, event)}
          onMouseEnter={event => this.onMouseEnter(index + 1, event)}
          onMouseLeave={this.onMouseLeave}
          style={index < score ? selectStyle : defaultStyle}
          className="LineScore-item"
        />
      </Tooltip>
    );
  }
  renderStar(index) {
    const { score, foregroundColor } = this.state;
    const { backgroundColor, defaultIcon, hideTip } = this.props;

    const defaultStyle = {
      color: backgroundColor,
    };
    const selectStyle = {
      color: foregroundColor,
    };

    return (
      <Tooltip title={this.props.disabled || hideTip ? '' : index + 1}>
        <div
          key={index}
          className="StarScore-item"
          onClick={event => this.onSelect(index + 1, event)}
          onMouseEnter={event => this.onMouseEnter(index + 1, event)}
          onMouseLeave={this.onMouseLeave}
        >
          {index < score ? (
            <i style={selectStyle} className="icon-task_custom_starred" />
          ) : (
            <i style={defaultStyle} className={cx('icon-task_custom_starred', defaultIcon)} />
          )}
        </div>
      </Tooltip>
    );
  }
  render() {
    const { count, type } = this.props;
    const list = Array.from({ length: count });
    return (
      <div className="Score-wrapper">
        {list.map((item, index) => (type === 'line' ? this.renderLine(index) : this.renderStar(index)))}
      </div>
    );
  }
}

export default Score;
