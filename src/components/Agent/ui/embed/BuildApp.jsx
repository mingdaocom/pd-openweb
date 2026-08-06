import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { Icon } from 'ming-ui';
import { colors } from '../tokens';

// build-app-agent a2a 产物（对齐 build-app-agent.yaml outputs.schema）：
//   appId / appName
//   worksheetContext              [{ name, id, alias, fields:[{name,id,alias,type}] }]
//   viewContext                   [{ worksheetName, worksheetId, actions:[{name,id}], views:[{name,id,type}] }]
//   customPageContext             [{ name, pageId }]（V5.x 合并自定义页面 + 工作台；旧产物为 dashboardContext / workspaceContext）
//   chatbotContext                [{ name, id }]（对话机器人 / AI 助手；无 AI 助手时缺省）
//   roleContext                   [{ name, id }]
//   workflowContext               [{ name, id, status }]（系统工作流）
//   customActionWorkflowContext   [{ name, id, status }]（自定义动作触发的工作流）
// 历史会话回放时只有这份结构化 JSON（无实时 SSE 事件），这里复刻 BuildProgress 的完成态视觉：
// 同一套步骤时间线（缩进16px、字号14px、完成对勾、工作表字段平铺不下钻、步骤改名），默认收起为「已完成」胶囊。

// —— 视觉对齐 ui/BuildProgress.jsx（同一套主题变量，[data-theme='dark'] 下自动切换）——
const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 4px 0;
`;

const SectionHeader = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.text};
  line-height: 1.4;
`;

const SchemePill = styled.div`
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 100%;
  height: 34px;
  padding: 0 14px 0 12px;
  border-radius: 14px;
  background: ${colors.backgroundSection};

  i {
    font-size: 18px;
    color: ${colors.textMuted};
    flex-shrink: 0;
  }
`;

const SchemeName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${colors.textMuted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DonePill = styled.div`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 28px;
  padding: 0 8px 0 14px;
  border: 1px solid ${colors.borderStrong};
  border-radius: 14px;
  background: ${colors.background};
  cursor: pointer;
  user-select: none;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${colors.borderHover};
  }
`;

const DoneLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${colors.textMuted};
`;

const DoneChevron = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;
  ${p =>
    p.$expanded &&
    css`
      transform: rotate(90deg);
    `}

  i {
    font-size: 16px;
    color: ${colors.borderHover};
  }
`;

// 步骤时间线容器：整体缩进 16px。不画最外侧竖线（仅 loop 自身从折叠图标引出连接线）
const StepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-left: 16px;
`;

const Muted = styled.span`
  color: ${colors.textSubtle};
  font-size: 13px;
`;

// loop 块：展开有子项时，从折叠图标位置引出一条竖线，贯穿标题行并往下延伸到子项
const LoopBlock = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  ${p =>
    p.$line &&
    css`
      &::before {
        content: '';
        position: absolute;
        left: 8px;
        top: 11px;
        bottom: 12px;
        width: 1px;
        background: ${colors.border};
      }
    `}
`;

const LoopHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: ${colors.text};
  line-height: 22px;
  cursor: ${p => (p.$clickable ? 'pointer' : 'default')};
  user-select: none;
`;

// 子项列表：子项相对父步骤标题再缩进 16px（设计稿）。竖线由 LoopBlock::before 统一绘制。
const LoopList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 42px;
`;

const IterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  line-height: 28px;
  color: ${colors.text};
  user-select: none;
`;

// 折叠箭头：与实时进度同位，作为 loop 标题的前导槽。设计稿 navigate_next 24×24，glyph 取 18px
const Chevron = styled.span`
  display: inline-flex;
  width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  color: ${colors.textSubtle};
  transition: transform 0.15s ease;
  ${p =>
    p.$expanded &&
    css`
      transform: rotate(90deg);
    `}

  i {
    font-size: 18px;
  }
`;

// 前导槽统一占位，保证各行标题左对齐（折叠箭头 / 空 都占同宽）。
// 带底色并置于引导线之上：折叠箭头盖住贯穿的竖线，不让线从图标缝里透出。
const LeadBox = styled.span`
  position: relative;
  z-index: 1;
  width: 18px;
  /* 固定撑满行高：否则 inline-flex 高度跟随内容，盖不住竖线 */
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${colors.background};
`;

function asArray(v) {
  return Array.isArray(v) ? v : [];
}

function lenOf(v) {
  return Array.isArray(v) ? v.length : 0;
}

// 顶层简单步骤行（非 loop，无下钻）：空前导占位 + 标题 + 值（设计稿无完成对勾）
function SimpleRow({ title, value }) {
  return (
    <LoopHeader>
      <LeadBox />
      <span>{title}</span>
      {value ? <Muted>{value}</Muted> : null}
    </LoopHeader>
  );
}

// 单张工作表行：表名 + 字段数（平铺，不再下钻——对齐「工作表去掉下一层级」）
function WorksheetRow({ name, fieldCount }) {
  return (
    <IterRow>
      <span>{name}</span>
      {fieldCount > 0 && <Muted>{_l('字段 %0 个', fieldCount)}</Muted>}
    </IterRow>
  );
}

// 单张表的视图/动作行：表名 + 「视图 N 个，动作 M 个」（两者均为 0 时仅显示表名）
function ViewRow({ name, viewCount, actionCount }) {
  const parts = [];

  if (viewCount > 0) parts.push(_l('视图 %0 个', viewCount));
  if (actionCount > 0) parts.push(_l('动作 %0 个', actionCount));

  return (
    <IterRow>
      <span>{name}</span>
      {parts.length > 0 && <Muted>{parts.join('，')}</Muted>}
    </IterRow>
  );
}

// 可收起的循环块：标题（模块名）前导折叠箭头，可点击收起/展开自身子项列表，默认展开。
function CollapsibleLoop({ title, count, children }) {
  const [open, setOpen] = useState(true);

  return (
    <LoopBlock $line={open}>
      <LoopHeader $clickable onClick={() => setOpen(v => !v)} role="button">
        <LeadBox>
          <Chevron $expanded={open}>
            <Icon icon="arrow-right-border" />
          </Chevron>
        </LeadBox>
        <span>{title}</span>
        {count != null && <Muted>{_l('%0 个', count)}</Muted>}
      </LoopHeader>
      {open && <LoopList>{children}</LoopList>}
    </LoopBlock>
  );
}

// 通用「标题 + 名称列表」循环块（角色 / 自定义页面 / 工作台 / 工作流——只展示名称，无下钻明细）。
function NameLoop({ title, items }) {
  return (
    <CollapsibleLoop title={title} count={items.length}>
      {items.map((item, index) => (
        <IterRow key={(item && (item.pageId || item.id || item.name)) || index}>
          <span>{(item && item.name) || _l('项 %0', index + 1)}</span>
        </IterRow>
      ))}
    </CollapsibleLoop>
  );
}

export default function BuildApp({ data }) {
  // 默认收起（与 BuildProgress 完成态一致）
  const [expanded, setExpanded] = useState(false);

  const appName = (data && data.appName) || '';
  const worksheets = asArray(data && data.worksheetContext);
  const views = asArray(data && data.viewContext);
  // V5.x：自定义页面 + 工作台合并为 customPageContext；旧产物回退到 dashboardContext + workspaceContext。
  const customPages =
    data && data.customPageContext
      ? asArray(data.customPageContext)
      : [...asArray(data && data.dashboardContext), ...asArray(data && data.workspaceContext)];
  const chatbots = asArray(data && data.chatbotContext);
  const roles = asArray(data && data.roleContext);
  const workflows = asArray(data && data.workflowContext);
  const customActionWorkflows = asArray(data && data.customActionWorkflowContext);

  // worksheetName 缺失时按 worksheetId 回查表名。
  const wsNameById = {};

  for (const ws of worksheets) if (ws && ws.id) wsNameById[ws.id] = ws.name;

  // 视图/动作按表归并：viewContext 每项即一张表，携带 worksheetName + views[] + actions[]，
  // 已完成态展开后逐表显示「视图 N 个，动作 M 个」。viewTotal（视图+动作）作折叠态总计。
  let viewTotal = 0;
  const viewItems = views.map((v, index) => {
    const viewCount = lenOf(v && v.views);
    const actionCount = lenOf(v && v.actions);

    viewTotal += viewCount + actionCount;
    return {
      key: (v && v.worksheetId) || index,
      name: (v && v.worksheetName) || wsNameById[v && v.worksheetId] || _l('工作表 %0', index + 1),
      viewCount,
      actionCount,
    };
  });

  const schemeTitle = appName ? _l('%0 搭建方案', appName) : _l('应用搭建方案');

  return (
    <Card>
      <SectionHeader>{_l('搭建应用')}</SectionHeader>

      <SchemePill title={schemeTitle}>
        <Icon icon="book" />
        <SchemeName>{schemeTitle}</SchemeName>
      </SchemePill>

      <DonePill role="button" onClick={() => setExpanded(v => !v)}>
        <DoneLabel>{_l('已完成')}</DoneLabel>
        <DoneChevron $expanded={expanded}>
          <Icon icon="arrow-right-border" />
        </DoneChevron>
      </DonePill>

      {expanded && (
        <StepList>
          {appName && <SimpleRow title={_l('创建应用')} value={appName} />}

          {worksheets.length > 0 && (
            <CollapsibleLoop title={_l('创建工作表')} count={worksheets.length}>
              {worksheets.map((ws, index) => (
                <WorksheetRow
                  key={(ws && (ws.id || ws.name)) || index}
                  name={(ws && ws.name) || _l('工作表 %0', index + 1)}
                  fieldCount={lenOf(ws && ws.fields)}
                />
              ))}
            </CollapsibleLoop>
          )}

          {viewItems.length > 0 && (
            <CollapsibleLoop title={_l('创建视图与自定义动作')} count={viewTotal}>
              {viewItems.map(it => (
                <ViewRow key={it.key} name={it.name} viewCount={it.viewCount} actionCount={it.actionCount} />
              ))}
            </CollapsibleLoop>
          )}

          {roles.length > 0 && <NameLoop title={_l('创建角色')} items={roles} />}

          {customPages.length > 0 && <NameLoop title={_l('创建自定义页面')} items={customPages} />}

          {chatbots.length > 0 && <NameLoop title={_l('创建对话机器人')} items={chatbots} />}

          {workflows.length > 0 && <NameLoop title={_l('创建工作流')} items={workflows} />}

          {customActionWorkflows.length > 0 && (
            <NameLoop title={_l('创建自定义动作工作流')} items={customActionWorkflows} />
          )}
        </StepList>
      )}
    </Card>
  );
}
