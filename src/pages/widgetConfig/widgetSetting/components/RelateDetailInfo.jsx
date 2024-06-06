import React from 'react';
import { toEditWidgetPage } from '../../util';
import { RelateDetail } from '../../styled';
import cx from 'classnames';

export default function RelateDetailInfo(props) {
  const { data, globalSheetInfo = {}, sheetInfo = {} } = props;
  const { sourceControl = {}, dataSource } = data;
  const { controlId: sourceControlId } = sourceControl;
  const { name, appId } = globalSheetInfo;

  return (
    <RelateDetail>
      <div className="text flexWidth" title={name}>
        {name}
      </div>
      <i className={cx('Font16 Gray_9e mRight6', !sourceControlId ? 'icon-trending' : 'icon-sync1')} />
      <span
        className="pointer ThemeColor3 Bold flexWidth"
        title={sheetInfo.name}
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
        {sheetInfo.name}
      </span>
      {!_.isEmpty(sheetInfo) && appId !== sheetInfo.appId && (
        <span className="mLeft6 flexWidth" title={sheetInfo.appName}>
          ({sheetInfo.appName})
        </span>
      )}
    </RelateDetail>
  );
}
