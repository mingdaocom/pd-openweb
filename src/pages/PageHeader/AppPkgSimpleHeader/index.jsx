import React, { useEffect, useState } from 'react';
import { Tooltip } from 'ming-ui';
import { navigateTo } from 'router/navigateTo';
import SvgIcon from 'src/components/SvgIcon';
import styled from 'styled-components';
import DocumentTitle from 'react-document-title';
import homeApp from 'src/api/homeApp';

const HeaderWrap = styled.div`
  height: 50px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.24);
  z-index: 15;
  background-color: #fff;
  padding: 0 24px 0 16px;
  .applicationIcon {
    width: 28px;
    height: 28px;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    line-height: normal;
    margin-left: -3px;
  }
  .Gray_bd {
    &:hover {
      color: #9e9e9e !important;
      .applicationIcon {
        box-shadow: 0 0 20px 20px rgb(0 0 0 / 10%) inset;
      }
    }
  }
`;

export default function AppPkgSimpleHeader(props) {
  const appId = _.get(props, 'match.params.appId') || '';
  const [appDetail, setAppDetail] = useState({});
  const isLog = props.path.includes('logs');
  const isAnalytics = props.path.includes('analytics');
  const text = isLog ? _l('日志') : isAnalytics ? _l('使用分析') : '';

  const getAppDetail = () => {
    homeApp.getApp({ appId }).then(appDetail => {
      setAppDetail(appDetail);

      //   navigateTo(`/app/${appId}`);
    });
  };

  useEffect(() => {
    getAppDetail();
  }, []);

  return (
    <HeaderWrap className="flexRow alignItemsCenter">
      <DocumentTitle title={`${appDetail.name ? appDetail.name + ' - ' : ''}${text}`} />

      <Tooltip popupPlacement="bottomLeft" text={<span>{_l('应用：%0', appDetail.name)}</span>}>
        <div
          className="flexRow pointer Gray_bd alignItemsCenter"
          onClick={() => {
            window.disabledSideButton = true;

            const storage =
              JSON.parse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${appId}`)) || {};

            if (storage) {
              const { lastGroupId, lastWorksheetId, lastViewId } = storage;
              navigateTo(
                `/app/${appId}/${[lastGroupId, lastWorksheetId, lastViewId]
                  .filter(o => o && !_.includes(['undefined', 'null'], o))
                  .join('/')}?from=insite`,
              );
            } else {
              navigateTo(`/app/${appId}`);
            }
          }}
        >
          <i className="icon-navigate_before Font20" />
          <div className="applicationIcon" style={{ backgroundColor: appDetail.iconColor }}>
            <SvgIcon url={appDetail.iconUrl} fill="#fff" size={18} />
          </div>
        </div>
      </Tooltip>

      <div className="flex nativeTitle Font17 bold mLeft16">{text}</div>
    </HeaderWrap>
  );
}
