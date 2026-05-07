import React, { useState } from 'react';
import { Dialog, FunctionWrap, Radio } from 'ming-ui';
import projectSettingController from 'src/api/projectSetting';

const radioData = [
  { text: _l('允许一小时内免验证 (默认)'), value: 1 },
  { text: _l('每次操作均需验证'), value: 0 },
];

function PwdFreeVerify(props) {
  const { projectId, onCancel = () => {}, enabled, updateEnabled } = props;
  const [type, setType] = useState(enabled ? 1 : 0);

  const onClick = value => {
    projectSettingController.setEnabledNoneVerification({ projectId, enabledNoneVerification: !!value }).then(res => {
      if (res) {
        setType(value);
        updateEnabled(!!value);
      }
    });
    onCancel();
  };

  return (
    <Dialog
      visible
      title={_l('密码免验证策略')}
      description={_l(
        '对审批、自定义动作等敏感操作进行密码验证时，允许用户在一次验证通过后的 1 小时内免于重复验证；管理员可选择禁用该策略，禁用后将不再提供免验证选项，每次操作时均需进行密码验证，适用于安全等级要求高的场景。',
      )}
      footer={null}
      onCancel={onCancel}
    >
      {radioData.map(item => (
        <div key={item.value} className="mBottom12">
          <Radio
            text={item.text}
            value={item.value}
            checked={type === item.value}
            onClick={() => onClick(item.value, item.text)}
          />
        </div>
      ))}
      <div className="mBottom50" />
    </Dialog>
  );
}

export default props => FunctionWrap(PwdFreeVerify, props);
