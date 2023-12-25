import React from 'react';
import styled from 'styled-components';
import { Support } from 'ming-ui';

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

export default function WidgetWarning(props) {
  return (
    <WarningWrap>
      {_l(
        '当工作表记录超过10w行时，为保证工作表性能，修改配置后将不再刷新历史数据。如果仍需更新历史数据，请手动进行刷新。',
      )}
      <Support type={3} href="https://help.mingdao.com/sheet43" text={_l('了解更多')} style={{ fontSize: '12px' }} />
    </WarningWrap>
  );
}
