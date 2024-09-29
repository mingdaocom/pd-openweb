import React, { useState } from 'react';
import styled from 'styled-components';
import RecentOrCollectAppList from './RecentOrCollectAppList';
import cx from 'classnames';

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;

  .tabList {
    display: flex;
    padding: 0 20px;
    .tabItem {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      position: relative;
      cursor: pointer;
      border-radius: 4px;
      font-size: 14px;
      font-weight: bold;
      &::after {
        content: '';
        position: absolute;
        height: 3px;
        left: 8px;
        right: 8px;
        bottom: 0px;
        display: inline-block;
      }
      &.isCur {
        font-weight: bold;
        color: ${({ themeColor }) => themeColor};
        &::after {
          background-color: ${({ themeColor }) => themeColor};
        }
        &:hover {
          background: #fff !important;
        }
      }
      &:hover {
        background: #f5f5f5;
      }
    }
  }
  .overflowAuto {
    overflow: auto;
  }
`;

export default function RecentApps(props) {
  const { projectId, onMarkApp, recentApps, appLang, recentAppItems, dashboardColor, loading, currentTheme } = props;
  const [currentTab, setCurrentTab] = useState('app');

  const tabs = [
    { key: 'app', text: _l('应用') },
    { key: 'item', text: _l('应用项') },
  ];

  return (
    <Wrapper themeColor={dashboardColor.themeColor}>
      <div className="cardTitle">
        <div className="titleText">
          {currentTheme.recentIcon && <img src={currentTheme.recentIcon} />}
          {_l('最近使用')}
        </div>
        <div className="tabList">
          {tabs.map(item => {
            return (
              <div
                key={item.key}
                className={cx('tabItem', { isCur: item.key === currentTab })}
                onClick={() => setCurrentTab(item.key)}
              >
                {item.text}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex overflowAuto">
        <RecentOrCollectAppList
          projectId={projectId}
          apps={currentTab === 'app' ? recentApps : recentAppItems}
          appLang={appLang}
          onMarkApp={onMarkApp}
          loading={loading}
          draggable={false}
        />
      </div>
    </Wrapper>
  );
}
