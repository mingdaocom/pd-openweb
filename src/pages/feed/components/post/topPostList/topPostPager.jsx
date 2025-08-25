import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';

/**
 * 置顶动态列表的分页器
 */
function TopPostPager(props) {
  return (
    <div className="postHeader topPostPager">
      <div className="InlineBlock ThemeColor3">{_l('置顶动态') /* 置顶动态*/}</div>
      <ul className="InlineBlock">
        {_.chain(props.pageCount)
          .times()
          .map(n => (
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
          ))}
      </ul>
    </div>
  );
}
TopPostPager.propTypes = {
  pageIndex: PropTypes.number.isRequired,
  pageCount: PropTypes.number.isRequired,
  handleChangeItem: PropTypes.func.isRequired,
};

export default TopPostPager;
