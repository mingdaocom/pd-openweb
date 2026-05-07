import React, { memo } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import CreateKnowledgeEntry from '../CreateKnowledgeEntry';

const GuideContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 600px;
  background: var(--color-background-primary);
  .guideIcon {
    margin-bottom: 30px;
    font-size: 80px;
    color: var(--color-primary);
  }
  .title {
    font-size: 22px;
    font-weight: 600;
    color: var(--color-text-primary);
  }
  .description {
    margin-top: 10px;
    margin-bottom: 48px;
    font-size: 14px;
    color: var(--color-text-secondary);
  }
  .stepList {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 40px 10px;
    margin-top: 70px;
    width: 95%;
    .stepItem {
      display: flex;
      align-items: flex-start;
      min-width: 0;
      .icon {
        font-size: 24px;
        color: var(--color-text-tertiary);
      }
      .stepItemContent {
        margin-left: 8px;
        font-size: 13px;
        word-break: break-all;
        .stepTitle {
          color: var(--color-text-primary);
        }
        .stepDes {
          margin-top: 3px;
          color: var(--color-text-secondary);
        }
      }
    }
  }
`;

const GUIDE_STEP_LIST = [
  {
    icon: 'Worksheet_query',
    title: _l('1、选择知识源'),
    description: _l('从本应用中选择工作表'),
  },
  {
    icon: 'parameter',
    title: _l('2、配置字段'),
    description: _l('指定需要检索的字段'),
  },
  {
    icon: 'view_module',
    title: _l('3、内容分块'),
    description: _l('将长文本拆解为知识片段'),
  },
  {
    icon: 'input',
    title: _l('4、向量数据入库'),
    description: _l('对知识片段进行向量化'),
  },
  {
    icon: 'task_alt',
    title: _l('5、使用知识库'),
    description: _l('在工作流AI Agent、对话机器人中使用 “知识库检索” 工具'),
  },
];

const Guide = props => {
  return (
    <GuideContainer>
      <Icon icon="database" className="guideIcon" />
      <div className="title">{_l('向量知识库')}</div>
      <div className="description">{_l('将应用数据转化为 AI 可理解的内容，让您可以通过自然语言进行检索。')}</div>
      <CreateKnowledgeEntry {...props} />
      <div className="stepList">
        {GUIDE_STEP_LIST.map((item, index) => (
          <div key={`step-${index}`} className="stepItem">
            <Icon icon={item.icon} />
            <div className="stepItemContent">
              <div className="stepTitle">{item.title}</div>
              <div className="stepDes">{item.description}</div>
            </div>
          </div>
        ))}
      </div>
    </GuideContainer>
  );
};

export default memo(Guide);
