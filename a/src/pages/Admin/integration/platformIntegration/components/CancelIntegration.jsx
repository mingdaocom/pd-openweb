import React from 'react';
import Trigger from 'rc-trigger';
import styled from 'styled-components';

const Wrap = styled.div`
  width: 174px;
  height: 48px;
  line-height: 48px;
  color: #f51744;
  padding-left: 20px;
  background-color: #fff;
  box-shadow: 0px 4px 16px 1px rgba(0, 0, 0, 0.24);
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
      <i className="icon-moreop Font18 Gray_9e" />
    </Trigger>
  );
}
