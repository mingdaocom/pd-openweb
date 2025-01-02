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
import { getGreetingText, MODULE_TYPES, urlToBase64 } from './utils';
import { getFilterApps } from '../AppCenter/utils';
import DashboardSetting from './DashboardSetting';
import RecordFav from 'src/pages/AppHomepage/RecordFav';
import RecentApps from './RecentApps';
import CollectionCharts from './CollectionCharts';
import cx from 'classnames';
import _ from 'lodash';
import { getToken } from 'src/util';
import { Base64 } from 'js-base64';
import axios from 'axios';
import { hasPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';

const Wrapper = styled.div`
  flex: 1;

  .dashboardScroll {
    .nano-content {
      overflow-x: scroll !important;
    }
  }
  .dashboardContent {
    padding: 0 36px;
    min-width: 1020px;
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

    .Height300 {
      height: 300px;
    }

    .sortableCardsWrap {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 20px;

      .sortItem {
        width: 100%;
        margin-bottom: 0;
        &.halfWidth {
          width: calc(50% - 10px);
        }
      }
    }
  }
`;

export const CardItem = styled.div`
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
  &.appCollectCard {
    min-height: 118px;
    .autosize {
      height: auto !important;
    }
  }
  &.recentCard,
  &.rowCollectCard {
    max-height: 300px;
    &.halfWidth {
      height: 300px;
    }
  }
  &.recentCard {
    min-height: 118px;
  }
  &.rowCollectCard {
    min-height: 100px;
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
    margin-top: 36px;
    margin-bottom: 36px;
    img {
      width: 80px;
      height: 80px;
      margin-bottom: 8px;
    }
    .boldText {
      font-weight: bold;
      margin-left: 4px;
      margin-right: 4px;
      color: #151515;
    }
  }
`;

const NewThemeSet = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  margin-right: 16px;
  cursor: pointer;

  .newThemeIcon {
    width: 24px;
    height: 24px;
    background-size: contain;
    background-repeat: no-repeat;
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
    hasBgImg,
    myPermissions = [],
    advancedThemes = [],
    currentTheme = {},
  } = props;
  const projects = _.get(md, 'global.Account.projects');
  const isExternal = projectId === 'external';
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
    appLang = [],
    projectGroupsLang,
  } = state;
  const { logo, logoSwitch, slogan, boardSwitch, logoHeight, bulletinBoards = [] } = platformSetting;
  const { displayCommonApp, rowCollect, todoDisplay, displayApp, displayChart, sortItems } = origin.homeSetting || {};

  const hasNewTheme = !md.global.Config.IsLocal && !!advancedThemes.length;
  const newTheme = advancedThemes[0] || {};
  const hasProjectSetting = hasPermission(myPermissions, PERMISSION_ENUM.DASHBOARD_SETTING);

  const fetchData = ({ noCache } = {}) => {
    !isExternal ? actions.loadDashboardInfo({ projectId, noCache }) : actions.loadAppAndGroups({ projectId, noCache });
  };

  useEffect(fetchData, [projectId]);

  useEffect(() => {
    dashboardColor.themeColor &&
      $('.appCenterHeader').css(
        'background',
        dashboardColor.themeColor === '#2196F3' ? '#fff' : dashboardColor.bgColor,
      );

    return () => {
      $('.appCenterHeader').css('background', '#fff');
    };
  }, [dashboardColor]);

  const onSetAdvancedTheme = theme => {
    const hasThemePic = !!bulletinBoards.filter(item => item.themeKey === theme.themeKey).length;
    hasThemePic
      ? updatePlatformSetting({
          color: theme.themeColor,
          boardSwitch: true,
          advancedSetting: _.pick(theme, 'themeKey'),
        })
      : getToken([{ bucket: 4, ext: '.jpg' }]).then(res => {
          if (res.error) {
            alert(res.error);
          } else {
            const url = `${md.global.FileStoreConfig.uploadHost}putb64/-1/key/${Base64.encode(res[0].key)}`;
            urlToBase64(theme.bulletinPic).then(base64 => {
              axios
                .post(url, base64.replace('data:image/jpeg;base64,', ''), {
                  headers: {
                    'Content-Type': 'application/octet-stream',
                    Authorization: `UpToken ${res[0].uptoken}`,
                  },
                })
                .then(({ data }) => {
                  const { key = '' } = data || {};
                  updatePlatformSetting({
                    color: theme.themeColor,
                    boardSwitch: true,
                    bulletinBoards: [
                      {
                        url: md.global.FileStoreConfig.pictureHost + key,
                        key,
                        bucket: 4,
                        link: theme.bulletinLink,
                        title: theme.bulletinTitle,
                        themeKey: theme.themeKey,
                      },
                    ].concat(bulletinBoards),
                    advancedSetting: _.pick(theme, 'themeKey'),
                  });
                });
            });
          }
        });
  };

  const renderSortableModules = () => {
    const sortModuleIds = sortItems && sortItems.length ? sortItems.map(item => item.moduleType) : [0, 1, 2, 3];
    const halfWidth =
      Math.abs(
        _.indexOf(sortModuleIds, MODULE_TYPES.RECENT) - _.indexOf(sortModuleIds, MODULE_TYPES.ROW_COLLECTION),
      ) === 1 &&
      displayCommonApp &&
      rowCollect;

    return (
      <div className="sortableCardsWrap">
        {sortModuleIds.map((type, index) => {
          switch (type) {
            case MODULE_TYPES.APP_COLLECTION:
              return !!markedApps.length ? (
                <CardItem key={index} className="sortItem appCollectCard">
                  <CollectionApps
                    loading={dashboardLoading}
                    projectId={projectId}
                    apps={apps}
                    appLang={appLang}
                    markedApps={markedApps}
                    onMarkApp={para => actions.markApp(para)}
                    onMarkApps={para => actions.markApps(para)}
                    onAppSorted={args => {
                      actions.updateAppSort(args);
                    }}
                    currentTheme={currentTheme}
                  />
                </CardItem>
              ) : null;
            case MODULE_TYPES.RECENT:
              return displayCommonApp ? (
                <CardItem key={index} className={cx('sortItem recentCard', { halfWidth })}>
                  <RecentApps
                    loading={dashboardLoading}
                    projectId={projectId}
                    appLang={appLang}
                    recentApps={recentApps}
                    recentAppItems={recentAppItems}
                    onMarkApp={para => actions.markApp(para)}
                    dashboardColor={dashboardColor}
                    currentTheme={currentTheme}
                  />
                </CardItem>
              ) : null;
            case MODULE_TYPES.ROW_COLLECTION:
              return rowCollect ? (
                <CardItem key={index} className={cx('sortItem rowCollectCard', { halfWidth })}>
                  <div className="cardTitle pointer">
                    <div className="titleText">
                      {currentTheme.recordFavIcon && <img src={currentTheme.recordFavIcon} />}
                      {_l('记录收藏')}
                    </div>
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
              ) : null;
            default:
              return displayChart ? (
                <CollectionCharts key={index} projectId={projectId} flag={flag} currentTheme={currentTheme} />
              ) : null;
          }
        })}
      </div>
    );
  };

  return (
    <Wrapper style={{ backgroundColor: hasBgImg ? 'unset' : dashboardColor.bgColor }} logoHeight={logoHeight || 40}>
      <ScrollView className="flex dashboardScroll">
        <div className="dashboardContent">
          <div className="dashboardHeader">
            {(logoSwitch && logo) || slogan ? (
              <div className="logoWrapper">
                {logoSwitch && logo && (
                  <img
                    src={`${md.global.FileStoreConfig.pictureHost}ProjectLogo/${logo}?imageView2/2/h/200/q/90`}
                    alt="logo"
                  />
                )}
                {slogan && <span className={logoSwitch && logo ? 'Font17 mLeft16' : 'Font17'}>{slogan}</span>}
              </div>
            ) : (
              <div className="Font26 overflow_ellipsis">
                <span>{getGreetingText()},</span>
                <span className="bold mLeft8">{md.global.Account.fullname}</span>
              </div>
            )}

            <div className="flexRow">
              {hasNewTheme && hasProjectSetting && !isExternal && (
                <Tooltip
                  title={
                    currentTheme.themeKey === newTheme.themeKey ? _l('修改主题') : _l('使用%0主题', newTheme.themeName)
                  }
                  placement="bottom"
                >
                  <NewThemeSet
                    onClick={() => {
                      currentTheme.themeKey === newTheme.themeKey
                        ? setSettingVisible(true)
                        : onSetAdvancedTheme(newTheme);
                    }}
                  >
                    <div
                      className="newThemeIcon"
                      style={{
                        backgroundImage: `url(${newTheme.themeIcon})`,
                      }}
                    ></div>
                  </NewThemeSet>
                </Tooltip>
              )}
              <Tooltip title={_l('刷新')} placement="bottom">
                <div
                  className="headerIcon"
                  onClick={() => {
                    fetchData({ noCache: true });
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
                  updateHomeSetting={(updateObj, editingKey) => {
                    actions.editHomeSetting({
                      projectId,
                      setting: { ...origin.homeSetting, ...updateObj },
                      editingKey,
                    });
                  }}
                  onClose={() => setSettingVisible(false)}
                  currentTheme={currentTheme}
                  onSetAdvancedTheme={onSetAdvancedTheme}
                  advancedThemes={advancedThemes}
                  hasProjectSetting={hasProjectSetting}
                  hasBasicSettingAuth={hasPermission(myPermissions, PERMISSION_ENUM.BASIC_SETTING)}
                />
              )}
            </div>
          </div>

          <div className="flexRow">
            {boardSwitch && !isExternal && (
              <CardItem className="flex mRight20 bulletinBoard overflowHidden">
                <BulletinBoard
                  loading={dashboardLoading}
                  platformSetting={platformSetting}
                  height={todoDisplay === 1 ? 240 : 200}
                />
              </CardItem>
            )}
            <CardItem className="flex">
              <Process
                loading={dashboardLoading}
                displayComplete={!boardSwitch || isExternal}
                countData={countData}
                updateCountData={updateCountData}
                dashboardColor={dashboardColor}
                todoDisplay={todoDisplay}
                flag={flag}
                setFlag={setFlag}
                currentTheme={currentTheme}
              />
            </CardItem>
          </div>

          {!projects.length && (
            <CardItem>
              <NoProjectsStatus />
            </CardItem>
          )}

          {!isExternal && renderSortableModules()}

          {(displayApp || isExternal) && (
            <CardItem className="flex">
              <AppGrid
                projectGroupsLang={projectGroupsLang}
                dashboardColor={dashboardColor}
                isDashboard={true}
                setting={origin.homeSetting}
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
                appLang={appLang}
                groups={groups}
                hideExternalTitle={isExternal}
                currentTheme={currentTheme}
                myPermissions={myPermissions}
              />
            </CardItem>
          )}
        </div>
      </ScrollView>
    </Wrapper>
  );
}
