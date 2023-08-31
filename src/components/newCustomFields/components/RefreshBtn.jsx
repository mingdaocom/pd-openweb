import React, { useState } from 'react';
import sheetAjax from 'src/api/worksheet';
import cx from 'classnames';
import _ from 'lodash';

export default ({ worksheetId, recordId, item, onChange = () => {} }) => {
  const [isRefresh, setRefresh] = useState(false);

  if (
    !recordId ||
    !md.global.Account.accountId ||
    (item.type === 30 && (item.strDefault || '').split('')[0] === '1') ||
    !_.includes([30, 31, 32, 37, 38], item.type)
  )
    return null;

  return (
    <span
      data-tip={isRefresh ? _l('刷新中...') : _l('刷新')}
      className="tip-top Font14 mLeft5 Gray_9e ThemeHoverColor3 pointer RefreshBtn"
      onClick={() => {
        if (isRefresh) return;

        setRefresh(true);

        sheetAjax.refreshSummary({ worksheetId, rowId: recordId, controlId: item.controlId }).then(data => {
          onChange(data, item.controlId, item);
          setRefresh(false);
        });
      }}
    >
      <i className={cx('icon-workflow_cycle', { isLoading: isRefresh })} />
    </span>
  );
};
