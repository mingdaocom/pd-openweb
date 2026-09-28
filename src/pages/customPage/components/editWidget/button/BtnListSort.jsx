import React, { Fragment, useState } from 'react';
import styled from 'styled-components';
import { Icon, SortableList } from 'ming-ui';
import { Modal, Tooltip } from 'ming-ui/antd-components';

const SortableBtnIconWrap = styled.div`
  display: flex;
  font-size: 14px;
  align-items: center;
  line-height: 32px;
  cursor: pointer;
`;
const SortableBtnListWrap = styled.ul`
  min-height: 205px;
  max-height: 560px;
  overflow: auto;
  li {
    display: flex;
    align-items: center;
    min-width: 180px;
    line-height: 36px;
    cursor: pointer;
    background-color: var(--color-background-primary);
    color: var(--color-text-title);
    .btnIcon {
      margin: 0 7px;
    }
    transition: padding 0.25s;
  }
`;
const renderSortableBtn = ({ item, DragHandle }) => (
  <li className="overflow_ellipsis">
    <DragHandle>
      <i className="icon-drag textDisabled Font18"></i>
    </DragHandle>
    <i style={{ color: item.color }} className={`btnIcon Font16 icon-${item.icon || 'custom_actions'}`}></i>
    <span>{item.name}</span>
  </li>
);
const cloneButtonList = buttonList => (buttonList || []).slice();

export default function BtnListSort({ buttonList, onSortEnd }) {
  const [visible, setVisible] = useState(false);
  const [sortedButtonList, setSortedButtonList] = useState(() => cloneButtonList(buttonList));

  const handleOpen = () => {
    setSortedButtonList(cloneButtonList(buttonList));
    setVisible(true);
  };

  const handleOk = () => {
    onSortEnd(sortedButtonList);
    setVisible(false);
  };

  return (
    <Fragment>
      <Tooltip title={_l('按钮排序')}>
        <SortableBtnIconWrap className="mLeft10" onClick={handleOpen}>
          <Icon className="Font24 textTertiary hoverColorPrimary" icon="import_export" />
        </SortableBtnIconWrap>
      </Tooltip>
      <Modal
        title={_l('自定义按钮排序')}
        width={400}
        centered
        open={visible}
        onCancel={() => setVisible(false)}
        onOk={handleOk}
      >
        <SortableBtnListWrap>
          <SortableList
            renderBody
            useDragHandle
            items={sortedButtonList}
            itemKey="id"
            renderItem={options => renderSortableBtn({ ...options })}
            onSortEnd={setSortedButtonList}
          />
        </SortableBtnListWrap>
      </Modal>
    </Fragment>
  );
}
