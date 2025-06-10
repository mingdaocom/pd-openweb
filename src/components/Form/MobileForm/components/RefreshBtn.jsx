import React, { useState } from 'react';
import cx from 'classnames';
import sheetAjax from 'src/api/worksheet';

export default props => {
  const { recordId, item, worksheetId, onChange } = props;
  const [isRefresh, setRefresh] = useState(false);

  return (
    <span
      className="Font14 mLeft5 Gray_9e RefreshBtn"
      onClick={e => {
        e.stopPropagation();
        if (isRefresh) return;

        setRefresh(true);

        sheetAjax.refreshSummary({ worksheetId, rowId: recordId, controlId: item.controlId }).then(data => {
          if (item.value !== data) {
            onChange(data, item.controlId, item);
          }
          alert(_l('刷新成功'));
          setRefresh(false);
        });
      }}
    >
      <i className={cx('icon-workflow_cycle', { isLoading: isRefresh })} />
    </span>
  );
};
