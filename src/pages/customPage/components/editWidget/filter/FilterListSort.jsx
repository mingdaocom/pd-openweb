import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Modal } from 'antd';
import { Button, Icon, SortableList } from 'ming-ui';
import styled from 'styled-components';

const SortableBtnIconWrap = styled.div`
  display: flex;
  font-size: 14px;
  align-items: center;
  line-height: 32px;
  cursor: pointer;
`;
const SortableBtnListWrap = styled.ul`
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
    background-color: #fff;
    color: #151515;
    .btnIcon {
      margin: 0 7px;
    }
    transition: padding 0.25s;
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

const renderSortableBtn = ({ item, DragHandle }) => (
  <li className="overflow_ellipsis">
    <DragHandle>
      <i className="icon-drag Gray_bd Font18"></i>
    </DragHandle>
    <span className="mLeft10">{item.name || _l('未命名')}</span>
  </li>
);

export default function FilterListSort({ filters, onSortEnd }) {
  const [visible, setVisible] = useState(false);
  return (
    <Fragment>
      <SortableBtnIconWrap onClick={() => setVisible(true)}>
        <div className="valignWrapper Gray_75 pointer mLeft10">
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
          <SortableBtnListWrap>
            <SortableList
              useDragHandle
              items={filters}
              itemKey="filterId"
              renderItem={(options) => renderSortableBtn({ ...options })}
              onSortEnd={newItems => onSortEnd(newItems)}
            />
          </SortableBtnListWrap>
          <Button onClick={() => setVisible(false)}>{_l('完成')}</Button>
        </ModalContentWrap>
      </Modal>
    </Fragment>
  );
}
