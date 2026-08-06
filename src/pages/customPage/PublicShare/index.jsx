import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import DocumentTitle from 'react-document-title';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv, SvgIcon } from 'ming-ui';
import appManagementApi from 'src/api/appManagement';
import { SHARE_STATE, ShareState, VerificationPass } from 'worksheet/components/ShareState';
import preall from 'src/common/preall';
import CreateByMingDaoYun from 'src/components/CreateByMingDaoYun';
import PublicAppLangDropdown from 'src/components/PublicAppLangDropdown';
import RestrictAccessStatus from 'src/components/restrictAccessStatus';
import { changeAppColor, syncAppDetail } from 'src/pages/PageHeader/redux/action';
import store from 'src/redux/configureStore';
import globalEvents from 'src/router/globalEvents';
import { getTranslateInfo, shareGetAppLangDetail } from 'src/utils/app';
import { browserIsMobile, getRequest } from 'src/utils/common';
import './index.less';

const Wrap = styled.div`
  .header {
    height: 44px;
    flex-shrink: 0;
    padding: 0 24px;
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.16);
    justify-content: space-between;
    background-color: var(--color-background-primary);
    z-index: 1;

    &.mobile {
      padding: 0 12px;
      .title {
        min-width: 0;
      }
    }
  }
`;

const isMobile = browserIsMobile();
const LoadableMobileCustomPage = lazy(() => import('src/pages/Mobile/CustomPage'));
const LoadableCustomPageContent = lazy(() => import('src/pages/customPage/pageContent'));
const SHARE_REFRESH_INTERVAL = 3 * 60 * 60 * 1000;

const Entry = () => {
  const { hideHeader } = getRequest();
  const pathname = location.pathname.split('/');
  const id = pathname[pathname.length - 1];
  const [loading, setLoading] = useState(true);
  const [share, setShare] = useState({});
  const [errorCode, setErrorCode] = useState(null);
  const [mobileRefreshKey, setMobileRefreshKey] = useState(0);

  const getEntityShareById = useCallback(
    data => {
      return new Promise(async (resolve, reject) => {
        try {
          const result = await appManagementApi.getEntityShareById({
            id,
            sourceType: 21,
            ...data,
          });
          const appIconColor = _.get(result, 'data.appIconColor');
          appIconColor && document.body.style.setProperty('--app-primary-color', appIconColor);
          const clientId = _.get(result, 'data.clientId');
          window.clientId = clientId;
          clientId && sessionStorage.setItem(id, clientId);

          if (result.resultCode === 1) {
            const { appId, projectId } = result.data || {};
            const info = await shareGetAppLangDetail({
              appId,
              projectId,
            });

            if (info) {
              window.appInfo = {
                id: appId,
              };
              data.appName = getTranslateInfo(appId, null, appId).name || data.appName;
              data.customerPageName = getTranslateInfo(appId, null, data.sourceId).name || data.customerPageName;
            }
          }

          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    },
    [id],
  );

  const refreshShareInfo = useCallback(() => {
    const clientId = sessionStorage.getItem(id);
    window.clientId = clientId;

    return getEntityShareById({
      clientId,
    })
      .then(async result => {
        const { data = {} } = result;
        const { projectId } = data;
        safeLocalStorageSetItem('currentProjectId', projectId);
        preall(
          {
            type: 'function',
          },
          {
            allowNotLogin: true,
            requestParams: {
              projectId,
            },
          },
        );
        store.dispatch(
          syncAppDetail({
            name: data.appName,
            projectId: data.projectId,
          }),
        );
        store.dispatch(changeAppColor(''));
        setShare(result);
        setLoading(false);
        setErrorCode(null);
      })
      .catch(err => {
        setLoading(false);
        setErrorCode(err.errorCode);
      });
  }, [getEntityShareById, id]);

  useEffect(() => {
    refreshShareInfo();

    const refreshTimer = setInterval(() => {
      setLoading(true);
      refreshShareInfo();
    }, SHARE_REFRESH_INTERVAL);

    if (hideHeader === 'true') {
      setCookie('i18n_langtag', 'zh-Hans');
    }

    globalEvents();
    return () => clearInterval(refreshTimer);
  }, [hideHeader, refreshShareInfo]);

  if (loading) {
    return (
      <div className="w100 h100 flexColumn alignItemsCenter justifyContentCenter">
        <LoadDiv className="mTop10" />
      </div>
    );
  }

  if (errorCode === 300016) {
    return <RestrictAccessStatus />;
  }

  const renderContent = () => {
    if ([14, 18, 19].includes(share.resultCode)) {
      return (
        <VerificationPass
          validatorPassPromise={(value, captchaResult) => {
            return new Promise(async (resolve, reject) => {
              if (value) {
                getEntityShareById({
                  password: value,
                  ...captchaResult,
                }).then(data => {
                  if (data.resultCode === 1) {
                    setShare(data);
                    resolve(data);
                  } else {
                    reject(SHARE_STATE[data.resultCode]);
                  }
                });
              } else {
                reject();
              }
            });
          }}
        />
      );
    }

    return <ShareState code={share.resultCode} />;
  };

  const renderHeader = ({ showRefresh = false }) => {
    const { appName, appIcon, appIconColor, appId, projectId, customerPageName, pageTitle } = share.data || {};
    const title = pageTitle || `${appName}-${customerPageName}`;

    return (
      <div className={cx('header flexRow alignItemsCenter', { mobile: isMobile })}>
        <div className="Font16 bold flexRow alignItemsCenter flex">
          {!isMobile && appIcon && (
            <div
              className="svgWrap flexRow alignItemsCenter justifyContentCenter pTop3 mRight10"
              style={{ backgroundColor: appIconColor }}
            >
              <SvgIcon url={appIcon} fill="#fff" size={20} />
            </div>
          )}
          {title && (
            <React.Fragment>
              <div className="title flex ellipsis" title={title}>
                {title}
              </div>
              <DocumentTitle title={title} />
            </React.Fragment>
          )}
        </div>
        {isMobile && showRefresh && (
          <Icon
            className="Font20 textTertiary"
            icon="task-later"
            onClick={() => setMobileRefreshKey(value => value + 1)}
          />
        )}
        <PublicAppLangDropdown className="mLeft2" appId={appId} projectId={projectId} />
        <CreateByMingDaoYun className="mLeft6" />
      </div>
    );
  };

  if (share.resultCode === 1) {
    const { pageTitle } = share.data || {};
    const Component = isMobile ? LoadableMobileCustomPage : LoadableCustomPageContent;
    return (
      <Provider store={store}>
        {isMobile ? (
          <Wrap className="flexColumn h100">
            {renderHeader({ showRefresh: true })}
            <div className="flex">
              <Suspense fallback={<LoadDiv className="mTop10" />}>
                <Component
                  key={mobileRefreshKey}
                  pageTitle={pageTitle}
                  match={{
                    params: {
                      worksheetId: share.data.sourceId,
                      appId: share.data.appId,
                    },
                    path: '',
                  }}
                />
              </Suspense>
            </div>
          </Wrap>
        ) : (
          <Suspense fallback={<LoadDiv className="mTop10" />}>
            <Component
              pageTitle={pageTitle}
              id={share.data.sourceId}
              ids={{
                appId: share.data.appId,
                worksheetId: share.data.sourceId,
              }}
              className={cx({
                hideHeader: hideHeader === 'true',
              })}
            />
          </Suspense>
        )}
      </Provider>
    );
  }

  return (
    <Wrap className={cx('flexColumn h100')}>
      {renderHeader({})}
      {renderContent()}
    </Wrap>
  );
};

const root = createRoot(document.getElementById('app'));
root.render(<Entry />);
