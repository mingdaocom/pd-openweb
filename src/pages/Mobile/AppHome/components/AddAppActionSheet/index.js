import React from 'react';
import { ActionSheet } from 'antd-mobile';
import styled from 'styled-components';
import { Icon } from 'ming-ui';

const AiCreateOption = styled.div`
  display: flex;
  align-items: center;
  color: var(--color-mingo);
  .aiCreateDesc {
    margin-top: 2px;
    color: var(--color-text-tertiary);
  }
`;

const ActionSheetWrapper = styled.div`
  display: flex;
  align-items: center;
  .subDesc {
    margin-top: 2px;
    color: var(--color-text-tertiary);
  }
`;

export default function showAddAppActionSheet() {
  const buttons = [
    {
      key: 'aiCreate',
      text: (
        <AiCreateOption>
          <Icon className="mRight16 Font24" icon="auto_awesome" />
          <div>
            <div className="Bold">{_l('使用AI创建')}</div>
            <div className="Font13 aiCreateDesc">{_l('告诉Mingo你的想法，自动生成应用方案')}</div>
          </div>
        </AiCreateOption>
      ),
    },
    {
      key: 'application',
      text: (
        <ActionSheetWrapper>
          <Icon className="mRight16 textTertiary Font24" icon="sp_store_mall_directory_white" />
          <div>
            <div className="Bold">{_l('从市场安装')}</div>
            <div className="Font13 subDesc">{_l('安装开箱即用的应用')}</div>
          </div>
        </ActionSheetWrapper>
      ),
    },
  ].filter(
    v =>
      (md.global.SysSettings.hideTemplateLibrary && v.key !== 'application') ||
      !md.global.SysSettings.hideTemplateLibrary,
  );
  let actionSheetHandler;

  actionSheetHandler = ActionSheet.show({
    actions: buttons,
    extra: (
      <div className="flexRow header">
        <span className="Font13">{_l('添加应用')}</span>
        <div className="closeIcon" onClick={() => actionSheetHandler.close()}>
          <Icon icon="close" />
        </div>
      </div>
    ),
    onAction: action => {
      if (action.key === 'aiCreate') {
        window.mobileNavigateTo('/mobile/mingo/create-app');
      }

      if (action.key === 'application') {
        window.mobileNavigateTo(`/mobile/appBox`);
      }

      actionSheetHandler.close();
    },
  });

  return actionSheetHandler;
}
