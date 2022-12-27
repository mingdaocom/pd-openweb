import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { CreateNode, MembersName, NodeOperate } from '../components';
import _ from 'lodash';

export default class Approval extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item } = this.props;

    if (!item.selectNodeId) {
      return <div className="pLeft8 pRight8 blue">{_l('设置此节点')}</div>;
    }

    if (!item.selectNodeName) {
      return (
        <div className="pLeft8 pRight8 red">
          <i className="icon-workflow_info Font18 mRight5" />
          {_l('指定的节点对象已删除')}
        </div>
      );
    }

    if (_.includes([1, 2], item.multipleLevelType)) {
      return (
        <Fragment>
          <div className="pLeft8 pRight8">{_l('按部门层级逐级审批')}</div>
          <div className="pLeft8 pRight8 mTop4">
            <MembersName accounts={item.accounts} multipleLevelAccounts={item.multipleLevelAccounts} />
          </div>
        </Fragment>
      );
    }

    if (!item.accounts.length) {
      return (
        <div className="pLeft8 pRight8 red">
          <i className="icon-workflow_info Font18 mRight5" />
          {_l('未设置审批人')}
        </div>
      );
    }

    const hasApprovalMethod = item.accounts.length > 1 || item.accounts[0].type !== 1;

    return (
      <Fragment>
        {hasApprovalMethod && (
          <div className="workflowContentInfo ellipsis pTop5">
            {item.countersignType === 1
              ? _l('需全员通过')
              : item.countersignType === 2
              ? _l('只需一人通过，需全员否决')
              : _l('一人通过或否决即可')}
          </div>
        )}
        <div className={cx('pLeft8 pRight8 mTop4', { pTop5: !hasApprovalMethod }, { pBottom5: !item.isCallBack })}>
          <span className="Gray_75">{_l('审批人：')}</span>
          <MembersName accounts={item.accounts} />
        </div>
        {item.isCallBack && <div className="pLeft8 pRight8 mTop4 pBottom5">{_l('否决后，允许退回')}</div>}
      </Fragment>
    );
  }

  render() {
    const { processId, item, disabled, selectNodeId, openDetail, approvalSelectNodeId } = this.props;

    return (
      <div className="flexColumn">
        <section className="workflowBox" data-id={item.id}>
          <div
            className={cx(
              'workflowItem',
              { workflowItemDisabled: disabled },
              { errorShadow: item.selectNodeId && item.isException },
              { active: selectNodeId === item.id },
            )}
            onMouseDown={() => !disabled && openDetail(processId, item.id, item.typeId, approvalSelectNodeId)}
          >
            <div className="workflowAvatars flexRow">
              <i className={cx('workflowAvatar icon-workflow_ea', item.selectNodeId ? 'BGViolet' : 'BGGray')} />
            </div>
            <NodeOperate nodeClassName="BGViolet" {...this.props} />
            <div className="workflowContent">{this.renderContent()}</div>
          </div>
          {item.resultTypeId ? <div className="workflowLineBtn" /> : <CreateNode {...this.props} />}
        </section>
      </div>
    );
  }
}
