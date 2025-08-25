import React, { useState } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Dialog, FunctionWrap, Input } from 'ming-ui';
import certificationApi from 'src/api/certification';
import { RESULT_TYPES } from './constant';

const FormItemWrap = styled.div`
  margin-top: 16px;
  .labelText {
    padding-bottom: 8px;
    line-height: 1.5;
    font-size: 14px;
    color: #000000d9;
  }
  input {
    width: 100%;
    border-color: #ddd;
    font-size: 13px;
    &:hover {
      border-color: #ccc;
    }
    &:focus {
      border-color: #1e88e5 !important;
    }
    &::placeholder {
      color: #bdbdbd;
    }
  }
`;

function EditContactInfo(props) {
  const { onClose, contactInfo, projectId, onUpdateSuccess } = props;
  const [data, setData] = useSetState(contactInfo || {});
  const [submitLoading, setSubmitLoading] = useState(false);

  const onValidate = () => {
    if (!data.contactName) {
      alert(_l('请输入联系人姓名'), 3);
      return;
    }
    if (!data.contactIdNumber) {
      alert(_l('请输入联系人身份证号'), 3);
      return;
    }
    if (!/(^\d{15}$)|(^\d{17}(\d|X|x)$)/.test(data.contactIdNumber)) {
      alert(_l('请输入有效的身份证号码'), 3);
      return;
    }

    if (!data.contactMobile) {
      alert(_l('请输入联系人手机号'), 3);
      return;
    }
    if (!/^1[2-9]\d{9}$/.test(data.contactMobile)) {
      alert(_l('请输入有效的手机号'), 3);
      return;
    }

    return true;
  };

  const onSubmit = () => {
    if (onValidate()) {
      setSubmitLoading(true);
      certificationApi
        .setCertContact({ projectId, contactIdType: 1, ...data })
        .then(res => {
          if (res === 1) {
            alert(_l('设置成功'));
            onUpdateSuccess();
            onClose();
          } else {
            alert(RESULT_TYPES[res] + _l(',错误码:%0', res), 2);
          }
          setSubmitLoading(false);
        })
        .catch(() => setSubmitLoading(false));
    }
  };

  return (
    <Dialog
      visible={true}
      width={640}
      title={_l('修改联系人信息')}
      okText={submitLoading ? _l('提交中...') : _l('提交')}
      okDisabled={submitLoading}
      onOk={onSubmit}
      onCancel={onClose}
    >
      <FormItemWrap>
        <div className="labelText">{_l('联系人姓名')}</div>
        <Input
          placeholder={_l('请输入')}
          value={data.contactName || ''}
          onChange={contactName => setData({ contactName })}
        />
      </FormItemWrap>
      <FormItemWrap>
        <div className="labelText">{_l('联系人身份证号')}</div>
        <Input
          placeholder={_l('请输入')}
          value={data.contactIdNumber || ''}
          onChange={contactIdNumber => setData({ contactIdNumber })}
        />
      </FormItemWrap>
      <FormItemWrap>
        <div className="labelText">{_l('联系人手机号')}</div>
        <Input
          placeholder={_l('请输入')}
          value={data.contactMobile || ''}
          onChange={contactMobile => setData({ contactMobile })}
        />
      </FormItemWrap>
    </Dialog>
  );
}

export default props => FunctionWrap(EditContactInfo, props);
