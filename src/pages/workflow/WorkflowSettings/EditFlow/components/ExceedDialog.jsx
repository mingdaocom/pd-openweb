import React from 'react';
import { Modal } from 'ming-ui/antd-components';
import exceedImg from '../../../asset/exceed.png';

export default () => {
  Modal.confirm({
    width: 640,
    title: '',
    content: (
      <div className="flexColumn alignItemsCenter">
        <img src={exceedImg} width={110} className="mTop20" />
        <div className="Font20 bold mTop20">{_l('工作流节点数已达上限')}</div>
        <div className="Font14 mTop15">{_l('单条工作流最多支持添加200个动作节点')}</div>
        <div className="Font14 mTop5 mBottom10">{_l('您可以使用子流程将业务拆分为多个流程进行配置')}</div>
      </div>
    ),
    okText: _l('我知道了'),
    closable: false,
    cancelButtonProps: {
      style: {
        display: 'none',
      },
    },
    styles: { footer: { textAlign: 'center', marginBottom: 25 } },
  });
};
