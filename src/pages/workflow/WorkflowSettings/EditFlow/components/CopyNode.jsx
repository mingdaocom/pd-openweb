import React from 'react';
import cx from 'classnames';

export default ({ processId, isCopy, selectCopyIds, item, selectCopyNode, selectProcessId }) => {
  if (!isCopy || processId !== selectProcessId) return null;

  const index = selectCopyIds.indexOf(item.id);

  return (
    <span
      className={cx('workflowNodeCopy', index === -1 ? 'icon-ok Font16' : 'ThemeBGColor3 White active')}
      onMouseDown={e => {
        e.stopPropagation();
        selectCopyNode(item.id);
      }}
    >
      {index !== -1 && <span className="Font13 bold">{index + 1}</span>}
    </span>
  );
};
