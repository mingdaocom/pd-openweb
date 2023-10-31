import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Modal, Tooltip } from 'antd';
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
    <i style={{ color: item.color }} className={`btnIcon Font16 icon-${item.icon || 'custom_actions'}`}></i>
    <span>{item.name}</span>
  </li>
));

const SortableBtnList = SortableContainer(({ list }) => (
  <SortableBtnListWrap>
    {list.map((item, index) => (
      <SortableBtn item={item} index={index} />
    ))}
  </SortableBtnListWrap>
));

export default function BtnListSort({ buttonList, onSortEnd }) {
  const [visible, setVisible] = useState(false);
  return (
    <Fragment>
      <SortableBtnIconWrap data-tip={_l('按钮排序')} className="mLeft10" onClick={() => setVisible(true)}>
        <Icon className="Font24 Gray_9e ThemeHoverColor3" type="link" icon="import_export" />
      </SortableBtnIconWrap>
      <Modal
        title={_l('自定义按钮排序')}
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
            list={buttonList}
            onSortEnd={({ newIndex, oldIndex }) => {
              onSortEnd(arrayMove(buttonList, oldIndex, newIndex));
            }}
          />
          <Button onClick={() => setVisible(false)}>{_l('完成')}</Button>
        </ModalContentWrap>
      </Modal>
    </Fragment>
  );
}
