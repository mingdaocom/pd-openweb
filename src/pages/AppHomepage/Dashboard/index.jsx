import React, { useEffect, useMemo, useReducer, useState } from 'react';
import styled from 'styled-components';
import { Icon, ScrollView } from 'ming-ui';
import { Tooltip } from 'antd';
import Process from './Process';
import { navigateTo } from 'router/navigateTo';
import { initialState, reducer, CreateActions } from '../AppCenter/appHomeReducer';
import NoProjectsStatus from '../AppCenter/components/NoProjectsStatus';
import AppGrid from '../AppCenter/components/AppGrid';
import CollectionApps from './CollectionApps';
import BulletinBoard from './BulletinBoard';
import { getGreetingText, themeColors } from './utils';
import { getFilterApps } from '../AppCenter/utils';
import DashboardSetting from './DashboardSetting';
import RecordFav from 'src/pages/AppHomepage/RecordFav';
import RecentApps from './RecentApps';

const Wrapper = styled.div`
  flex: 1;

  .dashboardContent {
    padding: 0 36px;
    max-width: 1600px;
    margin: 0 auto;
    box-sizing: content-box;
    .dashboardHeader {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding: 24px 0 16px;
      white-space: nowrap;
      .logoWrapper {
        display: flex;
        align-items: center;
        img {
          height: ${({ logoHeight }) => `${logoHeight}px`};
        }
      }

      .headerIcon {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 32px;
        height: 32px;
        border-radius: 4px;
        cursor: pointer;
        i {
          color: #676767;
        }
        &:hover {
          background: #fff;
        }
      }
    }

    .Height220 {
      height: 220px;
    }
    .Height260 {
      height: 260px;
    }
    .Height320 {
      height: 320px;
    }
  }
`;

const CardItem = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #fff;
  padding-bottom: 12px;
  box-shadow: 0px 1px 2px 1px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  margin-bottom: 20px;

  &.bulletinBoard {
    padding: 0;
  }
  &.collectCard {
    min-height: 176px;
  }
  .cardTitle {
    height: 48px;
    display: flex;
    align-items: center;
    padding: 0 8px 0px 20px;
    position: relative;
    .titleText {
      display: flex;
      align-items: center;
      font-size: 17px;
      font-weight: bold;
      img {
        width: 24px;
        height: 24px;
        margin-right: 4px;
      }
    }
    .viewAll {
      display: flex;
      align-items: center;
      padding: 6px 4px 6px 10px;
      margin-top: -4px;
      border-radius: 4px;
      color: #9e9e9e;
      cursor: pointer;
      &:hover {
        background-color: #f8f8f8;
      }
    }
  }
  .emptyWrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #868686;
    font-size: 14px;
    img {
      width: 80px;
      height: 80px;
      margin-bottom: 8px;
    }
    .boldText {
      font-weight: bold;
      margin-left: 4px;
      margin-right: 4px;
      color: #333;
    }
  }
`;

export default function Dashboard(props) {
  const {
    projectId,
    currentProject,
    countData,
    updateCountData,
    platformSetting = {},
    updatePlatformSetting,
    dashboardColor,
  } = props;
  const projects = _.get(md, 'global.Account.projects');
  const isExternal = projectId === 'external';
  const isAdmin = currentProject.isSuperAdmin || currentProject.isProjectAppManager;
  const [state, dispatch] = useReducer(reducer, initialState);
  const actions = useMemo(() => new CreateActions({ dispatch, state }), [state]);
  const [flag, setFlag] = useState(null);
  const [settingVisible, setSettingVisible] = useState(false);
  const {
    origin = {},
    dashboardLoading,
    keywords,
    groups,
    markedGroup = [],
    apps = [],
    externalApps = [],
    aloneApps = [],
    recentApps = [],
    markedApps = [],
    recentAppItems = [],
  } = state;
  const { logo, logoSwitch, slogan, boardSwitch, color = '', logoHeight, bulletinBoards } = platformSetting;
  const { displayCommonApp, rowCollect, todoDisplay } = origin.homeSetting || {};

  const fetchData = () => {
    !isExternal ? actions.loadDashboardInfo({ projectId }) : actions.loadAppAndGroups({ projectId });
  };

  useEffect(fetchData, [projectId]);

  useEffect(() => {
    color &&
      $('.appCenterHeader').css(
        'background',
        color === '#2196F3' || !_.includes(themeColors, color) ? '#fff' : dashboardColor.bgColor,
      );

    return () => {
      $('.appCenterHeader').css('background', '#fff');
    };
  }, [color]);

  return (
    <Wrapper style={{ background: dashboardColor.bgColor }} logoHeight={logoHeight || 40}>
      <ScrollView className="flex">
        <div className="dashboardContent">
          <div className="dashboardHeader">
            {logoSwitch && (logo || slogan) ? (
              <div className="logoWrapper">
                {logo && (
                  <img
                    src={`${md.global.FileStoreConfig.pictureHost}ProjectLogo/${logo}?imageView2/2/h/200/q/90`}
                    alt="logo"
                  />
                )}
                {slogan && <span className={logo ? 'Font17 mLeft16' : 'Font17'}>{slogan}</span>}
              </div>
            ) : (
              <div className="Font26">
                <span>{getGreetingText()},</span>
                <span className="bold mLeft8">{md.global.Account.fullname}</span>
              </div>
            )}

            <div className="flexRow">
              <Tooltip title={_l('刷新')} placement="bottom">
                <div
                  className="headerIcon"
                  onClick={() => {
                    fetchData();
                    setFlag(+new Date());
                  }}
                >
                  <Icon icon="refresh1" className="Font20" />
                </div>
              </Tooltip>
              {!isExternal && (
                <Tooltip title={_l('自定义工作台')} placement="bottom">
                  <div className="headerIcon mLeft12" onClick={() => setSettingVisible(true)}>
                    <Icon icon="home_set" className="Font20" />
                  </div>
                </Tooltip>
              )}
              {settingVisible && (
                <DashboardSetting
                  currentProject={currentProject}
                  platformSetting={platformSetting}
                  homeSetting={origin.homeSetting}
                  updatePlatformSetting={updatePlatformSetting}
                  updateHomeSetting={updateObj => {
                    actions.editHomeSetting({ projectId, ...origin.homeSetting, ...updateObj });
                  }}
                  onClose={() => setSettingVisible(false)}
                />
              )}
            </div>
          </div>

          <div className={`flexRow ${todoDisplay === 1 ? 'Height260' : 'Height220'}`}>
            {boardSwitch && !isExternal && (
              <CardItem className="mRight20 bulletinBoard overflowHidden">
                <BulletinBoard
                  loading={dashboardLoading}
                  platformSetting={platformSetting}
                  height={todoDisplay === 1 ? 240 : 200}
                />
              </CardItem>
            )}
            <CardItem>
              <Process
                loading={dashboardLoading}
                displayComplete={!boardSwitch || isExternal}
                countData={countData}
                updateCountData={updateCountData}
                dashboardColor={dashboardColor}
                todoDisplay={todoDisplay}
                flag={flag}
                setFlag={setFlag}
              />
            </CardItem>
          </div>

          {!projects.length && (
            <CardItem>
              <NoProjectsStatus />
            </CardItem>
          )}

          {!isExternal && !!markedApps.length && (
            <CardItem className="collectCard">
              <CollectionApps
                loading={dashboardLoading}
                projectId={projectId}
                apps={apps}
                markedApps={markedApps}
                onMarkApp={para => actions.markApp(para)}
                onMarkApps={para => actions.markApps(para)}
                onAppSorted={args => {
                  actions.updateAppSort(args);
                }}
              />
            </CardItem>
          )}

          {(displayCommonApp || rowCollect) && !isExternal && (
            <div className="flexRow Height320">
              {displayCommonApp && (
                <CardItem className={`${rowCollect ? 'mRight20' : ''}`}>
                  <RecentApps
                    loading={dashboardLoading}
                    projectId={projectId}
                    recentApps={recentApps}
                    recentAppItems={recentAppItems}
                    onMarkApp={para => actions.markApp(para)}
                    dashboardColor={dashboardColor}
                  />
                </CardItem>
              )}

              {rowCollect && (
                <CardItem>
                  <div className="cardTitle pointer">
                    <div className="titleText">{_l('记录收藏')}</div>
                    <div className="flex"></div>
                    <div
                      className="viewAll"
                      onClick={() => {
                        navigateTo('/favorite');
                      }}
                    >
                      <span>{_l('全部')}</span>
                      <Icon icon="arrow-right-border" className="mLeft5 Font16" />
                    </div>
                  </div>
                  <RecordFav
                    className="overflowHidden pLeft5 pRight5"
                    projectId={projectId}
                    forCard
                    loading={dashboardLoading}
                  />
                </CardItem>
              )}
            </div>
          )}

          <CardItem>
            <AppGrid
              dashboardColor={dashboardColor}
              isDashboard={true}
              setting={origin.homeSetting}
              isAdmin={isAdmin}
              loading={dashboardLoading}
              keywords={keywords}
              actions={actions}
              projectId={projectId}
              currentProject={currentProject}
              markedGroup={markedGroup}
              markedApps={getFilterApps(
                markedApps.filter(item => item.type === 0),
                keywords,
              )}
              myApps={getFilterApps(apps, keywords)}
              externalApps={getFilterApps(externalApps, keywords)}
              aloneApps={getFilterApps(aloneApps, keywords)}
              groups={groups}
              hideExternalTitle={isExternal}
            />
          </CardItem>
        </div>
      </ScrollView>
    </Wrapper>
  );
}
