import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Dialog, Icon } from 'ming-ui';
import ScrollView from 'ming-ui/components/ScrollView';
import { AGENT_DIALOG_CLOSE_CLASS, AgentDialogCloseStyle } from '../dialogCloseStyle';

// 单条修改的上下文标签：模块 + 带引号的卡片名，如 工作表“订单明细”
export function modifyEditContext({ module, card } = {}) {
  if (module && card) return _l('%0“%1”', module, card);
  return module || card || '';
}

// 「修改搭建计划」聚合 chip：输入框挂件与会话内嵌共用。撑满、内容居中：📖 修改搭建计划 · N 💬
const Chip = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  padding: 0 10px;
  border-radius: 5px;
  background: var(--color-background-disabled);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background 0.18s ease;
  &:hover {
    background: var(--color-background-hover);
  }
  .bookIcon {
    font-size: 18px;
    color: var(--color-text-secondary);
  }
  .title {
    margin-left: 8px;
    font-size: 14px;
    font-weight: bold;
  }
  .dot {
    width: 3px;
    height: 3px;
    border-radius: 3px;
    margin: 0 8px;
    background-color: var(--color-text-tertiary);
  }
  .count {
    font-size: 13px;
  }
  .msgIcon {
    margin-left: 8px;
    font-size: 18px;
    color: var(--color-text-secondary);
  }
`;

export function ModifyPlanChip({ count, onClick }) {
  return (
    <Chip onClick={onClick}>
      <Icon className="bookIcon" icon="book" />
      <span className="title">{_l('修改搭建计划')}</span>
      <span className="dot"></span>
      <span className="count">{count}</span>
      <Icon className="msgIcon" icon="chat-message" />
    </Chip>
  );
}

const Body = styled.div`
  display: flex;
  flex-direction: column;
  .editList {
    max-height: 360px;
  }
  .editItem {
    position: relative;
    margin-bottom: 10px;
    padding: 10px 12px;
    border: 1px solid var(--color-border-primary);
    border-radius: 5px;
    ${({ $editable }) => $editable && 'padding-right: 44px;'}
    .context {
      font-size: 13px;
      line-height: 19px;
      color: var(--color-text-secondary);
      word-break: break-word;
    }
    .text {
      margin-top: 2px;
      font-size: 14px;
      line-height: 20px;
      color: var(--color-text-primary);
      word-break: break-word;
    }
    .deleteIcon {
      position: absolute;
      top: 12px;
      right: 12px;
      font-size: 18px;
      color: var(--color-text-tertiary);
      cursor: pointer;
      &:hover {
        color: var(--color-error);
      }
    }
  }
  .footer {
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
    padding-top: 12px;
  }
  .submitBtn {
    height: 36px;
    padding: 0 24px;
    border: 0;
    border-radius: 5px;
    background: var(--color-mingo);
    color: var(--color-text-inverse);
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: opacity 0.18s ease;
    &:hover {
      opacity: 0.9;
    }
  }
`;

// 「修改搭建计划」详情弹窗：editable→逐条可删 + 「提交修改」按钮（输入框聚合态）；
// 只读→仅预览条目，无删除、无提交（已发送的会话消息点击预览）。
export function ModifyPlanDialog({
  items = [],
  editable = false,
  onDelete = () => {},
  onSubmit = () => {},
  onClose = () => {},
}) {
  return (
    <Dialog
      visible
      width={640}
      title={_l('修改搭建计划')}
      showFooter={false}
      className={AGENT_DIALOG_CLOSE_CLASS}
      onCancel={onClose}
    >
      <AgentDialogCloseStyle />
      <Body $editable={editable}>
        <ScrollView className="editList">
          {items.map((item, idx) => (
            <div className="editItem" key={item.id || idx}>
              {!!modifyEditContext(item) && <div className="context">{modifyEditContext(item)}</div>}
              <div className="text">{item.text}</div>
              {editable && <Icon className="deleteIcon" icon="trash" onClick={() => onDelete(item.id)} />}
            </div>
          ))}
        </ScrollView>
        {editable && (
          <div className="footer">
            <button type="button" className="submitBtn" onClick={onSubmit}>
              {_l('提交修改')}
            </button>
          </div>
        )}
      </Body>
    </Dialog>
  );
}

const EmbedWrap = styled.div`
  width: 100%;
  margin: 16px 0;
`;

// 会话内嵌：与输入框 chip 同样形态（撑满），点击打开只读预览弹窗，不在列表展开具体内容
export default function ModifyPlan({ data }) {
  const items = (data && Array.isArray(data.items) ? data.items : []).filter(Boolean);
  const [open, setOpen] = useState(false);

  if (!items.length) return null;

  return (
    <EmbedWrap>
      <ModifyPlanChip count={items.length} onClick={() => setOpen(true)} />
      {open && <ModifyPlanDialog items={items} onClose={() => setOpen(false)} />}
    </EmbedWrap>
  );
}

ModifyPlan.propTypes = {
  data: PropTypes.object,
};

ModifyPlanChip.propTypes = {
  count: PropTypes.number,
  onClick: PropTypes.func,
};

ModifyPlanDialog.propTypes = {
  items: PropTypes.array,
  editable: PropTypes.bool,
  onDelete: PropTypes.func,
  onSubmit: PropTypes.func,
  onClose: PropTypes.func,
};
