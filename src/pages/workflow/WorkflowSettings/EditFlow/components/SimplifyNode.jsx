import React, { useState, useRef } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon, Dialog } from 'ming-ui';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import { Tooltip } from 'antd';

const Box = styled.div`
  min-width: 160px;
  max-width: 261px;
  height: 40px;
  background: #fff;
  box-shadow: 0 1px 4px rgb(0 0 0 / 16%);
  border-radius: 20px;
  padding: 0 12px 0 5px;
  position: relative;
  border: 1px solid #fff;
  transform: translateY(-20px);
  &.workflowItemDisabled {
    opacity: 0.5 !important;
  }
  &.errorShadow {
    box-shadow: 0 0 1px 1px rgba(244, 67, 54, 1), 0 1px 4px rgba(0, 0, 0, 0.16);
  }
  .approvalIcon {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
    border-radius: 50%;
    color: #fff;
    font-size: 20px;
  }
  .workflowOperate {
    color: #757575;
    &:hover {
      color: #2196f3;
    }
  }
  .workflowNodeName {
    height: 28px;
    padding: 4px;
    font-size: 15px;
    text-align: left;
    background: #efefef;
    color: #151515;
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
    {
      text: _l('删除'),
      icon: 'delete1',
      events: () => {
        Dialog.confirm({
          className: 'deleteApprovalProcessDialog',
          title: <span style={{ color: '#f44336' }}>{_l('删除“%0”', item.name)}</span>,
          onOk: () => {
            deleteNode(processId, item.id);
          },
        });
      },
      className: 'flowNodeDel',
    },
  ];
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
          <Icon type="info_outline" className="Font14 Gray_75 mLeft5" />
        </Tooltip>
      )}
      {allowMoreOperator && (
        <span className="workflowOperate mLeft10">
          <Trigger
            popupVisible={showOperate}
            action={['click']}
            popup={
              showOperate ? (
                <div className="flowNodeOperateList" style={{ minWidth: 180 }}>
                  <ul>
                    {list.map((item, index) => (
                      <li
                        key={index}
                        className={cx(item.className)}
                        onMouseDown={e => {
                          e.stopPropagation();
                          item.events();
                          setShowOperate(false);
                          index === 1 && operatorTriggerFunc();
                        }}
                      >
                        <Icon icon={item.icon} />
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div />
              )
            }
            popupAlign={{ points: ['tr', 'br'] }}
            onPopupVisibleChange={showOperate => setShowOperate(showOperate)}
          >
            <i className="Font18 pointer icon-more_horiz" onMouseDown={e => e.stopPropagation()} />
          </Trigger>
        </span>
      )}
    </Box>
  );
};
