import React from 'react';
import Trigger from 'rc-trigger';
import styled from 'styled-components';

const Wrap = styled.div`
  width: 174px;
  height: 48px;
  line-height: 48px;
  color: var(--color-error);
  padding-left: 20px;
  background-color: var(--color-background-card);
  box-shadow: var(--shadow-sm);
  border-radius: 3px;
  cursor: pointer;
`;

export default function CancelIntegration(props) {
  const { clickCancel = () => {} } = props;

  return (
    <Trigger
      action={['hover']}
      popup={<Wrap onClick={clickCancel}>{_l('取消集成')}</Wrap>}
      popupAlign={{
        points: ['tr', 'br'],
        offset: [5, 5],
        overflow: { adjustX: true, adjustY: true },
      }}
    >
      <i className="icon-moreop Font18 textTertiary" />
    </Trigger>
  );
}
