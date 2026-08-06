import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import agentApi from 'src/api/agent';
import LoadingDots from 'src/pages/widgetConfig/widgetSetting/components/DevelopWithAI/ChatBot/LoadingDots';
import { genBotSessionId } from 'src/utils/agentSession';

const Con = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  .recommendTitle {
    margin-top: 8px;
    font-size: 13px;
    color: var(--color-text-secondary);
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
    color: var(--color-text-secondary);
    cursor: pointer;
    &:after {
      content: ' ';
      position: absolute;
      bottom: -1px;
      left: 1px;
      right: 1px;
      border-bottom: 1px dashed var(--color-text-secondary);
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
    color: var(--color-text-primary);
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

export default function CreateWorksheetRecommend({ appName, appDescription, worksheets = [], onSelect = () => {} }) {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendWorkSheets, setRecommendWorkSheets] = useState([]);
  const existingWorksheets = useMemo(
    () =>
      JSON.stringify(
        worksheets.map(item => ({
          name: item.workSheetName,
          description: item.remark,
        })),
      ),
    [worksheets],
  );

  useEffect(() => {
    const abortController = new AbortController();
    let isActive = true;

    setIsLoading(true);

    agentApi
      .agentExecute(
        {
          agentName: 'app-worksheet-suggester',
          sessionId: genBotSessionId(),
          message: _l('开始'),
          context: {
            appName,
            appDescription,
            userLanguage: window.getCurrentLang() || 'zh-Hans',
            existingWorksheets,
          },
        },
        {
          abortController,
        },
      )
      .then(res => {
        if (!isActive) return;

        setRecommendWorkSheets(res?.data?.suggestWorksheet || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!isActive) return;

        setIsLoading(false);
      });

    return () => {
      isActive = false;
      abortController.abort();
    };
  }, [appName, appDescription, existingWorksheets]);

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
