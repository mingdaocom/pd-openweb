import React from 'react';
import PropTypes from 'prop-types';
import qs from 'query-string';
import attachmentController from 'src/api/attachment';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { ATTACHMENT_TYPE } from './enum';
import './style.less';

const getTip = type => {
  switch (type) {
    case ATTACHMENT_TYPE.COMMON:
      return _l('发送文件副本');
    case ATTACHMENT_TYPE.KC:
      return _l('发送文件分享链接');
    case ATTACHMENT_TYPE.WORKSHEET:
      return _l('发送工作表分享链接');
    case ATTACHMENT_TYPE.WORKSHEETROW:
      return _l('发送工作表记录分享链接');
    default:
      return '';
  }
};

const getTargetText = type => {
  switch (type) {
    case 3:
      return _l('微信扫码');
    case 6:
      return _l('手机QQ扫码');
    default:
      return _l('扫描二维码');
  }
};

const getQRCodeLink = url => `${md.global.Config.AjaxApiUrl}code/CreateQrCodeImage?url=${encodeURIComponent(url)}`;

const genQiniuFileShareUrl = async file => {
  let url = await attachmentController.getShareLocalAttachmentUrl({
    filePath: file.qiniuPath,
    hours: 48,
  });
  const queryIndex = url.indexOf('?');
  const qiniuParams = qs.parse(queryIndex >= 0 ? url.slice(queryIndex + 1) : '');
  url = queryIndex > 0 ? url.slice(0, queryIndex) : url;
  const urlParams = qs.stringify({
    qiniuPath: url,
    qiniutoken: qiniuParams.token,
    e: qiniuParams.e,
    name: file.name,
    ext: file.ext,
    size: file.size,
    genTime: Date.now(),
  });
  const result = await attachmentController.getShortUrl({
    url: window.escape(pathCompletion(`/apps/kc/shareLocalAttachment.aspx?${urlParams}`)),
  });

  return result.shortUrl || result;
};

const getShareUrl = (attachmentType, file) => {
  switch (attachmentType) {
    case ATTACHMENT_TYPE.COMMON:
      return attachmentController.getShareLocalAttachmentUrl({ fileID: file.fileID });
    case ATTACHMENT_TYPE.KC:
    case ATTACHMENT_TYPE.WORKSHEET:
    case ATTACHMENT_TYPE.WORKSHEETROW:
      return Promise.resolve(file.shareUrl);
    case ATTACHMENT_TYPE.QINIU:
      return genQiniuFileShareUrl(file);
    default:
      return Promise.reject(new Error('Unsupported attachment type'));
  }
};

export default function MobileShareDialog({ attachmentType, file, sendToType }) {
  const [loadError, setLoadError] = React.useState(false);
  const [qrCodeUrl, setQrCodeUrl] = React.useState();

  React.useEffect(() => {
    let active = true;

    getShareUrl(attachmentType, file)
      .then(url => {
        if (!url) {
          throw new Error('Missing share URL');
        }

        if (active) {
          setQrCodeUrl(getQRCodeLink(url));
        }
      })
      .catch(error => {
        console.error(error);
        if (active) {
          setLoadError(true);
        }
      });

    return () => {
      active = false;
    };
  }, [attachmentType, file]);

  return (
    <div className="mobileShareDialog">
      <div className="urlQrCode">
        {loadError ? (
          <p className="loadError">{_l('加载二维码失败')}</p>
        ) : qrCodeUrl ? (
          <img src={qrCodeUrl} alt={_l('分享二维码')} onError={() => setLoadError(true)} />
        ) : (
          <span className="clipLoader textTertiary" />
        )}
      </div>
      <div className="tip">
        {getTargetText(sendToType)}，{getTip(attachmentType)}
      </div>
      <div className="fileName ellipsis">{file.fullName}</div>
      {attachmentType === ATTACHMENT_TYPE.KC && <div className="deadline">{_l('下载链接有效期%0小时', 48)}</div>}
    </div>
  );
}

MobileShareDialog.propTypes = {
  attachmentType: PropTypes.number.isRequired,
  file: PropTypes.shape({
    ext: PropTypes.string,
    fileID: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    fullName: PropTypes.string,
    name: PropTypes.string,
    qiniuPath: PropTypes.string,
    shareUrl: PropTypes.string,
    size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
  sendToType: PropTypes.number.isRequired,
};
