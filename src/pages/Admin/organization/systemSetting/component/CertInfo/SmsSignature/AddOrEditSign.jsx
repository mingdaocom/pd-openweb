import React, { Fragment, useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import { Form } from 'antd';
import styled from 'styled-components';
import { Dialog, Dropdown, FunctionWrap, Input, RadioGroup, Support } from 'ming-ui';
import certificationApi from 'src/api/certification';
import EnterpriseForm from 'src/pages/certification/components/EnterpriseForm';
import UploadCertificate from 'src/pages/certification/components/EnterpriseForm/UploadCertificate';
import { getEnterpriseDefaultFormData, getEnterpriseParams } from 'src/pages/certification/utils';

const Wrapper = styled.div`
  margin-top: 8px;
  .formItem {
    margin-bottom: 20px;
    .labelText {
      color: var(--color-text-secondary);
      font-weight: bold;
      margin-bottom: 8px;
    }
  }
  .divider {
    height: 1px;
    background-color: var(--color-background-disabled);
    margin: 16px 0;
  }
`;

function AddOrEditSign(props) {
  const { onCancel, projectId, signInfo = {}, onSuccess } = props || {};
  const [cerOptionList, setCerOptionList] = useState([]);
  const [certId, setCertId] = useState(null);
  const [signName, setSignName] = useState(signInfo.signName || '');
  const [signSource, setSignSource] = useState(signInfo.signSource || 1);
  const [attachments, setAttachments] = useSetState(
    signInfo.id
      ? {
          trademark: { key: signInfo.trademark, url: signInfo.trademarkUrl },
          contactCardFront: { key: signInfo.contactIdCardFront, url: signInfo.contactIdCardFrontUrl },
          contactCardBack: { key: signInfo.contactIdCardBack, url: signInfo.contactIdCardBackUrl },
        }
      : {},
  );
  const [saveLoading, setSaveLoading] = useState(false);

  const [formData, setFormData] = useSetState({});
  const [form] = Form.useForm();

  useEffect(() => {
    if (signInfo.id && (window.platformENV.isOverseas || window.platformENV.isLocal) && window.platformENV.isPlatform) {
      const defaultValues = getEnterpriseDefaultFormData(signInfo.enterpriseInfo);
      setFormData(defaultValues);
    }
    getCertList();
  }, []);

  const getCertList = () => {
    certificationApi.getListCertInfo({ projectId }).then(res => {
      if (res) {
        const list = (res || []).map(item => ({
          text: item.authType === 1 ? item.personalInfo.fullName : item.enterpriseInfo.companyName,
          value: item.id,
        }));
        setCerOptionList(list);
        setCertId(list[0]?.value);
      }
    });
  };

  const onValidate = () => {
    if (!signName) {
      alert(_l('请输入短信签名'), 3);
      return false;
    }

    if (!/^[a-zA-z0-9\u4e00-\u9fa5]{2,}$/.test(signName)) {
      alert(_l('签名需不少于2个字符,且不得包含特殊符号'), 3);
      return false;
    }

    if (window.platformENV.isPlatform) {
      if (signSource === 2 && !attachments.trademark) {
        alert(_l('请上传商标证书'), 3);
        return false;
      }
      if (!attachments.contactCardFront) {
        alert(_l('请上传联系人身份证人像面'), 3);
        return false;
      }
      if (!attachments.contactCardBack) {
        alert(_l('请上传联系人身份证国徽面'), 3);
        return false;
      }
      return true;
    }

    return true;
  };

  const onOk = async () => {
    if (!onValidate()) return;

    const params = {
      id: signInfo.id,
      projectId,
      relationId: certId,
      signName,
      signSource,
      trademark: attachments.trademark?.key,
      contactIdCardFront: attachments.contactCardFront?.key,
      contactIdCardBack: attachments.contactCardBack?.key,
    };
    let enterpriseParams = {};

    if ((window.platformENV.isOverseas || window.platformENV.isLocal) && window.platformENV.isPlatform) {
      try {
        const values = await form.validateFields();

        if (formData.person !== values.legalName) {
          alert(_l('法定代表人姓名不一致'), 3);
          return;
        }

        enterpriseParams = getEnterpriseParams(values);
      } catch {
        return;
      }
    }

    setSaveLoading(true);
    certificationApi[signInfo.id ? 'editSmsSignature' : 'addSmsSignature']({ ...params, ...enterpriseParams })
      .then(res => {
        if (res) {
          alert(signInfo.id ? _l('编辑成功') : _l('添加成功'));
          onSuccess();
          onCancel();
        } else {
          alert(_l('保存失败'), 2);
        }
      })
      .finally(() => setSaveLoading(false));
  };

  const renderContactIdCard = () => {
    return (
      <Fragment>
        <div className="divider" />
        <div className="formItem">
          <div className="labelText">{_l('联系人身份证人像面')}</div>
          <UploadCertificate
            value={attachments.contactCardFront}
            onChange={value => setAttachments({ contactCardFront: value })}
          />
        </div>
        <div className="formItem">
          <div className="labelText">{_l('联系人身份证国徽面')}</div>
          <UploadCertificate
            value={attachments.contactCardBack}
            onChange={value => setAttachments({ contactCardBack: value })}
          />
        </div>
        {!window.platformENV.isOverseas && !window.platformENV.isLocal && <div className="divider" />}
      </Fragment>
    );
  };

  return (
    <Dialog
      visible
      title={signInfo.id ? _l('编辑签名') : _l('添加签名')}
      width={800}
      onCancel={onCancel}
      onOk={onOk}
      okDisabled={saveLoading}
    >
      <Wrapper>
        {!window.platformENV.isOverseas && !window.platformENV.isLocal && (
          <div className="formItem">
            <div className="labelText">{_l('选择已认证主体')}</div>
            <Dropdown
              border
              isAppendToBody
              className="w100"
              data={cerOptionList}
              value={certId}
              onChange={value => setCertId(value)}
            />
          </div>
        )}

        {window.platformENV.isPlatform && (
          <Fragment>
            <div className="formItem">
              <div className="textSecondary bold mTop24 mBottom12">{_l('签名来源')}</div>
              <RadioGroup
                data={[
                  { text: _l('公司名称'), value: 1 },
                  { text: _l('商标'), value: 2 },
                ]}
                checkedValue={signSource}
                onChange={value => setSignSource(value)}
              />
            </div>
            {signSource === 2 && (
              <div className="formItem">
                <div className="labelText">{_l('商标证书')}</div>
                <UploadCertificate
                  value={attachments.trademark}
                  onChange={value => setAttachments({ trademark: value })}
                />
              </div>
            )}
          </Fragment>
        )}

        {!window.platformENV.isOverseas && !window.platformENV.isLocal && <Fragment>{renderContactIdCard()}</Fragment>}

        <div className="formItem">
          <div className="labelText">{_l('短信签名')}</div>
          <Input
            className="w100"
            placeholder={_l('请输入短信签名')}
            maxLength={50}
            value={signName}
            onChange={value => setSignName(value)}
          />
          <div className="mTop16 textTertiary LineHeight20">
            {window.platformENV.isPlatform ? (
              <Fragment>
                <span>
                  {_l(
                    '请使用企业简称或注册商标作为短信签名；提交后需运营商审核，预计 5-10 个工作日，审核通过前该签名不可使用；签名需不少于 2 个字符且不得包含特殊符号。',
                  )}
                </span>
                {!window.platformENV.isOverseas && !window.platformENV.isLocal && (
                  <Support
                    type={3}
                    href="https://help.mingdao.com/workflow/sms-failure/#%E7%AD%BE%E5%90%8D%E6%9D%A5%E6%BA%90%E5%92%8C%E8%A7%84%E8%8C%83"
                    text={_l('签名命名规范')}
                    className="mBottom2"
                  />
                )}
              </Fragment>
            ) : (
              <span>
                {_l(
                  '签名请使用您的公司简称或者商标名称；审核中的签名不能使用，签名需不少于 2 个字符且不得包含特殊符号。',
                )}
              </span>
            )}
          </div>
        </div>

        {(window.platformENV.isOverseas || window.platformENV.isLocal) && window.platformENV.isPlatform && (
          <Fragment>
            <EnterpriseForm type="sign" formData={formData} setFormData={setFormData} form={form} />
            {renderContactIdCard()}
          </Fragment>
        )}
      </Wrapper>
    </Dialog>
  );
}

export const AddOrEditSignDialog = props => FunctionWrap(AddOrEditSign, { ...props });
