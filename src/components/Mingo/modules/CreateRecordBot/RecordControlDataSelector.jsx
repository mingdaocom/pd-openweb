import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import { debounce, find, uniq } from 'lodash';
import styled from 'styled-components';
import { Checkbox } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import CellControl from 'worksheet/components/CellControls';
import LoadingDots from 'src/pages/widgetConfig/widgetSetting/components/DevelopWithAI/ChatBot/LoadingDots';
import { emitter } from 'src/utils/common';
import { formatAiGenControlValue } from 'src/utils/control';
import { checkCellIsEmpty } from 'src/utils/control';
import { parseStreamingJsonlData } from 'src/utils/sse';

const Con = styled.div`
  border-radius: 8px;
  border: 1px solid #dddddd;
  padding: 12px 0;
  background-color: #fff;
  .hr {
    height: 1px;
    background-color: #dddddd;
    margin: 10px;
  }
  .widget-item {
    padding: 8px 17px;
    font-size: 13px;
    color: #151515;
    .widget-item-left {
      width: 120px;
      flex-shrink: 0;
      padding-right: 10px;
    }
    .name {
      margin-left: 3px;
      word-break: break-word;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box !important;
      -webkit-line-clamp: 5;
      -webkit-box-orient: vertical;
    }
    .filledByAi.icon {
      font-size: 12px;
      margin-left: 1px;
      margin-top: -7px;
      color: #f9b81a;
    }
    .Checkbox {
      font-size: 0px;
      flex-shrink: 0;
    }
    .Checkbox.checked .Checkbox-box,
    .Checkbox.clearselected .Checkbox-box,
    .Checkbox.clearselected .Checkbox-box:hover {
      border-color: var(--ai-primary-color) !important;
      background-color: var(--ai-primary-color) !important;
    }
    .ming.Checkbox.Checkbox--disabled .Checkbox-box,
    .ming.Checkbox.Checkbox--disabled.clearselected .Checkbox-box {
      opacity: 0.39;
    }
    .icon {
      margin-right: 8px;
    }
    .widget-name {
      font-size: 13px;
      color: #9e9e9e;
      display: none;
    }
    .options {
      margin: 6px 0 0 31px;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 12px;
      .option {
        .circle {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 5px;
        }
        font-size: 12px;
        color: #757575;
      }
    }
    .widget-item-value {
      overflow: hidden;
      .workSheetTextCell > span:first-child {
        word-break: break-word;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box !important;
        -webkit-line-clamp: 8;
        -webkit-box-orient: vertical;
        white-space: break-spaces;
      }
    }
    &.isSmartFill {
      .name {
        font-weight: bold;
      }
    }
  }
  .add-button-con {
    padding: 0 16px;
    gap: 10px;
  }
  .add-widget-btn {
    height: 32px;
    line-height: 30px;
    width: 260px;
    text-align: center;
    background: #fff;
    color: #151515;
    border-radius: 32px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    border: 1px solid #dddddd;
    &:hover {
      background: #f5f5f5;
    }
    &.disabled {
      background: #f5f5f5;
      color: #bdbdbd;
      cursor: not-allowed;
    }
  }
  &:not(.disabled) {
    .widget-item:hover {
      background: #f5f5f5;
      .widget-name {
        display: block;
      }
    }
  }
  &.disabled {
    background: #f5f6f7;
  }
`;

function WidgetList({
  appId,
  worksheetId,
  projectId,
  disabled = false,
  className,
  widgets = [],
  selectedWidgetIds = [],
  setSelectedWidgetIds = () => {},
  onFill = () => {},
  onClear = () => {},
}) {
  const filteredSelectedWidgetIds = useMemo(
    () => selectedWidgetIds.filter(id => widgets.some(item => item.controlId === id)),
    [selectedWidgetIds, widgets],
  );
  return (
    <div className={className}>
      {widgets.map((item, i) => {
        const itemDisabled = disabled || checkCellIsEmpty(item.value);
        const valueComp = (
          <div className="widget-item-value t-flex-1">
            <CellControl
              appId={appId}
              cell={item}
              worksheetId={worksheetId}
              from={4}
              projectId={projectId}
              allowedit={false}
            />
          </div>
        );
        return (
          <div
            className={cx('widget-item t-flex t-flex-col', {
              isSmartFill: item?.isSmartFill,
              disabled: itemDisabled,
            })}
            key={item.controlId || `widget-${i}`}
            onClick={() => {
              if (itemDisabled) return;
              const checked = filteredSelectedWidgetIds.includes(item.controlId);
              if (checked) {
                onClear(item.controlId);
              } else {
                onFill(item.controlId, item.value);
              }
              setSelectedWidgetIds(oldState =>
                oldState.includes(item.controlId)
                  ? oldState.filter(id => id !== item.controlId)
                  : [...oldState, item.controlId],
              );
            }}
          >
            <div className="t-flex t-flex-row t-items-center t-justify-between">
              <div className="widget-item-left t-flex t-flex-row t-items-center">
                <Checkbox checked={filteredSelectedWidgetIds.includes(item.controlId)} disabled={itemDisabled} />
                <div className="name">{item.controlName}</div>
                {item.isSmartFill && <i className="filledByAi icon icon-auto_one_star" />}
              </div>
              {item.fillReason ? (
                <Tooltip title={item.fillReason} placement="top">
                  {valueComp}
                </Tooltip>
              ) : (
                valueComp
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function MingoGeneratedWidgetsSelector({
  isStreaming = false,
  isLastAssistantMessage = false,
  content,
  controls = [],
}) {
  const disabled = !isLastAssistantMessage;
  // 使用 useMemo 缓存解析结果，避免重复解析
  const cache = useRef({});
  const allControls = useMemo(() => {
    if (!content) return [];
    return parseStreamingJsonlData(content, isStreaming);
  }, [content, isStreaming]);
  const allControlsWithValue = useMemo(
    () =>
      allControls
        .map(item => {
          const control = find(controls, { controlId: item.controlId });
          if (!control) return;
          return {
            ...control,
            value: formatAiGenControlValue(control, item.value),
            isSmartFill: item.isSmartFill,
            fillReason: item.Reason,
          };
        })
        .filter(Boolean),
    [content, controls],
  );
  const [selectedWidgetIds, setSelectedWidgetIds] = useState([]);
  useEffect(() => {
    cache.current.isStreaming = isStreaming;
    cache.current.disabled = disabled;
  }, [isStreaming, disabled]);
  const handleResetSelectedWidgetIds = useCallback(() => {
    if (cache.current.isStreaming || cache.current.disabled) return;
    setSelectedWidgetIds([]);
  }, []);
  const emitFillValueByAi = useCallback((controlId, value) => {
    emitter.emit('MINGO_TRIGGER_ACTION', {
      action: 'fillValueByAi',
      params: {
        controlId,
        value,
      },
    });
  }, []);
  const fillAllValueByAi = useCallback(
    debounce(needFillData => {
      needFillData.forEach(item => {
        if (typeof item.value === 'undefined' || item.value === null) return;
        emitFillValueByAi(item.controlId, item.value);
        setSelectedWidgetIds(oldState => uniq([...oldState, item.controlId]));
      });
    }, 100),
    [],
  );
  useEffect(() => {
    if (!cache.current.isDidMount) return;
    fillAllValueByAi(allControlsWithValue);
  }, [allControlsWithValue]);
  useEffect(() => {
    cache.current.isDidMount = true;
    emitter.on('MINGO_NEW_RECORD_CLEAN', handleResetSelectedWidgetIds);
    return () => {
      emitter.off('MINGO_NEW_RECORD_CLEAN', handleResetSelectedWidgetIds);
    };
  }, []);
  if (!allControlsWithValue.length) return null;
  return (
    <Con className={cx({ disabled })}>
      <WidgetList
        className="basic-widgets"
        widgets={allControlsWithValue}
        setSelectedWidgetIds={setSelectedWidgetIds}
        selectedWidgetIds={selectedWidgetIds}
        disabled={disabled}
        onFill={(controlId, value) => {
          emitFillValueByAi(controlId, value);
        }}
        onClear={controlId => {
          emitFillValueByAi(controlId, undefined);
        }}
      />
      {!isStreaming && (
        <div className="add-button-con t-flex t-flex-row t-items-center t-justify-between mTop10">
          <div
            className={cx('add-widget-btn t-flex-1', {
              disabled,
            })}
            onClick={() => {
              if (disabled) return;
              setSelectedWidgetIds(allControlsWithValue.map(item => item.controlId));
              allControlsWithValue.forEach(item => {
                emitFillValueByAi(item.controlId, item.value);
              });
            }}
          >
            {_l('全选')}
          </div>
          <div
            className={cx('add-widget-btn secondary t-flex-1', {
              disabled,
            })}
            onClick={() => {
              if (disabled) return;
              setSelectedWidgetIds([]);
              allControlsWithValue.forEach(item => {
                emitFillValueByAi(item.controlId, undefined);
              });
            }}
          >
            {_l('取消全选')}
          </div>
        </div>
      )}
      {isStreaming && (
        <div className="t-flex t-items-center mTop10 mLeft16">
          <LoadingDots dotNumber={3} />
          {<div className="statusText mLeft5 Gray_75">{_l('生成中')}</div>}
        </div>
      )}
    </Con>
  );
}
