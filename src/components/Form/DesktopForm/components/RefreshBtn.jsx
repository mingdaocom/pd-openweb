import React, { useState } from 'react';
import cx from 'classnames';
import { Tooltip } from 'ming-ui/antd-components';
import sheetAjax from 'src/api/worksheet';

export default props => {
  const { recordId, item, worksheetId, onChange } = props;
  const [isRefresh, setRefresh] = useState(false);

  return (
    <Tooltip title={isRefresh ? _l('刷新中...') : _l('刷新')} placement="top">
      <span
        className="Font14 mLeft5 Gray_9e pointer RefreshBtn ThemeHoverColor3"
        onClick={() => {
          if (isRefresh) return;

          setRefresh(true);

          sheetAjax.refreshSummary({ worksheetId, rowId: recordId, controlId: item.controlId }).then(data => {
            if ((item.value || '') !== data) {
              onChange(data, item.controlId, item);
            }

            setRefresh(false);
          });
        }}
      >
        <i className={cx('icon-workflow_cycle', { isLoading: isRefresh })} />
      </span>
    </Tooltip>
  );
};
