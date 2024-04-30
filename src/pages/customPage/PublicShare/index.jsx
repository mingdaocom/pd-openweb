import React, { useEffect, useState } from 'react';
import ReactDom from 'react-dom';
import preall from 'src/common/preall';
import cx from 'classnames';
import { Provider } from 'react-redux';
import store from 'src/redux/configureStore';
import { SvgIcon, LoadDiv } from 'ming-ui';
import appManagementApi from 'src/api/appManagement';
import CustomPageContent from 'src/pages/customPage/pageContent';
import MobileCustomPage from 'src/pages/Mobile/CustomPage';
import { ShareState, VerificationPass, SHARE_STATE } from 'worksheet/components/ShareState';
import DocumentTitle from 'react-document-title';
import CreateByMingDaoYun from 'src/components/CreateByMingDaoYun';
import styled from 'styled-components';
import { getRequest, getTranslateInfo, browserIsMobile } from 'src/util';
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

  useEffect(() => {
    const clientId = sessionStorage.getItem(id);
    window.clientId = clientId;
    getEntityShareById({
      clientId,
      langType: getCurrentLangCode(),
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
      if (langInfo && langInfo.appLangId) {
        const lang = await appManagementApi.getAppLangDetail({
          projectId,
          appId,
          appLangId: langInfo.appLangId,
        });
        window.appInfo = { id: appId };
        window[`langData-${appId}`] = lang.items;
        data.appName = getTranslateInfo(appId, appId).name || data.appName;
        data.customerPageName = getTranslateInfo(appId, data.sourceId).name || data.customerPageName;
      }
      setShare(result);
      setLoading(false);
    });
    if (hideHeader === 'true') {
      document.body.classList.add('bodyScroll');
      setCookie('i18n_langtag', 'zh-Hans');
    }
  }, []);

  const getEntityShareById = data => {
    return new Promise(async (resolve, reject) => {
      const result = await appManagementApi.getEntityShareById({ id, sourceType: 21, ...data });
      const clientId = _.get(result, 'data.clientId');
      window.clientId = clientId;
      clientId && sessionStorage.setItem(id, clientId);
      resolve(result);
    });
  };

  if (loading) {
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
    return (
      <Provider store={store}>
        {isMobile ? (
          <MobileCustomPage
            match={{
              params: {
                worksheetId: share.data.sourceId,
                appId: share.data.appId
              },
              path: ''
            }}
          />
        ) : (
          <CustomPageContent
            id={share.data.sourceId}
            ids={{ worksheetId: share.data.sourceId }}
            className={cx({ hideHeader: hideHeader === 'true' })}
          />
        )}
      </Provider>
    );
  }

  const { appName, customerPageName, appIcon, appIconColor } = share.data || {};

  return (
    <Wrap className={cx('flexColumn h100')}>
      <div className="header flexRow alignItemsCenter">
        <div className="Font16 bold flexRow alignItemsCenter">
          {appIcon && (
            <div
              className="svgWrap flexRow alignItemsCenter justifyContentCenter mRight10"
              style={{ backgroundColor: appIconColor }}
            >
              <SvgIcon url={appIcon} fill="#fff" size={22} />
            </div>
          )}
          {appName && `${appName}-${customerPageName}`}
          {appName && <DocumentTitle title={`${appName}-${customerPageName}`} />}
        </div>
      </div>
      {renderContent()}
    </Wrap>
  );
};

ReactDom.render(<Entry />, document.getElementById('app'));
