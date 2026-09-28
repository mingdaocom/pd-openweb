import React from 'react';
import cx from 'classnames';
import { MdLink } from 'ming-ui';

export default ({ item, returnQuery }) => {
  const returnArgs = returnQuery ? '#' + returnQuery : '';

  return (
    <MdLink
      to={`/workflowedit/${item.id}${returnArgs}`}
      target={window.isWxWork || window.isMDClient ? '_self' : '_blank'}
      className={cx('flexColumn nameBox colorPrimary', { unable: !item.enabled })}
    >
      <div className="ellipsis Font14">{item.name}</div>
      <div className="ellipsis Font12 textDisabled">{item.explain}</div>
    </MdLink>
  );
};
