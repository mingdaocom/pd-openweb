import _ from 'lodash';
import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * 置顶动态列表的分页器
 */
function TopPostPager(props) {
  return (
    <div className="postHeader topPostPager">
      <div className="InlineBlock ThemeColor3">{_l('置顶动态') /* 置顶动态*/}</div>
      <ul className="InlineBlock">
        {_(props.pageCount)
          .times(n => (
            <li
              className={cx('InlineBlock', {
                ThemeColor3: n === props.pageIndex,
                Bold: n === props.pageIndex,
              })}
              key={n}
              onClick={() => props.handleChangeItem(n)}
            >
              {n + 1}
            </li>
          ))
          .value()}
      </ul>
    </div>
  );
}
TopPostPager.propTypes = {
  pageIndex: PropTypes.number.isRequired,
  pageCount: PropTypes.number.isRequired,
  handleChangeItem: PropTypes.func.isRequired,
};

module.exports = TopPostPager;
