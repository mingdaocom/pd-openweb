import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { ACTION_ID, APP_TYPE } from '../../enum';
import { CreateNode, NodeOperate, WorksheetMessage } from '../components';

export default class Search extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item } = this.props;

    if (!item.appId && !item.selectNodeId) {
      return <div className="pLeft8 pRight8 blue">{_l('设置此节点')}</div>;
    }

    if (item.appId && !item.appName) {
      return (
        <div className="pLeft8 pRight8 red">
          <i className="icon-report Font18 mRight5" />
          {item.appType === APP_TYPE.SHEET ? _l('工作表已删除') : _l('聚合表已删除')}
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

    if (item.selectNodeId) {
      return (
        <div className="pLeft8 pRight8 ellipsis">
          {_l('从多条数据节点获取')}
          <span>{item.executeType === 0 ? _l('，无结果时中止或执行查找结果分支') : _l('，无结果时继续执行')}</span>
        </div>
      );
    }

    if (item.actionId === ACTION_ID.RECORD_UPDATE && item.isException) {
      return (
        <div className="pLeft8 pRight8 red">
          <i className="icon-report Font18 mRight5" />
          {_l('必须配置筛选条件和更新字段')}
        </div>
      );
    }

    if (item.actionId === ACTION_ID.RECORD_DELETE && item.isException) {
      return (
        <div className="pLeft8 pRight8 red">
          <i className="icon-report Font18 mRight5" />
          {_l('必须配置筛选条件')}
        </div>
      );
    }

    return (
      <Fragment>
        <WorksheetMessage
          item={{ ...item, appTypeName: item.appType === APP_TYPE.SHEET ? _l('工作表') : _l('聚合表') }}
        />
        <div className="workflowContentInfo ellipsis Gray_75 mTop4 pBottom5">
          {_.includes([ACTION_ID.WORKSHEET_FIND, ACTION_ID.RECORD_UPDATE, ACTION_ID.RECORD_DELETE], item.actionId)
            ? item.appType === APP_TYPE.SHEET
              ? _l('从工作表获得')
              : _l('从聚合表获得')
            : _l('从记录链接获得')}
          {item.executeType === 0 && <span>{_l('，无结果时中止或执行查找结果分支')}</span>}
          {item.executeType === 1 && <span>{_l('，无结果时新增记录')}</span>}
          {item.executeType === 2 && <span>{_l('，无结果时继续执行')}</span>}
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
              <i className={cx('workflowAvatar icon-search', item.appId ? 'BGYellow' : 'BGGray')} />
            </div>
            <NodeOperate nodeClassName="BGYellow" {...this.props} />
            <div className="workflowContent Font13">
              {isSimple ? <span className="pLeft8 pRight8 Gray_75">{_l('加载中...')}</span> : this.renderContent()}
            </div>
          </div>
          {item.resultTypeId ? <div className="workflowLineBtn" /> : <CreateNode {...this.props} />}
        </section>
      </div>
    );
  }
}
