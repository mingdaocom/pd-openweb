import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import styled from 'styled-components';
import { Button, Dialog, Icon, Input } from 'ming-ui';
import apiKeyAjax from 'src/pages/Admin/api/cloudApi/apiKey';
import { PERMISSION_AI_MODEL, PERMISSION_OPTIONS } from './constants';

const { Option } = Select;
const MAX_SECRET_NAME_LENGTH = 20;

const CreateDialogContent = styled.div`
  padding-top: 8px;

  .createTip {
    color: var(--color-text-secondary);
    margin-bottom: 22px;
    font-size: 14px;
  }
`;

const CreateFormItem = styled.div`
  margin-bottom: ${props => (props.isLast ? '0' : '22px')};

  .label {
    color: var(--color-text-title);
    font-weight: 600;
    margin-bottom: 10px;
    font-size: 14px;
  }

  .ming.Input {
    height: 38px;
    border: 1px solid var(--color-border-primary);
    border-radius: 4px;
    line-height: 36px;
    padding: 0 12px;
  }

  .ant-select-selector {
    height: 38px !important;
    border: 1px solid var(--color-border-primary) !important;
    border-radius: 4px !important;
    display: flex;
    align-items: center;
    box-shadow: none !important;
    padding: 0 12px !important;
  }

  .ant-select-selection-item {
    line-height: 36px !important;
  }

  .ant-select-arrow {
    right: 12px;
  }
`;

export default function CreateKeyDialog({ visible, projectId, mode = 'create', data = {}, onSuccess, onCancel }) {
  const isEdit = mode === 'edit';
  const inputKey = `${mode}-${visible ? 'open' : 'close'}-${data.id || 'new'}`;
  const { description = '' } = data;
  const permissionValue = (data.permission || [])[0] || PERMISSION_AI_MODEL;
  const [createForm, setCreateForm] = useState({
    description: '',
    permission: PERMISSION_AI_MODEL,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;

    setSubmitting(false);
    setCreateForm({
      description: isEdit ? description : '',
      permission: isEdit ? permissionValue : PERMISSION_AI_MODEL,
    });
  }, [visible, isEdit, description, permissionValue]);

  const handleClose = () => {
    if (submitting) return;
    onCancel();
    setCreateForm({ description: '', permission: PERMISSION_AI_MODEL });
  };

  const handleSubmit = () => {
    if (submitting) return;

    const description = createForm.description.trim();

    if (!description) {
      alert(_l('密钥名称不能为空'), 2);
      return;
    }

    if (description.length > MAX_SECRET_NAME_LENGTH) {
      alert(_l('密钥名称最多20个字符'), 2);
      return;
    }

    setSubmitting(true);

    if (isEdit) {
      apiKeyAjax
        .keysDescriptionUpdate({ apiKeyId: data.id, description })
        .then(() => {
          onSuccess({ description });
          setCreateForm({ description: '', permission: PERMISSION_AI_MODEL });
        })
        .finally(() => setSubmitting(false));
      return;
    }

    apiKeyAjax
      .keysCreate({ projectId, description, permission: [createForm.permission] })
      .then(res => {
        onSuccess({ description, rawKey: res.rawKey || '' });
        setCreateForm({ description: '', permission: PERMISSION_AI_MODEL });
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <Dialog
      width={640}
      className="cloudServiceCreateDialog"
      visible={visible}
      title={isEdit ? _l('编辑密钥') : _l('创建密钥')}
      onCancel={handleClose}
      footer={
        <div className="flexRow alignItemsCenter">
          <div className="flex"></div>
          <Button type="link" disabled={submitting} onClick={handleClose}>
            {_l('取消')}
          </Button>
          <Button type="primary" disabled={submitting} onClick={handleSubmit}>
            {isEdit ? _l('保存') : _l('创建')}
          </Button>
        </div>
      }
    >
      <CreateDialogContent>
        {!isEdit && <div className="createTip">{_l('密钥创建完成后不能修改，请及时保存')}</div>}
        <CreateFormItem>
          <div className="label">{_l('密钥名称')}</div>
          <Input
            key={inputKey}
            className="w100"
            defaultValue={isEdit ? description : ''}
            maxLength={MAX_SECRET_NAME_LENGTH}
            placeholder={_l('请输入')}
            onChange={value =>
              setCreateForm(prev => ({ ...prev, description: value.slice(0, MAX_SECRET_NAME_LENGTH) }))
            }
          />
        </CreateFormItem>
        {/* 授权服务：permission 与后端 int 枚举对齐（1/2/3）；当前仅开放 1-AI模型服务，不传 0、不提供「全部」 */}
        <CreateFormItem isLast>
          <div className="label">{_l('授权服务')}</div>
          <Select
            className="w100 mdAntSelect"
            value={createForm.permission}
            suffixIcon={<Icon icon="arrow-down-border" className="Font14 textTertiary" />}
            onChange={v =>
              setCreateForm(prev => ({
                ...prev,
                permission: v,
              }))
            }
          >
            {PERMISSION_OPTIONS.map(item => (
              <Option key={item.value} value={item.value}>
                {item.label}
              </Option>
            ))}
          </Select>
        </CreateFormItem>
      </CreateDialogContent>
    </Dialog>
  );
}
