import React, { useEffect, useState } from 'react';
import ReactDom from 'react-dom';
import preall from 'src/common/preall';
import { Provider } from 'react-redux';
import store from 'src/redux/configureStore';
import SvgIcon from 'src/components/SvgIcon';
import appManagement from 'src/api/appManagement';
import CustomPageContent from 'src/pages/customPage/pageContent';
import { ShareState, VerificationPass, SHARE_STATE } from 'worksheet/components/ShareState';
import DocumentTitle from 'react-document-title';
import { LoadDiv } from 'ming-ui';
import styled from 'styled-components';
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

const Entry = props => {
  const pathname = location.pathname.split('/');
  const id = pathname[pathname.length - 1];
  const [loading, setLoading] = useState(true);
  const [share, setShare] = useState({});

  useEffect(() => {
    const clientId = sessionStorage.getItem(id);
    window.clientId = clientId;
    getEntityShareById({ clientId }).then(({ data }) => {
      localStorage.setItem('currentProjectId', data.projectId);
      preall(
        { type: 'function' },
        {
          allownotlogin: true,
          requestParams: { projectId: data.projectId },
        },
      );
      setLoading(false);
    });
  }, []);

  const getEntityShareById = data => {
    return new Promise(async (resolve, reject) => {
      const result = await appManagement.getEntityShareById({ id, sourceType: 21, ...data });
      const clientId = _.get(result, 'data.clientId');
      window.clientId = clientId;
      clientId && sessionStorage.setItem(id, clientId);
      setShare(result);
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
        <CustomPageContent id={share.data.sourceId} ids={{ worksheetId: share.data.sourceId }} />
      </Provider>
    );
  }

  const { appName, customerPageName, appIcon, appIconColor } = share.data || {};

  return (
    <Wrap className="flexColumn h100">
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
