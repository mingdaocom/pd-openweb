import PropTypes from 'prop-types';
import React, { Component } from 'react';

import './style.less';

import Item from './item';
import { ACCOUNT_FIELD } from '../../../../constants';

class List extends Component {
  /**
   * 渲染表单
   */
  renderForm = () => {
    const formList = [];

    if (this.props.data && this.props.data.length) {
      // 前一个 row
      let prevRow = 0;
      // 前一个 col
      let prevCol = 0;

      this.props.data.map((item, i, list) => {
        if (item.type !== 'DIVIDER') {
          // add clearfix for different row
          if (item.row !== prevRow) {
            formList.push(<div className="mui-clearfix" key={`clearfix-${item.row}`} />);
          }

          let mark = false;
          if (item.id === ACCOUNT_FIELD.COMPANY_NAME) {
            mark = true;
          }

          // form item
          formList.push(<Item key={`item-${item.row}-${item.col}`} size={item.size} mark={mark} label={item.label} value={item.valueText} />);

          // update row and col
          prevRow = item.row;
          prevCol = item.col;
        }

        return null;
      });
    }
    return formList;
  };

  render() {
    let content = [];
    if (this.props.data && this.props.data.length) {
      content = this.renderForm();
    }

    return <ul className="dossier-user-form-list">{content}</ul>;
  }
}

List.propTypes = {
  /**
   * 表单数据
   */
  data: PropTypes.any,
};

List.defaultProps = {
  data: [],
};

export default List;
