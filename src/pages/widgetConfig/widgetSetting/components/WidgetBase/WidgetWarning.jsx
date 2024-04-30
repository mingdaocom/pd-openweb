import React from 'react';
import styled from 'styled-components';
import { Support } from 'ming-ui';
import { HAS_WARNING_CONTROL } from '../../../config';

const WarningWrap = styled.div`
  font-size: 12px;
  padding: 10px;
  line-height: 21px;
  margin: 12px 0;
  background: #f7f7f7;
  border-radius: 2px;
  border: 1px solid #eaeaea;
  .Font13 {
    font-size: 12px !important;
  }
`;

const DEFAULT_TEXT = {
  text: _l(
    '当工作表记录超过10w行时，为保证工作表性能，修改配置后将不再刷新历史数据。如果仍需更新历史数据，请手动进行刷新。',
  ),
  href: 'https://help.mingdao.com/worksheet/batch-refresh',
};

const CUSTOM_EVENT_TEXT = {
  text: _l(
    '控件事件是指在字段控件上有交互事件发生时，如果表单内的数据满足条件，则可以根据配置执行不同动作，如显示消息、调用集成API等。',
  ),
  href: '',
};

export default function WidgetWarning(type) {
  const detail = type === 'custom_event' ? CUSTOM_EVENT_TEXT : DEFAULT_TEXT;
  return (
    <WarningWrap>
      {detail.text}
      <Support type={3} href={detail.href} text={_l('了解更多')} style={{ fontSize: '12px' }} />
    </WarningWrap>
  );
}
