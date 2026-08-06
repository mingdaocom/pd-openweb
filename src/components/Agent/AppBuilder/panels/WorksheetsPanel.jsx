// 「工作表」tab 的 panel —— 渲染 /jsons/worksheets.json 内容。
// 元素 schema：{ type: 'worksheet', groupName, name, description, fields, views, icon?, color? }
// 按 groupName 二级分组渲染；数组顺序 = 后端 worksheets.json 拓扑序，前端不再重排。
import React from 'react';
import AppItemListRenderer from './_appItemRenderer';

export default function WorksheetsPanel({ worksheets }) {
  return <AppItemListRenderer items={worksheets} fallbackType="worksheet" />;
}
