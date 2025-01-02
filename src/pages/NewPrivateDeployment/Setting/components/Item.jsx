import React, { useState } from 'react';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import { Icon, Menu, MenuItem, Switch } from 'ming-ui';

export const EmptyWrap = styled.div`
  height: 48px;
  line-height: 46px;
  border-radius: 3px;
  border: 1px solid #e6e6e6;
`;
export const MyItem = styled(EmptyWrap)`
  display: flex;
  align-items: center;
  padding: 0 15px 0 7px;
  margin-bottom: 12px;
  .iconImg {
    width: 20px;
    height: 20px;
    margin-right: 8px;
  }
`;

export const ActionWrap = styled(Menu)`
  width: 160px !important;
  .ming.MenuItem .Item-content:not(.disabled):hover {
    background-color: #f5f5f5 !important;
    color: #151515 !important;
  }
  .ming.MenuItem .Item-content.disabled {
    color: #9e9e9e;
    background-color: #f5f5f5 !important;
  }
  .delete {
    color: #f51744;
  }
`;

export default function Item(props) {
  const { item, className, dragIcon = null, onEdit = () => {}, onDelete = () => {}, onSwitch = () => {} } = props;
  const [visible, setVisible] = useState(false);

  const handleEdit = () => {
    setVisible(false);
    onEdit(item);
  };

  const handleDelete = () => {
    setVisible(false);
    onDelete(item);
  };

  return (
    <MyItem className={className}>
      {dragIcon}
      <img src={item.icon} className="iconImg" />
      <div className="mLeft6 mRight12">{item.name}</div>
      <div className="Font13 Gray_9e flex">{item.desc || ''}</div>
      <Switch size="small" checked={item.status === 1 ? true : false} onClick={onSwitch} />
      <Trigger
        popupVisible={visible}
        onPopupVisibleChange={value => setVisible(value)}
        action={['click']}
        popupAlign={{
          points: ['tr', 'br'],
          offset: [-160, 15],
          overflow: { adjustX: true, adjustY: true },
        }}
        popup={() => {
          return (
            <ActionWrap>
              <MenuItem onClick={handleEdit}>{_l('编辑')}</MenuItem>
              <MenuItem className="delete" onClick={handleDelete}>
                {_l('删除')}
              </MenuItem>
            </ActionWrap>
          );
        }}
      >
        <Icon icon="moreop" className="Font16 Hand mLeft15" />
      </Trigger>
    </MyItem>
  );
}
