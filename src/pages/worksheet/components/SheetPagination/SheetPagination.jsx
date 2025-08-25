import React, { Component } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import './SheetPagination.less';

export default class SheetPagination extends Component {
  static propTypes = {
    count: PropTypes.number,
    pageSize: PropTypes.number,
    pageIndex: PropTypes.number,
    onChange: PropTypes.func,
  };
  static defaultProps = {
    pageIndex: 1,
    onChange: () => {},
  };
  renderPage(index, pageIndex) {
    if (index === -1) {
      return (
        <span key={index} className="pageNum">
          ...
        </span>
      );
    }
    return (
      <span
        className={cx('pageNum', {
          Hand: true,
          ThemeColor3: index === pageIndex,
        })}
        onClick={() => {
          this.props.onChange(index);
        }}
        key={index}
      >
        {index}
      </span>
    );
  }
  renderAllPage(length, pageIndex, offset = 0) {
    return [...new Array(length)].map((a, index) => this.renderPage(index + 1 + offset, pageIndex));
  }
  renderPiecePage() {
    const { count, pageSize, pageIndex } = this.props;
    const pages = Math.ceil(count / pageSize);
    if (pageIndex < 5) {
      return this.renderAllPage(5, pageIndex).concat(this.renderPage(-1)).concat(this.renderPage(pages));
    } else if (pageIndex > pages - 4) {
      return [this.renderPage(1, pageIndex)]
        .concat(this.renderPage(-1, pageIndex))
        .concat(this.renderAllPage(5, pageIndex, pages - 5));
    } else {
      return [this.renderPage(1, pageIndex)]
        .concat(this.renderPage(-1, pageIndex))
        .concat(this.renderAllPage(5, pageIndex, pageIndex - 3))
        .concat(this.renderPage(-1, pageIndex))
        .concat(this.renderPage(pages));
    }
  }
  render() {
    const { count, pageSize, pageIndex } = this.props;
    const pageMax = 9;
    const pages = Math.ceil(count / pageSize);
    return (
      <div className="sheetPagination">
        {pages < pageMax ? this.renderAllPage(pages, pageIndex) : this.renderPiecePage()}
      </div>
    );
  }
}
