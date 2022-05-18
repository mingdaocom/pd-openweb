import React, { Component } from 'react';
import './index.less';
import cx from 'classnames';
import BranchItem from './BranchItem';
import { CreateNode } from '../components';
import { Tooltip } from 'antd';

export default class Branch extends Component {
  constructor(props) {
    super(props);
  }

  renderTips = () => {
    const { item, isCopy, hideNodes } = this.props;
    const isHide = _.includes(hideNodes, item.id);

    if (isCopy) return null;

    return (
      <div className="flexRow alignItemsCenter">
        {!isHide && (
          <span
            className="workflowBranchBtnSmall Gray_9e ThemeHoverColor3 workflowBranchBtnSmallTips"
            onClick={this.switchBranchType}
            data-tip={
              item.gatewayType === 1
                ? _l('转为唯一分支：只执行第一个满足条件的分支下的节点序列，其他分支均不执行')
                : _l('转为包容分支：满足任一分支条件的节点序列均同步执行，直至合并')
            }
          >
            <i className="icon-swap_horiz" />
          </span>
        )}

        <span
          className="workflowBranchBtnBig mLeft8 mRight8"
          data-tip={isHide ? _l('展开') : item.gatewayType === 1 ? _l('包容分支(点击折叠)') : _l('唯一分支(点击折叠)')}
          onClick={this.changeShrink}
        />

        {!isHide && (
          <span
            className="workflowBranchBtnSmall Gray_9e ThemeHoverColor3"
            data-tip={_l('添加分支')}
            onClick={() => {
              this.props.addFlowNode({ prveId: item.id, name: '', typeId: 2 });
            }}
          >
            <i className="icon-add" />
          </span>
        )}
      </div>
    );
  };

  /**
   * 展开收起
   */
  changeShrink = () => {
    const { item, hideNodes, updateHideNodes } = this.props;
    const workflowHideNodes = hideNodes.slice();

    if (_.includes(hideNodes, item.id)) {
      _.remove(workflowHideNodes, o => o === item.id);
    } else {
      workflowHideNodes.push(item.id);
    }

    updateHideNodes(workflowHideNodes);
    localStorage.setItem('workflowHideNodes', JSON.stringify(workflowHideNodes));
  };

  /**
   * 切换网关类型
   */
  switchBranchType = () => {
    const { item, updateBranchGatewayType } = this.props;

    updateBranchGatewayType(item.id, item.gatewayType === 1 ? 2 : 1);
  };

  render() {
    const { data, item, hideNodes } = this.props;
    const showAddBtn = !item.resultTypeId;
    const isHide = _.includes(hideNodes, item.id);

    return (
      <div className={cx('flexColumn', { workflowBranchHide: isHide })}>
        <div className={cx('workflowBranch', { pTop0: !showAddBtn })}>
          {showAddBtn && (
            <Tooltip title={this.renderTips} overlayClassName="workflowBranchTips" align={{ offset: [0, 34] }}>
              <i
                className={cx(
                  'workflowBranchBtn',
                  isHide ? 'icon-milestone1' : item.gatewayType === 1 ? 'icon-all_run' : 'icon-run_a',
                )}
              >
                {isHide && <span className="Font16 White workflowBranchNumber bold">{item.flowIds.length}</span>}
              </i>
            </Tooltip>
          )}
          {!isHide &&
            item.flowIds.map((id, i) => {
              return (
                <BranchItem
                  key={id}
                  {...this.props}
                  prveId={item.id}
                  item={data[id]}
                  clearBorderType={i === 0 ? -1 : i === item.flowIds.length - 1 ? 1 : 0}
                />
              );
            })}
        </div>
        <CreateNode {...this.props} />
      </div>
    );
  }
}
