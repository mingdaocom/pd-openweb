import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import preall from 'src/common/preall';
import styled from 'styled-components';
import worksheet from 'src/api/worksheet';
import { LoadDiv } from 'ming-ui';
import SingleView from 'worksheet/common/SingleView';
import MobileSingleView from 'mobile/components/SingleView';
import { browserIsMobile } from 'src/util';
import cx from 'classnames';
import _ from 'lodash';

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

export default function ViewLand(props) {
  $('body').addClass('fixedScreen');
  const pathname = location.pathname.split('/').slice(3);
  const [appId, worksheetId, viewId] = pathname;
  const [loading, setLoading] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [worksheetInfo, setWorksheetInfo] = useState();
  const isMobile = browserIsMobile();
  const Component = isMobile ? MobileSingleView : SingleView;

  useEffect(() => {
    setLoading(true);
    window.hideColumnHeadFilter = true;
    worksheet.getWorksheetInfo({ worksheetId, getViews: true }).then(worksheetInfo => {
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
