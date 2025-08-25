import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { ACTION_ID } from '../../enum';
import { CreateNode, NodeOperate } from '../components';

export default class Link extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item } = this.props;
    const LINK_TYPE_TEXT = {
      1: _l('获取记录分享链接'),
      2: _l('获取记录填写链接'),
      3: _l('带支付按钮的记录链接'),
      4: _l('付款链接'),
    };

    if (!item.appId && !item.selectNodeId) {
      return <div className="pLeft8 pRight8 blue">{_l('设置此节点')}</div>;
    }

    if (item.appId && !item.appName) {
      return (
        <div className="pLeft8 pRight8 red">
          <i className="icon-report Font18 mRight5" />
          {_l('工作表已删除')}
        </div>
      );
    }

    if (item.selectNodeId && !item.selectNodeName) {
      return (
        <div className="pLeft8 pRight8 red">
          <i className="icon-report Font18 mRight5" />
          {_l('指定的节点对象已删除')}
        </div>
      );
    }

    return (
      <Fragment>
        <div className="workflowContentInfo ellipsis workflowContentBG">
          <span className="Gray_75">{_l('工作表')}</span>“{item.appName}”
        </div>
        <div className={cx('workflowContentInfo ellipsis Gray_75 mTop4 pBottom5', { yellow: item.isException })}>
          {item.isException ? (
            <Fragment>
              <i className="icon-info_outline Font18 mRight5" />
              {_l('链接名称存在异常')}
            </Fragment>
          ) : (
            LINK_TYPE_TEXT[item.linkType]
          )}
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
              { errorShadow: (item.appId || item.selectNodeId) && item.isException },
              { active: selectNodeId === item.id },
            )}
            onMouseDown={() => !disabled && openDetail(processId, item.id, item.typeId)}
          >
            <div className="workflowAvatars flexRow">
              <i
                className={cx(
                  'workflowAvatar',
                  item.appId ? 'BGBlueAsh' : 'BGGray',
                  item.actionId === ACTION_ID.RECORD_LINK_PAY ? 'icon-Collection' : 'icon-link2',
                )}
              />
            </div>
            <NodeOperate nodeClassName="BGBlueAsh" {...this.props} />
            <div className="workflowContent Font13">
              {isSimple ? <span className="pLeft8 pRight8 Gray_75">{_l('加载中...')}</span> : this.renderContent()}
            </div>
          </div>
          <CreateNode {...this.props} />
        </section>
      </div>
    );
  }
}
