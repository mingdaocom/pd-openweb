import React, { useEffect, useState } from 'react';
import ReactDom from 'react-dom';
import { LoadDiv, SvgIcon } from 'ming-ui';
import preall from 'src/common/preall';
import sheetApi from 'src/api/worksheet';
import appManagementApi from 'src/api/appManagement';
import { ShareState, VerificationPass, SHARE_STATE } from 'worksheet/components/ShareState';
import ViewSahre from './ViewSahre';
import DocumentTitle from 'react-document-title';
import styled from 'styled-components';
import _ from 'lodash';
import { getTranslateInfo } from 'src/util';

const Wrap = styled.div`
  .header {
    height: 44px;
    padding: 0 24px;
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.16);
    justify-content: space-between;
    background-color: #fff;
    z-index: 1;
  }
  .header,
  .SingleViewHeader {
    .svgWrap {
      width: 26px;
      height: 26px;
      border-radius: 4px;
    }
  }
  .SingleViewHeader {
    height: 44px;
    padding: 0 24px;
    background-color: #fff;
    .icon-task-later,
    .addRecord {
      display: none;
    }
    .pagination {
      display: flex;
      align-items: center;
    }
    .queryInput {
      margin-right: 0;
    }
    .queryInput .inputCon > i {
      font-size: 20px !important;
      margin-top: 2px;
    }
  }
`;

const Entry = props => {
  const shareId = location.pathname.match(/.*\/public\/view\/(.*)/)[1];
  const [loading, setLoading] = useState(true);
  const [share, setShare] = useState({});

  useEffect(() => {
    const clientId = sessionStorage.getItem(shareId);
    window.clientId = clientId;
    getShareInfoByShareId({
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
        window[`langData-${appId}`] = lang.items;
        window.appInfo = { id: appId };
        data.appName = getTranslateInfo(appId, appId).name || data.appName;
        data.worksheetName = getTranslateInfo(appId, data.worksheetId).name || data.worksheetName;
        data.viewName = getTranslateInfo(appId, data.viewId).name || data.viewName;
      }
      setShare(result);
      setLoading(false);
    });
  }, []);

  const getShareInfoByShareId = data => {
    return new Promise(async (resolve, reject) => {
      const result = await sheetApi.getShareInfoByShareId({ shareId, ...data });
      const shareAuthor = _.get(result, 'data.shareAuthor');
      const clientId = _.get(result, 'data.clientId');
      window.clientId = clientId;
      clientId && sessionStorage.setItem(shareId, clientId);
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
                getShareInfoByShareId({
                  password: value,
                  ...captchaResult,
                }).then(data => {
                  if (data.resultCode === 1) {
                    resolve(data);
                    setShare(data);
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

  const renderInfo = () => {
    const { appName, worksheetName, viewName, appIcon, appIconColor } = share.data || {};
    return (
      <div className="Font16 bold flexRow alignItemsCenter">
        {appIcon && (
          <div
            className="svgWrap flexRow alignItemsCenter justifyContentCenter mRight10"
            style={{ backgroundColor: appIconColor }}
          >
            <SvgIcon url={appIcon} fill="#fff" size={22} />
          </div>
        )}
        <div className="flex ellipsis">
          {appName && `${appName}-${worksheetName}-${viewName}`}
          {appName && <DocumentTitle title={`${appName}-${worksheetName}-${viewName}`} />}
        </div>
      </div>
    );
  };

  const renderSource = () => {
    return null;
  };

  if (share.resultCode === 1) {
    return (
      <Wrap className="h100">
        <ViewSahre data={share.data} headerLeft={renderInfo()} headerRight={renderSource()} />
      </Wrap>
    );
  } else {
    return (
      <Wrap className="flexColumn h100">
        <div className="header flexRow alignItemsCenter">
          {renderInfo()}
          {renderSource()}
        </div>
        {renderContent()}
      </Wrap>
    );
  }
};

ReactDom.render(<Entry />, document.getElementById('app'));
