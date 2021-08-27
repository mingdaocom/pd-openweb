import React, { Component } from 'react';
import 'pager';
import { Icon } from 'ming-ui';

class Pager extends Component {
  constructor(props) {
    super(props);
  }

  pageFn = (pageIndex, pageAll = 0) => {
    if (pageIndex <= 0 || pageIndex > pageAll) {
      return;
    }
    this.props.pageFn(pageIndex);
  };

  render() {
    const { allCount, pageIndex, pageSize } = this.props;
    if (allCount <= 0) {
      return '';
    }
    let pageAll = Math.ceil(allCount / pageSize);
    let num = pageAll <= pageIndex ? allCount : pageIndex * pageSize;
    return (
      <div className="pageBox">
        {_l('第 %0 - %1 条，共 %2 条', (pageIndex - 1) * pageSize + 1, num, allCount)}
        <Icon
          className="Font20 preIcon mRight15 mLeft15"
          icon="navigate_before"
          onClick={() => {
            this.pageFn(pageIndex - 1, pageAll);
          }}
        />
        <Icon
          className="Font20 nextIcon"
          icon="navigate_next"
          onClick={() => {
            this.pageFn(pageIndex + 1, pageAll);
          }}
        />
      </div>
    );
  }
}

export default Pager;
