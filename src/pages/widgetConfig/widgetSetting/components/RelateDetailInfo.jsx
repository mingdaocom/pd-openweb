import React from 'react';
import { toEditWidgetPage } from '../../util';
import { RelateDetail } from '../../styled';
import cx from 'classnames';

export default function RelateDetailInfo(props) {
  const { data, globalSheetInfo = {}, sheetInfo = {} } = props;
  const { sourceControl = {}, sourceEntityName, dataSource } = data;
  const { controlId: sourceControlId } = sourceControl;
  const { name, appId } = globalSheetInfo;

  return (
    <RelateDetail>
      <div className="text">{name}</div>
      <i className={cx('Font16 Gray_9e mRight6', !sourceControlId ? 'icon-trending' : 'icon-sync1')} />
      <div
        className="name flexCenter overflow_ellipsis"
        onClick={() => {
          const toPage = () =>
            toEditWidgetPage({
              sourceId: dataSource,
              ...(!sourceControlId ? {} : { targetControl: sourceControlId }),
              fromURL: 'newPage',
            });
          props.relateToNewPage(toPage);
        }}
      >
        <span className="overflow_ellipsis pointer ThemeColor3 Bold" title={sourceEntityName}>
          {sourceEntityName}
        </span>
        {!_.isEmpty(sheetInfo) && appId !== sheetInfo.appId && <span className="mLeft6">({sheetInfo.appName})</span>}
      </div>
    </RelateDetail>
  );
}
