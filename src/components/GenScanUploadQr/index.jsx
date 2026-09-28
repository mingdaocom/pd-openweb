import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { LoadDiv, Qr } from 'ming-ui';
import { Popover } from 'ming-ui/antd-components';
import attachmentAjax from 'src/api/attachment';
import RecordInfoContext from 'worksheet/common/recordInfo/RecordInfoContext';
import { UPLOAD_TYPE } from 'src/utils/domain/worksheet/constants';
import { getTemporaryAttachmentFromUrl } from 'src/utils/platform/file/attachment';

const Popup = styled.div`
  .error {
    color: var(--color-error);
    text-align: center;
    line-height: 200px;
  }
  .expired {
    position: absolute;
    bottom: 20px;
    left: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    background-color: rgba(255, 255, 255, 0.95);
    .icon {
      color: var(--color-primary);
    }
    .qrExpired {
      font-size: 13px;
      color: var(--color-text-primary);
      margin-top: 6px;
    }
    .refresh {
      padding: 4px 20px;
      border-radius: 45px;
      background: var(--color-primary);
      color: var(--color-white);
      &:hover {
        background: var(--color-primary);
      }
    }
  }
  .tip {
    font-size: 14px;
    color: var(--color-text-primary);
    font-weight: bold;
    text-align: center;
  }
  .danger {
    font-size: 14px;
    color: var(--color-error);
    margin: 3px 0 10px;
    text-align: center;
  }
  .loadingCon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 200px;
    height: 200px;
  }
`;

function getUrlNoSearch(url) {
  const urlObj = new URL(url);
  return urlObj.origin + urlObj.pathname;
}

const UPDATE_ATTACHMENT_INTERVAL = 1000;

function QrPopup({ type, from, worksheetId, viewId, controlId, onScanResultUpdate, setPopupVisible }) {
  const cache = useRef({ appendedAttachmentIds: [] });
  const onScanResultUpdateRef = useRef(onScanResultUpdate);
  const [loading, setLoading] = useState(true);
  const [scanId, setScanId] = useState();
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);
  const { recordBaseInfo: { fromIsDraft, fromIsWorkflow } = {} } = useContext(RecordInfoContext) || {};

  useEffect(() => {
    onScanResultUpdateRef.current = onScanResultUpdate;
  }, [onScanResultUpdate]);

  const listenScan = useCallback(
    newScanId => {
      if (cache.current.timer) {
        clearInterval(cache.current.timer);
      }

      function run() {
        attachmentAjax.getScanAttachments({ scanId: newScanId }).then(res => {
          if (res.status !== 1) {
            setExpired(true);
            if (cache.current.timer) {
              clearInterval(cache.current.timer);
            }

            return;
          }

          const { attachmentScanSimpleDetail = [] } = res;

          if (!isEmpty(attachmentScanSimpleDetail)) {
            const newAttachments = attachmentScanSimpleDetail.filter(
              item => !cache.current.appendedAttachmentIds.includes(getUrlNoSearch(item.fileUrl)),
            );

            if (newAttachments.length > 0) {
              onScanResultUpdateRef.current(newAttachments.map(getTemporaryAttachmentFromUrl));
              const newAppendedAttachmentIds = newAttachments.map(item => getUrlNoSearch(item.fileUrl));
              cache.current.appendedAttachmentIds = [
                ...cache.current.appendedAttachmentIds,
                ...newAppendedAttachmentIds,
              ];
              if (type === UPLOAD_TYPE.SIGNATURE) {
                setPopupVisible(false);
              }
            }
          }
        });
      }

      const timer = setInterval(run, UPDATE_ATTACHMENT_INTERVAL);
      cache.current.timer = timer;
    },
    [type, setPopupVisible],
  );

  const genScanId = useCallback(
    (cb = () => {}) => {
      let sourceType = 1;

      if (!worksheetId) {
        sourceType = 3;
      } else if (from === 'worksheet') {
        sourceType = 1;
      } else {
        sourceType = 2;
      }

      let getType;

      if (fromIsDraft) {
        getType = 21;
      } else if (fromIsWorkflow) {
        getType = 9;
      }

      attachmentAjax
        .getAttachmentScanUrl({
          sourceType,
          getType,
          fileType: type,
          worksheetId,
          controlId,
          viewId,
          rowId: '',
        })
        .then(data => {
          if (data.scanUrl) {
            const generatedScanId = (data.scanUrl.match(/\/(\w{16})$/) || '')[1];
            setScanId(generatedScanId);
            cache.current.scanId = generatedScanId;
            cb(generatedScanId);
          } else {
            setError(_l('获取扫码链接失败'));
          }
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [controlId, from, fromIsDraft, fromIsWorkflow, type, viewId, worksheetId],
  );

  useEffect(() => {
    const cacheValue = cache.current;
    genScanId(newScanId => {
      listenScan(newScanId);
    });
    return () => {
      if (cacheValue.scanId) {
        attachmentAjax.stopAttachmentScanUrl({ scanId: cacheValue.scanId });
      }

      if (cacheValue.timer) {
        clearInterval(cacheValue.timer);
      }
    };
  }, [genScanId, listenScan]);

  return (
    <Popup>
      <div className="tip">{_l('使用手机扫描二维码输入')}</div>
      <div className="danger">{_l('上传时请勿关闭此浮层')}</div>
      {!error &&
        (loading ? (
          <div className="loadingCon">
            <LoadDiv size="small" />
          </div>
        ) : (
          <Qr
            content={`${md.global.Config.WebUrl}recordfileupload/${scanId}?sys_lang=${window.getCurrentLang()}`}
            width={200}
            height={200}
            style={{ height: 200 }}
          />
        ))}
      {error && <div className="error">{error}</div>}
      {expired && (
        <div className="expired">
          <i className="icon icon-error1 Font48"></i>
          <p className="qrExpired">{_l('当前二维码已过期')}</p>
          <span
            className="refresh Hand"
            onClick={() => {
              setLoading(true);
              genScanId(newScanId => {
                setExpired(false);
                listenScan(newScanId);
              });
            }}
          >
            {_l('刷新')}
          </span>
        </div>
      )}
    </Popup>
  );
}

QrPopup.propTypes = {
  type: PropTypes.number,
  from: PropTypes.string,
  worksheetId: PropTypes.string,
  controlId: PropTypes.string,
  onScanResultUpdate: PropTypes.func,
  setPopupVisible: PropTypes.func,
};

export default function GenScanUploadQr({
  type = UPLOAD_TYPE.ATTACHMENT,
  from = 'worksheet',
  worksheetId,
  viewId,
  controlId,
  children,
  onScanResultUpdate = () => {},
}) {
  const [popupVisible, setPopupVisible] = useState(false);

  const child = React.Children.only(children);

  return (
    <Popover
      arrow={true}
      open={popupVisible}
      onOpenChange={setPopupVisible}
      placement="bottom"
      content={
        <QrPopup
          type={type}
          from={from}
          worksheetId={worksheetId}
          viewId={viewId}
          controlId={controlId}
          onScanResultUpdate={onScanResultUpdate}
          setPopupVisible={setPopupVisible}
        />
      }
      trigger="click"
    >
      {React.cloneElement(child, {
        className: `${children.props.className || ''} ${popupVisible ? 'active' : ''}`,
      })}
    </Popover>
  );
}

GenScanUploadQr.propTypes = {
  type: PropTypes.number,
  from: PropTypes.string,
  rowId: PropTypes.string,
  worksheetId: PropTypes.string,
  viewId: PropTypes.string,
  controlId: PropTypes.string,
  children: PropTypes.element.isRequired,
  onScanResultUpdate: PropTypes.func,
};
