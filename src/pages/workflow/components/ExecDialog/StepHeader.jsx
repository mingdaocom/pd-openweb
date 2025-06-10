import React, { useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { browserIsMobile } from 'src/utils/common';
import FlowChart, { MobileFlowChart } from '../FlowChart';

const Btn = styled.div`
  &:hover {
    .Gray_bd {
      color: #2196f3 !important;
    }
  }
`;

export default ({
  processId,
  instanceId,
  processName = '',
  currentWork,
  hasBack = false,
  onClose = () => {},
  isApproval,
}) => {
  const [visible, setVisible] = useState(false);
  const isMobile = browserIsMobile();
  const Modal = isMobile ? MobileFlowChart : FlowChart;
  return (
    <div className={cx('flexRow mTop16 mRight20 mBottom5', isMobile ? 'pLeft10' : 'pLeft16')}>
      <Btn className={cx('flexRow alignItemsCenter mRight15 ellipsis', { pointer: hasBack })} onClick={onClose}>
        {hasBack && (
          <Icon className={cx('Font20 Gray_bd', isMobile ? 'mRight5' : 'mRight10')} icon="arrow-left-border" />
        )}
        <div className="Font17 bold">{processName}</div>
      </Btn>
      <div className="flex" />
      {isApproval && (
        <div className="flexRow pointer alignItemsCenter Gray_75 ThemeHoverColor3" onClick={() => setVisible(true)}>
          <Icon className="Font16 mRight5" icon="department1" />
          <div className="bold">{_l('流转图')}</div>
        </div>
      )}

      {visible && (
        <Modal
          processId={processId}
          instanceId={instanceId}
          selectNodeId={_.get(currentWork, 'flowNode.id')}
          onClose={() => setVisible(false)}
        />
      )}
    </div>
  );
};
