import React, { useState } from 'react';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Dialog, Icon } from 'ming-ui';

const Wrapper = styled.div`
  .optionIcon {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: #9e9e9e;
    background-color: #fff;

    &:hover {
      color: #1677ff;
      background-color: #f5f5f5;
    }
  }
`;

const OptionMenu = styled.div`
  position: relative !important;
  width: 220px !important;
  padding: 6px 0 !important;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.16);
  border-radius: 3px;
  background: #fff;
`;

const MenuItem = styled.div`
  padding: 0 20px;
  line-height: 36px;
  cursor: pointer;
  &:hover {
    background-color: #f5f5f5;
  }
`;

const RedMenuItem = styled(MenuItem)`
  color: #f44336;
`;

export default function OptionColumn(props) {
  const { id, onDel } = props;
  const [visible, setVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);

  return (
    <Wrapper>
      <Trigger
        action={['click']}
        popupClassName="moreOption"
        getPopupContainer={() => document.body}
        popupVisible={visible}
        onPopupVisibleChange={visible => setVisible(visible)}
        popupAlign={{
          points: ['tr', 'bl'],
          offset: [25, 5],
          overflow: { adjustX: true, adjustY: true },
        }}
        popup={
          <OptionMenu>
            <MenuItem
              onClick={() => {
                window.open(`/dataMirrorPreview/${id}`);
              }}
            >
              {_l('预览数据')}
            </MenuItem>
            <RedMenuItem
              onClick={() => {
                setVisible(false);
                setDialogVisible(true);
              }}
            >
              {_l('删除')}
            </RedMenuItem>
          </OptionMenu>
        }
      >
        <div className="optionIcon">
          <Icon icon="more_horiz" className="Font18 pointer" />
        </div>
      </Trigger>

      {dialogVisible && (
        <Dialog
          title={_l('删除')}
          buttonType="danger"
          visible={dialogVisible}
          description={<div>{_l('不会删除目的地数据库表。')}</div>}
          okText={_l('删除')}
          onOk={() => {
            onDel(() => setDialogVisible(false));
          }}
          onCancel={() => setDialogVisible(false)}
        />
      )}
    </Wrapper>
  );
}
