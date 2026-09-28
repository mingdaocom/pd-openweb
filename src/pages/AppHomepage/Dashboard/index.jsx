import React, { lazy, Suspense, useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import axios from 'axios';
import cx from 'classnames';
import _ from 'lodash';
import { navigateTo } from 'router/navigation/navigateTo';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { PERMISSION_ENUM } from 'src/utils/domain/security/permission';
import { emitter } from 'src/utils/platform/browser/dom';
import { getRgbaByColor } from 'src/utils/platform/theme/color';
import { getAdvancedThemeBulletinPicExt, getFilterApps } from 'src/utils/services/appCenter';
import { getToken } from 'src/utils/services/request/authenticated';
import { hasPermission } from 'src/utils/services/security/permission';
import { CreateActions, initialState, reducer } from '../AppCenter/appHomeReducer';
import AppGrid from '../AppCenter/components/AppGrid';
import NoProjectsStatus from '../AppCenter/components/NoProjectsStatus';
import BulletinBoard from './BulletinBoard';
import CollectionApps from './CollectionApps';
import CollectionCharts from './CollectionCharts';
import Process from './Process';
import RecentApps from './RecentApps';
import {
  CardItem,
  getGreetingText,
  getImageBase64UploadData,
  getModuleVisible,
  getUrlWithRandomQuery,
  MODULE_TYPES,
  normalizeSortModuleIds,
  urlToBase64,
} from './utils';

const Wrapper = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;

  .dashboardMask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .dashboardContent {
    padding: 0 36px;
    min-width: 700px;
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
          height: ${({ $logoHeight }) => `${$logoHeight}px`};
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
          color: var(--color-text-secondary);
        }
        &:hover {
          background: var(--color-background-card);
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
const LoadableRecordFav = lazy(() => import('src/pages/AppHomepage/RecordFav'));

const LoadableDashboardSetting = lazy(() => import('./DashboardSetting'));

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
  const actions = useMemo(
    () =>
      new CreateActions({
        dispatch,
        state,
      }),
    [state],
  );
  const [flag, setFlag] = useState(null);
  const [settingVisible, setSettingVisible] = useState(false);
  const [collectCounts, setCollectCounts] = useState({});
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
  const hasNewTheme = window.platformENV.isHap && !!advancedThemes.length;
  const newTheme = advancedThemes[0] || {};
  const hasProjectSetting = hasPermission(myPermissions, PERMISSION_ENUM.DASHBOARD_SETTING);

  const currentCollectCounts = collectCounts.projectId === projectId ? collectCounts : {};
  const handleCollectCountChange = useCallback(
    (type, count) => {
      setCollectCounts(value =>
        value.projectId === projectId && value[type] === count ? value : { ...value, projectId, [type]: count },
      );
    },
    [projectId],
  );
  const resetCollectCounts = useCallback(() => {
    setCollectCounts(value =>
      value.projectId === projectId && (!_.isUndefined(value.record) || !_.isUndefined(value.chart))
        ? { projectId }
        : value,
    );
  }, [projectId]);

  const fetchData = ({ noCache } = {}) => {
    !isExternal
      ? actions.loadDashboardInfo({
          projectId,
          noCache,
        })
      : actions.loadAppAndGroups({
          projectId,
          noCache,
        });
  };

  const handlerMaskColor = useCallback(
    value => {
      if (dashboardColor.themeColor) {
        const isDark = value === 'dark';
        const color = getRgbaByColor(dashboardColor.themeColor, isDark ? '0.1' : '0.08');
        $('.appCenterHeaderMask').css('background', color);
        $('.sideNavMask').css('background', color);
        $('.dashboardMask').css('background', color);
      }
    },
    [dashboardColor],
  );
  useEffect(() => {
    emitter.addListener('CHANGE_THEME_MODE', handlerMaskColor);
    return () => {
      emitter.removeListener('CHANGE_THEME_MODE', handlerMaskColor);
    };
  }, [handlerMaskColor]);
  useEffect(fetchData, [projectId]);
  useEffect(() => {
    handlerMaskColor(window.themeMode);
    return () => {
      $('.appCenterHeaderMask').css('background', '');
    };
  }, [dashboardColor]);

  const onSetAdvancedTheme = theme => {
    const bulletinPicExt = getAdvancedThemeBulletinPicExt(theme);
    const hasThemePic = !!bulletinBoards.filter(item => item.themeKey === theme.themeKey).length;
    hasThemePic
      ? updatePlatformSetting({
          color: theme.themeColor,
          boardSwitch: true,
          advancedSetting: _.pick(theme, 'themeKey'),
        })
      : getToken(
          [
            {
              bucket: 4,
              ext: `.${bulletinPicExt}`,
            },
          ],
          4,
        ).then(res => {
          if (res.error) {
            alert(res.error);
          } else {
            const url = `${md.global.FileStoreConfig.uploadHost}/putb64/-1/key/${btoa(res[0].key)}`;
            urlToBase64(getUrlWithRandomQuery(theme.bulletinPic)).then(base64 => {
              axios
                .post(url, getImageBase64UploadData(base64, bulletinPicExt), {
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
                        url: `${md.global.FileStoreConfig.pictureHost}/${key}`,
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

  const renderAppGrid = () => (
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
  );

  const renderSortableModules = () => {
    const moduleVisibleData = {
      markedApps,
      displayCommonApp,
      recentApps,
      recentAppItems,
      rowCollect,
      recordCollectCount: currentCollectCounts.record,
      displayChart,
      chartCollectCount: currentCollectCounts.chart,
      displayApp,
    };
    const visibleSortModuleIds = normalizeSortModuleIds(sortItems).filter(moduleType =>
      getModuleVisible(moduleType, moduleVisibleData),
    );
    const hasRecentAndRecordCollect =
      _.includes(visibleSortModuleIds, MODULE_TYPES.RECENT) &&
      _.includes(visibleSortModuleIds, MODULE_TYPES.ROW_COLLECTION);
    const halfWidth =
      hasRecentAndRecordCollect &&
      Math.abs(
        _.indexOf(visibleSortModuleIds, MODULE_TYPES.RECENT) -
          _.indexOf(visibleSortModuleIds, MODULE_TYPES.ROW_COLLECTION),
      ) === 1;

    return (
      <div className="sortableCardsWrap">
        {visibleSortModuleIds.map(type => {
          switch (type) {
            case MODULE_TYPES.APP_COLLECTION:
              return (
                <CardItem key={type} className="sortItem appCollectCard">
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
              );

            case MODULE_TYPES.RECENT:
              return (
                <CardItem
                  key={type}
                  className={cx('sortItem recentCard', {
                    halfWidth,
                  })}
                >
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
              );

            case MODULE_TYPES.ROW_COLLECTION:
              return (
                <CardItem
                  key={type}
                  className={cx('sortItem rowCollectCard', {
                    halfWidth,
                  })}
                >
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
                  <Suspense fallback={<LoadDiv className="mTop10" />}>
                    <LoadableRecordFav
                      className="overflowHidden pLeft5 pRight5"
                      projectId={projectId}
                      forCard
                      loading={dashboardLoading}
                      onDataCountChange={handleCollectCountChange}
                    />
                  </Suspense>
                </CardItem>
              );

            case MODULE_TYPES.CHART_COLLECTION:
              return (
                <CollectionCharts
                  key={type}
                  projectId={projectId}
                  flag={flag}
                  currentTheme={currentTheme}
                  onDataCountChange={handleCollectCountChange}
                />
              );

            case MODULE_TYPES.APP:
              return (
                <CardItem key={type} className="sortItem flex">
                  {renderAppGrid()}
                </CardItem>
              );

            default:
              return null;
          }
        })}
      </div>
    );
  };

  return (
    <Wrapper
      className="dashboardWrapper"
      style={{
        backgroundColor: hasBgImg ? 'unset' : 'var(--color-background-primary)',
      }}
      $logoHeight={logoHeight || 40}
    >
      <div className="dashboardMask" />
      <ScrollView className="dashboardScrollView h100 pRight10">
        <div className="dashboardContent">
          <div className="dashboardHeader">
            {(logoSwitch && logo) || slogan ? (
              <div className="logoWrapper">
                {logoSwitch && logo && (
                  <img
                    src={`${md.global.FileStoreConfig.pictureHost}/ProjectLogo/${logo}?imageView2/2/h/200/q/90`}
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
                    resetCollectCounts();
                    fetchData({
                      noCache: true,
                    });
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
                <Suspense fallback={null}>
                  <LoadableDashboardSetting
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
                </Suspense>
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

          {isExternal && <CardItem className="flex">{renderAppGrid()}</CardItem>}
        </div>
      </ScrollView>
    </Wrapper>
  );
}
