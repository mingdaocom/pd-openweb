import React from 'react';
import styled from 'styled-components';
import { Support } from 'ming-ui';
import { HAS_WARNING_CONTROL } from 'src/pages/widgetConfig/config';

const WarningWrap = styled.div`
  font-size: 12px;
  padding: 10px;
  line-height: 21px;
  border-radius: 2px;
  ${props =>
    props.isBg
      ? 'margin-top: 10px;background: #FFFCD5;'
      : 'margin: 12px 0;background: #f7f7f7;border: 1px solid #eaeaea;'}
`;

const DEFAULT_TEXT = {
  text: _l(
    '当工作表记录超过10万行时，为保证工作表性能，修改配置后将不再刷新历史数据。如果仍需更新历史数据，请手动进行刷新。',
  ),
  href: 'https://help.mingdao.com/worksheet/batch-refresh',
};

const OTHER_TEXT = {
  event: {
    text: _l(
      '控件事件是指在应用内表单详情页中的字段控件上有交互事件发生时，如果表单内的数据满足条件，则可以根据配置执行不同动作，如显示消息、调用集成API等。',
    ),
    href: 'https://help.mingdao.com/worksheet/event',
  },
  widgetStyle: {
    text: _l(
      '这是一个兼容保留的历史配置，现在此字段类型已不再支持此设置。如果你不需要此功能可以取消勾选，避免性能浪费。',
    ),
  },
};

export default function WidgetWarning({ type }) {
  const detail = _.includes(HAS_WARNING_CONTROL, type) ? DEFAULT_TEXT : OTHER_TEXT[type];
  const isBg = _.includes(['widgetStyle'], type);
  return (
    <WarningWrap isBg={isBg}>
      {detail.text}
      {detail.href && <Support type={3} href={detail.href} text={<span className="Font12">{_l('了解更多')}</span>} />}
    </WarningWrap>
  );
}
