import React from 'react';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import { getAppFeaturesPath } from 'src/util';

export default ({ item, type }) => {
  return (
    <Link
      to={`/workflowedit/${item.id}?${getAppFeaturesPath()}#type=${type}`}
      target={window.isWxWork ? '_self' : '_blank'}
      className={cx('flexColumn nameBox ThemeColor3 stopPropagation', { unable: !item.enabled })}
    >
      <div className="ellipsis Font14">{item.name}</div>
      <div className="ellipsis Font12 Gray_bd">{item.explain}</div>
    </Link>
  );
};
