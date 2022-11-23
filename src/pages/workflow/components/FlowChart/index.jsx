import React, { Component, memo } from 'react';
import { string } from 'prop-types';
import { LoadDiv, Icon } from 'ming-ui';
import styled from 'styled-components';
import { get } from '../../api/flowNode';
import { getSameLevelIds } from '../../WorkflowSettings/utils';
import nodeModules from '../../WorkflowSettings/EditFlow/nodeModules';
import { NODE_TYPE } from '../../WorkflowSettings/enum';
import cx from 'classnames';

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
  position: absolute;
  left: 32px;
  font-size: 12px;
  .legendLine {
    width: 30px;
    height: 3px;
    margin-right: 16px;
  }
`;

class FlowChart extends Component {
  static propTypes = {
    processId: string.isRequired,
    instanceId: string.isRequired,
  };

  state = {
    scale: 100,
    startEventId: '',
    flowNodeMap: {},
    execIds: [],
    execPendingIds: [],
    execLineComplete: false,
  };

  componentWillMount() {
    const { processId, instanceId } = this.props;

    get({ processId, instanceId }).then(result => {
      this.setState({
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
    const $box = $('.workflowEdit');
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
    const box = document.getElementsByClassName('workflowEdit')[0] || {};
    const scrollWidth = box.scrollWidth;
    const width = box.clientWidth;

    if (scrollWidth > width) {
      $('.workflowEdit').scrollLeft((scrollWidth - width) / 2);
    }
  }

  /**
   * 渲染线
   */
  renderLine(ids, isPending = false) {
    const { flowNodeMap, execIds, execPendingIds } = this.state;

    ids.forEach((id, index) => {
      const $el = $(`.workflowBox[data-id=${id}]`);

      if (isPending) {
        $(`.workflowBox[data-id=${id}],.workflowBranch[data-id=${id}]`).addClass('workflowBoxPending');
      }

      // 已执行的高亮 或者 未执行的第一个高亮
      if (!isPending || (isPending && index === 0)) {
        $el.find('> .workflowItem').removeClass('workflowItemDisabled');
      }

      if (flowNodeMap[id].typeId === NODE_TYPE.BRANCH) {
        const $branchEl = $(`.workflowBranch[data-id=${id}]`);
        const branchLeft = $branchEl.offset().left;
        const branchWidth = $branchEl.innerWidth();

        if (index === ids.length - 1) {
          $branchEl
            .siblings('.workflowLineBtn')
            .toggleClass('workflowBoxPending', isPending)
            .append('<div class="workflowExecLine" />');

          return;
        }

        const $nextEl = $(`.workflowBox[data-id=${ids[index + 1]}]`);
        const nextLeft = $nextEl.offset().left;
        const nextWidth = $nextEl.innerWidth();

        const diffWidth = branchWidth / 2 + branchLeft - (nextWidth / 2 + nextLeft);
        const isLeft = diffWidth > 0;
        const lineStyle = `width: ${Math.abs(diffWidth) + 2}px;margin-left:${
          isLeft ? `${Math.ceil(branchWidth / 2 - diffWidth) - 1}px;` : `${Math.floor(branchWidth / 2) - 1}px;`
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
                (!isPending && _.includes(execPendingIds, flowNodeMap[key].nextId)) ||
                isPending)
            ) {
              const $branchEl = $(`.workflowBranch[data-id=${key}]`);
              const $btn = $branchEl.siblings('.workflowLineBtn');

              if (!$branchEl.find('> .workflowExecBottomLine').length) {
                $branchEl.toggleClass('workflowBoxBranchPending', isPending);
                $branchEl.append(
                  `<div class="workflowExecBottomLine" style="${$branchEl
                    .find('> .workflowExecTopLine')
                    .attr('style')}"/>`,
                );
              }

              if (!$btn.find('> .workflowExecLine').length) {
                $btn.toggleClass('workflowBoxPending', isPending).append('<div class="workflowExecLine" />');
              }

              $branchEl
                .find('.workflowExecLine')
                .eq(0)
                .closest('.flexColumn')
                .addClass('workflowExecBeforeLine');
            }
          });
      }
    });
  }

  /**
   * 渲染节点卡片
   */
  renderNode = ({ processId, data, firstId, excludeFirstId = false }) => {
    return getSameLevelIds(data, firstId, excludeFirstId).map(id => {
      const props = {
        key: id,
        processId,
        data,
        item: data[id],
        disabled: true,
        renderNode: this.renderNode,
      };

      if (!data[id]) return null;

      const NodeComponent = nodeModules[data[id].typeId];

      return <NodeComponent {...props} />;
    });
  };

  /**
   * 完整显示
   */
  fullDisplay = () => {
    const $content = $('.workflowEdit')[0];

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

        <div className="workflowEditBtns">
          <span data-tip={_l('放大')}>
            <i
              className={cx('icon-add ThemeHoverColor3', { disabled: scale === 100 })}
              onClick={() => scale < 100 && this.setState({ scale: scale + 10 })}
            />
          </span>
          <span data-tip={_l('缩小')}>
            <i
              className={cx('icon-maximizing_a2 ThemeHoverColor3', { disabled: scale === 50 })}
              onClick={() => scale > 50 && this.setState({ scale: scale - 10 })}
            />
          </span>
          <span className="Font14 mLeft10">{scale}%</span>
          <span className="mLeft15 Gray_75 ThemeHoverColor3 pointer" onClick={this.fullDisplay}>
            {_l('完整显示')}
          </span>
        </div>

        <Legend className="flexRow alignItemsCenter" style={{ top: 130 }}>
          <div className="legendLine" style={{ background: '#2196f3' }} />
          <div>{_l('已执行')}</div>
        </Legend>

        <Legend className="flexRow alignItemsCenter" style={{ top: 160 }}>
          <div className="legendLine" style={{ background: '#ccc' }} />
          <div>{_l('待执行')}</div>
        </Legend>
      </div>
    );
  }
}

export default memo(FlowChart);
