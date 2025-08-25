import React, { Component } from 'react';
import cx from 'classnames';
import { PUSH_LIST, PUSH_TYPE } from '../../enum';
import { CreateNode, NodeOperate } from '../components';

export default class Push extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item } = this.props;

    if (!item.pushType || (item.pushType === PUSH_TYPE.AUDIO && item.openMode === 0)) {
      return <div className="pLeft8 pRight8 blue">{_l('设置此节点')}</div>;
    }

    if (item.pushType && item.isException) {
      return (
        <div className="pLeft8 pRight8 red">
          <i className="icon-report Font18 mRight5" />
          {_l('节点配置有误')}
        </div>
      );
    }

    if (item.pushType === PUSH_TYPE.AUDIO) {
      return <div className="pLeft8 pRight8 ellipsis">{item.openMode === 1 ? _l('音频') : _l('语音播报')}</div>;
    }

    return <div className="pLeft8 pRight8 ellipsis">{PUSH_LIST.find(o => o.value === item.pushType).text}</div>;
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
              { active: selectNodeId === item.id },
              { errorShadow: item.pushType && item.isException && item.openMode !== 0 },
            )}
            onMouseDown={() => !disabled && openDetail(processId, item.id, item.typeId)}
          >
            <div className="workflowAvatars flexRow">
              <i
                className={cx(
                  'workflowAvatar',
                  item.pushType === PUSH_TYPE.AUDIO ? 'icon-volume_up' : 'icon-interface_push',
                  item.pushType !== PUSH_TYPE.AUDIO || (item.pushType === PUSH_TYPE.AUDIO && item.openMode !== 0)
                    ? 'BGBlue'
                    : 'BGGray',
                )}
              />
            </div>
            <NodeOperate nodeClassName="BGBlue" {...this.props} />
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
