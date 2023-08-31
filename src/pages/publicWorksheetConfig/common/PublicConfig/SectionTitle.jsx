import React from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  width: fit-content;
  margin-top: 32px;
  margin-bottom: 24px;
  cursor: pointer;

  .titleText {
    color: #333;
    font-weight: bold;
    vertical-align: middle;
    font-size: 15px;
  }
  i {
    color: #9e9e9e;
    margin-right: 12px;
  }
`;

export default function SectionTitle(props) {
  const { title, isFolded, onClick = _.noop, className } = props;
  return (
    <TitleWrapper className={className || ''} onClick={onClick}>
      <Icon icon={isFolded ? 'arrow-right-tip' : 'arrow-down'} />
      <div className="titleText">{title}</div>
    </TitleWrapper>
  );
}
