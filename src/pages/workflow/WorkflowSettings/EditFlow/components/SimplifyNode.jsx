import React, { useRef, useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Dropdown, Modal, Tooltip } from 'ming-ui/antd-components';

const Box = styled.div`
  min-width: 160px;
  max-width: 261px;
  height: 40px;
  background: var(--color-background-primary);
  box-shadow: 0 1px 4px rgb(0 0 0 / 16%);
  border-radius: 20px;
  padding: 0 12px 0 5px;
  position: relative;
  border: 1px solid var(--color-border-primary);
  transform: translateY(-20px);
  &.workflowItemDisabled {
    opacity: 0.5 !important;
  }
  &.errorShadow {
    box-shadow:
      0 0 1px 1px rgba(244, 67, 54, 1),
      0 1px 4px rgba(0, 0, 0, 0.16);
  }
  .approvalIcon {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
    border-radius: 50%;
    color: var(--color-white);
    font-size: 20px;
  }
  .workflowOperate {
    color: var(--color-text-secondary);
    display: inline-flex;
    align-items: center;
    &:hover {
      color: var(--color-primary);
    }
  }
  .workflowNodeName {
    height: 28px;
    padding: 4px;
    font-size: 15px;
    text-align: left;
    background: var(--color-border-secondary);
    color: var(--color-text-title);
    border: none;
  }
`;

export default props => {
  const {
    processId,
    disabled,
    isCopy,
    item,
    updateNodeName,
    deleteNode,
    nodeClassName,
    IconClassName,
    IconElement,
    allowMoreOperator = true,
    info,
    nodeTriggerFunc = () => {},
    IconTriggerFunc = () => {},
    operatorTriggerFunc = () => {},
    extraOperatorList = [],
  } = props;
  const nodeNameRef = useRef(null);
  const [showOperate, setShowOperate] = useState(false);
  const [editName, setEditName] = useState(false);
  const list = [
    {
      text: _l('修改名称'),
      icon: 'edit',
      events: () => nodeNameEdit(),
    },
    ...extraOperatorList,
    {
      text: _l('删除'),
      icon: 'trash',
      events: () => {
        Modal.confirm({
          title: (
            <span
              style={{
                color: 'var(--color-error)',
              }}
              className="textError"
            >
              {_l('删除“%0”', item.name)}
            </span>
          ),
          okButtonProps: { danger: true },
          onOk: () => {
            deleteNode(processId, item.id);
          },
        });
      },
      danger: true,
    },
  ];
  const menuItems = list.map((menuItem, index) => ({
    key: String(index),
    label: menuItem.text,
    icon: <Icon icon={menuItem.icon} />,
    danger: menuItem.danger,
    onClick: ({ domEvent }) => {
      domEvent.stopPropagation();
      menuItem.events();
      setShowOperate(false);

      if (index === 1) {
        operatorTriggerFunc();
      }
    },
  }));

  // 节点名称编辑
  const nodeNameEdit = () => {
    setEditName(true);
    setTimeout(() => {
      nodeNameRef && nodeNameRef.current.focus();
    }, 100);
  };

  // 修改节点名称
  const updateName = evt => {
    const name = evt.currentTarget.value.trim();

    if (name && name !== item.name) {
      updateNodeName(processId, item.id, name);
    }

    setEditName(false);
  };

  return (
    <Box
      className={cx('flexRow alignItemsCenter', { workflowItemDisabled: disabled || isCopy }, nodeClassName)}
      onMouseDown={nodeTriggerFunc}
    >
      <span
        className={cx('approvalIcon', IconClassName)}
        onMouseDown={e => {
          e.stopPropagation();
          IconTriggerFunc();
        }}
      >
        {IconElement}
      </span>
      <div className="flex Font14 bold ellipsis TxtCenter">
        {editName ? (
          <input
            type="text"
            ref={nodeNameRef}
            className="workflowNodeName"
            defaultValue={item.name}
            onMouseDown={evt => evt.stopPropagation()}
            onKeyDown={evt => evt.keyCode === 13 && updateName(evt)}
            onBlur={updateName}
          />
        ) : (
          <span onClick={nodeNameEdit}>{item.name}</span>
        )}
      </div>
      {info && (
        <Tooltip title={info}>
          <Icon type="info_outline" className="Font14 textSecondary mLeft5" />
        </Tooltip>
      )}
      {allowMoreOperator && (
        <span className="workflowOperate mLeft10">
          <Dropdown
            open={showOperate}
            trigger={['click']}
            placement="bottomRight"
            menu={{
              items: menuItems,
              style: { minWidth: 180 },
              onMouseDown: event => event.stopPropagation(),
            }}
            onOpenChange={setShowOperate}
          >
            <i className="Font18 pointer icon-more_horiz" onMouseDown={e => e.stopPropagation()} />
          </Dropdown>
        </span>
      )}
    </Box>
  );
};
