import React, { Fragment } from 'react';
import cx from 'classnames';
import { CreateNode } from '../components';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { addFlowNode } from '../../../redux/actions';
import _ from 'lodash';

const ApprovalProcessBox = styled.div`
  min-width: 333px;
  border-radius: 24px 24px 24px 24px;
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
  } = props;
  const { flowNodeMap = {}, startEventId, id } = item.processNode;
  const isEmpty = (flowNodeMap[startEventId] || {}).nextId === '99';
  const isHide = _.includes(hideNodes, item.id);
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

  return (
    <div className="flexColumn">
      <section className="workflowBox pTop20 approvalProcessBoxBox" data-id={item.id}>
        <ApprovalProcessBox className={cx('flexColumn', { foldCurrentNode: isHide })}>
          <Box
            className={cx(
              'flexRow alignItemsCenter',
              { workflowItemDisabled: disabled || isCopy },
              { errorShadow: item.selectNodeId && item.isException && _.isEmpty(flowNodeMap) },
              { active: selectNodeId === item.id },
            )}
            onMouseDown={() => !disabled && openDetail(processId, item.id, item.typeId)}
          >
            <span className="approvalIcon">
              <Icon type="approval" />
            </span>
            <div className="flex Font14 bold ellipsis TxtCenter">{item.name}</div>
            <span
              className="mLeft10 ThemeHoverColor3 pointer Gray_9e"
              data-tip={isHide ? _l('展开') : _l('收起')}
              onMouseDown={e => {
                e.stopPropagation();
                changeShrink();
              }}
            >
              <Icon type={isHide ? 'arrow-down-border' : 'arrow-up-border'} />
            </span>
          </Box>

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
                      approvalSelectNodeId: item.selectNodeId,
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
