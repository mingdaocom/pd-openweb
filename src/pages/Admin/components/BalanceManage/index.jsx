import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Dialog, Icon, Switch } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import AIServiceAjax from 'src/api/aIService';
import ProjectAjax from 'src/api/projectSetting';

const ContentWrap = styled.div`
  .item {
    padding: 16px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid var(--color-border-secondary);
    .leftCon {
      flex: 1;
      width: calc(100% - 48px);
    }
    .rightCon {
      width: 48px;
    }
  }
`;

// 基础功能类型映射
const BASIC_FUNCTION_TYPE = {
  SMS: 1,
  EMAIL: 2,
  TEXT_OCR: 3,
  TEXT_EXTRACTION: 4,
  PDF_GEN: 5,
};

// 从 basePricingPolicy 中获取价格
const getPrice = (basePricingPolicy, key) => {
  const typeMap = {
    sms: BASIC_FUNCTION_TYPE.SMS,
    email: BASIC_FUNCTION_TYPE.EMAIL,
    ocr: BASIC_FUNCTION_TYPE.TEXT_OCR,
    PDF: BASIC_FUNCTION_TYPE.PDF_GEN,
  };

  const type = typeMap[key];
  if (!type || !basePricingPolicy?.basicRate) return 0;

  const rateItem = basePricingPolicy.basicRate.find(item => item.type === type);
  return rateItem?.price || 0;
};

const getConfigs = basePricingPolicy => [
  {
    key: 'autoPurchaseWorkflowExtPack',
    title: _l('工作流执行数自动增补'),
    desc: _l('当月工作流执行数剩余2%时自动购买当月额度包，费用10信用点/1,000次'),
    hasSwitch: true,
    ajaxFuncName: 'setAutoPurchaseWorkflowExtPack',
  },
  {
    key: 'autoPurchaseDataPipelineExtPack',
    title: _l('同步任务算力自动增补'),
    desc: _l('当月同步任务算力剩余2%时自动购买当月额度包，费用10信用点/10,000行'),
    hasSwitch: true,
    ajaxFuncName: 'setAutoPurchaseDataPipelineExtPack',
  },
  {
    key: 'autoPurchaseApkStorageExtPack',
    title: _l('附件上传流量自动增补'),
    desc: _l('当年附件上传流量剩余2%时自动购买当年额度包，费用20信用点/1GB'),
    hasSwitch: true,
    ajaxFuncName: 'setAutoPurchaseApkStorageExtPack',
  },
  {
    key: 'autoPurchaseExternalUserExtPack',
    title: _l('外部用户额度自动增补'),
    desc: _l('当外部用户额度剩余不足20人时自动购买100人，费用500信用点/100人'),
    hasSwitch: true,
    ajaxFuncName: 'setAutoPurchaseExternalUserExtPack',
  },
  {
    key: 'allowMingoAgentCharge',
    title: _l('Mingo AI 功能'),
    desc: _l('关闭后，当AI福利点用完后，将不会继续扣除信用点，且无法使用MingoAI付费功能'),
    hasSwitch: true,
    ajaxFuncName: 'setAllowMingoAgentCharge',
  },
  {
    key: 'sms',
    title: _l('发送短信'),
    desc: _l('用于工作流短信节点或外部门户短信邀请，费用%0信用点/条', getPrice(basePricingPolicy, 'sms')),
    hasSwitch: false,
  },
  {
    key: 'email',
    title: _l('发送邮件'),
    desc: _l('用于工作流邮件节点或外部门户发送邮件，费用%0信用点/封', getPrice(basePricingPolicy, 'email')),
    hasSwitch: false,
  },
  {
    key: 'ocr',
    title: _l('OCR识别'),
    desc: _l('用于工作表文本识别字段，费用%0信用点/次', getPrice(basePricingPolicy, 'ocr')),
    hasSwitch: false,
  },
  {
    key: 'PDF',
    title: _l('生成PDF文件'),
    desc: _l('用于工作流获取打印文件节点，费用%0信用点/次', getPrice(basePricingPolicy, 'PDF')),
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

  const [basePricingPolicy, setBasePricingPolicy] = useState({});

  useEffect(() => {
    if (visible && projectId) {
      AIServiceAjax.getBasePricingPolicy({ projectId }).then(res => {
        if (res) {
          setBasePricingPolicy(res?.basePricingPolicy);
        }
      });
    }
  }, [visible, projectId]);

  const handleSwitch = item => {
    const { ajaxFuncName, key } = item;

    if (!ajaxFuncName) return;

    const keyValue = !value[key];
    ProjectAjax[ajaxFuncName]({ projectId, [key]: keyValue }).then(res => {
      if (res) {
        onChange({ [key]: keyValue });
        res[key] && res.balance < 100 && alert(_l('当前账户信用点不足100信用点，该功能可能无法正常运行'), 3);
      } else {
        alert(_l('操作失败'), 2);
      }
    });
  };

  const configs = getConfigs(basePricingPolicy);

  return (
    <Dialog width={640} visible={visible} footer={null} title={_l('信用点余额使用管理')} handleClose={onClose}>
      <ContentWrap className="">
        {configs.map(item => (
          <div className="item" key={`balanceManage-item-${item.key}`}>
            <div className="leftCon">
              <div className="Font15 Bold mBottom8 textPrimary ellipsis">
                {item.title}

                {item.key === 'allowMingoAgentCharge' && (
                  <Tooltip
                    title={
                      <div>
                        <div>{_l('Mingo搭建—AI搭建应用、创建工作表、填充示例数据、优化名称和图标、填写记录')}</div>
                        <div className="mTop12">{_l('Mingo查询—使用Mingo查询应用数据')}</div>
                        <div className="mTop12">{_l('使用帮助问答不扣费')}</div>
                      </div>
                    }
                    placement="bottom"
                  >
                    <Icon icon="help" className="mLeft6 hoverColorPrimary textTertiary" />
                  </Tooltip>
                )}
              </div>
              <div className="Font13 textSecondary mRight5">{item.desc}</div>
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
