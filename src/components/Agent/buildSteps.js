// build-app-agent 工作流步骤元数据。stepId 对齐 assets/agents/prod/build-app/build-app-agent.yaml workflow 节点。
// kind=loop 的 step 走 workflow-loop-* 事件序列，UI 展示 {index}/{count} 进度；kind=step 走 workflow-step-* 单次事件。

// 执行顺序对齐 build-app-agent.yaml：建应用 → 建表 → 补表关联 → 视图与动作
// →（示例数据 / AI 助手两路 async 后台跑）→ 建页面空壳 → 建角色
// →（并行 step-config-and-design：页面组件配置 ∥ 工作流设计）
// →（并行 step-build-workflows：系统工作流 ∥ 自定义动作工作流）。

// 两个 parallel 容器步：自身只发 workflow-step-start/completed 作分组，UI 不单独渲染它们（见 BuildProgress 的 filter），
// 只渲染其下分支。分支 stepId 一律为复合 "{并行步}:{分支}"——loop 分支走 workflow-loop-*，单 agent 分支走 workflow-step-*。
export const BUILD_PARALLEL_STEP_IDS = new Set([
  'step-create-pages-and-chatbots',
  'step-config-and-design',
  'step-build-workflows',
]);

export const BUILD_STEPS = {
  'step-create-app': { title: _l('应用'), kind: 'step' },
  // 应用描述：create_app 后由 async-agent 后台异步补 remark/desc（fire-and-forget）。纯元数据美化、
  // 不阻塞主流程、无内容产出，进度条不单独展示（BuildProgress.renderSimpleStep 对其 return null）；
  // 仍登记于此，让其 workflow-step-* 事件不落入 unknownIds 的 fallback 渲染。
  'step-update-app-desc': { title: _l('应用描述'), kind: 'step' },
  'step-build-worksheets': { title: _l('工作表'), kind: 'loop' },
  'step-build-relations': { title: _l('表关联'), kind: 'loop' },
  'step-build-views': { title: _l('视图与动作'), kind: 'loop' },
  'step-build-sample-data': { title: _l('示例数据'), kind: 'step' },
  // AI 助手：async-agent 后台 fire-and-forget（与示例数据同阶段），只发 step-start/completed；
  // 与 sample-data 一样以独立行嵌进 worksheets loop 末尾展示（见 BuildProgress 的 AiAssistantRow）。
  // V5.x：自定义页面空壳 + 对话机器人合并为并行步 step-create-pages-and-chatbots 的两个单 agent 分支，
  // 走 workflow-parallel-branch-* 事件，stepId 为复合形式（容器:分支）。旧的 step-create-dashboards /
  // step-create-chatbots 已不再 emit，对应条目随之改为复合 id。
  'step-create-pages-and-chatbots:create-dashboards': { title: _l('页面'), kind: 'step' },
  'step-create-pages-and-chatbots:create-chatbots': { title: _l('对话机器人'), kind: 'step' },
  // 并行 step-config-and-design 的四个分支：custom-pages（loop，逐个配置仪表盘 / 工作台页面组件）、
  // build-roles（loop，逐个建角色——V5.x 从原独立 step-build-roles 移入本并行步，故 id 变为复合形式）、
  // design-system-workflows（单 agent，一次性设计系统工作流节点方案）、
  // design-custom-action-workflows（单 agent，设计自定义动作对应的工作流节点方案）。
  // 两个 design 分支都是单 agent，走复合 id 的 workflow-step-* 事件。
  'step-config-and-design:custom-pages': { title: _l('页面配置'), kind: 'loop' },
  'step-config-and-design:build-roles': { title: _l('角色'), kind: 'loop' },
  'step-config-and-design:design-system-workflows': { title: _l('工作流设计'), kind: 'step' },
  'step-config-and-design:design-custom-action-workflows': { title: _l('自定义动作设计'), kind: 'step' },
  // 并行 step-build-workflows 的两个 loop 分支：系统工作流 / 自定义动作工作流。
  'step-build-workflows:system-workflows': { title: _l('工作流'), kind: 'loop' },
  'step-build-workflows:custom-action-workflows': { title: _l('自定义动作'), kind: 'loop' },
};

export const BUILD_STEP_ORDER = Object.keys(BUILD_STEPS);
