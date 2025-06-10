import React from 'react';
import { Dialog } from 'ming-ui';

export default projectId => {
  Dialog.confirm({
    title: _l('自定义签名'),
    description: <span className="Gray_75">{_l('应短信运营商要求，需完成组织身份认证才可自定义短信签名')}</span>,
    okText: _l('去认证'),
    onOk: () => {
      location.href = `/admin/sysinfo/${projectId}`;
    },
  });
};
