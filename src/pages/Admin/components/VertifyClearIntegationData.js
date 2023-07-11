import React from 'react';
import { VerifyPasswordConfirm, Icon } from 'ming-ui';
import workwxAjax from 'src/api/workWeiXin';

export default function VertifyClearIntegationData({ projectId, callback = () => {} }) {
  return VerifyPasswordConfirm.confirm({
    title: (
      <div className="Bold" style={{ color: '#f44336' }}>
        <Icon icon="error" className="mRight10" />
        {_l('您是否确认进行保存？')}
      </div>
    ),
    description: (
      <div>
        <span className="bold Gray">{_l('保存后，您的原始集成映射关系将被清理。')}</span>
        {_l('请确认是否不需要原始集成关系，再执行此操作')}
      </div>
    ),
    allowNoVerify: false,
    inputName: _l('请输入您的登录密码，以验证您的身份信息'),
    onOk: () => {
      workwxAjax.removeProjectAllIntergration({ projectId }).then(res => {
        if (res) {
          callback();
        } else {
          alert(_l('操作失败'), 2);
        }
      });
    },
  });
}
