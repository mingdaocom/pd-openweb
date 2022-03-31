import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import './style.less';

import TimeMenu from './time-menu';

class Time extends Component {
  constructor(props) {
    super(props);

    const value = this.props.value || {
      hour: 0,
      minute: 0,
      second: 0,
    };

    this.state = {
      /**
       * 当前值
       */
      value,
      /**
       * 显示文本
       */
      label: this.getTimeLabel(value),
      /**
       * 菜单是否展开
       */
      menuOpened: false,
    };

    this.button = null;
  }

  componentDidMount() {
    window.addEventListener('mousedown', this.clickListener, false);

    window.addEventListener('keydown', this.keyDownListener, false);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.value) {
      const value = nextProps.value || {
        hour: 0,
        minute: 0,
        second: 0,
      };
      const label = this.getTimeLabel(value);

      this.setState({
        value,
        label,
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.clickListener, false);

    window.removeEventListener('keydown', this.keyDownListener, false);
  }

  padZero = (value) => {
    return value < 10 ? `0${value}` : value.toString();
  };

  getTimeLabel = (time) => {
    let data = [this.padZero(time.hour), this.padZero(time.minute)];
    if (this.props.type === 'second') {
      data = [this.padZero(time.hour), this.padZero(time.minute), this.padZero(time.second)];
    }

    return data.join(':');
  };

  clickListener = (e) => {
    const node = ReactDOM.findDOMNode(this);
    if ((node === e.target || !node.contains(e.target)) && this.state.menuOpened) {
      this.hideMenu();
    }
  };

  keyDownListener = (e) => {
    if (
      e.keyCode === 27 && // ESC
      this.state.menuOpened
    ) {
      this.hideMenu();
    }
  };

  showMenu() {
    this.setState({
      menuOpened: true,
    });
  }

  hideMenu() {
    this.setState({
      menuOpened: false,
    });
  }

  toggleMenuOpened = () => {
    this.setState({
      menuOpened: !this.state.menuOpened,
    });
  };

  onPick = (event, value) => {
    const label = this.getTimeLabel(value);

    this.setState({
      value,
      label,
    });

    if (this.props.onChange) {
      this.props.onChange(event, value, label);
    }
  };

  render() {
    const classList = ['mui-time'];
    if (this.state.menuOpened && this.button) {
      const rect = this.button.getBoundingClientRect();
      if (window.innerHeight - rect.top < rect.height + 162) {
        classList.push('bottom-edge');
      }
      if (window.innerWidth - rect.left < 122 - rect.width) {
        classList.push('right-edge');
      }
    }
    const classNames = classList.join(' ');

    return (
      <div className={classNames}>
        <button
          ref={(button) => {
            this.button = button;
          }}
          className="mui-forminput"
          disabled={this.props.disabled}
          onClick={this.toggleMenuOpened}
        >
          <span>{this.state.label}</span>
        </button>
        <TimeMenu
          show={this.state.menuOpened}
          mode={this.props.type}
          value={this.state.value}
          min={this.props.min}
          max={this.props.max}
          onPick={(event, value) => {
            this.onPick(event, value);
          }}
        />
      </div>
    );
  }
}

Time.propTypes = {
  /**
   * 选择模式
   */
  type: PropTypes.oneOf([
    'hour', // HH
    'minute', // HH:mm
    'second', // HH:mm:ss
  ]),
  /**
   * 最小值
   */
  min: PropTypes.any,
  /**
   * 最大值
   */
  max: PropTypes.any,
  /**
   * 选中的值
   */
  value: PropTypes.any,
  /**
   * 是否禁用
   */
  disabled: PropTypes.bool,
  /**
   * 值发生改变
   * @param {event} event - 触发事件
   * @param {object} time - 选中的时间
   * @param {string} label - 时间的展示文本
   */
  onChange: PropTypes.func,
};

Time.defaultProps = {
  type: 'minute',
  min: null,
  max: null,
  value: {
    hour: 0,
    minute: 0,
    second: 0,
  },
  disabled: false,
  onChange: (event, time, label) => {
    //
  },
};

export default Time;
