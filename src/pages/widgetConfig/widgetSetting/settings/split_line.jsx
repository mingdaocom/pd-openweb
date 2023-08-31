import React from 'react';
import styled from 'styled-components';
import { DEFAULT_DATA } from '../../config/widget';
import { enumWidgetType } from '../../util';

const SplitLineWrap = styled.div`
  width: 100%;
  background: #fffad2;
  border: 1px solid #f3dd8b;
  border-radius: 3px;
  margin: 24px 0;
  padding: 14px;
`;

export default function SplitLine({ data, onChange }) {
  const { emunDefault } = data;

  return (
    <SplitLineWrap>
      <div className="Bold Font15 mBottom12">{_l('这是一个旧的分段字段')}</div>
      <div>{_l('新分段可以在分段内添加字段。从而支持进行展开、折叠操作，或整体控制分段内所有字段的显隐。')}</div>
      <div>{_l('因为结构不兼容，旧的分段字段需要手动转为新类型后使用。')}</div>
      <div
        className="ThemeColor3 pointer ThemeHoverColor2 mTop12"
        onClick={() => {
          const widgetType = enumWidgetType[52];
          onChange({ type: 52, ...DEFAULT_DATA[widgetType] });
        }}
      >
        {_l('转为新分段类型')}
      </div>
    </SplitLineWrap>
  );
}
