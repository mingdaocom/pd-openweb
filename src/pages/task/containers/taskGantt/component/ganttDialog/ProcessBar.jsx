import React from 'react';
import cx from 'classnames';
export default ({ width, left, state, className, status }) => {
  return (
    <div style={{ marginLeft: left }} className={cx('processBar flexRow', className, state)}>
      {state === 'noStart' && <div className={cx('before', status, state)} />}
      <div className={cx('day', status, state, { tooShort: width < 24 })} style={{ width }} />
      {state === 'noEnd' && <div className={cx('after', status, state)} />}
    </div>
  );
};
