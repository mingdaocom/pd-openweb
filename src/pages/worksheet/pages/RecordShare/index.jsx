import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import _ from 'lodash';
import { LoadDiv } from 'ming-ui';
import sheetApi from 'src/api/worksheet';
import { SHARE_STATE, ShareState, VerificationPass } from 'worksheet/components/ShareState';
import preall from 'src/common/preall';
import { shareGetAppLangDetail } from 'src/utils/app';
import RecordShare from './RecordShare';

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
    }).then(async result => {
      const { data } = result;
      const { appId, projectId } = data;
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
      window.appInfo = { id: appId };
      setShare(result);
      setLoading(false);
    });
  }, []);

  const getShareInfoByShareId = data => {
    return new Promise(async (resolve, reject) => {
      const result = await sheetApi.getShareInfoByShareId({ shareId, ...data });
      const clientId = _.get(result, 'data.identity');
      const printClientId = _.get(result, 'data.clientId');
      const { appId, projectId } = result.data;
      window.clientId = printClientId;
      clientId && sessionStorage.setItem(shareId, clientId);
      if (printClientId) {
        window.clientId = printClientId;
        !sessionStorage.getItem('clientId') && sessionStorage.setItem('clientId', printClientId);
      }
      if (result.resultCode === 1) {
        await shareGetAppLangDetail({
          projectId,
          appId,
        });
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

const root = createRoot(document.getElementById('app'));

root.render(<Entry />);
