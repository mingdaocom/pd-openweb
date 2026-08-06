// 「AI助手」tab 的 panel —— 渲染 /jsons/ai-assistants.json（独立文件，7 文件 schema）。
// 元素 schema：{ type: 'aiAssistant', groupName, name, description, icon? }（无 charts/components）。
// 复用通用项渲染器，按 aiAssistant 兜底渲染（流式 partial 阶段 type 未到时也按 aiAssistant 呈现）。
import React from 'react';
import AppItemListRenderer from './_appItemRenderer';

export default function AiAssistantsPanel({ pages }) {
  return <AppItemListRenderer items={pages} fallbackType="aiAssistant" />;
}
