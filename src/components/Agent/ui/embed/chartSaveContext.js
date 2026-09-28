import { createContext, useContext } from 'react';

// 图表卡片「保存」入口的运行环境，由 ChatPanel 注入。
// 默认 canSave=false：分享只读页、嵌入页、公开漏斗等没有套 Provider 的场景天然不显示保存入口，
// 不必逐个入口去关。projectId 供「保存到自定义页面」拉应用列表用（为空时由调用侧兜底取当前组织）。
const ChartSaveContext = createContext({ canSave: false, projectId: '' });

export const ChartSaveProvider = ChartSaveContext.Provider;

export function useChartSaveEnv() {
  return useContext(ChartSaveContext);
}
