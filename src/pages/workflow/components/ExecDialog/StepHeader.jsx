import React, { useState } from 'react';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import { browserIsMobile } from 'src/util';
import FlowChart, { MobileFlowChart } from '../FlowChart';
import styled from 'styled-components';

const Btn = styled.div`
  &:hover {
    .Gray_bd {
      color: #2196f3 !important;
    }
  }
`;

export default ({ processId, instanceId, processName = '', currentWork, hasBack = false, onClose = () => {}, isApproval }) => {
  const [visible, setVisible] = useState(false);
  const isMobile = browserIsMobile();
  const Modal = isMobile ? MobileFlowChart : FlowChart;
  return (
    <div className={cx('flexRow mTop20 mRight20 mBottom5', isMobile ? 'pLeft10' : 'pLeft25')}>
      <Btn className={cx('flexRow alignItemsCenter mRight15 ellipsis', { pointer: hasBack })} onClick={onClose}>
        {hasBack && (
          <Icon className={cx('Font20 Gray_bd', isMobile ? 'mRight5' : 'mRight10')} icon="arrow-left-border" />
        )}
        <div className="Font17 bold">{processName}</div>
      </Btn>
      <div className="flex" />
      {isApproval && (
        <div className="flexRow pointer alignItemsCenter Gray_9e ThemeHoverColor3" onClick={() => setVisible(true)}>
          <Icon className="Font16 mRight5" icon="department1" />
          <div className="bold">{_l('流转图')}</div>
        </div>
      )}

      {visible && <Modal processId={processId} instanceId={instanceId} selectNodeId={_.get(currentWork, 'flowNode.id')} onClose={() => setVisible(false)} />}
    </div>
  );
};
