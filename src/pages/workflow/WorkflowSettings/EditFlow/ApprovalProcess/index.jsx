import React, { Fragment, useState, useRef } from 'react';
import cx from 'classnames';
import { CreateNode } from '../components';
import styled from 'styled-components';
import { Icon, Dialog } from 'ming-ui';
import { addFlowNode } from '../../../redux/actions';
import _ from 'lodash';
import { Tooltip } from 'antd';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';

const ApprovalProcessBox = styled.div`
  min-width: 309px;
  border-radius: 24px 24px 24px 24px;
  padding: 0 12px;
  &:not(.foldCurrentNode) {
    background: #ededf4;
  }
  &.foldCurrentNode {
    margin-bottom: -20px;
  }
  .addProcessNode {
    margin: 14px 0 48px;
    padding: 0 !important;
    width: auto !important;
    cursor: pointer;
    justify-content: center;
    &:hover {
      .icon-custom_add_circle {
        color: #2196f3 !important;
      }
    }
    &:not(:hover) {
      span {
        color: #757575;
      }
    }
    .icon-custom_add_circle {
      width: auto !important;
      display: flex !important;
      align-items: center;
    }
  }
  .addProcessNodeStart {
    margin-top: -20px;
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: auto;
      width: 1px;
      height: 100%;
      background-color: #ccc;
    }
  }
  .workflowBranch {
    background: #ededf4 !important;
    > .flexColumn {
      .clearLeftBorder::before,
      .clearLeftBorder::after,
      .clearRightBorder::before,
      .clearRightBorder::after {
        background: #ededf4 !important;
      }
    }
  }
  .workflowBranchBtn,
  .icon-custom_add_circle {
    background: #ededf4 !important;
  }
  .Menu.List {
    margin-top: -6px !important;
  }
`;

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
  cursor: pointer;
  &.workflowItemDisabled {
    opacity: 0.5 !important;
  }
  &.active {
    border-color: #2196f3;
    box-shadow: 0 2px 6px rgba(33, 150, 243, 0.4), 0 6px 24px rgba(33, 150, 243, 0.4);
  }
  &.errorShadow {
    box-shadow: 0 0 1px 1px rgba(244, 67, 54, 1), 0 1px 4px rgba(0, 0, 0, 0.16);
  }
  &.errorShadow.active {
    border-color: transparent;
    box-shadow: 0 0 1px 1px rgba(244, 67, 54, 1), 0 2px 6px rgba(244, 67, 54, 0.4), 0 6px 24px rgba(33, 150, 243, 0.4);
  }
  &.foldNode {
    color: #fff;
    background: #2747f9;
    .approvalIcon {
      background: #fff;
      color: #2747f9;
    }
    .workflowOperate {
      color: rgba(255, 255, 255, 0.8);
      &:hover {
        color: #fff;
      }
    }
  }
  .approvalIcon {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #2747f9;
    margin-right: 10px;
    border-radius: 50%;
    color: #fff;
    font-size: 20px;
  }
  .workflowOperate {
    color: #9e9e9e;
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
    color: #333;
    border: none;
  }
`;

export default props => {
  const {
    item,
    disabled,
    selectNodeId,
    openDetail,
    dispatch,
    renderNode,
    hideNodes,
    updateHideNodes,
    isCopy,
    processId,
    updateRefreshThumbnail,
    deleteNode,
    updateNodeName,
  } = props;
  const nodeNameRef = useRef(null);
  const [foldBtn, showFoldBtn] = useState(true);
  const [showOperate, setShowOperate] = useState(false);
  const [editName, setEditName] = useState(false);
  const { flowNodeMap = {}, startEventId, id } = item.processNode || {};
  const isEmpty = (flowNodeMap[startEventId] || {}).nextId === '99';
  const isHide = _.includes(hideNodes, item.id);
  const list = [
    {
      text: _l('修改名称'),
      icon: 'edit',
      events: () => {
        setEditName(true);
        setTimeout(() => {
          nodeNameRef && nodeNameRef.current.focus();
        }, 100);
      },
    },
    {
      text: _l('删除'),
      icon: 'delete1',
      events: () => {
        Dialog.confirm({
          className: 'deleteApprovalProcessDialog',
          title: <span style={{ color: '#f44336' }}>{_l('删除“%0”', item.name)}</span>,
          description: _l('这些已触发的流程实例将不会被执行'),
          onOk: () => {
            deleteNode(processId, item.id);
          },
        });
      },
      className: 'flowNodeDel',
    },
  ];
  const NodeCard = () => (
    <Box
      className={cx(
        'flexRow alignItemsCenter',
        { workflowItemDisabled: disabled || isCopy },
        {
          errorShadow:
            item.selectNodeId &&
            item.isException &&
            (_.isEmpty(flowNodeMap) || item.sourceAppId !== flowNodeMap[startEventId].appId),
        },
        { active: selectNodeId === item.id },
        { foldNode: isHide },
      )}
      onMouseDown={() => {
        if (isHide) {
          changeShrink();
        } else if (!disabled) {
          openDetail(processId, item.id, item.typeId);
          handleFoldBtnTipsPosition();
        }
        setShowOperate(false);
      }}
    >
      <span className="approvalIcon">
        <Icon type="approval" />
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
          item.name
        )}
      </div>
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
                        handleFoldBtnTipsPosition();
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
    </Box>
  );
  const AddBtn = options => {
    return (
      <CreateNode
        {...props}
        {...options}
        item={Object.assign({}, props.item, { id: startEventId })}
        isApproval
        processId={id}
        addFlowNode={(processId, args) => dispatch(addFlowNode(processId, args))}
      />
    );
  };
  const changeShrink = () => {
    const workflowHideNodes = hideNodes.slice();

    if (_.includes(hideNodes, item.id)) {
      _.remove(workflowHideNodes, o => o === item.id);
    } else {
      workflowHideNodes.push(item.id);
    }

    updateHideNodes(workflowHideNodes);
    safeLocalStorageSetItem('workflowHideNodes', JSON.stringify(workflowHideNodes));
    updateRefreshThumbnail();
  };
  // 处理折叠按钮tips位置问题
  const handleFoldBtnTipsPosition = () => {
    showFoldBtn(false);

    setTimeout(() => {
      showFoldBtn(true);
    }, 50);
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
    <div className="flexColumn">
      <section className="workflowBox pTop20 approvalProcessBoxBox" data-id={item.id}>
        <ApprovalProcessBox className={cx('flexColumn', { foldCurrentNode: isHide })}>
          {foldBtn && !isHide ? (
            <Tooltip
              title={() => (
                <span
                  className="workflowBranchBtnSmall Gray_9e ThemeHoverColor3 mTop7"
                  data-tip={isHide ? _l('展开') : _l('收起')}
                  onMouseDown={e => {
                    e.stopPropagation();
                    setShowOperate(false);
                    changeShrink();
                    handleFoldBtnTipsPosition();
                  }}
                >
                  <Icon type={isHide ? 'arrow-down-border' : 'arrow-up-border'} />
                </span>
              )}
              overlayClassName="workflowBranchTips"
              overlayStyle={{ width: 34 }}
              placement="rightTop"
            >
              {NodeCard()}
            </Tooltip>
          ) : (
            NodeCard()
          )}

          {!isHide && startEventId && (
            <Fragment>
              {isEmpty ? (
                AddBtn({ className: 'addProcessNode Gray_75 ThemeHoverColor3', text: _l('步骤'), removeCopyBtn: true })
              ) : (
                <Fragment>
                  {AddBtn({ className: 'addProcessNodeStart' })}
                  {!_.isEmpty(flowNodeMap) &&
                    renderNode({
                      processId: id,
                      data: flowNodeMap,
                      firstId: startEventId,
                      excludeFirstId: true,
                      isApproval: true,
                    })}
                </Fragment>
              )}
            </Fragment>
          )}

          {!startEventId && (
            <div className="Font14 Bold" style={{ color: '#f44336', marginTop: 14, marginBottom: 48 }}>
              {_l('审批流程异常，请删除后重新配置')}
            </div>
          )}
        </ApprovalProcessBox>
      </section>

      <CreateNode {...props} />
    </div>
  );
};
