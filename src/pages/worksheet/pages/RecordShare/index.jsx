import React, { useEffect, useState } from 'react';
import ReactDom from 'react-dom';
import { LoadDiv } from 'ming-ui';
import preall from 'src/common/preall';
import sheetApi from 'src/api/worksheet';
import { ShareState, VerificationPass, SHARE_STATE } from 'worksheet/components/ShareState';
import RecordShare from './RecordShare';
import _ from 'lodash';

const Entry = props => {
  const [loading, setLoading] = useState(true);
  const [share, setShare] = useState({});
  let shareId;

  if (location.pathname.indexOf('public/print') >= 0) {
    shareId = location.pathname.match(/.*\/public\/print\/(.*)/)[1].split('&&')[0];
  } else {
    shareId = location.pathname.match(/.*\/public\/record\/(.*)/)[1];
  }

  useEffect(() => {
    getShareInfoByShareId().then(data => {
      setLoading(false);
    });
  }, []);

  const getShareInfoByShareId = data => {
    return new Promise(async (resolve, reject) => {
      const result = await sheetApi.getShareInfoByShareId({ shareId, ...data });
      const shareAuthor = _.get(result, 'data.shareAuthor');
      window.share = shareAuthor;
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

const Comp = preall(Entry, { allownotlogin: true });

ReactDom.render(<Comp />, document.getElementById('app'));
