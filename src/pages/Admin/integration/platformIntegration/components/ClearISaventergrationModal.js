import React, { Fragment, useState } from 'react';
import { Modal, Radio, VerifyPasswordConfirm } from 'ming-ui';
import FunctionWrap from 'ming-ui/components/FunctionWrap';
import workwxAjax from 'src/api/workWeiXin';

export default function ClearISaventergrationModal(props) {
  const { projectId, onCancel = () => {}, onSave = () => {} } = props;
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
            if (res) {
              onSave();
            } else {
              alert(_l('操作失败'), 2);
            }
          });
        },
      });
    } else {
      onSave();
    }
  };
  return (
    <Modal visible onCancel={onCancel} title={_l('您是否确认进行保存？')} okText={_l('下一步')} onOk={onOk}>
      <Fragment>
        <Radio
          className="Font13"
          checked={saveType === 'delete'}
          text={_l('删除原有的集成映射关系')}
          onClick={() => setSaveType('delete')}
        />
        <div className="Gray_75 Font12 mTop10 mLeft30 mBottom10">
          {_l('变更集成方式后原有的集成映射关系建议删除，保留后会对新的映射关系产生影响')}
        </div>
        <Radio
          className="Font13"
          checked={saveType === 'save'}
          text={_l('保留原有的集成映射关系')}
          onClick={() => setSaveType('save')}
        />
        <div className="Gray_75 Font12 mTop10 mLeft30">
          {_l('企微/钉钉/飞书等平台私有部署的用户（支持ID自定义）建议选择保留，映射关系不需要删除，后续修改 ID 即可')}
        </div>
      </Fragment>
    </Modal>
  );
}

export const checkClearIntegrationDialog = props => FunctionWrap(ClearISaventergrationModal, { ...props });
