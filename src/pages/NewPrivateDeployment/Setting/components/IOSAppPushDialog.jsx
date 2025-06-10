import React, { Fragment, useEffect, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, Input, LoadDiv, QiniuUpload } from 'ming-ui';
import privatePushAjax from 'src/api/privatePush';
import { encrypt } from 'src/utils/common';
import { RequestLabel } from '../../common';

const Wrap = styled.div`
  .certName {
    display: inline-block;
    .cleatBtn {
      display: none;
    }
    &:hover {
      .cleatBtn {
        display: inline-block !important;
      }
    }
  }
`;

const ERROR_TEXT = {
  cert: _l('请上传证书'),
  secret: _l('请上传密钥'),
  bundleId: _l('请填写BundleId'),
};

function IOSAppPushDialog(props) {
  const { visible, data = {}, onOk, onCancel } = props;

  const [password, setPassword] = useState(data.password);
  const [bundleId, setBundleId] = useState(data.bundleId);
  const [uploading, setUploading] = useState(undefined);
  const [cert, setCert] = useState(_.pick(data, ['certName', 'certPath', 'certFullPath', 'certExpireTime']));
  const [secret, setSecret] = useState(_.pick(data, ['keyName', 'keyPath', 'keyFullPath']));

  useEffect(() => {
    if (_.isEmpty(data)) return;

    setCert(_.pick(data, ['certName', 'certPath', 'certFullPath', 'certExpireTime']));
    setSecret(_.pick(data, ['keyName', 'keyPath', 'keyFullPath']));
    setPassword(data.password);
    setBundleId(data.bundleId);
  }, [data]);

  const handleUploaded = (up, file, key) => {
    setUploading(false);
    key === 'cert'
      ? setCert({ ...cert, certName: file.name, certPath: file.key })
      : setSecret({ ...secret, keyName: file.name, keyPath: file.key });
    up.disableBrowse(false);
  };

  const handleOk = async () => {
    if (!cert.certName || !secret.keyName || !bundleId) {
      alert(!cert.certName ? ERROR_TEXT.cert : !secret.keyName ? ERROR_TEXT.secret : ERROR_TEXT.bundleId, 3);
      return;
    }

    const res = privatePushAjax.setIosPushSetting({
      bundleId,
      certKV: {
        key: cert.certName,
        value: cert.certPath,
      },
      secretKV: {
        key: secret.keyName,
        value: secret.keyPath,
      },
      password: password ? encrypt(password) : '',
    });

    if (res) {
      const isFirst = _.isEmpty(data);
      alert(_l('编辑成功'));

      if (isFirst) {
        await privatePushAjax.setPushSettingEnable({ pushMode: 0, status: 1 });
        onOk('ios');
      } else {
        onOk('ios');
      }
    }
  };

  const renderUpload = key => {
    return (
      <QiniuUpload
        key={key}
        className="Block"
        options={{
          multi_selection: false,
          filters: {
            mime_types: [{ title: 'cert', extensions: 'pem' }],
          },
          max_file_size: '1m',
          error_callback: () => {
            alert(_l('有不合法的文件格式，请重新选择上传'), 3);
            return;
          },
        }}
        bucket={3}
        onUploaded={(up, file) => handleUploaded(up, file, key)}
        onAdd={(up, files) => {
          setUploading(key);
          up.disableBrowse();
        }}
      >
        <span className="Font13 ThemeColor Hand">
          {_l('上传')}
          {uploading === key && <LoadDiv size="small" className="InlineBlock mLeft10" />}
        </span>
      </QiniuUpload>
    );
  };

  return (
    <Dialog
      visible={visible}
      title={_l('iOS消息推送通道设置')}
      description={_l('证书、密钥为 .pem 格式，不得大于1M，密钥与证书需匹配')}
      width={480}
      onOk={handleOk}
      onCancel={onCancel}
    >
      <Wrap>
        <RequestLabel title={_l('证书')} className="mBottom12" />
        {!_.isEmpty(cert) ? (
          <Fragment>
            <div className="certName">
              <a href={cert.certFullPath} target="_blank" download>
                {cert.certName}
              </a>
              <span className="Gray_9e mLeft8 cleatBtn Hand" onClick={() => setCert({})}>
                {_l('清除')}
              </span>
            </div>
            {cert.certExpireTime && (
              <div className="certTime Gray_75">{_l('有效期：%0', createTimeSpan(cert.certExpireTime, 3))}</div>
            )}
          </Fragment>
        ) : (
          renderUpload('cert')
        )}
        <RequestLabel title={_l('密钥')} className="mBottom12 mTop30" />
        {!_.isEmpty(secret) ? (
          <div className="certName">
            <a href={secret.keyFullPath} target="_blank" download>
              {secret.keyName}
            </a>
            <span className="Gray_9e mLeft8 cleatBtn Hand" onClick={() => setSecret({})}>
              {_l('清除')}
            </span>
          </div>
        ) : (
          renderUpload('secret')
        )}
        <div className="Font14 Gray mBottom10 mTop30">{_l('密码')}</div>
        <Input className="w100 mBottom20" type="password" value={password} onChange={value => setPassword(value)} />
        <RequestLabel title={_l('BundleId')} className="mBottom10" />
        <Input className="w100" value={bundleId} onChange={value => setBundleId(value)} />
      </Wrap>
    </Dialog>
  );
}

export default IOSAppPushDialog;
