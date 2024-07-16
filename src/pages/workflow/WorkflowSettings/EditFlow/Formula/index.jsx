import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { CreateNode, NodeOperate } from '../components';
import { ACTION_ID } from '../../enum';
import { SUMMARY_LIST } from 'src/pages/worksheet/util';

export default class Formula extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item } = this.props;
    let {
      fieldValue = '',
      fieldControlName = '',
      formulaValue,
      formulaMap,
      actionId,
      isException,
      selectNodeId,
      selectNodeName,
      appId,
      fields,
    } = item;

    if (
      (!_.includes([ACTION_ID.OBJECT_TOTAL, ACTION_ID.WORKSHEET_TOTAL, ACTION_ID.CUSTOM_ACTION_TOTAL], actionId) &&
        !formulaValue) ||
      (_.includes([ACTION_ID.OBJECT_TOTAL, ACTION_ID.CUSTOM_ACTION_TOTAL], actionId) && !selectNodeId) ||
      (actionId === ACTION_ID.WORKSHEET_TOTAL && !appId)
    ) {
      return <div className="pLeft8 pRight8 blue">{_l('设置此节点')}</div>;
    }

    if (actionId === ACTION_ID.OBJECT_TOTAL) {
      if (!selectNodeName) {
        return (
          <div className="pLeft8 pRight8 red">
            <i className="icon-workflow_info Font18 mRight5" />
            {_l('指定的节点对象已删除')}
          </div>
        );
      }

      return <div className="pLeft8 pRight8 ellipsis Gray_75">{_l('获取数据条数')}</div>;
    }

    if (isException) {
      return (
        <div className="pLeft8 pRight8 yellow">
          <i className="icon-workflow_error Font18 mRight5" />
          {_l('节点存在异常')}
        </div>
      );
    }

    if (actionId === ACTION_ID.WORKSHEET_TOTAL) {
      if (item.appId && !item.appName) {
        return (
          <div className="pLeft8 pRight8 red">
            <i className="icon-workflow_info Font18 mRight5" />
            {_l('工作表已删除')}
          </div>
        );
      }

      return (
        <Fragment>
          <div className="workflowContentInfo ellipsis workflowContentBG">
            <span className="Gray_75">{_l('工作表')}</span>“{item.appName}”
          </div>
          <div className="workflowContentInfo ellipsis mTop4 pBottom5">
            {_l('汇总方式：')}
            {fields && fields[0].fieldId
              ? `${fields[0].fieldName}（${SUMMARY_LIST.find(o => o.value === fields[0].enumDefault).label}）`
              : _l('记录数量')}
          </div>
        </Fragment>
      );
    }

    if (actionId === ACTION_ID.CUSTOM_ACTION_TOTAL) {
      return (
        <Fragment>
          <div className="workflowContentInfo ellipsis">
            {_l('汇总方式：')}
            {fields && fields[0].fieldId
              ? `${fields[0].fieldName}（${SUMMARY_LIST.find(o => o.value === fields[0].enumDefault).label}）`
              : _l('记录数量')}
          </div>
        </Fragment>
      );
    }

    if (actionId !== ACTION_ID.DATE_DIFF_FORMULA) {
      const arr = formulaValue.match(/\$[^ \r\n]+?\$/g);
      if (arr) {
        arr.forEach(obj => {
          formulaValue = formulaValue.replace(
            obj,
            (
              formulaMap[
                obj
                  .replace(/\$/g, '')
                  .split(/([a-zA-Z0-9#]{24,32})-/)
                  .filter(item => item)
                  .join('-')
              ] || {}
            ).name || '',
          );
        });
      }
      formulaValue = formulaValue
        .replace(/\+/g, ' + ')
        .replace(/\-/g, ' - ')
        .replace(/\*/g, ' * ')
        .replace(/\//g, ' / ');
    }

    return (
      <Fragment>
        <div className="pLeft8 pRight8 breakAll">
          <span className="Gray_75">{actionId === ACTION_ID.FUNCTION_CALCULATION ? _l('计算：') : _l('运算：')}</span>
          {fieldValue + fieldControlName + formulaValue}
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
              {
                errorShadow: (!!item.formulaValue && item.isException) || (item.selectNodeId && !item.selectNodeName),
              },
              { active: selectNodeId === item.id },
            )}
            onMouseDown={() => !disabled && openDetail(processId, item.id, item.typeId)}
          >
            <div className="workflowAvatars flexRow">
              <i
                className={cx(
                  'workflowAvatar',
                  _.includes(
                    [ACTION_ID.OBJECT_TOTAL, ACTION_ID.WORKSHEET_TOTAL, ACTION_ID.CUSTOM_ACTION_TOTAL],
                    item.actionId,
                  )
                    ? 'icon-sigma'
                    : 'icon-workflow_function',
                  item.formulaValue || item.selectNodeId || item.appId ? 'BGGreen' : 'BGGray',
                )}
              />
            </div>
            <NodeOperate nodeClassName="BGGreen" {...this.props} />
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
