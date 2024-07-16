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
          {item.multipleLevelAccounts && !!item.multipleLevelAccounts.length && (
            <div className="pLeft8 pRight8 mTop4">
              <MembersName
                {...this.props}
                accounts={item.accounts}
                multipleLevelAccounts={item.multipleLevelAccounts}
              />
            </div>
          )}
        </Fragment>
      );
    }

    const hasApprovalMethod =
      !!item.accounts.length &&
      (item.accounts.length > 1 || item.accounts[0].type !== 1) &&
      _.includes([1, 2, 4], item.countersignType);

    return (
      <Fragment>
        {hasApprovalMethod && (
          <div className="workflowContentInfo ellipsis pTop5 mBottom4">
            {item.countersignType === 1
              ? _l('需全员通过')
              : item.countersignType === 2
              ? _l('只需一人通过，需全员否决')
              : _l('按比例投票通过')}
          </div>
        )}
        <div className={cx('pLeft8 pRight8 pBottom5', { pTop5: !hasApprovalMethod })}>
          <span className="Gray_75">{_l('审批人：')}</span>
          {item.accounts.length ? <MembersName {...this.props} accounts={item.accounts} /> : '[]'}
        </div>
      </Fragment>
    );
  }

  render() {
    const { processId, item, disabled, selectNodeId, openDetail, isSimple } = this.props;

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
            onMouseDown={() => !disabled && openDetail(processId, item.id, item.typeId)}
          >
            <div className="workflowAvatars flexRow">
              <i className={cx('workflowAvatar icon-workflow_ea', item.selectNodeId ? 'BGViolet' : 'BGGray')} />
            </div>
            <NodeOperate nodeClassName="BGViolet" {...this.props} />
            <div className="workflowContent">
              {isSimple ? <span className="pLeft8 pRight8 Gray_75">{_l('加载中...')}</span> : this.renderContent()}
            </div>
          </div>
          {item.resultTypeId ? <div className="workflowLineBtn" /> : <CreateNode {...this.props} />}
        </section>
      </div>
    );
  }
}
