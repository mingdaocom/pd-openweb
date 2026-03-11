import React from 'react';
import _ from 'lodash';
import { arrayOf, bool, shape } from 'prop-types';
import styled from 'styled-components';

const Con = styled.div`
  width: 220px;
  padding: 8px 0;
  background: var(--color-background-card);
  box-shadow: var(--shadow-lg);
  border-radius: 3px;
`;
const Title = styled.div`
  padding: 0 26px;
  margin: 5px 0;
  color: var(--color-text-tertiary);
`;

const Item = styled.a`
  cursor: pointer;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 26px;
  color: var(--color-text-secondary) !important;
  .icon {
    font-size: 20px;
    margin-right: 13px;
  }
  &:hover {
    background: var(--color-background-hover);
  }
`;

export default function PopupLinks(props) {
  const { openInNew, items } = props;
  return (
    <Con>
      {items.map((item, i) =>
        item.type === 'title' ? (
          <Title key={`title_${i}`}>{item.title}</Title>
        ) : (
          <Item
            key={i}
            href={item.href || ''}
            onClick={
              item.onClick
                ? e => {
                    e.preventDefault();
                    item.onClick();
                  }
                : _.noop
            }
            {...(openInNew || item.openInNew ? { target: '_blank' } : {})}
          >
            {item.icon && <i className={`icon icon-${item.icon}`} style={{ color: item.color }}></i>}
            <span className="ellipsis">{item.name || item.text}</span>
          </Item>
        ),
      )}
    </Con>
  );
}
PopupLinks.propTypes = {
  openInNew: bool,
  items: arrayOf(shape({})),
};
