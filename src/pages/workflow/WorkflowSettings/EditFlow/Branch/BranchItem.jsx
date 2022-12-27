import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import Confirm from 'ming-ui/components/Dialog/Confirm';
import { CreateNode, NodeOperate } from '../components';
import { addFlowNode } from '../../../redux/actions';
import { getFilterText } from '../../utils';
import _ from 'lodash';

export default class BranchItem extends Component {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    clearBorderType: 0,
  };

  /**
   * 渲染内容
   */
  renderContent() {
    const { item, prveId, processId } = this.props;

    return (
      <div className="workflowName workflowBranchItem">
        <div className="flexRow mBottom4" style={{ alignItems: 'center' }}>
          <NodeOperate
            copyBranchNode={() =>
              this.props.dispatch(
                addFlowNode(processId, {
                  prveId,
                  nodeIds: [item.id],
                  name: item.name ? _l('-复制') : _l('分支-复制'),
                }),
              )
            }
            {...this.props}
          />
        </div>

        {item.operateCondition.length ? (
          item.operateCondition.map((conditions, i) => {
            return (
              <Fragment key={i}>
                {conditions.map((obj, j) => {
                  const isOldCondition =
                    (_.includes([15, 16], obj.filedTypeId) || (obj.filedTypeId === 38 && obj.enumDefault === 2)) &&
                    _.includes(['15', '16', '17', '18'], obj.conditionId);

                  return (
                    <div key={j} className="workflowBranchItemTag">
                      <span
                        className="ellipsis maxWidth mRight5"
                        style={{ color: obj.filedValue ? '#333' : '#f44336' }}
                      >
                        {obj.filedValue || _l('字段已删除')}
                      </span>
                      <span className="ellipsis maxWidth">
                        <span className="mRight5 Gray_75">
                          {getFilterText(Object.assign({}, obj, { type: obj.filedTypeId }), obj.conditionId)}
                          {isOldCondition && '*'}
                        </span>
                        {this.renderSingleValue(obj)}
                      </span>
                    </div>
                  );
                })}

                {i !== item.operateCondition.length - 1 && (
                  <div className="conditionSplit">
                    <span>{_l('或')}</span>
                  </div>
                )}
              </Fragment>
            );
          })
        ) : (
          <div className="pLeft8 pRight8">{_l('所有数据可进入该分支')}</div>
        )}
      </div>
    );
  }

  /**
   * 渲染单个条件的值
   */
  renderSingleValue(item) {
    if (item.conditionId === '1' || item.conditionId === '3' || item.conditionId === '5' || item.conditionId === '6') {
      return this.renderOrAnd(item, _l('或'));
    }

    if (item.conditionId === '2' || item.conditionId === '4') {
      return this.renderOrAnd(item, _l('和'));
    }

    if (item.conditionId === '15' || item.conditionId === '16') {
      return this.renderRange(item.conditionValues);
    }

    return this.renderOrAnd(item);
  }

  /**
   * 渲染或 或者 且
   */
  renderOrAnd(item, text) {
    return (
      <span>
        {item.conditionValues.map((obj, i) => {
          return (
            <Fragment key={i}>
              {obj.controlId ? (
                <Fragment>
                  <span style={{ color: obj.nodeName ? '#333' : '#f44336' }}>{obj.nodeName || _l('节点已删除')}</span>-
                  <span style={{ color: obj.controlName ? '#333' : '#f44336' }}>
                    {obj.controlName || _l('字段已删除')}
                  </span>
                </Fragment>
              ) : obj.value && typeof obj.value === 'object' ? (
                obj.value.value
              ) : (
                obj.value
              )}
              {i !== item.conditionValues.length - 1 && <span className="mLeft5 mRight5 Gray_9e">{text}</span>}
            </Fragment>
          );
        })}
      </span>
    );
  }

  /**
   * 渲染在范围内  不在范围内
   */
  renderRange(item) {
    return (
      <span>
        {item[0].controlId ? `${item[0].nodeName}-${item[0].controlName}` : item[0].value}
        <span className="mLeft5 mRight5">~</span>
        {item[1].controlId ? `${item[1].nodeName}-${item[1].controlName}` : item[1].value}
      </span>
    );
  }

  /**
   * 渲染删除结果分支
   */
  renderDeleteResultNode() {
    const { processId, isCopy, item, deleteNode } = this.props;

    if (isCopy) return null;

    return (
      <i
        className="icon-workflow_cancel workflowNodeDel"
        onMouseDown={e => {
          e.stopPropagation();

          Confirm({
            className: 'deleteNodeConfirm',
            title: _.includes([1, 2], item.resultTypeId)
              ? _l('您确定要删除审批结果分支吗？')
              : _l('你确定要删除此查找结果分支吗？'),
            description: _l('分支删除后，该分支下的所有节点都将被删除'),
            okText: _l('删除'),
            onOk: () => {
              deleteNode(processId, item.id);
            },
          });
        }}
      />
    );
  }

  render() {
    const {
      processId,
      data,
      item,
      disabled,
      renderNode,
      clearBorderType,
      openDetail,
      isCopy,
      isApproval,
      approvalSelectNodeId,
    } = this.props;
    const resultTypeText = {
      1: _l('通过'),
      2: _l('否决'),
      3: _l('有数据'),
      4: _l('无数据'),
    };

    return (
      <div className="flexColumn">
        {clearBorderType === -1 && <div className="clearLeftBorder" />}
        {clearBorderType === 1 && <div className="clearRightBorder" />}

        <section className="workflowBox" data-id={item.id}>
          <div
            className={cx(
              'workflowItem',
              { workflowItemDisabled: disabled || isCopy },
              { workflowBranchSpecial: _.includes([1, 2, 3, 4], item.resultTypeId) },
              { errorShadow: item.isException },
            )}
            onMouseDown={() =>
              !disabled && !item.resultTypeId && openDetail(processId, item.id, item.typeId, approvalSelectNodeId)
            }
          >
            {_.includes([1, 2, 3, 4], item.resultTypeId) ? (
              <Fragment>
                {this.renderDeleteResultNode()}

                <div className="workflowName flexRow">
                  {_.includes([1, 3], item.resultTypeId) ? (
                    <div className="Font15 workflowYes">
                      <i className="icon-check_circle mRight5 Font18" />
                      {resultTypeText[item.resultTypeId]}
                    </div>
                  ) : (
                    <div className="Font15 workflowNo">
                      <i className="icon-cancel mRight5 Font18" />
                      {resultTypeText[item.resultTypeId]}
                    </div>
                  )}
                </div>
              </Fragment>
            ) : (
              <Fragment>
                {this.renderContent()}
                <div className="workflowContent">
                  <div className="pLeft8 pRight8 blue">{_l('配置筛选条件')}</div>
                </div>
              </Fragment>
            )}
          </div>
          <CreateNode {...this.props} />
        </section>

        {item.nextId && renderNode({ processId, data, firstId: item.nextId, isApproval, approvalSelectNodeId })}
      </div>
    );
  }
}
