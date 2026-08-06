import React, { useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { Icon } from 'ming-ui';

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 4px 0;
  /* 搭建异常时停掉所有 loading 动画（••• 三点呼吸），定格为静态 */
  ${p =>
    p.$frozen &&
    css`
      *,
      *::before,
      *::after {
        animation: none !important;
      }
    `}
`;

// 字号按设计稿统一为 14px
const SectionHeader = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.4;
`;

// 方案胶囊：对应设计稿 容器62（高 34、圆角 14、底 #F5F5F5、无描边，book 18px + 方案名）
// $clickable：作为「重新打开搭建预览」入口时，加手型 + hover 反馈，提示可点。
const SchemePill = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  height: 34px;
  padding: 0 14px 0 12px;
  border-radius: 14px;
  background: var(--color-background-tertiary);

  i {
    font-size: 18px;
    color: var(--color-text-secondary);
    flex-shrink: 0;
  }

  ${p =>
    p.$clickable &&
    css`
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: var(--color-background-hover);
      }
    `}
`;

const SchemeName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// 完成态折叠胶囊：对应设计稿 矩形22148（高 28、圆角 14、1px #DDDDDD 描边）
const DonePill = styled.div`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 28px;
  padding: 0 8px 0 14px;
  border: 1px solid var(--color-border-primary);
  border-radius: 14px;
  background: var(--color-background-card);
  cursor: pointer;
  user-select: none;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: var(--color-border-hover);
  }
`;

const DoneLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
`;

const DoneTime = styled.span`
  font-size: 13px;
  color: var(--color-text-tertiary);
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
    color: var(--color-border-hover);
  }
`;

// 步骤时间线容器：整体缩进 16px。不画最外侧竖线（仅 loop 自身从 loading/折叠图标引出连接线）
const StepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-left: 16px;
`;

const Muted = styled.span`
  color: var(--color-text-tertiary);
  font-size: 13px;
`;

// loop 块：展开有子项时，从前导图标(•••/›)位置引出一条竖线，贯穿 loading 行并往下延伸到子项
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
        background: var(--color-border-secondary);
      }
    `}
`;

// 步骤标题行：前导槽（loading / 折叠 / 状态同位）+ 标题 + 计数。步骤名 14/700（设计稿）
const LoopHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 22px;
  cursor: ${p => (p.$clickable ? 'pointer' : 'default')};
  user-select: none;
`;

// 子项列表：子项相对父步骤标题再缩进 16px（设计稿「缩进16px」）。竖线由 LoopBlock::before 统一绘制。
// 父标题左缘 = LeadBox(18) + gap(8) = 26；子项再 +16 = 42。
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
  color: ${p => (p.$muted ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)')};
  user-select: none;
`;

// 折叠箭头：与 loading 占同一前导位置（loading时转圈、完成后此处变折叠箭头）。设计稿 navigate_next 24×24，glyph 取 18px
const Chevron = styled.span`
  display: inline-flex;
  width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
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

// 三点循环指示器，对应设计稿的 "•••"
const dotPulse = keyframes`
  0%, 80%, 100% { opacity: 0.25; transform: scale(0.85); }
  40% { opacity: 1; transform: scale(1); }
`;

const Dots = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  color: var(--color-text-tertiary);

  span {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: currentColor;
    ${p =>
      p.$active &&
      css`
        animation: ${dotPulse} 1.2s ease-in-out infinite;
      `}
  }
  span:nth-child(2) {
    animation-delay: 0.2s;
  }
  span:nth-child(3) {
    animation-delay: 0.4s;
  }
`;

function DotsIndicator({ active }) {
  return (
    <Dots $active={active}>
      <span />
      <span />
      <span />
    </Dots>
  );
}

// 失败小叉（设计稿无完成/待办 glyph，仅失败时给红叉兜底反馈）
const Cross = styled.span`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--color-error);
  color: #fff;
  i {
    font-size: 10px;
  }
`;

// 前导槽统一占位，保证各行标题左对齐（•••/折叠箭头/空 都占同宽）。
// 带底色并置于引导线之上：折叠箭头/loading 盖住贯穿的竖线，不让线从图标缝里透出。
const LeadBox = styled.span`
  position: relative;
  z-index: 1;
  width: 18px;
  /* 固定撑满行高：否则 inline-flex 高度跟随内容，••• 只有 4px、底色盖不住竖线 */
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--color-background-card);
`;

// 步骤前导槽：loading 与折叠 icon 占同一位置（设计稿）。
// 完成且有子项 → 折叠箭头 ›；进行中 → ••• 呼吸；未开始 → ••• 静态；failed → 红叉。loading 时不显示折叠箭头。
function LeadSlot({ status, foldable, expanded }) {
  if (foldable)
    return (
      <Chevron $expanded={expanded}>
        <Icon icon="arrow-right-border" />
      </Chevron>
    );
  if (status === 'running') return <DotsIndicator active />;
  if (status === 'pending') return <DotsIndicator />;
  if (status === 'failed')
    return (
      <Cross>
        <Icon icon="close" />
      </Cross>
    );
  return null;
}

function fieldsCountOf(item) {
  if (!item) return 0;
  if (Array.isArray(item.fields)) return item.fields.length;
  return 0;
}

// plan 声明的视图数（step-build-views 迭代项 item.views 为视图名数组）：迭代结果未回填前的退路。
function viewsCountOf(item) {
  if (!item) return 0;
  if (Array.isArray(item.views)) return item.views.length;
  return 0;
}

function iterTitle(stepId, iter) {
  const item = iter && iter.item;

  if (!item) {
    if (stepId === 'step-build-worksheets' || stepId === 'step-build-relations')
      return _l('工作表 %0', (iter && iter.index + 1) || '');
    if (stepId === 'step-build-views') return _l('视图 %0', (iter && iter.index + 1) || '');
    if (stepId === 'step-build-workflows:system-workflows') return _l('工作流 %0', (iter && iter.index + 1) || '');
    if (stepId === 'step-build-workflows:custom-action-workflows')
      return _l('自定义动作 %0', (iter && iter.index + 1) || '');
    return _l('项 %0', (iter && iter.index + 1) || '');
  }

  return item.name || item.title || _l('项 %0', iter.index + 1);
}

// 工作表 iteration 的 inline 副信息：字段数（设计稿「工作表去掉下一层级」，字段数直接平铺、不再下钻）
function iterMeta(stepId, iter) {
  if (stepId === 'step-build-worksheets') {
    const n = fieldsCountOf(iter && iter.item);

    return n > 0 ? _l('字段 %0 个', n) : '';
  }

  // 视图与自定义动作：每张表后平铺「视图 N 个，动作 M 个」。
  // 真实建成数在迭代完成结果 result.currentView（{ views, actions }）；尚未完成时退回 plan 声明的 item.views 计数。
  if (stepId === 'step-build-views') {
    const cv = iter && iter.result && iter.result.currentView;
    const views = cv && Array.isArray(cv.views) ? cv.views.length : viewsCountOf(iter && iter.item);
    const actions = cv && Array.isArray(cv.actions) ? cv.actions.length : 0;
    const parts = [];

    if (views > 0) parts.push(_l('视图 %0 个', views));
    if (actions > 0) parts.push(_l('动作 %0 个', actions));
    return parts.join('，');
  }

  return '';
}

// 顶层简单步骤行（创建应用 / 创建分组）：标题 + 值/准备中。
// 交互（建应用 / 建分组进行中）时前导槽显示 ••• loading 反馈；完成后槽位归空。
function SimpleRow({ title, status, value }) {
  const running = status === 'running';
  const pending = !status || status === 'pending';

  return (
    <LoopHeader>
      <LeadBox>{running && <DotsIndicator active />}</LeadBox>
      <span>{title}</span>
      {pending ? <Muted>{_l('准备中')}</Muted> : value ? <Muted>{value}</Muted> : null}
    </LoopHeader>
  );
}

// 中间「设计/准备」步骤行：••• loading + 「XX准备中」标题。仅运行中出现，结束即消失（设计稿）。
function PrepRow({ label }) {
  return (
    <LoopHeader>
      <LeadBox>
        <DotsIndicator active />
      </LeadBox>
      <span>{label}</span>
    </LoopHeader>
  );
}

// loop 步骤：标题行（可折叠）+ 子项列表。子项平铺、不再下钻一层。
function LoopStep({ stepId, title, cur }) {
  const iters = Array.isArray(cur.iterations) ? cur.iterations : [];
  const total = cur.total || iters.length;
  const status = cur.status || 'pending';
  const running = status === 'running';
  const completed = status === 'completed';
  const pending = status === 'pending';
  const hasList = iters.length > 0;
  const foldable = !running && hasList;

  // 自动折叠：步骤完成后默认收起（全部完成即全部收起）；用户手动点过之后改为跟随手动状态。
  const [userToggled, setUserToggled] = useState(false);
  const [manualOpen, setManualOpen] = useState(true);
  const stepOpen = userToggled ? manualOpen : !completed;

  const toggle = () => {
    if (!foldable) return;
    // 首次点击：当前可见态为 !completed，翻转后即 completed；之后正常 toggle
    setManualOpen(prev => (userToggled ? !prev : completed));
    setUserToggled(true);
  };

  return (
    <LoopBlock $line={stepOpen && hasList}>
      <LoopHeader $clickable={foldable} onClick={toggle} role={foldable ? 'button' : undefined}>
        <LeadBox>
          <LeadSlot status={status} foldable={foldable} expanded={stepOpen} />
        </LeadBox>
        <span>{title}</span>
        {pending ? <Muted>{_l('准备中')}</Muted> : total > 0 ? <Muted>{_l('%0 个', total)}</Muted> : null}
      </LoopHeader>

      {stepOpen && hasList && (
        <LoopList>
          {iters.map(iter => {
            if (!iter) return null;
            const metaStr = iterMeta(stepId, iter);

            return (
              <IterRow key={iter.index} $muted={iter.status !== 'completed' && iter.status !== 'failed'}>
                <span>{iterTitle(stepId, iter)}</span>
                {metaStr && <Muted>{metaStr}</Muted>}
              </IterRow>
            );
          })}
        </LoopList>
      )}
    </LoopBlock>
  );
}

// 总耗时格式化，对齐设计稿 "16m24s"：>=1h 用 "1h3m"，>=1min 用 "16m24s"，否则 "24s"
function formatDuration(ms) {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;

  if (m >= 60) return `${Math.floor(m / 60)}h${m % 60}m`;
  if (m > 0) return `${m}m${s}s`;
  return `${s}s`;
}

// 并行分支结果里的命名实体列表 [{ name, ... }]：用于把单 agent 分支结果合成成可折叠子项。
// 自定义页面分支 → result.customPageContext；对话机器人分支 → result.chatbotContext。
function namedListOf(step, key) {
  const list = step && step.result && step.result[key];

  return Array.isArray(list) ? list : [];
}

const showMain = s => !!s && (s.status === 'running' || s.status === 'completed');
const isRunning = s => !!s && s.status === 'running';

// 固定 8 行步骤（对齐设计稿）；未到达的步骤显示「准备中」。
// 1) 创建应用 / 2) 创建分组（均来自 step-create-app）/ 3) 创建工作表 / 4) 创建视图与自定义动作
// 5) 创建角色 / 6) 创建自定义页面 / 7) 创建工作流 / 8) 创建自定义动作工作流
export default function BuildProgress({ steps = {}, appName, startedAt, finishedAt, aborted, onOpenPreview }) {
  const createApp = steps['step-create-app'] || { status: 'pending' };
  const caResult = createApp.result || {};
  const appNameVal = appName || caResult.appName || caResult.name || '';
  const sectionCount = caResult.sectionIdByName ? Object.keys(caResult.sectionIdByName).length : 0;

  // 表关联（step-build-relations）并入「创建工作表」：表建完但关联还在跑（running/pending）时，
  // 「创建工作表」保持 loading；关联完成（或本就没有关联步骤）才算完成、进入下一步。表关联不单独成行。
  const buildWs = steps['step-build-worksheets'] || { status: 'pending' };
  const relations = steps['step-build-relations'];
  const relationsBlocking = !!relations && relations.status !== 'completed' && relations.status !== 'failed';
  const wsCur = buildWs.status === 'completed' && relationsBlocking ? { ...buildWs, status: 'running' } : buildWs;

  // 把单 agent 并行分支结果（[{ name }]）合成成 LoopStep 可消化的 cur（total + iterations），列出子项名。
  const branchToCur = (step, key) => {
    const list = namedListOf(step, key);

    return step
      ? {
          ...step,
          total: list.length,
          iterations: list.map((it, i) => ({ index: i, item: { name: it && it.name }, status: 'completed' })),
        }
      : { status: 'pending' };
  };

  // 「创建自定义页面」合成：把空壳分支（页面名列表）与配置分支（逐页 iteration）并成一步。
  // - 子项 = customPageContext 的页面名；某页对应配置迭代 completed → 该子项 completed（黑），否则 pending（灰）
  // - 整步 status：空壳已建好且配置全部完成 → completed；否则 running（前导 ••• 持续 loading）
  // 设计稿：空壳建好先全灰列出，逐页配完逐个变黑，全部配完整步收起；不再单独显示「自定义页面准备中」。
  const mergeCustomPageCur = (shellStep, prepStep) => {
    if (!shellStep) return { status: 'pending' };
    const pages = namedListOf(shellStep, 'customPageContext');
    const prepIters = prepStep && Array.isArray(prepStep.iterations) ? prepStep.iterations : [];
    const iterations = pages.map((it, i) => ({
      index: i,
      item: { name: it && it.name },
      status: prepIters[i] && prepIters[i].status === 'completed' ? 'completed' : 'pending',
    }));
    const shellDone = shellStep.status === 'completed' || shellStep.status === 'failed';
    // 配置分支 completed 或 failed（部分页面配置失败）都算终结，避免整步一直 loading 转圈
    const allConfigured = !!prepStep && (prepStep.status === 'completed' || prepStep.status === 'failed');

    return {
      ...shellStep,
      status: shellDone && allConfigured ? 'completed' : 'running',
      total: pages.length,
      iterations,
    };
  };

  // 创建自定义页面：V5.x 改为并行步分支 step-create-pages-and-chatbots:create-dashboards（单 agent，
  // 走 parallel-branch-* 事件），结果在 result.customPageContext。页面配置在 step-config-and-design:custom-pages
  // 分支逐页进行，合并进本步：空壳建好全灰列出，逐页配完逐个变黑，全部配完整步才完成。
  const dashboards = steps['step-create-pages-and-chatbots:create-dashboards'];
  const customPagesPrep = steps['step-config-and-design:custom-pages'];
  const dashCur = mergeCustomPageCur(dashboards, customPagesPrep);

  // 创建对话机器人：并行步分支 step-create-pages-and-chatbots:create-chatbots，结果在 result.chatbotContext
  // （[{ name, id }]，如经营助手 / 客户助手）。无 AI 助手时列表为空，不渲染该模块。
  const chatbots = steps['step-create-pages-and-chatbots:create-chatbots'];
  const chatCur = branchToCur(chatbots, 'chatbotContext');
  const hasChatbots = chatCur.iterations && chatCur.iterations.length > 0;

  const views = steps['step-build-views'];
  // V5.x：角色构建从独立 step-build-roles 移入并行步 step-config-and-design 的 build-roles 分支，stepId 变为复合形式。
  const roles = steps['step-config-and-design:build-roles'];
  const sysWf = steps['step-build-workflows:system-workflows'];
  const caWf = steps['step-build-workflows:custom-action-workflows'];
  // 中间「设计/准备」prep 步骤：仅运行中显示「XX准备中」，结束即消失（设计稿）。
  // 注：自定义页面配置（step-config-and-design:custom-pages）不再单独成「准备中」行，已并入「创建自定义页面」。
  const sysWfPrep = steps['step-config-and-design:design-system-workflows'];
  const caWfPrep = steps['step-config-and-design:design-custom-action-workflows'];
  // 主步骤未开始（pending）不显示——开始或完成后才出现（设计稿：执行中只显示已开始/已完成的步骤）

  const schemeTitle = appName ? _l('%0 搭建方案', appName) : _l('应用搭建方案');

  // 仅以 finishedAt 作为"搭建收尾"的权威信号（在 completed 事件落盖）
  const finished = !!finishedAt;
  const [expanded, setExpanded] = useState(false);
  const durationLabel =
    finishedAt && startedAt && finishedAt - startedAt >= 1000 ? formatDuration(finishedAt - startedAt) : '';

  return (
    <Card $frozen={aborted}>
      <SectionHeader>{_l('搭建应用')}</SectionHeader>

      <SchemePill
        title={onOpenPreview ? _l('查看搭建预览') : schemeTitle}
        $clickable={!!onOpenPreview}
        role={onOpenPreview ? 'button' : undefined}
        onClick={onOpenPreview || undefined}
      >
        <Icon icon="book" />
        <SchemeName>{schemeTitle}</SchemeName>
      </SchemePill>

      {finished && (
        <DonePill onClick={() => setExpanded(v => !v)} role="button">
          <DoneLabel>{_l('已完成')}</DoneLabel>
          {durationLabel && <DoneTime>{durationLabel}</DoneTime>}
          <DoneChevron $expanded={expanded}>
            <Icon icon="arrow-right-border" />
          </DoneChevron>
        </DonePill>
      )}

      {(!finished || expanded) && (
        <StepList>
          <SimpleRow
            title={_l('创建应用')}
            status={createApp.status}
            value={createApp.status === 'running' && !appNameVal ? '' : appNameVal}
          />
          <SimpleRow
            title={_l('创建分组')}
            status={createApp.status}
            value={sectionCount > 0 ? _l('%0 个', sectionCount) : ''}
          />
          {showMain(wsCur) && <LoopStep stepId="step-build-worksheets" title={_l('创建工作表')} cur={wsCur} />}
          {showMain(views) && <LoopStep stepId="step-build-views" title={_l('创建视图与自定义动作')} cur={views} />}
          {showMain(roles) && (
            <LoopStep stepId="step-config-and-design:build-roles" title={_l('创建角色')} cur={roles} />
          )}
          {showMain(dashboards) && (
            <LoopStep
              stepId="step-create-pages-and-chatbots:create-dashboards"
              title={_l('创建自定义页面')}
              cur={dashCur}
            />
          )}
          {(isRunning(chatbots) || hasChatbots) && (
            <LoopStep
              stepId="step-create-pages-and-chatbots:create-chatbots"
              title={_l('创建对话机器人')}
              cur={chatCur}
            />
          )}

          {isRunning(sysWfPrep) && <PrepRow label={_l('工作流准备中')} />}
          {isRunning(caWfPrep) && <PrepRow label={_l('自定义动作工作流准备中')} />}

          {showMain(sysWf) && (
            <LoopStep stepId="step-build-workflows:system-workflows" title={_l('创建工作流')} cur={sysWf} />
          )}
          {showMain(caWf) && (
            <LoopStep
              stepId="step-build-workflows:custom-action-workflows"
              title={_l('创建自定义动作工作流')}
              cur={caWf}
            />
          )}
          {/* 已完成面板兜底：自定义动作工作流已设计（caWfPrep 跑过）但构建分支尚未完成（异步未回填）时，
              showMain(caWf) 为假会让该模块整段消失。此处补一条「准备中」占位，对齐设计稿。 */}
          {finished && !!caWfPrep && !showMain(caWf) && <PrepRow label={_l('自定义动作工作流准备中')} />}
        </StepList>
      )}
    </Card>
  );
}
