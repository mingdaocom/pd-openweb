import React, { useState } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Dropdown, Modal } from 'ming-ui/antd-components';

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  .optionIcon {
    color: var(--color-text-tertiary);
    font-size: 16px;
    cursor: pointer;
    display: none;
    &:hover {
      color: var(--color-primary);
    }
  }
`;

export default function OptionColumn({ isDirOption, hideDelete, onAdd, onEdit, onDelete, onLog }) {
  const [visible, setVisible] = useState(false);

  const onDeleteVar = () => {
    setVisible(false);

    Modal.confirm({
      title: <span className="textError">{_l('确定删除这个变量？')}</span>,
      okButtonProps: {
        danger: true,
      },
      content: (
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
      <Dropdown
        trigger={['click']}
        placement="bottomRight"
        getPopupContainer={() => document.body}
        open={visible}
        onOpenChange={setVisible}
        menu={{
          items: isDirOption
            ? [{ key: 'add', label: _l('添加变量') }]
            : [
                { key: 'edit', label: _l('编辑') },
                { key: 'log', label: _l('日志') },
                ...(!hideDelete ? [{ key: 'delete', danger: true, label: _l('删除') }] : []),
              ],
          onClick: ({ key }) => {
            setVisible(false);
            if (key === 'add') {
              onAdd();
            } else if (key === 'edit') {
              onEdit();
            } else if (key === 'log') {
              onLog();
            } else if (key === 'delete') {
              onDeleteVar();
            }
          },
        }}
      >
        <Icon icon="moreop" className="optionIcon" />
      </Dropdown>
    </Wrapper>
  );
}
