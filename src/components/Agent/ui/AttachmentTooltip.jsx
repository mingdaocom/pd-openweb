import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

// 上传附件按钮的 tooltip：标题 + 按类别列出支持格式（多行）。
// antd Tooltip 对纯文本 \n 不换行，故用 JSX 节点渲染。
const Wrap = styled.div`
  line-height: 1.7;

  .title {
    margin-bottom: 2px;
  }
  .row {
    white-space: nowrap;
    opacity: 0.85;
  }
`;

export default function AttachmentTooltip({ max }) {
  return (
    <Wrap>
      <div className="title">{_l('上传附件（最多 %0 个）', max)}</div>
      <div className="row">{_l('· 文档：Word、WPS、PDF、PPT')}</div>
      <div className="row">{_l('· 表格：Excel、CSV')}</div>
      <div className="row">{_l('· 文本/数据：txt、md、json、xml、yaml、log 等')}</div>
      <div className="row">{_l('· 图片：PNG、JPG 等')}</div>
    </Wrap>
  );
}

AttachmentTooltip.propTypes = {
  max: PropTypes.number,
};
