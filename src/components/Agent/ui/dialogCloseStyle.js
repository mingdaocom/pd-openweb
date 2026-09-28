import { createGlobalStyle } from 'styled-components';

// Agent 内弹窗统一样式：调整关闭按钮位置，并给内容顶部补充间距。
// 用法：给 Modal 加 rootClassName="agentDialogClose"，并在其内渲染 <AgentDialogCloseStyle />。
export const AGENT_DIALOG_CLOSE_CLASS = 'agentDialogClose';

export const AgentDialogCloseStyle = createGlobalStyle`
  .${AGENT_DIALOG_CLOSE_CLASS} .hap-modal-close {
    top: 17px !important;
    right: 5px !important;
  }
  .${AGENT_DIALOG_CLOSE_CLASS} .hap-modal-body {
    padding-top: 5px !important;
  }
`;
