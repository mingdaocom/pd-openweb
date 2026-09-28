import React from 'react';
import styled from 'styled-components';
import { PopupWrapper } from 'ming-ui/antd-mobile-components';
import BatchPrintErrorContent from 'worksheet/common/BatchPrintErrorContent';

const Content = styled.div`
  padding: 8px 20px 20px;
`;

export default function BatchPrintErrorPopup({ templateName, recordNames, onClose }) {
  return (
    <PopupWrapper
      visible
      bodyClassName="autoHeightPopupBody"
      headerType="withIcon"
      headerTitleAlign="center"
      title={_l('批量打印：%0', templateName)}
      onClose={onClose}
    >
      <Content>
        <BatchPrintErrorContent mobile recordNames={recordNames} />
      </Content>
    </PopupWrapper>
  );
}
