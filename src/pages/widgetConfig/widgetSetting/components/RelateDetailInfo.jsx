import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { RelateDetail } from '../../styled';
import { toEditWidgetPage } from '../../util';

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
        className={cx('colorPrimary Bold flexWidth', { pointer: !fromPortal })}
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
        {sheetInfo.resultCode === 4 ? <span className="Red">{_l('已删除')}</span> : sheetInfo.name}
      </span>
      {!_.isEmpty(sheetInfo) && appId !== sheetInfo.appId && sheetInfo.resultCode !== 4 && (
        <span className="mLeft6 flexWidth" title={sheetInfo.appName}>
          ({sheetInfo.appName})
        </span>
      )}
    </RelateDetail>
  );
}
