import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import DeletedSourceMessage from 'src/components/AppSandbox/environment/DeletedSourceMessage';
import { toEditWidgetPage } from 'src/pages/widgetConfig/navigation';
import { RelateDetail } from '../../styled';

export default function RelateDetailInfo(props) {
  const { data, globalSheetInfo = {}, sheetInfo = {}, fromPortal } = props;
  const { sourceControl = {}, dataSource } = data;
  const { controlId: sourceControlId } = sourceControl;
  const { name, appId } = globalSheetInfo;

  return (
    <RelateDetail>
      <div className="text flexWidth" title={name}>
        {name}
      </div>
      <i className={cx('Font16 textTertiary mRight6', !sourceControlId ? 'icon-right' : 'icon-sync1')} />
      <span
        className={cx('colorPrimary Bold flexWidth', {
          pointer: !fromPortal,
          deletedSourceMessage: sheetInfo.resultCode === 4,
        })}
        title={sheetInfo.name}
        onClick={() => {
          if (fromPortal) return;
          const toPage = () =>
            toEditWidgetPage({
              sourceId: dataSource,
              ...(!sourceControlId ? {} : { targetControl: sourceControlId }),
              fromURL: 'newPage',
            });
          props.relateToNewPage(toPage);
        }}
      >
        {sheetInfo.resultCode === 4 ? <DeletedSourceMessage worksheetId={dataSource} /> : sheetInfo.name}
      </span>
      {!_.isEmpty(sheetInfo) && appId !== sheetInfo.appId && sheetInfo.resultCode !== 4 && (
        <span className="mLeft6 flexWidth" title={sheetInfo.appName}>
          ({sheetInfo.appName})
        </span>
      )}
    </RelateDetail>
  );
}
