import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { ACTION_ID, APP_TYPE } from '../../enum';
import { getIcons } from '../../utils';
import { CreateNode, NodeOperate, WorksheetMessage } from '../components';

export default class GetMoreRecord extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item } = this.props;
    const text = {
      [ACTION_ID.FROM_WORKSHEET]:
        item.appType === APP_TYPE.SHEET ? _l('从工作表获取多条记录') : _l('从聚合表获取多条记录'),
      [ACTION_ID.FROM_RECORD]: _l('从一条记录获取多条关联记录'),
      [ACTION_ID.FROM_ADD]: _l('从新增记录节点获取多条记录'),
      [ACTION_ID.FROM_ARRAY]: _l('从发送API请求数组获取数据'),
      [ACTION_ID.FROM_CODE_ARRAY]: _l('从代码块数组获取数据'),
      [ACTION_ID.FROM_ARTIFICIAL]: _l('从人工节点获取操作明细数据'),
      [ACTION_ID.FROM_PBC_INPUT_ARRAY]: _l('从业务流程输入数组获取数据'),
      [ACTION_ID.FROM_API_ARRAY]: _l('从API数组获取数据'),
      [ACTION_ID.FROM_PBC_OUTPUT_ARRAY]: _l('从业务流程输出数组获取数据'),
      [ACTION_ID.FROM_PLUGIN_ARRAY]: _l('从插件输出数组获取数据'),
      [ACTION_ID.FROM_JSON_PARSE_ARRAY]: _l('从JSON解析数组获取数据'),
      [ACTION_ID.BATCH_UPDATE]: _l('批量更新记录'),
      [ACTION_ID.BATCH_DELETE]: _l('批量删除记录'),
    };

    if (!item.appId && !item.selectNodeId) {
      return <div className="pLeft8 pRight8 blue">{_l('设置此节点')}</div>;
    }

    if (item.isException) {
      return (
        <div className="pLeft8 pRight8 yellow">
          <i className="icon-info_outline Font18 mRight5" />
          {_l('未配置有效参数')}
        </div>
      );
    }

    if (
      _.includes(
        [
          ACTION_ID.FROM_ARRAY,
          ACTION_ID.FROM_CODE_ARRAY,
          ACTION_ID.FROM_PBC_INPUT_ARRAY,
          ACTION_ID.FROM_API_ARRAY,
          ACTION_ID.FROM_PBC_OUTPUT_ARRAY,
          ACTION_ID.FROM_PLUGIN_ARRAY,
          ACTION_ID.FROM_JSON_PARSE_ARRAY,
        ],
        item.actionId,
      )
    ) {
      return <div className="pLeft8 pRight8 ellipsis Gray_75">{text[item.actionId]}</div>;
    }

    return (
      <Fragment>
        <WorksheetMessage
          item={{ ...item, appTypeName: item.appType === APP_TYPE.SHEET ? _l('工作表') : _l('聚合表') }}
        />
        {_.includes([ACTION_ID.BATCH_UPDATE, ACTION_ID.REFRESH_MULTIPLE_DATA], item.actionId) ? (
          <div className="workflowContentInfo Gray_75 mTop4 pBottom5">
            {item.actionId === ACTION_ID.REFRESH_MULTIPLE_DATA
              ? _l('校准了%0个字段', item.fields.length)
              : _l('修改了%0个字段', item.fields.length)}
            {item.errorFields.length > 0 ? '，' : ''}
            <span className="yellow">{item.errorFields.length || ''}</span>
            {item.errorFields.length > 0 ? _l('个字段存在异常') : ''}
          </div>
        ) : (
          <div className="workflowContentInfo ellipsis Gray_75 mTop4 pBottom5">{text[item.actionId]}</div>
        )}
      </Fragment>
    );
  }

  render() {
    const { processId, item, disabled, selectNodeId, openDetail, isSimple } = this.props;
    const isCalibration = item.actionId === ACTION_ID.REFRESH_MULTIPLE_DATA;

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
                  item.appId || item.selectNodeId ? (isCalibration ? 'BGGreen' : 'BGYellow') : 'BGGray',
                  getIcons(item.typeId, item.appType, item.actionId),
                )}
              />
            </div>
            <NodeOperate nodeClassName={isCalibration ? 'BGGreen' : 'BGYellow'} {...this.props} />
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
