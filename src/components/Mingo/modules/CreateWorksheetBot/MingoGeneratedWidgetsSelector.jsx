import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import { difference, filter, find, get, isEmpty, isEqual, sortBy, uniq } from 'lodash';
import styled, { keyframes } from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { Checkbox } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import appManagementAjax from 'src/api/appManagement';
import { mapWidgetTypeToControlType } from 'src/components/Mingo/ChatBot/utils';
import { DEFAULT_CONFIG } from 'src/pages/widgetConfig/config/widget';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { getIconByType } from 'src/pages/widgetConfig/util';
import LoadingDots from 'src/pages/widgetConfig/widgetSetting/components/DevelopWithAI/ChatBot/LoadingDots';
import { emitter } from 'src/utils/common';
import { changeCodeOfAIGenControl, convertAiRecommendControlToControlData } from 'src/utils/control';
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
    .name {
      font-size: 13px;
      color: #151515;
    }
    .Checkbox {
      font-size: 0px;
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
    .relate-worksheet-info {
      margin: 6px 0 0 31px;
      font-size: 12px;
      color: #757575;
    }
    .relate-worksheet-new-worksheet {
      margin: 6px 0 0 31px;
      font-size: 12px;
      color: #4caf50;
      cursor: pointer;
    }
    &.widget-list-title {
      padding: 8px 12px;
      .name {
        color: var(--ai-primary-color);
        font-weight: bold;
      }
      .Checkbox .Checkbox-box {
        border-color: var(--ai-primary-color) !important;
      }
    }
  }
  .added-count {
    width: 100%;
    border-radius: 32px;
    font-size: 13px;
    color: #757575;
    line-height: 32px;
    background: #ffffff;
  }
  .add-widget-btn {
    height: 32px;
    line-height: 32px;
    width: 230px;
    text-align: center;
    background: var(--ai-primary-color);
    border-radius: 32px;
    font-size: 14px;
    font-weight: bold;
    color: #fff;
    cursor: pointer;
    &.disabled {
      background: #f5f5f5;
      color: #bdbdbd;
      cursor: not-allowed;
    }
  }
  &:not(.disabled) {
    .widget-item:hover {
      &:not(.add-widget, .widget-list-title) {
        background: #f5f5f5;
      }
    }
  }
  &.disabled {
    background: #f5f6f7;
  }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(50%);
    filter: blur(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
`;

const CreateWorksheetOfRelateRecordCon = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  background: rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
  align-items: end;
  .confirmContent {
    animation: ${slideUp} 0.3s ease-in-out;
    border-radius: 12px 12px 0 0;
    background: #fff;
    padding: 20px 20px 100px;
    .confirmContent-title {
      font-size: 17px;
      font-weight: bold;
      color: #151515;
      margin-bottom: 6px;
    }
    .confirmContent-desc {
      font-size: 14px;
      color: #151515;
    }
    .confirmContent-button-con {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 26px;
    }
    .confirmContent-button {
      height: 34px;
      line-height: 34px;
      width: 100%;
      text-align: center;
      background: var(--ai-primary-color);
      border-radius: 34px;
      font-size: 14px;
      font-weight: bold;
      color: rgb(255, 255, 255);
      cursor: pointer;
      &.secondary {
        background: transparent;
        color: #151515;
        border: 1px solid #bdbdbd;
      }
      &.loading {
        opacity: 0.5;
        cursor: not-allowed;
        .icon {
          margin-right: 5px;
          display: inline-block;
          animation: rotate 0.6s infinite linear;
        }
      }
    }
  }
`;

const Icon = styled.i`
  color: #4caf50;
  font-size: 18px;
  margin-right: 2px !important;
`;

function CreateWorksheetOfRelateRecord({
  className,
  appId,
  projectId,
  sectionId,
  relateControls = [],
  onConfirm = () => {},
  onSkip = () => {},
  onClose = () => {},
}) {
  const [isRequesting, setIsRequesting] = useState(false);
  return (
    <CreateWorksheetOfRelateRecordCon className={className} onClick={onClose}>
      <div className="confirmContent" onClick={e => e.stopPropagation()}>
        <div className="confirmContent-title">{_l('创建关联表')}</div>
        <div
          className="confirmContent-desc"
          dangerouslySetInnerHTML={{
            __html: _l(
              '所选关联字段 <b>%0</b> 暂无已有工作表，将为您创建工作表后再继续添加字段',
              relateControls.map(item => item.controlName).join('、'),
            ),
          }}
        />
        <div className="confirmContent-button-con">
          <div
            className={cx('confirmContent-button', { loading: isRequesting })}
            onClick={() => {
              setIsRequesting(true);
              const needCreateWorksheets = relateControls.map(item => ({
                name: get(item, 'source.createNewWorksheet.worksheetName') || item.controlName,
                description: get(item, 'source.createNewWorksheet.description') || item.hint,
              }));
              Promise.all(
                needCreateWorksheets.map(needCreateWorksheet => {
                  const iconName = 'table';
                  const iconUrl = `https://fp1.mingdaoyun.cn/customIcon/${iconName}.svg`;
                  return appManagementAjax
                    .addWorkSheet({
                      appId,
                      sourceType: 1,
                      name: needCreateWorksheet.name,
                      iconColor: '#6e09f9',
                      projectId,
                      description: needCreateWorksheet.description,
                      appSectionId: sectionId,
                      icon: iconName,
                      iconUrl,
                      type: 0,
                    })
                    .then(data => {
                      if (data.workSheetId) {
                        return {
                          worksheetId: data.workSheetId,
                          worksheetName: needCreateWorksheet.name,
                          worksheetDescription: needCreateWorksheet.description,
                        };
                      }
                      return null;
                    });
                }),
              ).then(data => {
                setIsRequesting(false);
                const result = {};
                data.forEach((item, index) => {
                  result[relateControls[index].controlId] = item;
                });
                onConfirm(result);
              });
            }}
          >
            {isRequesting ? (
              <Fragment>
                <i className="icon icon-loading_button" />
                {_l('创建中...')}
              </Fragment>
            ) : (
              _l('确定')
            )}
          </div>
          <div className="confirmContent-button secondary" onClick={onSkip}>
            {_l('跳过，暂不创建')}
          </div>
        </div>
      </div>
    </CreateWorksheetOfRelateRecordCon>
  );
}

function groupWidgetsByType(widgets, { idCache = {} } = {}) {
  // 确保 widgets 是数组且每个项目都有稳定的 ID
  if (!Array.isArray(widgets)) {
    return { basic: [], tabs: [] };
  }

  const allWidgets = widgets
    .map(item => {
      // 确保每个项目都有稳定的 ID，避免重新渲染时 ID 变化
      if (!item || typeof item !== 'object') return;
      const existingControl = find(window?.globalStoreForMingo?.allWidgets, widget => widget.alias === item.code);
      const stableId = idCache[item.code] || existingControl?.controlId || uuidv4();
      idCache[item.code] = stableId;
      return {
        ...item,
        aiExist: item.isExist,
        row: parseInt((item.rowPosition || '').split('.')[0] || 1),
        col: parseInt((item.rowPosition || '').split('.')[1] || 1),
        id: stableId,
        group: item.type === 'relatedTable' ? 'tab' : 'basic',
        isExist: !!existingControl,
      };
    })
    .filter(Boolean);
  allWidgets.forEach(widget => {
    widget.size = Math.floor(12 / filter(allWidgets, { row: widget.row }).length);
    delete widget.rowPosition;
  });

  return allWidgets;
}

function WidgetList({
  disabled = false,
  className,
  name,
  widgets = [],
  existingControls = [],
  selectedWidgetIds = [],
  setSelectedWidgetIds = () => {},
}) {
  const filteredSelectedWidgetIds = useMemo(
    () => selectedWidgetIds.filter(id => widgets.some(item => item.id === id)),
    [selectedWidgetIds, widgets],
  );
  const isAllSelected = isEqual(sortBy(filteredSelectedWidgetIds), sortBy(widgets.map(item => item.id)));
  const hasSelected = !!filteredSelectedWidgetIds.length && !isAllSelected;
  return (
    <div className={className}>
      <div className="widget-list-title widget-item t-flex t-flex-row t-items-center t-justify-between">
        <div className="widget-item-left t-flex t-flex-row t-items-center">
          <Checkbox
            disabled={disabled}
            checked={isAllSelected}
            clearselected={hasSelected}
            onClick={() => {
              if (hasSelected) {
                setSelectedWidgetIds(oldState => oldState.filter(id => !filteredSelectedWidgetIds.includes(id)));
              } else {
                setSelectedWidgetIds(oldState => {
                  return isAllSelected
                    ? oldState.filter(id => !filteredSelectedWidgetIds.includes(id))
                    : uniq([
                        ...oldState,
                        ...widgets.filter(item => !find(existingControls, { alias: item.code })).map(item => item.id),
                      ]);
                });
              }
            }}
          />
          <div className="name">{name}</div>
        </div>
      </div>
      {widgets.map((item, i) => {
        const isExist = !!find(existingControls, { alias: item.code }) || item.aiExist;
        const isRelatedTable = item.type === 'relatedTable' || item.type === 'multiRelated' || item.type === 'related';
        const isDisabled = disabled || isExist;
        return (
          <Tooltip title={item.description}>
            <div
              className="widget-item t-flex t-flex-col"
              key={item.id || `widget-${i}`}
              onClick={() => {
                if (isDisabled) return;
                setSelectedWidgetIds(oldState =>
                  oldState.includes(item.id) ? oldState.filter(id => id !== item.id) : [...oldState, item.id],
                );
              }}
            >
              <div className="t-flex t-flex-row t-items-center t-justify-between">
                <div className="widget-item-left t-flex t-flex-row t-items-center">
                  {!isExist ? (
                    <Checkbox checked={selectedWidgetIds.includes(item.id)} disabled={isDisabled} />
                  ) : (
                    <i className="icon icon-ok Gray_9e Font18 mRight5"></i>
                  )}
                  <i className={`icon icon-${getIconByType(mapWidgetTypeToControlType(item.type))} Font18 Gray_9e`} />
                  <div className="name">{item.name}</div>
                </div>
                <span className="widget-name">{DEFAULT_CONFIG[mapWidgetTypeToControlType(item.type)]?.widgetName}</span>
              </div>
              {item.options && (
                <div className="options">
                  {item.options.map((option, i) => (
                    <div className="option t-flex t-flex-row t-items-center" key={`${item.id}-option-${i}`}>
                      <div className="circle" style={{ backgroundColor: option.color || '#bdbdbd' }} />
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
              {isRelatedTable && item.relatedWorksheet && (
                <div className="relate-worksheet-info">
                  {get(item, 'relatedWorksheet.worksheetName')}
                  {!isEmpty(get(item, 'displayField', [])) &&
                    `(
                ${get(item, 'displayField', [])
                  .map(field => field.fieldName)
                  .join('、')}
                )`}
                </div>
              )}
              {isRelatedTable && !item.relatedWorksheet && (
                <div className="relate-worksheet-new-worksheet">{_l('新建关联表')}</div>
              )}
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
}

export default function MingoGeneratedWidgetsSelector({
  appId,
  worksheetId,
  projectId,
  sectionId,
  deactivated,
  isStreaming = false,
  isLastAssistantMessage = false,
  content,
  setRootComp = () => {},
  onAppendNewCreatedWorksheets = () => {},
  updateUnsavedControlIds = () => {},
}) {
  const [addedCount, setAddedCount] = useState();
  const [allWidgets, setAllWidgets] = useState([]);
  const disabled = !isLastAssistantMessage || !!addedCount || deactivated;
  const checkboxDisabled = disabled || isStreaming;
  const cache = useRef({
    idCache: {},
    widgetIdsMap: {},
  });
  cache.current.isStreaming = isStreaming;
  const [selectedWidgetIds, setSelectedWidgetIds] = useState([]);
  const existingControls = useMemo(() => window?.globalStoreForMingo?.allWidgets || [], [isLastAssistantMessage]);
  const basic = useMemo(() => allWidgets.filter(item => item.group === 'basic'), [allWidgets]);
  const tabs = useMemo(() => allWidgets.filter(item => item.group === 'tab'), [allWidgets]);
  useEffect(() => {
    if (!content) return;
    let data = parseStreamingJsonlData(content, isStreaming);
    const streamEnd = !!content && !isStreaming;
    if (streamEnd) {
      data = changeCodeOfAIGenControl(window?.globalStoreForMingo?.allWidgets || [], data);
    }
    const allWidgets = groupWidgetsByType(data, { idCache: cache.current.idCache });
    allWidgets.forEach(item => {
      if (!item.isExist) {
        cache.current.widgetIdsMap[item.id] = true;
      }
    });
    if (!disabled) {
      setSelectedWidgetIds(
        allWidgets
          .filter(w => !!cache.current.widgetIdsMap[w.id])
          .map(item => item.id)
          .slice(0, isStreaming ? -1 : undefined),
      );
    }
    cache.current.allWidgets = allWidgets;
    setAllWidgets(allWidgets);
  }, [content, isStreaming]);
  const handleTriggerSaveWidgetConfig = useCallback(() => {
    emitter.emit('SAVE_WIDGET_CONFIG');
    emitter.emit('UPDATE_GLOBAL_STORE', 'mingoIsCreatingWorksheetStatus', false);
    updateUnsavedControlIds([]);
  }, []);
  useEffect(() => {
    const prevSelectWidgets = get(cache, 'current.prevSelectWidgets', []);
    const changes = {
      deletedIds: difference(prevSelectWidgets, selectedWidgetIds),
      addedIds: difference(selectedWidgetIds, prevSelectWidgets),
    };
    const layoutOfAllWidgets = (cache.current.allWidgets || []).reduce((acc, item) => {
      acc[item.id] = {
        row: item.row,
        col: item.col,
        size: item.size,
      };
      return acc;
    }, {});
    const needAddWidgets = changes.addedIds
      .map(id => cache.current.allWidgets.find(item => item.id === id))
      .filter(Boolean)
      .map(item =>
        convertAiRecommendControlToControlData(item, {
          allWidgets: cache.current.allWidgets,
        }),
      )
      .filter(c => {
        if (!c.type) return false;
        if (c.type === WIDGETS_TO_API_TYPE_ENUM.SUB_LIST) {
          return !!c.relationControls?.length;
        }
        return true;
      });
    if (!isEmpty(needAddWidgets)) {
      emitter.emit(
        'WIDGET_CONFIG_ADD_WIDGETS',
        needAddWidgets,
        { layoutOfAllWidgets, isStreaming: cache.current.isStreaming },
        () => {
          window.pendingSaveWidgetConfigFunction?.();
          window.pendingSaveWidgetConfigFunction = undefined;
        },
      );
    }
    const needDeleteWidgets = changes.deletedIds
      .map(id => cache.current.allWidgets.find(item => item.id === id))
      .filter(Boolean)
      .map(item => convertAiRecommendControlToControlData(item))
      .filter(c => !!c.type);
    if (!isEmpty(needDeleteWidgets)) {
      emitter.emit('WIDGET_CONFIG_DELETE_WIDGETS', { needDeleteWidgets }, { layoutOfAllWidgets }, () => {
        window.pendingSaveWidgetConfigFunction?.();
        window.pendingSaveWidgetConfigFunction = undefined;
      });
    }
    cache.current.prevSelectWidgets = selectedWidgetIds;
    updateUnsavedControlIds(selectedWidgetIds);
  }, [selectedWidgetIds]);
  return (
    <Con className={cx({ disabled })}>
      <WidgetList
        className="basic-widgets"
        name={_l('基础信息')}
        widgets={basic}
        existingControls={existingControls}
        setSelectedWidgetIds={setSelectedWidgetIds}
        selectedWidgetIds={selectedWidgetIds}
        disabled={checkboxDisabled}
      />
      {!!tabs.length && <div className="hr" />}
      {!!tabs.length && (
        <WidgetList
          className="tabs-widgets"
          name={_l('标签页')}
          widgets={tabs}
          existingControls={existingControls}
          setSelectedWidgetIds={setSelectedWidgetIds}
          selectedWidgetIds={selectedWidgetIds}
          disabled={checkboxDisabled}
        />
      )}
      {!isStreaming && (
        <div className="widget-item add-widget t-flex t-flex-row t-items-center t-justify-between mTop10">
          {disabled && typeof addedCount === 'number' ? (
            <div className="added-count t-flex t-items-center t-justify-center">
              <Icon className="icon icon-ok" />
              {_l('已保存%0个字段', addedCount)}
            </div>
          ) : (
            <Fragment>
              <div
                className={cx('add-widget-btn flex', { disabled: !selectedWidgetIds.length || disabled })}
                onClick={() => {
                  if (!selectedWidgetIds.length || disabled) return;
                  const controlData = selectedWidgetIds
                    .map(id => allWidgets.find(item => item.id === id))
                    .filter(Boolean)
                    .map(item => convertAiRecommendControlToControlData(item, { worksheetId }))
                    .filter(c => !!c.type);
                  const relateControlsNoWorksheet = filter(
                    controlData,
                    control => control.type === WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET && !control.dataSource,
                  );
                  const hasRelatedTableNoWorksheet = !!relateControlsNoWorksheet.length;
                  if (hasRelatedTableNoWorksheet) {
                    setRootComp(
                      <CreateWorksheetOfRelateRecord
                        appId={appId}
                        projectId={projectId}
                        sectionId={sectionId}
                        relateControls={relateControlsNoWorksheet}
                        onConfirm={createdWorksheetsMap => {
                          setRootComp(null);
                          const newControlData = controlData
                            .map(
                              control =>
                                createdWorksheetsMap[control.controlId] && {
                                  ...control,
                                  dataSource: createdWorksheetsMap[control.controlId].worksheetId,
                                  worksheetName: createdWorksheetsMap[control.controlId].worksheetName,
                                  worksheetDescription: createdWorksheetsMap[control.controlId].worksheetDescription,
                                },
                            )
                            .filter(Boolean);
                          emitter.emit(
                            'WIDGET_CONFIG_UPDATE_WIDGETS_ATTRIBUTE',
                            { needUpdateWidgets: newControlData },
                            () => {
                              setAddedCount(controlData.length);
                              handleTriggerSaveWidgetConfig();
                            },
                          );
                          onAppendNewCreatedWorksheets(
                            newControlData.filter(item => !!createdWorksheetsMap[item.controlId]),
                          );
                        }}
                        onSkip={() => {
                          setRootComp(null);
                          const filteredControlData = controlData.filter(
                            control => !find(relateControlsNoWorksheet, { controlId: control.controlId }),
                          );
                          setSelectedWidgetIds(prev => {
                            const newSelectedWidgetIds = prev.filter(id =>
                              filteredControlData.map(item => item.controlId).includes(id),
                            );
                            setAddedCount(selectedWidgetIds.length);
                            window.pendingSaveWidgetConfigFunction = () => {
                              handleTriggerSaveWidgetConfig();
                            };
                            return newSelectedWidgetIds;
                          });
                        }}
                        onClose={() => {
                          setRootComp(null);
                        }}
                      />,
                    );
                    return;
                  }
                  handleTriggerSaveWidgetConfig();
                  setAddedCount(selectedWidgetIds.length);
                }}
              >
                {_l('保存')}
              </div>
            </Fragment>
          )}
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
