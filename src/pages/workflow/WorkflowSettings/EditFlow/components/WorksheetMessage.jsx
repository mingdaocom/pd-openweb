import React from 'react';
import _ from 'lodash';
import { APP_TYPE } from '../../enum';

export default ({ item }) => {
  const openWorksheet = evt => {
    evt.stopPropagation();
    window.open(`/worksheet/${item.appId}`);
  };

  return (
    <div className="workflowContentInfo workflowContentBG flexRow alignItemsCenter">
      <div className="Gray_75 nowrap">{item.appTypeName}:</div>
      <div className="ellipsis mLeft3">{item.appName}</div>
      {_.includes([APP_TYPE.SHEET, APP_TYPE.DATE, APP_TYPE.APPROVAL_START], item.appType) && item.appId && (
        <i
          className="mLeft5 icon-task-new-detail Font12 pointer ThemeColor3 ThemeHoverColor2"
          onMouseDown={openWorksheet}
        />
      )}
    </div>
  );
};
