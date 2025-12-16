import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { AGENT_TOOLS, APP_TYPE } from '../../enum';
import { getToolName } from '../../utils';
import { CreateNode, NodeOperate } from '../components';

const TOOLS_ITEM = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: #5b00a6;
  background: #f9e6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  margin-right: 4px;
  margin-top: 5px;
  position: relative;
  &.executing {
    border: 5px solid #fff;
    font-size: 12px;
    & ~ span:not(.executing) {
      color: #fff;
      background: #bdbdbd !important;
    }
  }
  .icon-agent_loading {
    position: absolute;
    color: #2196f3;
    display: inline-block;
    animation: rotate 1.2s linear infinite;
    font-size: 32px;
  }
`;

export default class Agent extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item, processId, workflowTestRunning } = this.props;

    if (!item.appId) {
      return <div className="pLeft8 pRight8 blue">{_l('设置此节点')}</div>;
    }

    if (item.isException) {
      return (
        <div className="pLeft8 pRight8 yellow">
          <i className="icon-info_outline Font18 mRight5" />
          {_l('节点存在异常')}
        </div>
      );
    }

    return (
      <Fragment>
        <div className={cx('pLeft8 pRight8', { 'pTop3 pBottom3': item.tools.length })}>
          <span className="Gray_75">
            {getToolName(workflowTestRunning[`${processId}_${item.id}`]?.toolName) ||
              (item.appId === 'auto'
                ? _l('自动选择模型')
                : _.includes(['O3', 'O4-mini'], item.appId)
                  ? _.lowerFirst(item.appId)
                  : item.appId)}
          </span>
          <div className="flexRow mTop2" style={{ flexWrap: 'wrap' }}>
            {item.tools.map((o, index) => {
              const tool = AGENT_TOOLS[o.type];
              const { status } =
                workflowTestRunning[
                  `${processId}_${item.id}_${_.includes([5, 6], o.type) ? o.configs[0].nodeId : tool.name}`
                ] || {};

              return (
                <TOOLS_ITEM key={index} className={cx({ executing: status === 0 })}>
                  <i className={tool.icon} />
                  {status === 0 && <i className="icon-agent_loading" />}
                </TOOLS_ITEM>
              );
            })}
          </div>
        </div>
      </Fragment>
    );
  }

  render() {
    const { processId, item, disabled, selectNodeId, openDetail, isSimple, data, startEventId } = this.props;

    return (
      <div className="flexColumn">
        <section className="workflowBox" data-id={item.id}>
          <div
            className={cx(
              'workflowItem',
              { workflowItemDisabled: disabled },
              { errorShadow: item.appId && item.isException },
              { active: selectNodeId === item.id },
            )}
            onMouseDown={() => !disabled && openDetail(processId, item.id, item.typeId)}
          >
            <div className="workflowAvatars flexRow">
              <i className={cx('workflowAvatar icon-AI_Agent', item.appId ? 'BGDarkViolet' : 'BGGray')} />
            </div>
            <NodeOperate
              nodeClassName="BGDarkViolet"
              {...this.props}
              noDelete={data[startEventId].appType === APP_TYPE.CHATBOT && data[startEventId].nextId === item.id}
            />
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
