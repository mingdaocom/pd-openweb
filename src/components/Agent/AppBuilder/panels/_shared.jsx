import React, { useContext, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Popover } from 'ming-ui/antd-components';
import { useAgentBus } from '../../agentBus';
import { ChatStateContext } from '../index';

export const PanelWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 1000px;
  margin: 0 auto;
`;

export const Card = styled.div`
  background: var(--color-background-card);
  border: 1px solid var(--color-border-secondary);
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
  box-shadow: var(--shadow-sm);
`;

export const CardLead = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-background-card);
  border: 1px solid var(--color-border-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${p => p.$color || 'var(--color-text-secondary)'};

  .icon {
    font-size: 20px;
    line-height: 1;
  }
`;

export const CardBody = styled.div`
  flex: 1;
  min-width: 0;
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

export const CardTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 20px;
`;

export const CardDesc = styled.div`
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 20px;
  margin-top: 4px;
`;

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 20px;
  background: ${p => p.$bg || 'var(--color-background-tertiary)'};
  color: ${p => p.$color || 'var(--color-text-secondary)'};
`;

export const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

export const Tag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 10px;
  border-radius: 5px;
  background: var(--color-background-tertiary);
  font-size: 12px;
  color: var(--color-text-secondary);
`;

export const TagIcon = styled(Icon)`
  font-size: 14px !important;
  color: var(--color-text-tertiary);
`;

export const SectionDivider = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--color-border-secondary);
`;

export const SectionLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const ChipList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const Chip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 26px;
  padding: 0 10px;
  border-radius: 5px;
  background: var(--color-background-tertiary);
  border: 1px solid var(--color-border-secondary);
  font-size: 12px;
  color: var(--color-text-secondary);
`;

export const ChipIcon = styled(Icon)`
  font-size: 13px !important;
  color: ${p => p.$color || 'var(--color-text-tertiary)'};
`;

export const StepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 0;
`;

export const StepItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 20px;
`;

export const StepNum = styled.span`
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-background-tertiary);
  border: 1px solid var(--color-border-secondary);
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
`;

// 卡片级「修改」入口：点开弹出小弹层，发送的消息直接 submit 到 Agent 主输入框。
// 默认隐藏（opacity:0），hover 卡片时由父卡片的 `&:hover .card-edit-btn` 显示；
// 已写过修改意见（pinned）或弹层打开（active）时常驻显示。
const EditIconButton = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  opacity: 0;
  transition:
    color 0.18s ease,
    opacity 0.18s ease;

  &.active,
  &.pinned {
    opacity: 1;
  }

  &:hover,
  &.active,
  &.pinned {
    color: var(--color-mingo);
  }

  &:disabled {
    cursor: not-allowed;
    color: var(--color-text-tertiary);
    opacity: 0.4;
  }

  .icon {
    font-size: 18px !important;
    line-height: 1;
    color: inherit;
  }
`;

const PopoverWrap = styled.div`
  width: 450px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PopoverTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: var(--color-text-primary);
  line-height: 22px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PopoverTextarea = styled.textarea`
  width: 100%;
  min-height: 110px;
  max-height: 200px;
  padding: 8px 12px;
  border: 1px solid var(--color-border-secondary);
  border-radius: 6px;
  background: var(--color-background-card);
  color: var(--color-text-primary);
  font-size: 14px;
  line-height: 22px;
  resize: none;
  outline: none;

  &::placeholder {
    color: var(--color-text-placeholder);
  }

  &:focus {
    border-color: var(--color-mingo);
  }
`;

const PopoverFooter = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const SendButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 20px;
  border: 0;
  border-radius: 6px;
  background: var(--color-mingo);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.18s ease;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`;

function CardEditPopover({ moduleLabel, cardName, initialText = '', onClose }) {
  // 二次修改时回显上次输入，方便在原文上继续改
  const [value, setValue] = useState(initialText);
  const textareaRef = useRef(null);
  const bus = useAgentBus();

  // 自动聚焦并把光标移到文末（回显内容时避免光标停在最前面）
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    const len = el.value.length;
    el.setSelectionRange(len, len);
  }, []);

  const handleSend = () => {
    const text = value.trim();

    if (!text) return;
    // 不再直接发送：把单条修改交给 ChatPanel 聚合（单条→填入输入框，多条→聚合成「修改搭建计划」）
    bus.emit('builder:add-edit', { module: moduleLabel, card: cardName, text });
    setValue('');
    onClose();
  };

  return (
    <PopoverWrap onClick={e => e.stopPropagation()}>
      <PopoverTitle title={cardName}>{_l('修改【%0】', cardName)}</PopoverTitle>
      <PopoverTextarea
        ref={textareaRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={_l('请告诉我你想如何修改？')}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      <PopoverFooter>
        <SendButton type="button" disabled={!value.trim()} onClick={handleSend}>
          {_l('发送')}
        </SendButton>
      </PopoverFooter>
    </PopoverWrap>
  );
}

export function CardEditButton({ moduleLabel, cardName }) {
  const [open, setOpen] = useState(false);
  const { submitting, pendingEdits = [] } = useContext(ChatStateContext);

  // 本卡片是否已有待提交的修改：命中则 icon 常驻高亮，点开弹层回显上次输入
  const pendingEdit = pendingEdits.find(e => e.module === moduleLabel && e.card === cardName);

  // 默认展示「+」(newchat) 表示「添加修改意见」；本卡片已写过修改内容（pendingEdit）后才换成对话气泡「…」
  const editIcon = pendingEdit ? 'chat-message' : 'newchat';

  // 进入提交中（plan/build 流式输出）时强制关闭已打开的弹层，避免边写边改
  useEffect(() => {
    if (submitting && open) setOpen(false);
  }, [submitting, open]);

  if (submitting) {
    return (
      <EditIconButton type="button" className="card-edit-btn" disabled aria-label={_l('修改')}>
        <Icon icon={editIcon} />
      </EditIconButton>
    );
  }

  return (
    <Popover
      noPadding
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      destroyOnHidden
      content={
        <CardEditPopover
          moduleLabel={moduleLabel}
          cardName={cardName}
          initialText={pendingEdit ? pendingEdit.text : ''}
          onClose={() => setOpen(false)}
        />
      }
    >
      <EditIconButton
        type="button"
        className={cx('card-edit-btn', { active: open, pinned: !!pendingEdit })}
        aria-label={_l('修改')}
        onClick={e => e.stopPropagation()}
      >
        <Icon icon={editIcon} />
      </EditIconButton>
    </Popover>
  );
}
