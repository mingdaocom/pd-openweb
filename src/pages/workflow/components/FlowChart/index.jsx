import React, { Component, Fragment, memo } from 'react';
import { Popup } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import { string } from 'prop-types';
import styled from 'styled-components';
import { Icon, LoadDiv, Modal } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import flowNode from '../../api/flowNode';
import { getTranslateInfo } from 'src/utils/app';
import { browserIsMobile } from 'src/utils/common';
import nodeModules from '../../WorkflowSettings/EditFlow/nodeModules';
import { NODE_TYPE } from '../../WorkflowSettings/enum';
import { getSameLevelIds } from '../../WorkflowSettings/utils';
import '../../WorkflowSettings/EditFlow/index.less';
import './index.less';

const Start = styled.div`
  padding: 0 0 32px 0 !important;
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
  .flexRow {
    height: 40px;
    background: #fff;
    box-shadow: 0 1px 4px 1px rgba(0, 0, 0, 0.12);
    border-radius: 20px;
    padding: 0 30px 0 5px;
    position: relative;
    span {
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
  }
`;

const End = styled.div`
  height: 40px;
  line-height: 40px;
  background: #fff;
  box-shadow: 0 1px 4px 1px rgba(0, 0, 0, 0.12);
  border-radius: 20px;
  position: relative;
  padding: 0 30px;
`;

const Legend = styled.div`
  margin-left: 12px;
  font-size: 12px;
  .legendLine {
    width: 12px;
    height: 3px;
    margin-right: 8px;
  }
`;

export class FlowChart extends Component {
  static propTypes = {
    appId: string.isRequired,
    processId: string.isRequired,
    instanceId: string.isRequired,
    selectNodeId: string,
  };

  state = {
    scale: 100,
    parentId: '',
    startEventId: '',
    flowNodeMap: {},
    execIds: [],
    execPendingIds: [],
    execLineComplete: false,
  };

  componentWillMount() {
    const { processId, instanceId } = this.props;

    flowNode.get({ processId, instanceId }).then(result => {
      this.setState({
        parentId: result.parentId,
        startEventId: result.startEventId,
        flowNodeMap: result.flowNodeMap,
        execIds: result.execIds,
        execPendingIds: result.execPendingIds,
      });
    });
  }

  componentDidUpdate() {
    const { execIds, execPendingIds } = this.state;

    if (!this.state.execLineComplete) {
      this.changeScreenWidth();
      this.setViewCenter();
      this.renderLine(execIds);
      this.renderLine(execPendingIds, true);
      this.fullDisplay();
      this.setState({ execLineComplete: true });
    }
  }

  changeScreenWidth() {
    const $box = $('.flowChartModal .workflowEdit');
    const $content = $box.find('.workflowEditContent');
    let maxWidth = $box.width();

    $content.find('> .flexColumn > .workflowBranch').map((i, item) => {
      if (maxWidth < $(item).innerWidth()) {
        maxWidth = $(item).innerWidth();
      }
    });

    $content.width(maxWidth);
  }

  setViewCenter() {
    const box = $('.flowChartModal .workflowEdit')[0] || {};
    const scrollWidth = box.scrollWidth;
    const width = box.clientWidth;

    if (scrollWidth > width) {
      $('.flowChartModal .workflowEdit').scrollLeft((scrollWidth - width) / 2);
    }
  }

  /**
   * 渲染线
   */
  renderLine(ids, isPending = false) {
    const { selectNodeId } = this.props;
    const { flowNodeMap, execIds, execPendingIds } = this.state;

    ids.forEach((id, index) => {
      const $el = $(`.flowChartModal .workflowBox[data-id=${id}]`);

      if (isPending) {
        $(`.flowChartModal .workflowBox[data-id=${id}],.workflowBranch[data-id=${id}]`).addClass('workflowBoxPending');
      } else {
        $el.parent().addClass('executed');
      }

      // 已执行的高亮
      if (!isPending || id === selectNodeId) {
        $el.find('> .workflowItem').removeClass('workflowItemDisabled');
      }

      if (flowNodeMap[id].typeId === NODE_TYPE.BRANCH) {
        const { flowIds, gatewayType } = flowNodeMap[id];
        const $branchEl = $(`.flowChartModal .workflowBranch[data-id=${id}]`).toggleClass(
          'workflowInclusionBranch',
          gatewayType === 1,
        );
        const branchLeft = $branchEl.offset().left;
        const branchWidth = $branchEl.innerWidth();

        if (index === ids.length - 1) {
          $branchEl
            .siblings('.workflowLineBtn')
            .toggleClass('workflowBoxPending', isPending)
            .append('<div class="workflowExecLine" />');

          return;
        }

        // 包含分支最后一个经过节点id
        let lastId;
        if (gatewayType === 1) {
          flowIds.forEach(o => {
            if (_.includes(ids, o)) {
              lastId = o;
            }
          });
        }

        const $nextEl = $(`.flowChartModal .workflowBox[data-id=${ids[index + 1]}]`);
        const nextLeft = $nextEl.offset().left;
        const nextWidth = $nextEl.innerWidth();
        const diffWidth = branchWidth / 2 + branchLeft - (nextWidth / 2 + nextLeft);
        let moreBranchWidth = 0;

        // 经过分支多个补充宽度
        if (lastId && lastId !== ids[index + 1]) {
          const $lastEl = $(`.flowChartModal .workflowBox[data-id=${lastId}]`);
          const lastLeft = $lastEl.offset().left;
          const lastWidth = $lastEl.innerWidth();
          const lastDiffWidth = branchWidth / 2 + branchLeft - (lastWidth / 2 + lastLeft);

          if (diffWidth > 0 && lastDiffWidth < 0) {
            moreBranchWidth = Math.abs(lastDiffWidth);
          } else if (diffWidth < 0 && lastDiffWidth < 0) {
            moreBranchWidth = Math.abs(lastDiffWidth) - Math.abs(diffWidth);
          }
        }

        const lineStyle = `width: ${Math.abs(diffWidth) + 2 + moreBranchWidth}px;margin-left:${
          diffWidth > 0 ? `${Math.ceil(branchWidth / 2 - diffWidth) - 1}px;` : `${Math.floor(branchWidth / 2) - 1}px;`
        }`;

        $branchEl.prepend(`<div class="workflowExecTopLine" style="${lineStyle}" />`);
      } else {
        $el.prepend('<div class="workflowExecLine" />');
      }

      // 分支下线
      if (flowNodeMap[id].typeId !== NODE_TYPE.BRANCH && !flowNodeMap[id].nextId) {
        ids
          .slice(0, index)
          .concat(isPending ? execIds : [])
          .reverse()
          .forEach(key => {
            if (
              flowNodeMap[key].typeId === NODE_TYPE.BRANCH &&
              (_.includes(['', '99'], flowNodeMap[key].nextId) ||
                (!isPending && (!execPendingIds.length || _.includes(execPendingIds, flowNodeMap[key].nextId))) ||
                isPending)
            ) {
              const $branchEl = $(`.flowChartModal .workflowBranch[data-id=${key}]`);
              const $btn = $branchEl.siblings('.workflowLineBtn');
              let nextIsPadding = false;

              if (
                (flowNodeMap[key].nextId === '99' && !!execPendingIds.length) ||
                _.includes(execPendingIds, flowNodeMap[key].nextId)
              ) {
                nextIsPadding = true;
              }

              if (!$branchEl.find('> .workflowExecBottomLine').length) {
                $branchEl.toggleClass(
                  'workflowBoxBranchPending',
                  _.includes(execIds, flowNodeMap[key].nextId) ? false : isPending || nextIsPadding,
                );
                $branchEl.append(
                  `<div class="workflowExecBottomLine" style="${$branchEl
                    .find('> .workflowExecTopLine')
                    .attr('style')}"/>`,
                );
              }

              if (!$btn.find('> .workflowExecLine').length) {
                $btn
                  .toggleClass(
                    'workflowBoxPending',
                    _.includes(execIds, flowNodeMap[key].nextId) ? false : isPending || nextIsPadding,
                  )
                  .append('<div class="workflowExecLine" />');
              }

              $branchEl.find('.workflowExecLine').eq(0).closest('.flexColumn').addClass('workflowExecBeforeLine');
            }
          });
      }
    });

    $('.workflowExecLine').each((item, el) => {
      const $el = $(el);

      $el.height(_.max([$el.closest('.executed').innerHeight(), $el.closest('.workflowBoxPending').innerHeight()]));
    });
  }

  /**
   * 渲染节点卡片
   */
  renderNode = ({ processId, data, firstId, excludeFirstId = false }) => {
    const { parentId } = this.state;
    const { appId } = this.props;
    return getSameLevelIds(data, firstId, excludeFirstId).map(id => {
      const item = data[id];
      const props = {
        key: id,
        processId,
        data,
        item: {
          ...item,
          name: getTranslateInfo(appId, parentId, item.id).nodename || item.name,
        },
        disabled: true,
        renderNode: this.renderNode,
      };

      if (!data[id] || !_.includes([NODE_TYPE.BRANCH, NODE_TYPE.APPROVAL], data[id].typeId)) return null;

      const NodeComponent = nodeModules[data[id].typeId];

      return <NodeComponent {...props} />;
    });
  };

  /**
   * 完整显示
   */
  fullDisplay = () => {
    const $content = $('.flowChartModal .workflowEdit')[0];

    if ($content.clientHeight < $content.scrollHeight) {
      let scale = Math.floor((($content.clientHeight / $content.scrollHeight) * this.state.scale) / 10) * 10;

      if (scale <= 50) scale = 50;
      if (scale >= 100) scale = 100;

      this.setState({ scale });
    }
  };

  render() {
    const { processId } = this.props;
    const { scale, startEventId, flowNodeMap } = this.state;
    const isMobile = browserIsMobile();

    return (
      <div className="workflowEdit flexRow workflowEditRelease flex">
        {!startEventId ? (
          <LoadDiv />
        ) : (
          <div
            className="workflowEditContent"
            style={{ transform: `scale(${scale / 100})`, transformOrigin: 'center top' }}
          >
            <div className="flexColumn">
              <Start className="workflowBox" data-id={startEventId}>
                <div className="flexRow alignItemsCenter Font14 bold Gray_75">
                  <span>
                    <Icon type="approval" />
                  </span>
                  {_l('流程开始')}
                </div>
              </Start>
            </div>
            {this.renderNode({ processId, data: flowNodeMap, firstId: startEventId, excludeFirstId: true })}
            <div className="flexColumn">
              <div className="workflowBox pTop0 mBottom20" data-id="99">
                <End className="Font14 bold Gray_75">
                  <div>{_l('结束')}</div>
                </End>
              </div>
            </div>
          </div>
        )}

        <div className={cx('workflowEditBtn', { mobile: isMobile })}>
          <Tooltip title={isMobile ? '' : _l('缩小')}>
            <span>
              <i
                className={cx('icon-minus', { ThemeHoverColor3: !isMobile }, { disabled: scale === 50 })}
                onClick={() => scale > 50 && this.setState({ scale: scale - 10 })}
              />
            </span>
          </Tooltip>
          <span className="Font14 mRight8 TxtCenter" style={{ width: 40 }}>
            {scale}%
          </span>
          <Tooltip title={isMobile ? '' : _l('放大')}>
            <span>
              <i
                className={cx('icon-add', { ThemeHoverColor3: !isMobile }, { disabled: scale === 100 })}
                onClick={() => scale < 100 && this.setState({ scale: scale + 10 })}
              />
            </span>
          </Tooltip>

          <Tooltip title={isMobile ? '' : _l('适应高度')}>
            <span>
              <i className={cx('icon-settings_overscan', { ThemeHoverColor3: !isMobile })} onClick={this.fullDisplay} />
            </span>
          </Tooltip>

          {!isMobile && (
            <Fragment>
              <span className="workflowEditBtnLine" />

              <Legend className="flexRow alignItemsCenter">
                <div className="legendLine" style={{ background: '#1677ff' }} />
                <div>{_l('已执行')}</div>
              </Legend>
              <Legend className="flexRow alignItemsCenter mLeft20">
                <div className="legendLine" style={{ background: '#ccc' }} />
                <div>{_l('待执行')}</div>
              </Legend>
            </Fragment>
          )}
        </div>
      </div>
    );
  }
}

export default memo(({ appId, processId, instanceId, selectNodeId, onClose = () => {} }) => {
  return (
    <Modal
      visible
      className="flowChartModal"
      closable={false}
      title={
        <div className="flexRow valignWrapper">
          <div className="flex Font17 bold">{_l('流转图')}</div>
          <Icon className="Gray_75 Font20 pointer" icon="close" onClick={onClose} />
        </div>
      }
      type="fixed"
      width={window.outerWidth - 60}
      onCancel={onClose}
    >
      <FlowChart appId={appId} processId={processId} instanceId={instanceId} selectNodeId={selectNodeId} />
    </Modal>
  );
});

export const MobileFlowChart = memo(({ appId, processId, instanceId, selectNodeId, onClose = () => {} }) => {
  return (
    <Popup className="flowChartModal mobileModal full" onClose={onClose} visible={true}>
      <Icon className="Gray_75 Font22 pointer mobileClose" icon="cancel" onClick={onClose} />
      <FlowChart appId={appId} processId={processId} instanceId={instanceId} selectNodeId={selectNodeId} />
    </Popup>
  );
});
