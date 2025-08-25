import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './style.less';

class List extends Component {
  constructor(props) {
    super(props);
    this.timeRef = React.createRef();
  }

  componentDidMount() {
    this.scrollToVisibleRange();
  }

  scrollToVisibleRange = () => {
    const { data } = this.props;
    const { value } = data.find(v => !!v.current);
    const { current } = this.timeRef;
    const offsetHeight = current.offsetHeight;
    const $parent = current.parentElement;
    const scrollTop = Math.floor(offsetHeight * (value / data.length)) - Math.floor($parent.offsetHeight / 2);
    $parent.scrollTop = scrollTop;
  };

  itemOnClick = (event, item) => {
    if (item.disabled) {
      return;
    }

    if (this.props.onPick) {
      this.props.onPick(event, item.value);
    }
  };

  render() {
    const items = this.props.data.map(item => {
      const classList = [];
      if (item.disabled) {
        classList.push('disabled');
      }
      if (item.current) {
        classList.push('current');
        classList.push('ThemeBGColor3');
      }
      const classNames = classList.join(' ');

      return (
        <li
          key={item.value}
          className={classNames}
          onClick={event => {
            this.itemOnClick(event, item);
          }}
        >
          {item.label}
        </li>
      );
    });
    return (
      <ul className="mui-timemenu-list" ref={this.timeRef}>
        {items}
      </ul>
    );
  }
}

List.propTypes = {
  /**
   * 数据列表
   */
  data: PropTypes.any,
  /**
   * 选择
   * @param {event} event - 事件
   * @param {any} value - 选中的值
   */
  onPick: PropTypes.func,
};

List.defaultProps = {
  data: [],
  onPick: () => {},
};

export default List;
