import React from 'react';
import styled from 'styled-components';
import { Icon, LoadDiv, MobileSearch, PopupWrapper, ScrollView, SvgIcon } from 'ming-ui';

const HIDDEN_SCROLLBAR_OPTIONS = { scrollbars: { visibility: 'hidden' } };

const Content = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;

  .mentionAppList {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: calc(10px + env(safe-area-inset-bottom));
  }

  .mentionAppItem {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 48px;
    padding: 0 18px;
  }

  .appIcon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    > div {
      display: flex;
      line-height: 0;
    }
  }

  .appName {
    flex: 1;
    min-width: 0;
    font-size: 15px;
    color: var(--color-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mentionEmpty,
  .mentionLoading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 160px;
    color: var(--color-text-tertiary);
    font-size: 14px;
  }
`;

export default function MobileMentionPopup({ apps, loading, onSearch, onSelect, onClose }) {
  return (
    <PopupWrapper
      visible
      title={_l('选择应用')}
      headerType="withIcon"
      headerTitleAlign="left"
      bodyClassName="heightPopupBody40"
      onClose={onClose}
    >
      <Content>
        <MobileSearch placeholder={_l('搜索应用')} onSearch={onSearch} />
        <ScrollView className="mentionAppList" options={HIDDEN_SCROLLBAR_OPTIONS}>
          {loading ? (
            <div className="mentionLoading">
              <LoadDiv size={24} />
            </div>
          ) : apps.length ? (
            apps.map(app => (
              <div key={app.id} className="mentionAppItem" onClick={() => onSelect(app)}>
                <div className="appIcon" style={{ background: app.iconColor || 'var(--color-mingo)' }}>
                  {app.iconUrl ? (
                    <SvgIcon url={app.iconUrl} fill="#fff" size={22} />
                  ) : (
                    <Icon icon="dashboard" style={{ fontSize: 22, color: '#fff' }} />
                  )}
                </div>
                <div className="appName">{app.name}</div>
              </div>
            ))
          ) : (
            <div className="mentionEmpty">{_l('没有找到应用')}</div>
          )}
        </ScrollView>
      </Content>
    </PopupWrapper>
  );
}
