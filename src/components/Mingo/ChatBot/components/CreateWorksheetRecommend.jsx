import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import mingoAjax from 'src/api/mingo';
import LoadingDots from 'src/pages/widgetConfig/widgetSetting/components/DevelopWithAI/ChatBot/LoadingDots';

const Con = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  .recommendTitle {
    margin-top: 8px;
    font-size: 13px;
    color: #757575;
    line-clamp: 1;
  }
  .recommendList {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .expandButton {
    position: relative;
    font-size: 13px;
    color: #757575;
    cursor: pointer;
    &:after {
      content: ' ';
      position: absolute;
      bottom: -1px;
      left: 1px;
      right: 1px;
      border-bottom: 1px dashed #888;
    }
  }
`;

const RecommendItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  border-radius: 6px;
  border: 1px solid var(--color-border-secondary);
  padding: 10px;
  cursor: pointer;
  .name {
    font-size: 14px;
    color: #151515;
    line-clamp: 1;
  }
  .description {
    font-size: 13px;
    color: var(--color-text-tertiary);
    line-clamp: 2;
  }
  &:hover {
    border-color: var(--color-border-hover);
    background: var(--color-background-hover);
  }
`;

export default function CreateWorksheetRecommend({ appId, onSelect = () => {} }) {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendWorkSheets, setRecommendWorkSheets] = useState([]);

  useEffect(() => {
    setIsLoading(true);
    mingoAjax
      .getRecommendedSheets({
        appId,
      })
      .then(data => {
        setRecommendWorkSheets(data.suggestWorksheet || []);
        setIsLoading(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <Con>
      <span className="recommendTitle">{_l('推荐')}</span>
      {isLoading && <LoadingDots dotNumber={3} />}
      {recommendWorkSheets.map(workSheet => (
        <RecommendItem key={workSheet.id} onClick={() => onSelect(workSheet)}>
          <div className="name ellipsis">{workSheet.name}</div>
          <div className="description ellipsis">{workSheet.description}</div>
        </RecommendItem>
      ))}
    </Con>
  );
}
