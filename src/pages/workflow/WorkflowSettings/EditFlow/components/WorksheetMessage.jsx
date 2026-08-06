import React from 'react';
import _ from 'lodash';
import { pathCompletion } from 'src/utils/common';
import { APP_TYPE } from '../../enum';

export default ({ item }) => {
  const openWorksheet = evt => {
    evt.stopPropagation();
    window.open(pathCompletion(`/worksheet/${item.appId}`));
  };

  return (
    <div className="workflowContentInfo workflowContentBG flexRow alignItemsCenter">
      <div className="textSecondary nowrap">{item.appTypeName}:</div>
      <div className="ellipsis mLeft3">{item.appName}</div>
      {_.includes([APP_TYPE.SHEET, APP_TYPE.DATE, APP_TYPE.APPROVAL_START], item.appType) && item.appId && (
        <i
          className="mLeft5 icon-task-new-detail Font12 pointer colorPrimary hoverColorPrimaryDark"
          onMouseDown={openWorksheet}
        />
      )}
    </div>
  );
};
