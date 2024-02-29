import React, { useState } from 'react';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon, Dialog } from 'ming-ui';

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  .optionIcon {
    color: #9e9e9e;
    font-size: 16px;
    cursor: pointer;
    display: none;
    &:hover {
      color: #2196f3;
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

export default function OptionColumn({ isDirOption, onAdd, onEdit, onDelete, onLog }) {
  const [visible, setVisible] = useState(false);

  const onDeleteVar = () => {
    setVisible(false);

    Dialog.confirm({
      title: _l('确定删除这个变量？'),
      buttonType: 'danger',
      description: (
        <div>
          <span>{_l('删除变量后，无法恢复')}</span>
        </div>
      ),
      okText: _l('确定'),
      onOk: onDelete,
    });
  };

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
            {isDirOption ? (
              <MenuItem
                onClick={() => {
                  setVisible(false);
                  onAdd();
                }}
              >
                {_l('添加变量')}
              </MenuItem>
            ) : (
              <React.Fragment>
                <MenuItem
                  onClick={() => {
                    setVisible(false);
                    onEdit();
                  }}
                >
                  {_l('编辑')}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setVisible(false);
                    onLog();
                  }}
                >
                  {_l('日志')}
                </MenuItem>
                <RedMenuItem onClick={onDeleteVar}>{_l('删除')}</RedMenuItem>
              </React.Fragment>
            )}
          </OptionMenu>
        }
      >
        <Icon icon="moreop" className="optionIcon" />
      </Trigger>
    </Wrapper>
  );
}
