import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import preall from 'src/common/preall';
import cx from 'classnames';
import { Provider } from 'react-redux';
import store from 'src/redux/configureStore';
import { SvgIcon, LoadDiv } from 'ming-ui';
import appManagementApi from 'src/api/appManagement';
import { ShareState, VerificationPass, SHARE_STATE } from 'worksheet/components/ShareState';
import DocumentTitle from 'react-document-title';
import CreateByMingDaoYun from 'src/components/CreateByMingDaoYun';
import styled from 'styled-components';
import { syncAppDetail, changeAppColor } from 'src/pages/PageHeader/redux/action';
import { getRequest, getTranslateInfo, shareGetAppLangDetail, browserIsMobile } from 'src/util';
import _ from 'lodash';
import './index.less';

const Wrap = styled.div`
  .header {
    height: 44px;
    padding: 0 24px;
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.16);
    justify-content: space-between;
    background-color: #fff;
    z-index: 1;
  }
`;

const isMobile = browserIsMobile();

const Entry = props => {
  const { hideHeader } = getRequest();
  const pathname = location.pathname.split('/');
  const id = pathname[pathname.length - 1];
  const [loading, setLoading] = useState(true);
  const [share, setShare] = useState({});
  const [Components, setComponents] = useState(null);

  useEffect(() => {
    const clientId = sessionStorage.getItem(id);
    window.clientId = clientId;

    getEntityShareById({
      clientId
    }).then(async result => {
      const { data } = result;
      const { appId, projectId, langInfo } = data;
      localStorage.setItem('currentProjectId', projectId);
      preall(
        { type: 'function' },
        {
          allowNotLogin: true,
          requestParams: { projectId },
        },
      );

      store.dispatch(syncAppDetail({
        name: data.appName,
        projectId: data.projectId
      }));
      store.dispatch(changeAppColor(''));
      setShare(result);
      setLoading(false);
    });

    if (hideHeader === 'true') {
      document.body.classList.add('bodyScroll');
      setCookie('i18n_langtag', 'zh-Hans');
    }

    (isMobile ? import('src/pages/Mobile/CustomPage') : import('src/pages/customPage/pageContent')).then(res => {
      setComponents(res);
    });
  }, []);

  const getEntityShareById = data => {
    return new Promise(async (resolve, reject) => {
      const result = await appManagementApi.getEntityShareById({ id, sourceType: 21, ...data });
      const clientId = _.get(result, 'data.clientId');
      const { appId, projectId } = result.data;
      window.clientId = clientId;
      clientId && sessionStorage.setItem(id, clientId);
      if (result.resultCode === 1) {
        const info = await shareGetAppLangDetail({
          appId,
          projectId,
        });
        if (info) {
          window.appInfo = { id: appId };
          data.appName = getTranslateInfo(appId, null, appId).name || data.appName;
          data.customerPageName = getTranslateInfo(appId, null, data.sourceId).name || data.customerPageName;
        }
      }
      resolve(result);
    });
  };

  if (loading || !Components) {
    return (
      <div className="w100 h100 flexColumn alignItemsCenter justifyContentCenter">
        <LoadDiv />
      </div>
    );
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

  if (share.resultCode === 1) {
    const { pageTitle } = share.data || {};
    return (
      <Provider store={store}>
        {isMobile ? (
          <Components.default
            pageTitle={pageTitle}
            match={{
              params: {
                worksheetId: share.data.sourceId,
                appId: share.data.appId,
              },
              path: '',
            }}
          />
        ) : (
          <Components.default
            pageTitle={pageTitle}
            id={share.data.sourceId}
            ids={{ appId: share.data.appId, worksheetId: share.data.sourceId }}
            className={cx({ hideHeader: hideHeader === 'true' })}
          />
        )}
      </Provider>
    );
  }

  const { appName, customerPageName, appIcon, appIconColor, pageTitle } = share.data || {};
  const title = pageTitle || `${appName}-${customerPageName}`;

  return (
    <Wrap className={cx('flexColumn h100')}>
      <div className="header flexRow alignItemsCenter">
        <div className="Font16 bold flexRow alignItemsCenter flex">
          {appIcon && (
            <div
              className="svgWrap flexRow alignItemsCenter justifyContentCenter mRight10"
              style={{ backgroundColor: appIconColor }}
            >
              <SvgIcon url={appIcon} fill="#fff" size={22} />
            </div>
          )}
          {appName && <div className="flex ellipsis">{title}</div>}
          {appName && <DocumentTitle title={title} />}
        </div>
      </div>
      {renderContent()}
    </Wrap>
  );
};

const root = createRoot(document.getElementById('app'));

root.render(<Entry />);
