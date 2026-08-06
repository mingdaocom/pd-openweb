import { createGlobalStyle } from 'styled-components';

// Agent 内弹窗统一样式：① 关闭按钮位置（ming-ui 默认 right:0/top:2px 贴角，挪到 top:17/right:5）；
// ② body 顶部加 5px 内边距。ming-ui 默认规则是 4 层 class 选择器，特异度高于本作用域选择器，故用 !important 覆盖。
// 用法：给 Dialog 加 className="agentDialogClose"，并在其内渲染 <AgentDialogCloseStyle />。
export const AGENT_DIALOG_CLOSE_CLASS = 'agentDialogClose';

export const AgentDialogCloseStyle = createGlobalStyle`
  .${AGENT_DIALOG_CLOSE_CLASS} .mui-dialog-close-btn {
    top: 17px !important;
    right: 5px !important;
  }
  .${AGENT_DIALOG_CLOSE_CLASS} .mui-dialog-body {
    padding-top: 5px !important;
  }
`;
