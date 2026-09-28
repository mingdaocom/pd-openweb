import React, { useState } from 'react';
import { VerifyPasswordConfirm } from 'ming-ui';
import { Modal, Radio } from 'ming-ui/antd-components';
import FunctionWrap from 'ming-ui/components/FunctionWrap';
import workwxAjax from 'src/api/workWeiXin';

const HIDDEN_CANCEL_BUTTON_PROPS = { style: { display: 'none' } };

export default function ClearISaventergrationModal(props) {
  const { projectId, onCancel = () => {}, onSave = () => {}, integrationType, onClose = () => {} } = props;
  const [saveType, setSaveType] = useState('delete');

  const onOk = () => {
    onCancel();
    if (saveType === 'delete') {
      VerifyPasswordConfirm.confirm({
        allowNoVerify: false,
        isRequired: false,
        closeImageValidation: false,
        onOk: () => {
          workwxAjax.removeProjectAllIntergration({ projectId }).then(res => {
            res ? onSave() : alert(_l('操作失败'), 2);
          });
        },
      });
    } else {
      onSave();
    }
  };

  return (
    <Modal
      open
      width={520}
      onCancel={() => {
        onClose();
        onCancel();
      }}
      title={
        integrationType === 7 ? (
          <span className="textError">{_l('解除现有账号绑定关系')}</span>
        ) : (
          _l('您是否确认进行保存？')
        )
      }
      okText={integrationType === 7 ? _l('确认解除') : _l('下一步')}
      onOk={onOk}
      cancelButtonProps={integrationType === 7 ? HIDDEN_CANCEL_BUTTON_PROPS : undefined}
    >
      {integrationType === 7 ? (
        <div className="textSecondary">
          {_l('检测到当前组织已绑定其他第三方账号，要连接 Microsoft Entra，请先解除当前的账号绑定关系。')}
        </div>
      ) : (
        <div className="mTop8">
          <Radio
            className="Font13"
            checked={saveType === 'delete'}
            onChange={() => setSaveType('delete')}
            title={_l('删除原有的集成映射关系')}
          >
            {_l('删除原有的集成映射关系')}
          </Radio>
          <div className="textSecondary Font12 mTop10 mLeft30 mBottom10">
            {_l('变更集成方式后原有的集成映射关系建议删除，保留后会对新的映射关系产生影响')}
          </div>
          <Radio
            className="Font13"
            checked={saveType === 'save'}
            onChange={() => setSaveType('save')}
            title={_l('保留原有的集成映射关系')}
          >
            {_l('保留原有的集成映射关系')}
          </Radio>
          <div className="textSecondary Font12 mTop10 mLeft30">
            {_l(
              '企微/钉钉/飞书/Lark等平台私有部署的用户（支持ID自定义）建议选择保留，映射关系不需要删除，后续修改 ID 即可',
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

export const checkClearIntegrationDialog = props => FunctionWrap(ClearISaventergrationModal, { ...props });
