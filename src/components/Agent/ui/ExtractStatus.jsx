import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import LoadingDots from './LoadingDots';
import { colors } from './tokens';

// 附件解析状态行：doc / image 各一行，随 *-extract-start / *-extract-completed 事件推进。
// 解析中 →「“xxx.docx” 正在解析中…」，解析完成 →「“xxx.docx” 解析完成」，正文一开始整行由 ChatPanel 撤走。
// 完成态照样带三点：本轮还没结束，动画停下来那行就像卡住了，节奏要和消息级 loading 一致，最后一起消失。
const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 2px 0;
  font-size: 13px;
  line-height: 20px;
  color: ${colors.textMuted};
`;

// 文件名过长时截断，避免一行被撑爆（完整名走 title 提示）
function shortName(name = '') {
  return name.length > 28 ? `${name.slice(0, 25)}...` : name;
}

// 解析对象描述：文档优先报文件名（后端 files[].name 带回），图片名多为 image.png 无意义，只报张数。
// 文档超过 2 个时只列前两个，其余折叠成「等 N 个文档」，避免一行塞十几个文件名。
function describeTarget({ target, names = [], count = 0 }) {
  if (target === 'image') {
    return _l('%0 张图片', count || names.length || 1);
  }

  if (!names.length) {
    return count > 1 ? _l('%0 个文档', count) : _l('文档');
  }

  const quoted = names
    .slice(0, 2)
    .map(name => `“${shortName(name)}”`)
    .join('、');

  return names.length > 2 ? _l('%0 等 %1 个文档', quoted, names.length) : quoted;
}

// 完成态文案：全失败 / 部分失败要说清楚，否则用户以为内容已经被读进去了
function describeDone(part, target) {
  const failed = part.failed || 0;
  const total = part.count || (part.names || []).length || 1;

  if (failed >= total) return _l('%0 解析失败', target);
  return failed ? _l('%0 解析完成，%1 个失败', target, failed) : _l('%0 解析完成', target);
}

export function ExtractStatus({ part = {} }) {
  const target = describeTarget(part);
  const title = (part.names || []).join('、');

  return (
    <Row title={title}>
      <LoadingDots dotNumber={3} />
      <span>{part.status === 'done' ? describeDone(part, target) : _l('%0 正在解析中…', target)}</span>
    </Row>
  );
}

ExtractStatus.propTypes = {
  part: PropTypes.object,
};

export default ExtractStatus;
