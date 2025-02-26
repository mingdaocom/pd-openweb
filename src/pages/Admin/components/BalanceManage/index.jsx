import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, Switch } from 'ming-ui';
import ProjectAjax from 'src/api/projectSetting';

const ContentWrap = styled.div`
  .item {
    padding: 16px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #eaeaea;
    .leftCon {
      flex: 1;
      width: calc(100% - 48px);
    }
    .rightCon {
      width: 48px;
    }
  }
`;

const configs = [
  {
    key: 'autoPurchaseWorkflowExtPack',
    title: _l('工作流执行数自动增补'),
    desc: _l('当月工作流执行数剩余2%时自动购买当月额度包，费用10元/1,000次'),
    hasSwitch: true,
    ajaxFuncName: 'setAutoPurchaseWorkflowExtPack',
  },
  {
    key: 'autoPurchaseDataPipelineExtPack',
    title: _l('同步任务算力自动增补'),
    desc: _l('当月同步任务算力剩余2%时自动购买当月额度包，费用10元/10,000行'),
    hasSwitch: true,
    ajaxFuncName: 'setAutoPurchaseDataPipelineExtPack',
  },
  {
    key: 'autoPurchaseApkStorageExtPack',
    title: _l('附件上传流量自动增补'),
    desc: _l('当年附件上传流量剩余2%时自动购买当年额度包，费用20元/1GB'),
    hasSwitch: true,
    ajaxFuncName: 'setAutoPurchaseApkStorageExtPack',
  },
  {
    key: 'sms',
    title: _l('发送短信'),
    desc: _l('用于工作流短信节点或外部门户短信邀请，费用0.1元/条'),
    hasSwitch: false,
  },
  {
    key: 'email',
    title: _l('发送邮件'),
    desc: _l('用于工作流短信节点或外部门户发送邮件，费用0.03元/封'),
    hasSwitch: false,
  },
  {
    key: 'ocr',
    title: _l('OCR识别'),
    desc: _l('用于工作表文本识别字段，费用0.1元/次'),
    hasSwitch: false,
  },
  {
    key: 'PDF',
    title: _l('生成PDF文件'),
    desc: _l('用于工作流获取打印文件节点，费用0.15元/次'),
    hasSwitch: false,
  },
  {
    key: 'AIGC',
    title: _l('AIGC'),
    desc: _l('用于工作流AIGC节点，按每次实际消耗的 token 数量扣费'),
    hasSwitch: false,
  },
  {
    key: 'API',
    title: _l('集成中心API服务'),
    desc: _l('用于集成中心的付费API服务，按每次使用的API服务的定价扣费'),
    hasSwitch: false,
  },
];

export default function BalanceManage(props) {
  const { visible, projectId, value = {}, onClose = () => {}, onChange = () => {} } = props;

  const handleSwitch = item => {
    const { ajaxFuncName, key } = item;

    if (!ajaxFuncName) return;

    const keyValue = !value[key];
    ProjectAjax[ajaxFuncName]({ projectId, [key]: keyValue }).then(res => {
      if (res) {
        onChange({ [key]: keyValue });
        res[key] && res.balance < 100 && alert(_l('当前账户余额不足100元，该功能可能无法正常运行'), 3);
      } else {
        alert(_l('操作失败'), 2);
      }
    });
  };

  return (
    <Dialog width={640} visible={visible} footer={null} title={_l('余额使用管理')} handleClose={onClose}>
      <ContentWrap className="">
        {configs.map(item => (
          <div className="item" key={`balanceManage-item-${item.key}`}>
            <div className="leftCon">
              <div className="Font15 Bold mBottom8 Black ellipsis">{item.title}</div>
              <div className="Font13 Gray_75 ellipsis">{item.desc}</div>
            </div>
            {item.hasSwitch && (
              <div className="rightCon">
                <Switch checked={value[item.key]} onClick={() => handleSwitch(item)} />
              </div>
            )}
          </div>
        ))}
      </ContentWrap>
    </Dialog>
  );
}
