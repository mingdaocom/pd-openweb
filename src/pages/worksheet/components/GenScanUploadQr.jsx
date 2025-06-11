import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { get, isEmpty, startsWith } from 'lodash';
import PropTypes, { func } from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { LoadDiv, Qr } from 'ming-ui';
import attachmentAjax from 'src/api/attachment';
import RecordInfoContext from 'worksheet/common/recordInfo/RecordInfoContext';
import { UPLOAD_TYPE } from 'worksheet/constants/enum';

function generateFileOId() {
  const prefix = 'o_';

  // 使用当前时间戳作为基础（更具唯一性）
  const timestamp = Date.now().toString(36); // 转成36进制，包含数字+字母

  // 随机部分，用于增加复杂度和避免冲突
  const randomPart = Array.from({ length: 20 }, () => Math.random().toString(36)[2]).join('');

  return prefix + timestamp + randomPart;
}

export function getTemporaryAttachmentFromUrl({ fileUrl, fileName = '', fileSize } = {}) {
  const urlObj = new URL(fileUrl);
  const name = fileName.replace(/\.[^.]+$/, '');
  const ext = get(fileName.match(/\.[^.]+$/), '0');
  const fileNameOfUrl = get(urlObj.pathname.match(/\/([^\/]*$)/, ''), '1').replace(/\.[^.]+$/, '');
  return {
    fileID: generateFileOId(),
    fileSize: fileSize || 0,
    serverName: urlObj.origin + '/',
    filePath: urlObj.pathname.replace(/\/([^\/]*$)/, '').replace(/^\//, '') + '/',
    fileName: fileNameOfUrl,
    fileExt: ext,
    originalFileName: name,
    key: urlObj.pathname.replace(/^\//, ''),
    oldOriginalFileName: name,
    originalFileName: name,
    url: fileUrl,
  };
}

const Popup = styled.div`
  position: relative;
  background-color: #fff;
  padding: 12px 20px 20px;
  width: 240px;
  box-shadow: 0px 1px 6px 1px rgba(0, 0, 0, 0.24);
  border-radius: 6px;
  .error {
    color: #f44336;
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
      color: #2196f3;
    }
    .qrExpired {
      font-size: 13px;
      color: #333;
      margin-top: 6px;
    }
    .refresh {
      padding: 4px 20px;
      border-radius: 45px;
      background: #2195f3;
      color: #fff;
      &:hover {
        background: #1e88e5;
      }
    }
  }
  .tip {
    font-size: 14px;
    color: #333;
    font-weight: bold;
    text-align: center;
  }
  .danger {
    font-size: 14px;
    color: #f44336;
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
  &::before {
    content: '';
    position: absolute;
    width: 0px;
    height: 0px;
    border-left: 12px solid transparent;
    border-right: 12px solid transparent;
    border-bottom: 11px solid #eee;
    top: -11px;
    left: calc(50% - 12px);
  }
  &::after {
    content: '';
    position: absolute;
    width: 0px;
    height: 0px;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 10px solid #fff;
    top: -10px;
    left: calc(50% - 10px);
  }
  &.top {
    &::before {
      border-bottom: none;
      border-top: 11px solid #eee;
      top: auto;
      bottom: -11px;
    }
    &::after {
      border-bottom: none;
      border-top: 10px solid #fff;
      top: auto;
      bottom: -10px;
    }
  }
`;

function getUrlNoSearch(url) {
  const urlObj = new URL(url);
  return urlObj.origin + urlObj.pathname;
}

const UPDATE_ATTACHMENT_INTERVAL = 1000;

function QrPopup({
  type,
  from,
  worksheetId,
  viewId,
  controlId,
  rowId,
  popupPosition,
  onScanResultUpdate,
  setPopupVisible,
}) {
  const cache = useRef({ appendedAttachmentIds: [] });
  const [loading, setLoading] = useState(true);
  const [scanId, setScanId] = useState();
  const [appendedAttachmentIds, setAppendedAttachmentIds] = useState([]);
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);
  const { recordBaseInfo: { fromIsDraft, fromIsWorkflow } = {} } = useContext(RecordInfoContext) || {};
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
              onScanResultUpdate(newAttachments.map(getTemporaryAttachmentFromUrl));
              const newAppendedAttachmentIds = newAttachments.map(item => getUrlNoSearch(item.fileUrl));
              setAppendedAttachmentIds(old => [...old, ...newAppendedAttachmentIds]);
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
    [type, onScanResultUpdate, appendedAttachmentIds, setPopupVisible],
  );

  const genScanId = useCallback(
    (cb = () => {}) => {
      setLoading(true);
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
          rowId: !startsWith(rowId, 'temp') && !startsWith(rowId, 'default') ? rowId : '',
        })
        .then(data => {
          if (data.scanUrl) {
            const generatedScanId = (data.scanUrl.match(/\/(\w{16})$/) || '')[1];
            setScanId(generatedScanId);
            cb(generatedScanId);
          } else {
            setError(_l('获取扫码链接失败'));
          }
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [from, worksheetId, controlId, rowId, type, viewId],
  );

  useEffect(() => {
    cache.current.scanId = scanId;
  }, [scanId]);

  useEffect(() => {
    genScanId(newScanId => {
      listenScan(newScanId);
    });
    return () => {
      if (cache.current.scanId) {
        attachmentAjax.stopAttachmentScanUrl({ scanId: cache.current.scanId });
      }
      if (cache.current.timer) {
        clearInterval(cache.current.timer);
      }
    };
  }, []);

  return (
    <Popup className={popupPosition}>
      <div className="tip">{_l('使用手机扫描二维码输入')}</div>
      <div className="danger">{_l('上传时请勿关闭此浮层')}</div>
      {!error &&
        (loading ? (
          <div className="loadingCon">
            <LoadDiv size="small" />
          </div>
        ) : (
          <Qr
            content={`${md.global.Config.WebUrl.replace(/\/$/, '')}/recordfileupload/${scanId}?lang=${window.getCurrentLang()}`}
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
  type: PropTypes.string,
  from: PropTypes.string,
  worksheetId: PropTypes.string,
  controlId: PropTypes.string,
  rowId: PropTypes.string,
  popupPosition: PropTypes.string,
  onScanResultUpdate: PropTypes.func,
  setPopupVisible: PropTypes.func,
};

export default function GenScanUploadQr({
  type = UPLOAD_TYPE.ATTACHMENT,
  from = 'worksheet',
  rowId,
  worksheetId,
  viewId,
  controlId,
  children,
  onScanResultUpdate = () => {},
}) {
  const ref = useRef(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupPosition, setPopupPosition] = useState('bottom');

  const child = React.Children.only(children);

  return (
    <Trigger
      popupVisible={popupVisible}
      onPopupVisibleChange={newVisible => {
        if (newVisible) {
          const { bottom } = ref.current.getBoundingClientRect();
          setPopupPosition(bottom + 290 > window.innerHeight ? 'top' : 'bottom');
        }
        setPopupVisible(newVisible);
      }}
      popupAlign={{
        offset: [0, popupPosition === 'bottom' ? 13 : -13],
        points: popupPosition === 'bottom' ? ['tc', 'bc'] : ['bc', 'tc'],
      }}
      popup={
        <QrPopup
          type={type}
          from={from}
          worksheetId={worksheetId}
          viewId={viewId}
          controlId={controlId}
          rowId={rowId}
          popupPosition={popupPosition}
          onScanResultUpdate={onScanResultUpdate}
          setPopupVisible={setPopupVisible}
        />
      }
      destroyPopupOnHide
      action={['click']}
    >
      {React.cloneElement(child, {
        ref,
        className: `${children.props.className || ''} ${popupVisible ? 'active' : ''}`,
      })}
    </Trigger>
  );
}

GenScanUploadQr.propTypes = {
  type: PropTypes.string,
  from: PropTypes.string,
  rowId: PropTypes.string,
  worksheetId: PropTypes.string,
  viewId: PropTypes.string,
  controlId: PropTypes.string,
  children: PropTypes.element.isRequired,
  onScanResultUpdate: PropTypes.func,
};
