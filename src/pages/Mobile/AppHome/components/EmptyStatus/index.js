import React from 'react';
import styled from 'styled-components';
import processTodoEmpty from '../../img/processTodoEmpty.png';
import recentEmpty from '../../img/recentEmpty.png';

const Wrap = styled.div`
  img {
    width: 78px;
  }
`;

const IMAGES = {
  process: processTodoEmpty,
  recent: recentEmpty,
};

export default function EmptyStatus(props) {
  const { emptyType, emptyTxt } = props;
  return (
    <Wrap className="w100 h100 flexColumn alignItemsCenter justifyContentCenter">
      <img src={IMAGES[emptyType]} />
      <div className="Gray_bd mTop20 Font15">{emptyTxt}</div>
    </Wrap>
  );
}
