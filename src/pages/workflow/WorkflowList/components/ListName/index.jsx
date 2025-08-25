import React from 'react';
import cx from 'classnames';
import { MdLink } from 'ming-ui';

export default ({ item, type }) => {
  const typeArgs = type ? `#type=${type}` : '';

  return (
    <MdLink
      to={`/workflowedit/${item.id}${typeArgs}`}
      target={window.isWxWork || window.isMDClient ? '_self' : '_blank'}
      className={cx('flexColumn nameBox ThemeColor3', { unable: !item.enabled })}
    >
      <div className="ellipsis Font14">{item.name}</div>
      <div className="ellipsis Font12 Gray_bd">{item.explain}</div>
    </MdLink>
  );
};
