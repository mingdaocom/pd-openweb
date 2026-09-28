import React from 'react';
import { node } from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';

const getSandboxSteps = () => [
  { icon: 'worksheet_public', title: _l('开启沙盒') },
  { icon: 'worksheet_API', title: _l('沙盒开发') },
  { icon: 'approval', title: _l('提交审核') },
  { icon: 'airplane', title: _l('更新生产') },
];

const getSandboxRules = () => [
  {
    title: _l('应用结构与数据'),
    lines: [
      _l('隔离结构，锁定生产应用结构，仅能在沙盒中编辑测试'),
      _l('隔离数据，可选择同步生产数据至沙盒用于测试'),
      _l('沙盒搭建-发布审核-更新至生产，支持版本回滚'),
    ],
  },
  {
    title: _l('组织级数据'),
    lines: [_l('共用组织级数据，包含组织后台、API 集成、插件配置')],
  },
  {
    title: _l('运行与观测'),
    lines: [_l('隔离不同环境中运行产生通知、计费、日志等数据')],
  },
];

const GuideWrap = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  width: 100%;
  height: 100%;
  min-height: 0;

  &::before,
  &::after {
    content: '';
  }

  &::before {
    flex: 1;
  }

  &::after {
    flex: 2;
  }
`;

const Guide = styled.div`
  display: flex;
  flex-shrink: 0;
  padding: 0 40px;
  width: 100%;
`;

const Intro = styled.section`
  min-width: 0;
`;

const Content = styled.div`
  flex: 1;
  margin-right: 120px;

  @media (max-width: 1440px) {
    margin-right: 80px;
  }
`;

const Title = styled.h1`
  margin: 0;
  color: var(--color-text-primary);
  font-size: 30px;
  font-weight: 600;
  line-height: 42px;
`;

const Description = styled.p`
  width: 100%;
  margin: 14px 0 0;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 24px;
`;

const Flow = styled.ol`
  display: grid;
  grid-template-columns: repeat(3, minmax(44px, 1fr)) 44px;
  margin: 56px 0 0;
  padding: 0;
  list-style: none;
`;

const Step = styled.li`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  &:not(:last-child)::after {
    position: absolute;
    top: 22px;
    left: 44px;
    width: calc(100% - 44px);
    height: 1px;
    background-color: var(--color-border-primary);
    content: '';
  }
`;

const StepIcon = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--color-border-secondary);
  border-radius: 12px;
  background-color: var(--color-background-primary);
  color: var(--color-primary);

  .Icon {
    font-size: 22px;
  }
`;

const StepTitle = styled.div`
  position: relative;
  left: 22px;
  margin-top: 10px;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  transform: translateX(-50%);
  white-space: nowrap;
`;

const Action = styled.div`
  margin-top: 42px;

  .sandbox-guide-action {
    width: 188px;
    height: 48px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
  }
`;

const ActionTip = styled.div`
  width: 188px;
  margin-top: 8px;
  color: var(--color-error);
  font-size: 13px;
  line-height: 20px;
  text-align: left;
`;

const Rules = styled.section`
  min-height: 370px;
  margin-top: -18px;
  padding: 30px 28px;
  border: 1px solid var(--color-border-secondary);
  border-radius: 40px;
  background-color: var(--color-background-primary);
  box-shadow: var(--shadow-md);
`;

const RulesHeader = styled.div`
  display: flex;
  align-items: center;
`;

const RulesIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: 1px solid var(--color-border-secondary);
  border-radius: 12px;
  color: var(--color-primary);

  .Icon {
    font-size: 20px;
  }
`;

const RulesTitle = styled.h2`
  margin: 0 0 0 14px;
  color: var(--color-text-primary);
  font-size: 17px;
  font-weight: 600;
  line-height: 28px;
`;

const RuleList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin: 26px 0 0;
  padding: 0;
  list-style: none;
`;

const RuleItem = styled.li`
  position: relative;
  padding-left: 16px;

  &::before {
    position: absolute;
    top: 7px;
    left: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--color-primary);
    content: '';
  }
`;

const RuleTitle = styled.div`
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 600;
  line-height: 24px;
`;

const RuleDescription = styled.div`
  margin: 4px 0 0;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 20px;
`;

export default function SandboxGuide({ actionSlot, actionTip }) {
  const sandboxSteps = getSandboxSteps();
  const sandboxRules = getSandboxRules();

  return (
    <GuideWrap>
      <Guide>
        <Content>
          <Intro>
            <Title>{_l('应用沙盒')}</Title>
            <Description>
              {_l(
                '应用沙盒是一个与正式环境完全隔离的“实验场”。在这里，您可以自由修改测试应用结构，且不会影响到正式环境运行的业务。',
              )}
            </Description>
          </Intro>

          <Flow>
            {sandboxSteps.map(item => (
              <Step key={item.title}>
                <StepIcon>
                  <Icon icon={item.icon} />
                </StepIcon>
                <StepTitle>{item.title}</StepTitle>
              </Step>
            ))}
          </Flow>

          {actionSlot && (
            <Action>
              {actionSlot}
              {actionTip && <ActionTip>{actionTip}</ActionTip>}
            </Action>
          )}
        </Content>

        <Rules>
          <RulesHeader>
            <RulesIcon>
              <Icon icon="worksheet_API" />
            </RulesIcon>
            <RulesTitle>{_l('运行规则')}</RulesTitle>
          </RulesHeader>
          <RuleList>
            {sandboxRules.map(item => (
              <RuleItem key={item.title}>
                <RuleTitle>{item.title}</RuleTitle>
                <RuleDescription>
                  {item.lines.map(line => (
                    <div key={line}>- {line}</div>
                  ))}
                </RuleDescription>
              </RuleItem>
            ))}
          </RuleList>
        </Rules>
      </Guide>
    </GuideWrap>
  );
}

SandboxGuide.propTypes = {
  actionSlot: node,
  actionTip: node,
};
