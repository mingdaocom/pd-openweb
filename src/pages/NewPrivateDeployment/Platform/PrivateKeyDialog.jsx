import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Textarea, LoadDiv } from 'ming-ui';
import privateGuideApi from 'src/api/privateGuide';

export default props => {
  const { originCode, visible, onCancel, onSave } = props;
  const [licenseCode, setLicenseCode] = useState('');
  const [verifyLicenseCode, setVerifyLicenseCode] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddPrivateKey = () => {
    if (_.isEmpty(licenseCode)) {
      setPrompt(_l('请输入密钥'));
      setVerifyLicenseCode('');
      return;
    }
    if (loading) return;
    setLoading(true);
    setVerifyLicenseCode('');
    setPrompt('');
    privateGuideApi.bindLicenseCode({
      licenseCode,
    }).then(result => {
      setVerifyLicenseCode(result);
      setLoading(false);
      if (result) {
        alert(_l('添加成功'));
        onSave();
        onCancel();
        setLicenseCode('');
        setVerifyLicenseCode('');
      }
    }).fail(error => {
      setLoading(false);
      setPrompt(error.errorMessage);
    });
  }

  return (
    <Dialog
      visible={visible}
      anim={false}
      title={originCode ? _l('当前密钥') : _l('更新密钥')}
      width={560}
      onOk={() => {
        if (originCode) {
          onCancel();
        } else {
          handleAddPrivateKey();
        }
      }}
      onCancel={onCancel}
      showCancel={originCode ? false : true}
      okText={originCode ? _l('关闭') : _l('确定')}
    >
      {originCode ? (
        <div className="breakAll Gray_75">{originCode}</div>
      ) : (
        <Fragment>
          <div className="mBottom10">
            <span className="Gray_75 Font13">{_l('请输入您的密钥')}</span>
          </div>
          <Textarea
            value={licenseCode}
            onChange={value => {
              setLicenseCode(value);
            }}
          />
          {
            loading ? (
              <div className="flexRow verifyInfo Gray_75 mBottom10">
                <LoadDiv size="small" />
                {_l('正在验证您的产品密钥')}
              </div>
            ) : (
              (_.isBoolean(verifyLicenseCode) && !verifyLicenseCode) && <div className="mBottom10 Red">{_l('密钥验证失败, 请重新填写')}</div>
            )
          }
          {prompt ? <div className="mBottom10 Red">{prompt}</div> : null}
        </Fragment>
      )}
    </Dialog>
  );
}