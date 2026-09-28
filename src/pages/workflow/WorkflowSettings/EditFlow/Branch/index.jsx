import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Modal, Radio, Tooltip } from 'ming-ui/antd-components';
import { CreateNode, SimplifyNode } from '../components';
import BranchItem from './BranchItem';
import './index.less';

export default class Branch extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    showBranchTypeDialog: false,
    gatewayType: 1,
  };

  openBranchTypeDialog = () => {
    const { item, isCopy, disabled } = this.props;

    if (isCopy || disabled) return;

    this.setState({ showBranchTypeDialog: true, gatewayType: item.gatewayType });
  };

  renderGateway = () => {
    const { processId, item, isCopy } = this.props;
    const gatewayTypeName = item.gatewayType === 1 ? _l('并行分支') : _l('唯一分支');
    const gatewayName = item.name || gatewayTypeName;

    return (
      <div className="workflowGatewayNode">
        {!isCopy && (
          <Tooltip title={_l('收起')}>
            <span
              className="workflowGatewayAction workflowGatewayFold textSecondary hoverColorPrimary"
              onClick={this.changeShrink}
            >
              <Icon icon="arrow-up-border" />
            </span>
          </Tooltip>
        )}

        <SimplifyNode
          {...this.props}
          item={{ ...item, name: gatewayName }}
          nodeClassName="workflowGatewayCard"
          IconClassName={cx('workflowGatewayIcon', { pointer: !isCopy })}
          IconTriggerFunc={this.openBranchTypeDialog}
          IconElement={
            <Tooltip title={gatewayTypeName}>
              <Icon icon={item.gatewayType === 1 ? 'branch-parallel' : 'branch-exclusive'} />
            </Tooltip>
          }
          allowMoreOperator={!isCopy}
          extraOperatorList={[
            {
              text: _l('修改分支类型'),
              icon: 'workflow_branch',
              events: this.openBranchTypeDialog,
            },
          ]}
        />

        {!isCopy && (
          <Tooltip title={_l('添加分支')}>
            <span
              className="workflowGatewayAction workflowGatewayAdd textSecondary hoverColorPrimary"
              onClick={() => this.props.addFlowNode(processId, { prveId: item.id, name: '', typeId: 2 })}
            >
              <Icon icon="add" />
            </span>
          </Tooltip>
        )}
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
  };

  /**
   * 切换网关类型
   */
  switchBranchType = gatewayType => {
    const { processId, item, updateBranchGatewayType } = this.props;

    updateBranchGatewayType(processId, item.id, gatewayType);
  };

  render() {
    const { data, item, hideNodes, disabled } = this.props;
    const { showBranchTypeDialog, gatewayType } = this.state;
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
          {showAddBtn && (
            <Fragment>
              {isHide ? (
                <Tooltip title={_l('展开')}>
                  <span className="workflowGatewayCollapsed pointer" onClick={this.changeShrink}>
                    <span className="Font16 bold">{item.flowIds.length}</span>
                  </span>
                </Tooltip>
              ) : (
                this.renderGateway()
              )}
            </Fragment>
          )}
          {!isHide &&
            item.flowIds.map((id, i) => {
              if (!data[id]) return null;
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
          <Modal
            open
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
                  checked={o.value === gatewayType}
                  onChange={() =>
                    this.setState({
                      gatewayType: o.value,
                    })
                  }
                  title={o.text}
                >
                  {o.text}
                </Radio>
                <div className="mTop5 mLeft30 textSecondary">{o.desc}</div>
              </div>
            ))}
          </Modal>
        )}
      </div>
    );
  }
}
