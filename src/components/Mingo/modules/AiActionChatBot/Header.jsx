import React, { useRef } from 'react';
import styled from 'styled-components';
import { get } from 'svg.js';
import { BgIconButton, Checkbox, Dialog } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { navigateTo } from 'src/router/navigateTo';
import { MODE } from './enum';

const Con = styled.div`
  ${({ isMobile }) => (isMobile ? 'padding: 10px 16px;' : 'padding: 0 20px;margin-bottom: 10px;')}
  .header {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .title {
      font-size: 17px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-right: 6px;
    }
    .settingIcon {
      width: 28px;
      height: 28px;
      border-radius: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
      line-height: normal;
      color: var(--color-text-secondary);
      font-size: 18px;
      cursor: pointer;
      &:hover {
        background: var(--color-background-hover);
      }
    }
  }
  .recordTitle {
    ${({ isMobile }) => (isMobile ? '' : 'width: 100%;')}
    height: 32px;
    display: inline-flex;
    align-items: center;
    padding: 0 9px;
    background-color: var(--color-border-secondary);
    border-radius: 3px;
    color: var(--color-text-secondary);
    .icon {
      color: var(--color-text-tertiary);
      margin-right: 4px;
    }
  }
`;

export default function Header({
  isCharge,
  isTest,
  mode,
  title,
  worksheetInfo,
  activeButton,
  messages = [],
  isMobile,
  handleClearConversation = () => {},
  onBack = () => {},
  onClose = () => {},
}) {
  const cache = useRef({});
  const renderRecordTitle = () => {
    if (!title) return null;

    return (
      <div className="recordTitle">
        <i className="icon icon-knowledge-log"></i>
        <div className="ellipsis">{title}</div>
      </div>
    );
  };

  if (isMobile) {
    return <Con isMobile>{renderRecordTitle()}</Con>;
  }

  return (
    <Con>
      <div className="header">
        <div className="t-flex t-items-center overflowHidden">
          {mode === MODE.CHAT && !isTest && (
            <i className="icon icon-arrow_back Font18 Hand textSecondary mRight10" onClick={onBack}></i>
          )}
          {mode === MODE.BUTTONS && <div className="title ellipsis">{_l('AI 动作')}</div>}
          {mode === MODE.CHAT && <div className="title ellipsis">{isTest ? _l('测试') : activeButton.name}</div>}
          {mode === MODE.BUTTONS && isCharge && (
            <Tooltip title={_l('设置')}>
              <span className="settingIcon">
                <i
                  className="icon icon-settings"
                  onClick={() => {
                    navigateTo(`/worksheet/formSet/edit/${worksheetInfo.worksheetId}/aiAction`);
                  }}
                />
              </span>
            </Tooltip>
          )}
        </div>
        <BgIconButton.Group gap={10}>
          {(!!messages.length || isTest) && (
            <BgIconButton
              icon={'clean'}
              title={_l('清空')}
              tooltip={_l('清空当前会话')}
              onClick={() => {
                if (
                  isTest ||
                  localStorage.getItem(`aiActionDisableClearConfirm-${get(md, 'global.Account.accountId')}`) === 'true'
                ) {
                  handleClearConversation();
                } else {
                  Dialog.confirm({
                    title: _l('清空当前会话'),
                    description: _l('清空当前会话记录后将开始新对话。清空操作不可恢复。执行日志保留，不受该操作影响。'),
                    children: (
                      <div className="textSecondary Font13">
                        <Checkbox
                          text={_l('不再显示')}
                          size="small"
                          checked={cache.current.aiActionDisableClearConfirm}
                          onClick={() => {
                            cache.current.aiActionDisableClearConfirm = !cache.current.aiActionDisableClearConfirm;
                          }}
                        />
                      </div>
                    ),
                    buttonType: 'danger',
                    okText: _l('清空'),
                    onOk: () => {
                      handleClearConversation();
                      if (cache.current.aiActionDisableClearConfirm) {
                        localStorage.setItem(
                          `aiActionDisableClearConfirm-${get(md, 'global.Account.accountId')}`,
                          'true',
                        );
                      }
                    },
                  });
                }
              }}
            />
          )}
          <BgIconButton
            icon="close"
            title={_l('关闭')}
            onClick={() => {
              onClose();
            }}
          />
        </BgIconButton.Group>
      </div>
      {renderRecordTitle()}
    </Con>
  );
}
