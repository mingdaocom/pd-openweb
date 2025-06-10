import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import DocumentTitle from 'react-document-title';
import { navigateTo } from 'router/navigateTo';
import styled from 'styled-components';
import { SvgIcon, Tooltip } from 'ming-ui';
import appManagementApi from 'src/api/appManagement';
import homeApp from 'src/api/homeApp';
import { routerConfigs } from 'src/pages/AppSettings/routerConfig.js';
import { syncAppDetail } from 'src/pages/PageHeader/redux/action';
import { getTranslateInfo } from 'src/utils/app';

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

function AppPkgSimpleHeader(props) {
  const { appId, navTab } = _.get(props, 'match.params') || '';
  const [appDetail, setAppDetail] = useState({});
  const routerInfo = _.find(['logs', 'analytics', 'settings'], it => props.path.indexOf(it) > -1);
  const titleInfo = {
    logs: _l('日志'),
    analytics: _l('使用分析'),
    settings: _l('应用管理'),
  };
  const text = titleInfo[routerInfo] || '';
  const currentSettingMenu = (_.find(routerConfigs, v => v.type === navTab) || { text: _l('选项集') }).text;

  const getAppDetail = () => {
    homeApp.getApp({ appId, getLang: true }).then(appDetail => {
      const { langInfo } = appDetail;
      if (langInfo && langInfo.appLangId && langInfo.version !== window[`langVersion-${appId}`]) {
        appManagementApi
          .getAppLangDetail({
            projectId: appDetail.projectId,
            appId,
            appLangId: langInfo.appLangId,
          })
          .then(lang => {
            window[`langData-${appId}`] = lang.items;
            window[`langVersion-${appId}`] = langInfo.version;
            setAppDetail(appDetail);
            props.syncAppDetail(appDetail);
          });
      } else {
        setAppDetail(appDetail);
        props.syncAppDetail(appDetail);
      }
    });
  };

  useEffect(() => {
    getAppDetail();
  }, []);

  const name = getTranslateInfo(appId, null, appId).name || appDetail.name;

  return (
    <HeaderWrap className="flexRow alignItemsCenter">
      <DocumentTitle
        title={`${name ? name + ' - ' : ''}${text}${routerInfo === 'settings' ? ' - ' + currentSettingMenu : ''}`}
      />

      <Tooltip popupPlacement="bottomLeft" text={<span>{_l('应用：%0', name)}</span>}>
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
      <div className="mRight20">{_l('应用ID：%0', appId)}</div>
    </HeaderWrap>
  );
}

export default connect(
  state => ({}),
  dispatch => bindActionCreators({ syncAppDetail }, dispatch),
)(AppPkgSimpleHeader);
