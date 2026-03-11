import React, { useMemo, useState } from 'react';
import { trim } from 'lodash';
import styled from 'styled-components';
import { Tooltip } from 'ming-ui/antd-components';
import worksheetAjax from 'src/api/worksheet';
import CreateAIActionDialog from 'src/pages/FormSet/containers/AIAction/CreateAIActionDialog';

const Con = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 20px;
  .triggerButton {
    max-width: 100%;
    height: 36px;
    border-radius: 36px;
    padding: 0 12px;
    display: inline-flex;
    align-items: center;
    color: var(--color-text-primary);
    font-weight: bold;
    cursor: pointer;
    border: 2px solid var(--color-border-primary);
    background-color: var(--color-background-primary);
    .icon {
      font-size: 16px;
      color: var(--color-text-secondary);
      margin-left: 10px;
    }
    &:hover {
      background-color: var(--color-background-hover);
      border-color: var(--color-border-secondary);
    }
  }
  .addActionButton {
    height: 36px;
    border-radius: 36px;
    padding: 0 12px;
    display: inline-flex;
    align-items: center;
    color: var(--color-text-secondary);
    cursor: pointer;
    border: 2px dashed var(--color-border-primary);
    background-color: transparent;
    &:hover {
      background-color: var(--color-background-hover);
      border-color: var(--color-border-secondary);
    }
  }
`;

export default function TriggerButtons({
  isCharge,
  worksheetInfo,
  buttons = [],
  onChat = () => {},
  onReloadButtons = () => {},
}) {
  const [createAIActionDialogVisible, setCreateAIActionDialogVisible] = useState(false);
  const handleSave = params => {
    if (!trim(params.name)) {
      return;
    }
    worksheetAjax
      .saveWorksheetBtn({
        btnType: 1,
        appId: worksheetInfo.appId,
        worksheetId: worksheetInfo.worksheetId,
        workflowType: 1,
        isAllView: 1,
        ...params,
      })
      .then(() => {
        onReloadButtons();
      });
  };

  // 根据 actionsort 对 buttons 进行排序
  const sortedButtons = useMemo(() => {
    const actionsort = worksheetInfo?.advancedSetting?.actionsort;
    if (!actionsort) {
      return buttons;
    }

    try {
      const sortOrder = JSON.parse(actionsort);
      if (!Array.isArray(sortOrder) || sortOrder.length === 0) {
        return buttons;
      }

      // 创建一个 Map 来存储排序顺序
      const sortMap = new Map();
      sortOrder.forEach((id, index) => {
        sortMap.set(id, index);
      });

      // 按照 sortOrder 排序，不在排序数组中的按钮放在最后
      return [...buttons].sort((a, b) => {
        const indexA = sortMap.has(a.btnId) ? sortMap.get(a.btnId) : Infinity;
        const indexB = sortMap.has(b.btnId) ? sortMap.get(b.btnId) : Infinity;
        return indexA - indexB;
      });
    } catch (e) {
      console.error('解析 actionsort 失败:', e);
      return buttons;
    }
  }, [buttons, worksheetInfo?.advancedSetting?.actionsort]);

  return (
    <Con>
      {sortedButtons.map((item, index) => (
        <div className="mTop10">
          <Tooltip title={item.desc || item.name}>
            <div className="triggerButton" key={index} onClick={() => onChat(item)}>
              <div className="ellipsis">{item.name}</div>
              <i className="icon icon-arrow_forward"></i>
            </div>
          </Tooltip>
        </div>
      ))}
      {isCharge && (
        <div className="mTop10">
          <div
            className="addActionButton"
            onClick={() => {
              if (window.isPublicApp) {
                alert(_l('预览模式下，不能操作'), 3);
                return;
              }
              setCreateAIActionDialogVisible(true);
            }}
          >
            {_l('+ AI 动作')}
          </div>
        </div>
      )}
      {createAIActionDialogVisible && (
        <CreateAIActionDialog
          appId={worksheetInfo.appId}
          worksheetId={worksheetInfo.worksheetId}
          onCancel={() => setCreateAIActionDialogVisible(false)}
          onSuccess={data => {
            handleSave({ ...data, desc: data.description, advancedSetting: { prompt: data.prompt || '' } }, true);
          }}
        />
      )}
    </Con>
  );
}
