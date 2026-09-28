import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import cx from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { AILoading, BgIconButton } from 'ming-ui';
import { Button, Checkbox, Popover, Switch } from 'ming-ui/antd-components';
import { updateSheetListAppItem } from 'src/pages/worksheet/redux/actions/sheetList';
import { emitter } from 'src/utils/platform/browser/dom';
import { parseStreamingJsonlData } from 'src/utils/platform/network/sse';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import { buildSheetListUpdates, saveOptimizationResult } from './saveOptimizationResult';
import WorksheetItemTree from './WorksheetItemTree';

const DETAIL_POPOVER_STYLES = {
  root: { width: '100%' },
  container: {
    height: '100%',
    padding: 0,
    background: 'transparent',
    boxShadow: 'none',
  },
  content: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 400,
    padding: '0 20px',
    backgroundColor: 'var(--color-background-primary)',
    display: 'flex',
    flexDirection: 'column',
  },
};

const PopupContent = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  .header {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--color-text-title);
    font-size: 17px;
    font-weight: bold;
  }
  .content {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    .configBar {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      margin: 10px 0;
      .filterTabs {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
        .filterTabItem {
          padding: 0px 13px;
          height: 30px;
          border-radius: 30px;
          cursor: pointer;
          font-size: 13px;
          display: flex;
          align-items: center;
          color: var(--color-text-primary);
          border: 1px solid var(--color-border-primary);
          .selectedIcon {
            color: var(--color-primary);
            font-size: 14px;
            margin-right: 4px;
          }
          &:not(.selected):hover {
            background-color: var(--color-background-secondary);
          }
          &.selected {
            border: 1px solid var(--color-primary);
            background-color: var(--color-primary-transparent);
          }
        }
      }
      .switchCon {
        display: flex;
        align-items: center;
        .switchLabel {
          font-size: 13px;
          color: var(--color-text-secondary);
          margin-right: 4px;
        }
      }
    }
  }
  .footer {
    height: 75px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30px;
    margin: 0 -20px;
    border-top: 1px solid var(--color-border-primary);
  }
  .checkboxPlaceholder {
    width: 16px;
    flex-shrink: 0;
  }
`;

const EntryWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  user-select: none;
`;

const EntryCard = styled.div`
  width: 100%;
  min-width: 0;
  height: 74px;
  border-radius: 8px;
  border: 1px solid var(--color-border-primary);
  position: relative;
  overflow: hidden;

  .inner {
    position: relative;
    z-index: 1;
    height: 100%;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
  }

  .title {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-primary);
  }
  .desc {
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  &.active {
    border-color: var(--color-primary);
  }
  &:hover {
    background-color: var(--color-background-secondary);
  }
`;

export function flattenWorkSheetItems(app) {
  const result = [];
  const processedIds = new Set(); // 用于去重

  const processSection = (section, currentLevel) => {
    // 处理当前分组
    if (section.name && section.name.trim() !== '' && !processedIds.has(section.appSectionId)) {
      result.push({
        id: section.appSectionId,
        name: section.name,
        icon: section.icon,
        iconUrl: section.iconUrl,
        level: currentLevel,
        isGroup: true,
      });
      processedIds.add(section.appSectionId);
    }

    // 按顺序处理 workSheetInfo 中的所有项
    section.workSheetInfo?.forEach(item => {
      if (!processedIds.has(item.workSheetId)) {
        result.push({
          id: item.workSheetId,
          type: item.type,
          name: item.workSheetName,
          remark: item.remark,
          icon: item.icon,
          iconUrl: item.iconUrl,
          level: currentLevel + 1,
          isGroup: item.type === 2, // type为2的是文件夹（分组）
        });
        processedIds.add(item.workSheetId);

        // 如果当前 item 是文件夹（分组），并且有对应的 childSection
        if (item.type === 2) {
          // 找到对应的 childSection
          const childSection = section.childSections?.find(child => child.appSectionId === item.workSheetId);

          // 如果有对应的 childSection，处理它的内容
          if (childSection) {
            // 处理 childSection 下的 workSheetInfo
            childSection.workSheetInfo?.forEach(childItem => {
              if (!processedIds.has(childItem.workSheetId)) {
                result.push({
                  id: childItem.workSheetId,
                  type: childItem.type,
                  name: childItem.workSheetName,
                  remark: childItem.remark,
                  icon: childItem.icon,
                  iconUrl: childItem.iconUrl,
                  level: currentLevel + 2,
                  isGroup: childItem.type === 2,
                });
                processedIds.add(childItem.workSheetId);
              }
            });
          }
        }
      }
    });
  };

  // 遍历所有一级分组，从 level 0 开始
  app.sections.forEach(section => {
    processSection(section, 0);
  });

  return result;
}

function AppInfoOptimizationPopup({ appInfo, optimizedMap, config, isStreaming, editable = true, onClose }) {
  const [isLine, setIsLine] = useState(() => {
    const commonSetting = safeParse(localStorage.getItem('md_common_icon_setting')) || {};
    return !!commonSetting.isLine;
  });
  const { includeAppName, includeAppIcon } = config;
  const [editName, setEditName] = useState(includeAppName);
  const [editIcon, setEditIcon] = useState(includeAppIcon);
  const treeData = useMemo(() => flattenWorkSheetItems(appInfo), [appInfo]);
  const allIds = useMemo(
    () =>
      ['app', ...treeData.map(item => item.id)].filter(id =>
        id === 'app' ? optimizedMap.app?.reason : optimizedMap[id]?.reason,
      ),
    [treeData, optimizedMap],
  );
  const [selectedIds, setSelectedIds] = useState(allIds);
  const [hasSaved, setHasSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const savePendingRef = useRef(false);
  const mountedRef = useRef(true);

  const isAllChecked = selectedIds.length === allIds.length;
  const disabledAll = hasSaved || isStreaming || !editable || isSaving;

  const handleToggleAll = () => {
    if (disabledAll) return;
    setSelectedIds(prev => {
      if (prev.length === allIds.length) {
        return [];
      }

      return allIds;
    });
  };

  const dispatch = useDispatch();

  const handleUse = () => {
    if (disabledAll || savePendingRef.current) return;

    savePendingRef.current = true;
    setIsSaving(true);

    return Promise.resolve()
      .then(() =>
        saveOptimizationResult({
          appInfo,
          optimizedMap,
          selectedIds,
          editName,
          editIcon,
          isLine,
          treeData,
        }),
      )
      .then(res => {
        if (res === null) {
          onClose();
          return;
        }

        if (!res) {
          alert(_l('保存失败'), 2);
          return;
        }

        const updates = buildSheetListUpdates({
          appInfo,
          optimizedMap,
          selectedIds,
          editName,
          editIcon,
          isLine,
          treeData,
        });
        updates.forEach(u => {
          dispatch(
            updateSheetListAppItem(u.id, {
              workSheetName: u.workSheetName,
              icon: u.icon,
              iconUrl: u.iconUrl,
            }),
          );
        });
        emitter.emit('REFRESH_APP_DETAIL');
        alert(_l('保存成功'));
        setHasSaved(true);
        onClose();
      })
      .catch(_requestError => {
        alertIfNotUnauthorized(_requestError, _l('保存失败'), 2);
      })
      .finally(() => {
        savePendingRef.current = false;
        if (mountedRef.current) {
          setIsSaving(false);
        }
      });
  };

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setSelectedIds(allIds);
  }, [allIds]);

  return (
    <PopupContent>
      <div className="header">
        {_l('选择需要的修改')}
        <BgIconButton icon="close" onClick={onClose} />
      </div>
      <div className="content">
        <div className="configBar">
          <div className="filterTabs">
            {includeAppName && (
              <div
                className={cx('filterTabItem', { selected: editName })}
                onClick={() => {
                  if (disabledAll) return;
                  setEditName(prev => (prev && !editIcon ? true : !prev));
                }}
              >
                {editName && <i className="icon icon-ok selectedIcon" />}
                {_l('名称')}
              </div>
            )}
            {includeAppIcon && (
              <div
                className={cx('filterTabItem', { selected: editIcon })}
                onClick={() => {
                  if (disabledAll) return;
                  setEditIcon(prev => (prev && !editName ? true : !prev));
                }}
              >
                {editIcon && <i className="icon icon-ok selectedIcon" />}
                {_l('图标')}
              </div>
            )}
          </div>
          {includeAppIcon && editIcon && allIds.length > 0 && (
            <div className="switchCon">
              <div className="switchLabel">{_l('图标样式')}</div>
              <Switch
                checked={isLine}
                disabled={disabledAll}
                onClick={(checked, event) => {
                  event.stopPropagation();
                  if (disabledAll) return;
                  setIsLine(prev => {
                    const next = !prev;
                    const commonSetting = safeParse(localStorage.getItem('md_common_icon_setting')) || {};
                    safeLocalStorageSetItem(
                      'md_common_icon_setting',
                      JSON.stringify({
                        ...commonSetting,
                        isLine: next,
                      }),
                    );
                    return next;
                  });
                }}
                checkedChildren={isLine ? _l('线框') : _l('填充')}
                unCheckedChildren={isLine ? _l('线框') : _l('填充')}
              />
            </div>
          )}
        </div>
        <WorksheetItemTree
          appInfo={appInfo}
          treeData={treeData}
          optimizedMap={optimizedMap}
          isLine={isLine}
          editName={editName}
          editIcon={editIcon}
          disabled={disabledAll}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
        />
      </div>
      <div className="footer">
        <Checkbox
          checked={isAllChecked}
          disabled={disabledAll}
          onChange={event => handleToggleAll(!event.target.checked, undefined, event)}
        >
          {_l('全选')}
        </Checkbox>
        <Button
          color="var(--color-mingo)"
          variant="solid"
          shape="round"
          disabled={disabledAll}
          loading={isSaving}
          onClick={handleUse}
        >
          {_l('使用')}
        </Button>
      </div>
    </PopupContent>
  );
}

function AppOptimizationComp(props, ref) {
  const { appInfo, config, isStreaming, isLoading, content, editable = true } = props;
  const [detailVisible, setDetailVisible] = useState(true);
  const parsedData = useMemo(() => parseStreamingJsonlData(content, isStreaming), [content, isStreaming]);
  const optimizedMap = useMemo(() => {
    const map = {};

    if (!Array.isArray(parsedData)) {
      return map;
    }

    parsedData.forEach(item => {
      if (!item || !item.id) return;
      const { id, name, icon, reason } = item;
      map[id] = { name, icon, reason };
    });
    return map;
  }, [parsedData]);
  useImperativeHandle(ref, () => ({
    hidePopup: () => setDetailVisible(false),
  }));
  useEffect(() => {
    emitter.addListener('MINGO_APP_INFO_OPTIMIZATION_BOT_UPDATE_DETAIL_POPUP_VISIBLE', setDetailVisible);
    return () => {
      emitter.removeListener('MINGO_APP_INFO_OPTIMIZATION_BOT_UPDATE_DETAIL_POPUP_VISIBLE', setDetailVisible);
    };
  }, []);
  return (
    <Popover
      noPadding
      trigger={[]}
      open={detailVisible}
      onOpenChange={setDetailVisible}
      placement="leftTop"
      align={{ offset: [0, 0] }}
      getPopupContainer={() => document.getElementById('containerWrapper')}
      classNames={{ root: 'sidePanelContainerForMingo' }}
      styles={DETAIL_POPOVER_STYLES}
      motion={{ motionName: '' }}
      destroyOnHidden={false}
      content={
        <AppInfoOptimizationPopup
          appInfo={appInfo}
          config={config}
          optimizedMap={optimizedMap}
          isStreaming={isStreaming}
          editable={editable}
          onClose={() => setDetailVisible(false)}
        />
      }
    >
      <EntryWrap>
        <EntryCard
          className={cx({
            active: detailVisible,
          })}
          onClick={() => {
            setDetailVisible(oldVisible => {
              emitter.emit('MINGO_APP_INFO_OPTIMIZATION_BOT_UPDATE_DETAIL_POPUP_VISIBLE', false);
              return !oldVisible;
            });
          }}
        >
          {isLoading && <AILoading />}
          <div className="inner">
            <div className="title">{isLoading ? _l('优化中...') : _l('已生成优化项预览')}</div>
            <div className="desc">{isLoading ? _l('请等待') : _l('点击查看')}</div>
          </div>
        </EntryCard>
      </EntryWrap>
    </Popover>
  );
}

export default forwardRef(AppOptimizationComp);

AppOptimizationComp.propTypes = {
  appInfo: PropTypes.object.isRequired,
  isStreaming: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool,
  content: PropTypes.string.isRequired,
  editable: PropTypes.bool,
};
