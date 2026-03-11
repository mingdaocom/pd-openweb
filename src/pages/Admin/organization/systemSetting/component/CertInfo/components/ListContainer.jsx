import React, { useState } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 800px;
  .listItem {
    display: flex;
    align-items: center;
    width: 100%;
    background-color: var(--color-background-secondary);
    border-radius: 8px;
    padding: 16px;
    .successColor {
      color: var(--color-success);
    }
    .failColor {
      color: var(--color-error);
    }
  }
`;

export default function ListContainer(props) {
  const { list = [], renderItem, className = '' } = props;
  const [showMore, setShowMore] = useState(false);

  return (
    <Wrapper className={className}>
      {list.slice(0, showMore ? undefined : 5).map((item, index) => (
        <div key={index} className="listItem">
          {renderItem(item)}
        </div>
      ))}
      {!showMore && list.length > 5 && (
        <div className="ThemeColor3 adminHoverColor pointer bold mTop6" onClick={() => setShowMore(true)}>
          {_l('展开更多')}
        </div>
      )}
    </Wrapper>
  );
}
