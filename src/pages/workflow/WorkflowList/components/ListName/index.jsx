import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import cx from 'classnames';

export default ({ item, type }) => {
  return (
    <Link
      to={`/workflowedit/${item.id}#type=${type}`}
      target="_blank"
      className={cx('flexColumn nameBox ThemeColor3', { unable: !item.enabled })}
    >
      <div className="ellipsis Font14">{item.name}</div>
      <div className="ellipsis Font12 Gray_bd">{item.explain}</div>
    </Link>
  );
};
