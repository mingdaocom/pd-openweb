import React, { Component } from 'react';
import cx from 'classnames';
import { CreateNode, MembersName, NodeOperate } from '../components';
import { replaceField } from '../../utils';

export default class Message extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item } = this.props;

    if (!item.smsContent) {
      return <div className="pLeft8 pRight8 blue">{_l('设置此节点')}</div>;
    }

    if (item.isException) {
      return (
        <div className="pLeft8 pRight8 yellow">
          <i className="icon-workflow_error Font18 mRight5" />
          {_l('内容存在异常')}
        </div>
      );
    }

    return (
      <div className="pLeft8 pRight8">
        <div className="pTop5">
          <span className="Gray_75">{_l('发送给: ')}</span>
          <MembersName {...this.props} accounts={item.accounts} />
        </div>
        <div className="pBottom5 mTop4">
          {item.templateStatus === 0 && <span className="yellow">{_l('模板审核中...')}</span>}
          {item.templateStatus === 2 && <span className="red">{_l('模板审核失败！')}</span>}
          <span className={cx({ Gray_75: item.templateStatus !== 1 })}>
            【{item.companySignature}】{replaceField(item.smsContent, item.formulaMap)}
          </span>
        </div>
      </div>
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
              { errorShadow: !!item.smsContent && item.isException },
              { active: selectNodeId === item.id },
            )}
            onMouseDown={() => !disabled && openDetail(processId, item.id, item.typeId)}
          >
            <div className="workflowAvatars flexRow">
              <i className={cx('workflowAvatar icon-workflow_sms', item.smsContent ? 'BGBlue' : 'BGGray')} />
            </div>
            <NodeOperate nodeClassName="BGBlue" {...this.props} />
            <div className="workflowContent Font13">
              {isSimple ? <span className="pLeft8 pRight8 Gray_9e">{_l('加载中...')}</span> : this.renderContent()}
            </div>
          </div>
          <CreateNode {...this.props} />
        </section>
      </div>
    );
  }
}
