import React from 'react';
import styled from 'styled-components';
import { SortableList } from 'ming-ui';

const SortableBtnListWrap = styled.ul`
  padding: 10px 0;
  li {
    display: flex;
    align-items: center;
    color: #151515;
    background-color: #f1f1f1;
    border-radius: 4px;
    padding: 10px;
    margin-bottom: 10px;
    .btnIcon {
      margin: 0 7px;
    }
    transition: padding 0.25s;
  }
`;

const renderSortableBtn = ({ item, DragHandle }) => (
  <li className="overflow_ellipsis">
    <DragHandle>
      <i className="icon-drag Gray_bd Font18"></i>
    </DragHandle>
    <span className="mLeft10">{item.name || _l('未命名')}</span>
  </li>
);

export default function FilterListSort({ filters, onSortEnd }) {
  return (
    <SortableBtnListWrap>
      <SortableList
        useDragHandle
        items={filters}
        itemKey="filterId"
        renderItem={options => renderSortableBtn({ ...options })}
        onSortEnd={newItems => onSortEnd(newItems)}
      />
    </SortableBtnListWrap>
  );
}
