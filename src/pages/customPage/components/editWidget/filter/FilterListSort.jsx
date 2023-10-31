import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Modal } from 'antd';
import { Button, Icon } from 'ming-ui';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import styled from 'styled-components';

const SortableBtnIconWrap = styled.div`
  display: flex;
  font-size: 14px;
  align-items: center;
  line-height: 32px;
  cursor: pointer;
`;
const SortableBtnListWrap = styled.ul`
  /* box-shadow: 0 0 2px rgba(0, 0, 0, 0.25); */
  background-color: #fff;
  padding: 6px 24px;
  min-height: 205px;
  max-height: 560px;
  overflow: auto;
  li {
    display: flex;
    align-items: center;
    min-width: 180px;
    line-height: 36px;

    cursor: row-resize;
    background-color: #fff;
    color: #333;
    .btnIcon {
      margin: 0 7px;
    }
    transition: padding 0.25s;
    &:hover {
      padding-left: 12px;
      background-color: #f5f5f5;
    }
  }
`;
const ModalContentWrap = styled.div`
  display: flex;
  flex-direction: column;

  button {
    margin-top: 26px;
    margin-right: 24px;
    align-self: flex-end;
  }
`;

const SortableBtn = SortableElement(({ item }) => (
  <li className="overflow_ellipsis">
    <i className="icon-drag Gray_bd Font18"></i>
    <span className="mLeft10">{item.name || _l('未命名')}</span>
  </li>
));

const SortableBtnList = SortableContainer(({ list }) => (
  <SortableBtnListWrap>
    {list.map((item, index) => (
      <SortableBtn item={item} index={index} key={index} />
    ))}
  </SortableBtnListWrap>
));

export default function FilterListSort({ filters, onSortEnd }) {
  const [visible, setVisible] = useState(false);
  return (
    <Fragment>
      <SortableBtnIconWrap className="mLeft10" onClick={() => setVisible(true)}>
        <div className="valignWrapper Gray_75 pointer mLeft20">
          <Icon className="Font22 Gray_9e ThemeHoverColor3" icon="import_export" />
          <span className="Font13">{_l('排序')}</span>
        </div>
      </SortableBtnIconWrap>
      <Modal
        title={_l('筛选排序')}
        maskStyle={{ zIndex: 1051 }}
        width={400}
        centered
        closable={false}
        wrapClassName="customPageBtnSortModalWrap"
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        <ModalContentWrap>
          <SortableBtnList
            helperClass="customPageBtnSortHelper"
            list={filters}
            onSortEnd={({ newIndex, oldIndex }) => {
              onSortEnd(arrayMove(filters, oldIndex, newIndex));
            }}
          />
          <Button onClick={() => setVisible(false)}>{_l('完成')}</Button>
        </ModalContentWrap>
      </Modal>
    </Fragment>
  );
}
