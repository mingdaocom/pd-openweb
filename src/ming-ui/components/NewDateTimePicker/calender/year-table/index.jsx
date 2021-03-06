import PropTypes from 'prop-types';
import React, { Component } from 'react';

class YearTable extends Component {
  itemOnClick = (event, item) => {
    if (item.disabled) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      if (this.props.onPick) {
        this.props.onPick(event, item.value, item.time);
      }
    }
  };

  renderBodyList = () => {
    const trList = this.props.bodyData.map((row, i, rowList) => {
      const tdList = row.map((item, j, items) => {
        const classList = [];
        if (item.disabled) {
          classList.push('disabled');
        }
        if (item.current) {
          classList.push('current');
          classList.push('ThemeBGColor3');
        }
        if (item.other) {
          classList.push('other');
        }
        if (item.inRange) {
          classList.push('in-range');
        }
        if (item.now) {
          classList.push('now');
          classList.push('ThemeColor3');
        }

        const classNames = classList.join(' ');

        return (
          <td
            key={j}
            className={classNames}
            onClick={(event) => {
              event.nativeEvent.stopImmediatePropagation();
              this.itemOnClick(event, item);
            }}
          >
            {item.label}
          </td>
        );
      });

      return <tr key={i}>{tdList}</tr>;
    });

    return trList;
  };

  render() {
    const trList = this.renderBodyList();

    return (
      <table className="year">
        <tbody>{trList}</tbody>
      </table>
    );
  }
}

YearTable.propTypes = {
  /**
   * 表格数据
   */
  bodyData: PropTypes.any,
  /**
   * 选择数据
   * @param {event} event - 选择事件
   * @param {number} value - 选择的值
   * @param {Date} time - 选中的日期
   */
  onPick: PropTypes.func,
};

YearTable.defaultProps = {
  bodyData: [],
  onPick: (event, value, time) => {
    //
  },
};

export default YearTable;
