import React, { Component, Fragment } from 'react';
import { Tooltip } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Dialog, Radio } from 'ming-ui';
import { CreateNode } from '../components';
import BranchItem from './BranchItem';
import './index.less';

export default class Branch extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    showTips: true,
    showBranchTypeDialog: false,
    gatewayType: 1,
  };

  renderTips = () => {
    const { processId, item, isCopy } = this.props;

    if (isCopy) return null;

    return (
      <div className="flexRow alignItemsCenter">
        <span
          className="workflowBranchBtnSmall Gray_75 ThemeHoverColor3"
          data-tip={_l('添加分支')}
          onClick={() => {
            this.props.addFlowNode(processId, { prveId: item.id, name: '', typeId: 2 });
            this.handleTipsPosition();
          }}
        >
          <i className="icon-add" />
        </span>

        <span
          className="workflowBranchBtnBig mLeft8 mRight8"
          data-tip={item.gatewayType === 1 ? _l('并行分支') : _l('唯一分支')}
          onClick={() => {
            this.handleTipsPosition();
            this.setState({ showBranchTypeDialog: true, gatewayType: item.gatewayType });
          }}
        />

        <span
          className="workflowBranchBtnSmall Gray_75 ThemeHoverColor3"
          onClick={this.changeShrink}
          data-tip={_l('收起')}
        >
          <i className={'icon-arrow-up-border'} />
        </span>
      </div>
    );
  };

  /**
   * 展开收起
   */
  changeShrink = () => {
    const { item, hideNodes, updateHideNodes, updateRefreshThumbnail } = this.props;
    const workflowHideNodes = hideNodes.slice();

    if (_.includes(hideNodes, item.id)) {
      _.remove(workflowHideNodes, o => o === item.id);
    } else {
      workflowHideNodes.push(item.id);
    }

    updateHideNodes(workflowHideNodes);
    safeLocalStorageSetItem('workflowHideNodes', JSON.stringify(workflowHideNodes));
    updateRefreshThumbnail();
    this.handleTipsPosition();
  };

  /**
   * 切换网关类型
   */
  switchBranchType = gatewayType => {
    const { processId, item, updateBranchGatewayType } = this.props;

    updateBranchGatewayType(processId, item.id, gatewayType);
  };

  /**
   * 处理tips位置问题
   */
  handleTipsPosition() {
    this.setState({ showTips: false });

    setTimeout(() => {
      this.setState({ showTips: true });
    }, 50);
  }

  render() {
    const { data, item, hideNodes, disabled } = this.props;
    const { showTips, showBranchTypeDialog, gatewayType } = this.state;
    const showAddBtn = !item.resultTypeId && !disabled;
    const isHide = _.includes(hideNodes, item.id);
    const BRANCH_TYPE = [
      {
        text: _l('唯一分支'),
        value: 2,
        desc: _l('按照从左到右的顺序，只执行第一个符合条件的分支。其他分支即使符合条件也不再执行'),
      },
      {
        text: _l('并行分支'),
        value: 1,
        desc: _l('执行所有符合条件的分支。等待网关内所有分支全部执行完成后，再继续执行网关外的节点'),
      },
    ];

    return (
      <div className={cx('flexColumn', { workflowBranchHide: isHide })}>
        <div className={cx('workflowBranch', { pTop0: !showAddBtn })} data-id={item.id}>
          {showAddBtn && showTips && (
            <Fragment>
              {isHide ? (
                <i className={cx('workflowBranchBtn icon-milestone1', { ThemeColor3: isHide })}>
                  <span
                    className="Font16 workflowBranchNumber bold pointer"
                    data-tip={_l('展开')}
                    onClick={this.changeShrink}
                  >
                    {item.flowIds.length}
                  </span>
                </i>
              ) : (
                <Tooltip title={this.renderTips} overlayClassName="workflowBranchTips" align={{ offset: [0, 34] }}>
                  <i className="workflowBranchBtn icon-milestone1">
                    <span className={cx('Font16', item.gatewayType === 1 ? 'icon-all_run2' : 'icon-clear_bold')} />
                  </i>
                </Tooltip>
              )}
            </Fragment>
          )}
          {!isHide &&
            item.flowIds.map((id, i) => {
              return (
                <BranchItem
                  key={id}
                  {...this.props}
                  index={i}
                  prveId={item.id}
                  item={data[id]}
                  clearBorderType={i === 0 ? -1 : i === item.flowIds.length - 1 ? 1 : 0}
                  flowIds={item.flowIds}
                />
              );
            })}
        </div>
        <CreateNode {...this.props} />

        {showBranchTypeDialog && (
          <Dialog
            visible
            width={560}
            title={_l('分支类型')}
            onOk={() => {
              this.switchBranchType(gatewayType);
              this.setState({ showBranchTypeDialog: false });
            }}
            onCancel={() => this.setState({ showBranchTypeDialog: false })}
          >
            {BRANCH_TYPE.map((o, index) => (
              <div className={cx('flexColumn', { mTop15: index > 0 })} key={index}>
                <Radio
                  className="Font15 bold"
                  text={o.text}
                  checked={o.value === gatewayType}
                  onClick={() => this.setState({ gatewayType: o.value })}
                />
                <div className="mTop5 mLeft30 Gray_75">{o.desc}</div>
              </div>
            ))}
          </Dialog>
        )}
      </div>
    );
  }
}
