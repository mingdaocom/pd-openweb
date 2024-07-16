import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { CreateNode, MembersName, NodeOperate } from '../components';
import { NODE_TYPE } from '../../enum';

export default class CC extends Component {
  constructor(props) {
    super(props);
  }

  /**
   *
   * 渲染内容
   */
  renderContent() {
    const { item } = this.props;

    if (!item.accounts.length && !item.selectNodeId) {
      return <div className="pLeft8 pRight8 blue">{_l('设置此节点')}</div>;
    }

    if (item.selectNodeId && !item.selectNodeName) {
      return (
        <div className="pLeft8 pRight8 red">
          <i className="icon-workflow_info Font18 mRight5" />
          {_l('指定的发送记录已删除')}
        </div>
      );
    }

    return (
      <Fragment>
        <div className="pLeft8 pRight8 pTop5 pBottom5">
          <span className="Gray_75">{_l('通知人：')}</span>
          <MembersName {...this.props} accounts={item.accounts} />
        </div>
        {item.isException && (
          <div className="pLeft8 pRight8 pBottom5 yellow">
            <i className="icon-workflow_error Font18 mRight5" />
            {_l('通知内容存在异常')}
          </div>
        )}
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
              { errorShadow: (!!item.accounts.length || item.selectNodeId) && item.isException },
              { active: selectNodeId === item.id },
            )}
            onMouseDown={() => !disabled && openDetail(processId, item.id, item.typeId)}
          >
            <div className="workflowAvatars flexRow">
              <i
                className={cx(
                  'workflowAvatar',
                  item.accounts.length || item.selectNodeId ? 'BGBlue' : 'BGGray',
                  item.typeId === NODE_TYPE.CC ? 'icon-workflow_notice' : 'icon-hr_message_reminder',
                )}
              />
            </div>
            <NodeOperate nodeClassName="BGBlue" {...this.props} />
            <div className="workflowContent">
              {isSimple ? <span className="pLeft8 pRight8 Gray_75">{_l('加载中...')}</span> : this.renderContent()}
            </div>
          </div>
          <CreateNode {...this.props} />
        </section>
      </div>
    );
  }
}
