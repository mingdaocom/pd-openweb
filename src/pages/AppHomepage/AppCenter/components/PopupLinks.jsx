import React from 'react';
import styled from 'styled-components';
import { shape, arrayOf, bool } from 'prop-types';

const Con = styled.div`
  width: 220px;
  padding: 8px 0;
  background: #ffffff;
  box-shadow: 0px 3px 9px rgba(0, 0, 0, 0.16);
  border-radius: 3px;
`;
const Title = styled.div`
  padding: 0 26px;
  margin: 5px 0;
  color: #9e9e9e;
`;

const Item = styled.a`
  cursor: pointer;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 26px;
  color: #757575 !important;
  .icon {
    font-size: 20px;
    margin-right: 13px;
  }
  &:hover {
    background: #efefef;
  }
`;

export default function PopupLinks(props) {
  const { openInNew, items } = props;
  return (
    <Con>
      {items.map((item, i) =>
        item.type === 'title' ? (
          <Title>{item.title}</Title>
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
