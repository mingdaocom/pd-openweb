import PropTypes from 'prop-types';
import React, { Component } from 'react';

import './style.less';

class Table extends Component {
  getListData = () => {
    let data = [];

    if (this.props.data && this.props.data.length) {
      data = this.props.data.map((item, i, list) => {
        return {
          id: item.id,
          row: item.row,
          col: item.col,
          size: item.size,
          label: item.label,
          valueText: item.valueText,
        };
      });
    }

    return data;
  };

  render() {
    const listData = this.getListData();

    const trs = [];
    let tds = [];
    let lastRow = 0;
    listData.map((item, i, list) => {
      if (item.row !== lastRow || tds.length === 4 ) {
        trs.push(<tr key={`row-${lastRow}`}>{tds}</tr>);

        tds = [];
      }

      tds.push(<td key={`label-${item.row}-${item.col}`}>{item.label}</td>);
      const colspan = ((i < list.length - 1 && list[i + 1].row !== item.row) || i === list.length - 1) && item.col === 0 ? 3 : 1;
      tds.push(
        <td key={`value-${item.row}-${item.col}`} colSpan={colspan}>
          {item.valueText}
        </td>
      );

      lastRow = item.row;

      return null;
    });

    if (tds.length) {
      trs.push(<tr key={`row-${lastRow}`}>{tds}</tr>);

      tds = [];
    }

    return (
      <table className="dossier-print-table">
        <tbody>{trs}</tbody>
      </table>
    );
  }
}

Table.propTypes = {
  /**
   * 表单数据
   */
  data: PropTypes.any,
};

Table.defaultProps = {
  data: [],
};

export default Table;
