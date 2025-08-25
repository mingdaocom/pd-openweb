import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import AddCollectApp from './AddCollectApp';
import RecentOrCollectAppList from './RecentOrCollectAppList';

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  .titleBtn {
    display: inline-block;
    font-size: 13px;
    padding: 8px 10px;
    color: #868686;
    border-radius: 4px;
    cursor: pointer;
    &:hover {
      background-color: #f8f8f8;
    }
  }
`;

export default function CollectionApps(props) {
  const { projectId, markedApps, onMarkApp, apps, appLang, onMarkApps, loading, onAppSorted, currentTheme } = props;
  const [isExpand, setIsExpand] = useState(localStorage.getItem(`collectAppExpand_${projectId}`) === 'true');
  const [isOverflow, setIsOverflow] = useState(false);

  useEffect(() => {
    setIsExpand(localStorage.getItem(`collectAppExpand_${projectId}`) === 'true');
  }, [projectId]);

  return (
    <Wrapper>
      <div className="cardTitle alignItemsCenter">
        <div className="titleText">
          {currentTheme.appCollectIcon && <img src={currentTheme.appCollectIcon} />}
          {_l('应用收藏')}
        </div>
        <div
          className="titleBtn mLeft12"
          onClick={() => {
            AddCollectApp({ apps, markedApps, onMarkApps, projectId, appLang });
          }}
        >
          <Icon icon="add" className="mRight4" />
          {_l('添加')}
        </div>
        <div className="flex"></div>
        {isOverflow && (
          <div
            className="titleBtn"
            onClick={() => {
              setIsExpand(!isExpand);
              localStorage.setItem(`collectAppExpand_${projectId}`, !isExpand);
            }}
          >
            {isExpand ? _l('折叠') : _l('显示全部')}
            <Icon icon={isExpand ? 'unfold_less' : 'unfold_more'} className="mLeft4 Font16" />
          </div>
        )}
      </div>
      <RecentOrCollectAppList
        projectId={projectId}
        apps={markedApps}
        appLang={appLang}
        onMarkApp={onMarkApp}
        isFold={!isExpand}
        isCollect={true}
        loading={loading}
        setIsOverflow={setIsOverflow}
        draggable={true}
        onAppSorted={onAppSorted}
      />
    </Wrapper>
  );
}
