import React, { useEffect, useState } from 'react';
import ReactDom from 'react-dom';
import { LoadDiv } from 'ming-ui';
import preall from 'src/common/preall';
import sheetApi from 'src/api/worksheet';
import appManagementApi from 'src/api/appManagement';
import { ShareState, VerificationPass, SHARE_STATE } from 'worksheet/components/ShareState';
import RecordShare from './RecordShare';
import _ from 'lodash';

const Entry = props => {
  const [loading, setLoading] = useState(true);
  const [share, setShare] = useState({});
  let shareId;
  let printId;

  if (location.pathname.indexOf('public/print') >= 0) {
    const ids = location.pathname.match(/.*\/public\/print\/(.*)/)[1].split('&&');
    shareId = ids[0];
    printId = ids[1];
  } else {
    shareId = location.pathname.match(/.*\/public\/record\/(.*)/)[1];
  }

  useEffect(() => {
    const clientId = sessionStorage.getItem(shareId);
    window.clientId = clientId;
    getShareInfoByShareId({
      clientId,
      printId,
      langType: getCurrentLangCode(),
    }).then(async result => {
      const { data } = result;
      const { appId, projectId, langInfo } = data;
      if (!data.rowId) {
        location.href = `/public/view/${shareId}`;
        return;
      }
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
        window[`langData-${data.appId}`] = lang.items;
        window.appInfo = { id: appId };
      }
      setShare(result);
      setLoading(false);
    });
  }, []);

  const getShareInfoByShareId = data => {
    return new Promise(async (resolve, reject) => {
      const result = await sheetApi.getShareInfoByShareId({ shareId, ...data });
      const clientId = _.get(result, 'data.identity');
      const printClientId = _.get(result, 'data.clientId');
      window.clientId = printClientId;
      clientId && sessionStorage.setItem(shareId, clientId);

      if (printClientId) {
        window.clientId = printClientId;
        !sessionStorage.getItem('clientId') && sessionStorage.setItem('clientId', printClientId);
      }

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

  return share.resultCode === 1 ? <RecordShare data={share.data} /> : <ShareState code={share.resultCode} />;
};

ReactDom.render(<Entry />, document.getElementById('app'));
