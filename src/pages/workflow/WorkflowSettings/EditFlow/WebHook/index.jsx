import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { ACTION_ID, APP_TYPE } from '../../enum';
import { CreateNode, NodeOperate } from '../components';

export default class Write extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item } = this.props;
    const isPush = item.actionId === ACTION_ID.PBC_OUT;

    if (
      (_.includes([APP_TYPE.SHEET, APP_TYPE.EVENT_PUSH], item.appType) && !item.selectNodeId) ||
      (isPush && !item.webhookUrl)
    ) {
      return <div className="pLeft8 pRight8 blue">{_l('设置此节点')}</div>;
    }

    if (isPush) {
      return (
        <div className="pLeft8 pRight8 ellipsis">
          <span className="Gray_75">{_l('推送地址：')}</span>
          {item.webhookUrl}
        </div>
      );
    }

    if (_.includes([APP_TYPE.SHEET, APP_TYPE.EVENT_PUSH], item.appType) && !item.selectNodeName) {
      return (
        <div className="pLeft8 pRight8 red">
          <i className="icon-report Font18 mRight5" />
          {_l('指定的节点对象已删除')}
        </div>
      );
    }

    if (_.includes([APP_TYPE.SHEET, APP_TYPE.EVENT_PUSH], item.appType)) {
      return <div className="pLeft8 pRight8 ellipsis Gray_75">{_l('发送指定数据对象')}</div>;
    }

    if (item.count) {
      return (
        <div className="pLeft8 pRight8 ellipsis Gray_75">
          <span className="Gray_75">{_l('已配置：')}</span>
          {_l('%0个返回值', item.count)}
        </div>
      );
    }

    return <div className="pLeft8 pRight8 ellipsis Gray_75">{_l('发送自定义请求')}</div>;
  }

  render() {
    const { processId, item, disabled, selectNodeId, openDetail, isSimple } = this.props;
    const isPush = item.actionId === ACTION_ID.PBC_OUT;

    return (
      <div className="flexColumn">
        <section className="workflowBox" data-id={item.id}>
          <div
            className={cx(
              'workflowItem',
              { workflowItemDisabled: disabled },
              { errorShadow: (item.selectNodeId || item.webhookUrl) && item.isException },
              { active: selectNodeId === item.id },
            )}
            onMouseDown={() => !disabled && openDetail(processId, item.id, item.typeId)}
          >
            <div className="workflowAvatars flexRow">
              <i
                className={cx(
                  'workflowAvatar',
                  isPush ? 'icon-sending' : 'icon-workflow_webhook',
                  item.webhookUrl ? 'BGBlueAsh' : 'BGGray',
                )}
              />
            </div>
            <NodeOperate nodeClassName="BGBlueAsh" {...this.props} noDelete={isPush} noCopy={isPush} />
            <div className="workflowContent Font13">
              {isSimple ? <span className="pLeft8 pRight8 Gray_75">{_l('加载中...')}</span> : this.renderContent()}
            </div>
          </div>
          <CreateNode {...this.props} disabled={isPush} />
        </section>
      </div>
    );
  }
}
