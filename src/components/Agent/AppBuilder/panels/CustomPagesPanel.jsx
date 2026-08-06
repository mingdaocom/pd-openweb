// 「自定义页面」tab 的 panel —— 渲染 /jsons/custom-pages.json 内容。
// 元素 schema：{ type: 'dashboard' | 'workspace' | 'aiAssistant', groupName, name, description, charts?, components?, icon?, color? }
// 三种 type 共存于一个数组按 groupName 二级分组；流式 partial 状态下 type 未到时按 dashboard 兜底渲染。
import React from 'react';
import AppItemListRenderer from './_appItemRenderer';

export default function CustomPagesPanel({ pages }) {
  return <AppItemListRenderer items={pages} fallbackType="dashboard" />;
}
