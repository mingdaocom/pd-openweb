import PropTypes from 'prop-types';
import React, { Component } from 'react';

class DateTable extends Component {
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

  renderHeadList = () => {
    const thList = this.props.headData.map((item, i, list) => {
      return <th key={i}>{item}</th>;
    });

    return thList;
  };

  renderBodyList = () => {
    const trList = this.props.bodyData.map((row, i, rowList) => {
      const tdList = row.map((item, j, items) => {
        const classList = [];
        const labelClassList = [];
        if (item.other) {
          classList.push('other');
        }
        if (item.disabled) {
          classList.push('disabled');
        }
        if (item.current) {
          classList.push('current');
          labelClassList.push('ThemeBGColor3');
        }
        if (item.inRange) {
          classList.push('in-range');
          classList.push('ThemeBeforeBGColor6');
          // start
          if (item.start) {
            classList.push('cell-start');
          }
          // end
          if (item.end) {
            classList.push('cell-end');
          }
          // left
          if (item.left) {
            classList.push('cell-left');
          }
          // right
          if (item.right) {
            classList.push('cell-right');
          }
        }
        if (item.now) {
          classList.push('now');
          classList.push('ThemeColor3');
        }

        const classNames = classList.join(' ');
        const labelClassNames = labelClassList.join(' ');

        return (
          <td
            key={j}
            className={classNames}
            onClick={(event) => {
              event.nativeEvent.stopImmediatePropagation();
              this.itemOnClick(event, item);
            }}
          >
            <div className={labelClassNames}>{item.label}</div>
          </td>
        );
      });

      return <tr key={i}>{tdList}</tr>;
    });

    return trList;
  };

  render() {
    const thList = this.renderHeadList();
    const trList = this.renderBodyList();

    return (
      <table className="date">
        <thead>
          <tr>{thList}</tr>
        </thead>
        <tbody>{trList}</tbody>
      </table>
    );
  }
}

DateTable.propTypes = {
  /**
   * 表头数据
   */
  headData: PropTypes.any,
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

DateTable.defaultProps = {
  headData: [],
  bodyData: [],
  onPick: (event, value, time) => {
    //
  },
};

export default DateTable;
