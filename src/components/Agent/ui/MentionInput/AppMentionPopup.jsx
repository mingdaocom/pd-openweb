import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView, SvgIcon } from 'ming-ui';
import MobileMentionPopup from './MobileMentionPopup';

// @应用 下拉浮层：纯展示组件。
// 数据拉取、键盘导航(activeIndex)都由主输入组件 MentionInput 托管，
// 这里只负责按 rect 定位、渲染应用列表、把 hover / click 事件回抛。
const Popup = styled.div`
  position: fixed;
  z-index: 10001;
  background: var(--color-background-card);
  border: 1px solid var(--color-border-secondary);
  border-radius: 10px;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 2px 4px rgba(0, 0, 0, 0.06);
  padding: 3px;
  overflow: hidden;

  .mentionAppItem {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 38px;
    padding: 0 5px;
    border-radius: 8px;
    cursor: pointer;

    &.active {
      background: var(--color-background-hover);
    }

    /* HAP 标准应用图标：iconColor 填充的圆角方块 + 白色字形 */
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
  }

  .mentionEmpty,
  .mentionLoading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 80px;
    color: var(--color-text-tertiary);
    font-size: 13px;
  }
`;

export default function AppMentionPopup({
  rect,
  apps,
  loading,
  activeIndex,
  isMobile,
  onHover,
  onSelect,
  onClose,
  onSearch,
}) {
  const scrollRef = useRef(null);

  // 键盘上下导航时，把激活项滚动进可视区域（仅在超出视口时做最小滚动）
  useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    const { viewport } = scroll.getScrollInfo() || {};
    if (!viewport) return;
    const activeEl = viewport.querySelector('.mentionAppItem.active');
    if (!activeEl) return;

    const viewportRect = viewport.getBoundingClientRect();
    const elementRect = activeEl.getBoundingClientRect();
    const top = elementRect.top - viewportRect.top + viewport.scrollTop;
    const bottom = top + elementRect.height;

    if (top < viewport.scrollTop) {
      scroll.scrollTo({ top });
    } else if (bottom > viewport.scrollTop + viewport.clientHeight) {
      scroll.scrollTo({ top: bottom - viewport.clientHeight });
    }
  }, [activeIndex]);

  if (isMobile) {
    return (
      <MobileMentionPopup apps={apps} loading={loading} onSearch={onSearch} onSelect={onSelect} onClose={onClose} />
    );
  }

  if (!rect) return null;

  // 输入框常处于面板底部，下方空间不足时把浮层翻到输入框上方，避免被遮挡/截断。
  // 同时按可用空间收缩列表高度，保证浮层完整落在视口内。
  const GAP = 4;
  const spaceBelow = window.innerHeight - rect.bottom - 8;
  const spaceAbove = rect.top - 8;
  const openUp = spaceBelow < 252 && spaceAbove > spaceBelow;
  const listMaxHeight = Math.max(120, Math.min(240, (openUp ? spaceAbove : spaceBelow) - 12));
  const placement = openUp ? { bottom: window.innerHeight - rect.top + GAP } : { top: rect.bottom + GAP };

  // 浮层 portal 到 body，规避祖先 transform/overflow 对 fixed 定位的影响
  return createPortal(
    <Popup
      style={{
        left: rect.left,
        width: 340,
        ...placement,
      }}
      // 用 mousedown + preventDefault 避免点击浮层时 contenteditable 失焦
      onMouseDown={e => e.preventDefault()}
    >
      <ScrollView ref={scrollRef} style={{ maxHeight: listMaxHeight }}>
        {loading ? (
          <div className="mentionLoading">
            <LoadDiv size={24} />
          </div>
        ) : apps.length ? (
          apps.map((app, index) => (
            <div
              key={app.id}
              className={cx('mentionAppItem', { active: index === activeIndex })}
              onMouseEnter={() => onHover(index)}
              onClick={() => onSelect(app)}
            >
              <div className="appIcon" style={{ background: app.iconColor || 'var(--color-mingo)' }}>
                {app.iconUrl ? (
                  <SvgIcon url={app.iconUrl} fill="#fff" size={18} />
                ) : (
                  <Icon icon="dashboard" style={{ fontSize: 16, color: '#fff' }} />
                )}
              </div>
              <div className="appName" title={app.name}>
                {app.name}
              </div>
            </div>
          ))
        ) : (
          <div className="mentionEmpty">{_l('没有找到应用')}</div>
        )}
      </ScrollView>
    </Popup>,
    document.body,
  );
}
