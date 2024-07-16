import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import Confirm from 'ming-ui/components/Dialog/Confirm';
import { CreateNode, NodeOperate } from '../components';
import { addFlowNode } from '../../../redux/actions';
import { getFilterText } from '../../utils';
import _ from 'lodash';
import { NODE_TYPE } from '../../enum';

export default class BranchItem extends Component {
  constructor(props) {
    super(props);
  }

  static defaultProps = {
    clearBorderType: 0,
  };

  state = {
    isMove: false,
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.index !== this.props.index && this.state.isMove) {
      setTimeout(() => {
        this.mounted && this.setState({ isMove: false });
      }, 200);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { item, prveId, processId, disabled, updateBranchSort } = this.props;

    return (
      <div
        className={cx('workflowName workflowBranchItem', {
          pBottom10: !_.includes([1, 2, 3, 4], item.resultTypeId) && disabled,
        })}
      >
        <div className="flexRow mBottom4" style={{ alignItems: 'center' }}>
          <NodeOperate
            {...this.props}
            updateBranchSort={(processId, nodeId, flowIds) => {
              this.setState({ isMove: true });
              updateBranchSort(processId, nodeId, flowIds);
            }}
            copyBranchNode={all =>
              this.props.dispatch(
                addFlowNode(processId, {
                  prveId,
                  nodeIds: [item.id],
                  all,
                }),
              )
            }
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
                        style={{ color: obj.nodeName && obj.filedValue ? '#333' : '#f44336' }}
                      >
                        {obj.nodeName && obj.filedValue
                          ? obj.nodeType === NODE_TYPE.FORMULA
                            ? obj.nodeName
                            : obj.filedValue
                          : _l('字段已删除')}
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
          <div className="workflowBranchItemTag Gray_75">{_l('所有数据可进入该分支')}</div>
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
              {i !== item.conditionValues.length - 1 && <span className="mLeft5 mRight5 Gray_75">{text}</span>}
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
      isSimple,
    } = this.props;
    const { isMove } = this.state;
    const resultTypeText = {
      1: _l('通过'),
      2: _l('否决'),
      3: _l('有数据'),
      4: _l('无数据'),
    };

    return (
      <div className={cx('flexColumn', { Alpha2: isMove })}>
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
            onMouseDown={() => !disabled && !item.resultTypeId && openDetail(processId, item.id, item.typeId)}
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
                {isSimple ? (
                  <div className="workflowName workflowBranchItem">
                    <span className="pLeft8 pRight8 Gray_75">{_l('加载中...')}</span>
                  </div>
                ) : (
                  this.renderContent()
                )}
              </Fragment>
            )}
          </div>
          <CreateNode {...this.props} />
        </section>

        {item.nextId && renderNode({ processId, data, firstId: item.nextId, isApproval })}
      </div>
    );
  }
}
