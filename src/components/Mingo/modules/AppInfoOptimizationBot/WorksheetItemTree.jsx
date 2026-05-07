import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Checkbox, Icon, SvgIcon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';

const TreeWrap = styled.div`
  flex: 1;
  min-height: 0;
  margin-top: 12px;
  overflow-y: auto;
  .treeRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    height: 40px;
    font-size: 13px;
    color: var(--color-text-title);
    cursor: pointer;
    &:not(.isAppRow):hover {
      background-color: var(--color-background-hover);
    }
    &.isAppRow {
      height: 50px;
      font-weight: 600;
      border-bottom: 1px solid var(--color-border-primary);
      .iconWrap {
        margin-left: 10px;
        svg {
          width: 20px !important;
          height: 20px !important;
        }
      }
    }
    .rowLeft {
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 0;
      .treeNodeMain {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0;
      }
    }
    .arrowIcon,
    .arrowPlaceholder {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 8px;
    }
    .arrowIcon {
      color: var(--color-text-tertiary);
      cursor: pointer;
      &:hover {
        color: var(--color-text-primary);
      }
    }
    .iconWrap {
      width: 30px;
      height: 30px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 8px;
      svg {
        width: 16px;
        height: 16px;
      }
    }
    .rowName {
      flex: 1;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .rowRight {
      margin-left: 12px;
      flex-shrink: 0;
      .autoStarIcon.icon {
        font-size: 16px;
        color: var(--color-text-disabled);
        &:hover {
          color: var(--color-mingo);
        }
      }
    }
  }
`;

export default function WorksheetItemTree({
  appInfo,
  treeData,
  optimizedMap = {},
  isLine = false,
  editName = true,
  editIcon = true,
  disabled = false,
  selectedIds = [],
  onSelectedIdsChange,
}) {
  const [expandedIds, setExpandedIds] = useState(() => {
    const next = new Set();
    treeData.forEach(item => {
      if (item.isGroup) {
        next.add(item.id);
      }
    });
    return next;
  });

  useEffect(() => {
    const next = new Set();
    treeData.forEach(item => {
      if (item.isGroup) {
        next.add(item.id);
      }
    });
    setExpandedIds(next);
  }, [treeData]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const buildIconFileNameByStyle = (iconName, isLineStyle) => {
    if (!iconName) return iconName;
    if (isLineStyle) {
      return iconName.endsWith('_line') ? iconName : `${iconName}_line`;
    }

    return iconName.endsWith('_line') ? iconName.replace(/_line$/, '') : iconName;
  };

  const buildCustomIconUrl = iconName =>
    iconName ? `https://fp1.mingdaoyun.cn/customIcon/${iconName}.svg` : undefined;

  const mergedTreeData = useMemo(
    () =>
      treeData.map(item => {
        const override = optimizedMap[item.id];
        if (!override) return item;
        const merged = { ...item };

        if (editName && override.name) {
          merged.name = override.name;
        }

        if (editIcon && override.icon) {
          merged.icon = override.icon;
        }

        if (override.reason) {
          merged.reason = override.reason;
        }

        return merged;
      }),
    [treeData, optimizedMap, editName, editIcon],
  );

  const handleToggle = id => {
    if (disabled) return;
    const nextSet = new Set(selectedSet);

    if (nextSet.has(id)) {
      nextSet.delete(id);
    } else {
      nextSet.add(id);
    }

    onSelectedIdsChange && onSelectedIdsChange(Array.from(nextSet));
  };

  const visibleTreeData = useMemo(() => {
    const result = [];
    const stack = [];

    for (const item of mergedTreeData) {
      while (stack.length && stack[stack.length - 1].level >= item.level) {
        stack.pop();
      }

      if (stack.some(s => !s.expanded)) {
        continue;
      }

      result.push(item);
      if (item.isGroup) {
        stack.push({
          level: item.level,
          expanded: expandedIds.has(item.id),
        });
      }
    }

    return result;
  }, [mergedTreeData, expandedIds]);

  const handleToggleExpand = id => {
    if (disabled) return;
    setExpandedIds(prev => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const appHasReason = !!optimizedMap.app?.reason;

  return (
    <TreeWrap>
      <div className="treeRow isAppRow" onClick={() => appHasReason && handleToggle('app')}>
        <div className="rowLeft">
          {appHasReason ? (
            <Checkbox checked={selectedSet.has('app')} disabled={disabled} />
          ) : (
            <span className="checkboxPlaceholder" />
          )}
          <div className="treeNodeMain">
            <div className="iconWrap" style={{ backgroundColor: appInfo.iconColor }}>
              <SvgIcon
                url={
                  editIcon && optimizedMap.app?.icon
                    ? buildCustomIconUrl(
                        appHasReason ? buildIconFileNameByStyle(optimizedMap.app.icon, isLine) : optimizedMap.app.icon,
                      )
                    : appInfo.iconUrl
                }
                fill="#fff"
              />
            </div>
            <div className="rowName">{editName && optimizedMap.app?.name ? optimizedMap.app.name : appInfo.name}</div>
          </div>
        </div>
        <div className="rowRight">
          {optimizedMap.app?.reason && (
            <Tooltip title={optimizedMap.app.reason} placement="top">
              <i className="autoStarIcon icon icon-auto_one_star" />
            </Tooltip>
          )}
        </div>
      </div>
      {visibleTreeData.map(item => {
        const hasReason = !!item.reason;
        return (
          <div key={item.id} className="treeRow" onClick={() => hasReason && handleToggle(item.id)}>
            <div className="rowLeft">
              {hasReason ? (
                <Checkbox checked={selectedSet.has(item.id)} disabled={disabled} />
              ) : (
                <span className="checkboxPlaceholder" />
              )}
              <div className="treeNodeMain" style={{ paddingLeft: item.level * 16 }}>
                {item.isGroup ? (
                  <span
                    className="arrowIcon"
                    onClick={e => {
                      e.stopPropagation();
                      handleToggleExpand(item.id);
                    }}
                  >
                    <Icon icon={expandedIds.has(item.id) ? 'arrow-down' : 'arrow-right-tip'} />
                  </span>
                ) : (
                  <span className="arrowPlaceholder" />
                )}
                {!!(item.icon || item.iconUrl) && (
                  <div className="iconWrap">
                    <SvgIcon
                      url={
                        item.icon
                          ? buildCustomIconUrl(hasReason ? buildIconFileNameByStyle(item.icon, isLine) : item.icon)
                          : item.iconUrl
                      }
                      fill="#757575"
                    />
                  </div>
                )}
                <div className="rowName">{item.name}</div>
              </div>
            </div>
            <div className="rowRight">
              {item.reason && (
                <Tooltip title={item.reason} placement="top">
                  <i className="autoStarIcon icon icon-auto_one_star" />
                </Tooltip>
              )}
            </div>
          </div>
        );
      })}
    </TreeWrap>
  );
}
