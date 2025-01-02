import React, { useState } from 'react';
import sheetAjax from 'src/api/worksheet';
import cx from 'classnames';
import { isPublicLink } from '../tools/utils';
import { FROM } from '../tools/config';
import _ from 'lodash';

export default props => {
  const { disabledFunctions = [], from, recordId, item, worksheetId, disabled, onChange } = props;
  const [isRefresh, setRefresh] = useState(false);

  const showRefreshBtn =
    !disabledFunctions.includes('controlRefresh') &&
    from !== FROM.DRAFT &&
    !isPublicLink() &&
    recordId &&
    !recordId.includes('default') &&
    !recordId.includes('temp') &&
    md.global.Account.accountId &&
    ((item.type === 30 && (item.strDefault || '').split('')[0] !== '1') || _.includes([31, 32, 37, 38, 53], item.type));

  if (!showRefreshBtn) return null;

  return (
    <span
      data-tip={isRefresh ? _l('刷新中...') : _l('刷新')}
      className="tip-top Font14 mLeft5 Gray_9e ThemeHoverColor3 pointer RefreshBtn"
      onClick={() => {
        if (isRefresh) return;

        setRefresh(true);

        sheetAjax.refreshSummary({ worksheetId, rowId: recordId, controlId: item.controlId }).then(data => {
          if (item.value !== data) {
            onChange(data, item.controlId, item);
          }
          setRefresh(false);
        });
      }}
    >
      <i className={cx('icon-workflow_cycle', { isLoading: isRefresh })} />
    </span>
  );
};
