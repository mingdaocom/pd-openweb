import React, { Fragment, useRef, useState } from 'react';
import { Tooltip } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { CreateNode, SimplifyNode } from '../components';
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
  .processNodeStartLine {
    position: relative;
    width: 100%;
    height: 32px;
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
  .foldNode {
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
  > .flexRow {
    &:hover {
      .icon-approval {
        display: none;
      }
      .icon-launch {
        display: block;
      }
    }
  }
  .approvalIcon {
    cursor: pointer;
    background: #2747f9;
    &:hover {
      background-color: #122ec9;
    }
  }
  .icon-launch {
    display: none;
  }
`;

export default props => {
  const { item, renderNode, hideNodes, updateHideNodes, updateRefreshThumbnail } = props;
  const nodeNameRef = useRef(null);
  const [foldBtn, showFoldBtn] = useState(true);
  const { flowNodeMap = {}, startEventId, id } = item.processNode || {};
  const isHide = _.includes(hideNodes, item.id);
  const NodeCard = () => (
    <Box>
      <SimplifyNode
        {...props}
        nodeClassName={cx(
          {
            errorShadow:
              item.selectNodeId &&
              item.isException &&
              (_.isEmpty(flowNodeMap) || item.sourceAppId !== flowNodeMap[startEventId].appId),
          },
          { foldNode: isHide },
        )}
        IconElement={
          <Fragment>
            <Icon type="approval" />
            <Icon type="launch" />
          </Fragment>
        }
        nodeTriggerFunc={() => isHide && changeShrink()}
        IconTriggerFunc={() => window.open(`/workflowedit/${id}`)}
        operatorTriggerFunc={handleFoldBtnTipsPosition}
      />
    </Box>
  );
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

  return (
    <div className="flexColumn">
      <section className="workflowBox pTop20 approvalProcessBoxBox" data-id={item.id}>
        <ApprovalProcessBox className={cx('flexColumn', { foldCurrentNode: isHide })}>
          {foldBtn && !isHide ? (
            <Tooltip
              autoCloseDelay={0}
              title={() => (
                <span
                  className="workflowBranchBtnSmall Gray_75 ThemeHoverColor3 mTop7"
                  data-tip={isHide ? _l('展开') : _l('收起')}
                  onMouseDown={() => {
                    nodeNameRef && nodeNameRef.current && nodeNameRef.current.blur();
                    changeShrink();
                    handleFoldBtnTipsPosition();
                  }}
                >
                  <Icon type={isHide ? 'arrow-down-border' : 'arrow-up-border'} />
                </span>
              )}
              overlayClassName="workflowBranchTips"
              overlayStyle={{ width: 34 }}
              align={{ offset: [0, -20] }}
              placement="rightTop"
            >
              {NodeCard()}
            </Tooltip>
          ) : (
            NodeCard()
          )}

          {!isHide && startEventId && (
            <Fragment>
              <div className="processNodeStartLine" />
              {!_.isEmpty(flowNodeMap) &&
                renderNode({
                  processId: id,
                  data: flowNodeMap,
                  firstId: startEventId,
                  isApproval: true,
                })}
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
