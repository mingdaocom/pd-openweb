import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import homeAppApi from 'api/homeApp';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import appManagementApi from 'src/api/appManagement';
import worksheet from 'src/api/worksheet';
import MobileSingleView from 'mobile/components/SingleView';
import SingleView from 'worksheet/common/SingleView';
import preall from 'src/common/preall';
import socketInit from 'src/socket';
import { getTranslateInfo } from 'src/utils/app';
import { browserIsMobile } from 'src/utils/common';

const Con = styled.div`
  height: 100%;
  background: #fff;
  .SingleViewHeader {
    padding-right: 10px;
    .svgWrap {
      width: 26px;
      height: 26px;
      border-radius: 4px;
    }
  }
  .queryInput .inputCon > i {
    font-size: 20px !important;
    margin-top: 2px;
  }
`;

export default function ViewLand() {
  $('body').addClass('fixedScreen');
  const pathname = location.pathname.split('/').slice(-3);
  const [appId, worksheetId, viewId] = pathname;
  const [loading, setLoading] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [worksheetInfo, setWorksheetInfo] = useState();
  const isMobile = browserIsMobile();
  const Component = isMobile ? MobileSingleView : SingleView;

  useEffect(async () => {
    socketInit();
    setLoading(true);
    window.hideColumnHeadFilter = true;

    const data = await homeAppApi.getApp({
      appId,
      getLang: true,
    });

    const { langInfo } = data;
    if (langInfo && langInfo.appLangId && langInfo.version !== window[`langVersion-${appId}`]) {
      const lang = await appManagementApi.getAppLangDetail({
        projectId: data.projectId,
        appId,
        appLangId: langInfo.appLangId,
      });
      window[`langData-${appId}`] = lang.items;
      window[`langVersion-${appId}`] = langInfo.version;
    }

    worksheet.getWorksheetInfo({ worksheetId, getViews: true }).then(worksheetInfo => {
      worksheetInfo.name = getTranslateInfo(appId, null, worksheetId).name || worksheetInfo.name;
      worksheetInfo.views.forEach(view => {
        view.name = getTranslateInfo(appId, worksheetId, view.viewId).name || view.name;
      });
      const view = _.find(worksheetInfo.views, v => v.viewId === viewId) || {};
      const isSingleRecordDetailView = _.get(view, 'viewType') === 6 && String(_.get(view, 'childType')) === '1';
      setShowHeader(isMobile ? true : !isSingleRecordDetailView);
      setWorksheetInfo({
        worksheetName: worksheetInfo.name,
        viewName: view.name || '',
      });
      setLoading(false);
    });
    return () => {
      window.hideColumnHeadFilter = false;
    };
  }, []);

  if (loading) {
    return <LoadDiv />;
  }

  return (
    <Con>
      <Component
        showPageTitle
        showHeader={showHeader}
        headerLeft={
          !!worksheetInfo && (
            <div className={cx('Font16 bold flexRow alignItemsCenter', { mLeft24: !isMobile })}>
              {`${worksheetInfo.worksheetName}-${worksheetInfo.viewName}`}
            </div>
          )
        }
        appId={appId}
        worksheetId={worksheetId}
        viewId={viewId}
      />
    </Con>
  );
}

const Comp = preall(ViewLand);
const root = createRoot(document.getElementById('app'));

root.render(<Comp />);
